const $ = (selector) => document.querySelector(selector);

const TABLE = "tugas";
const BUCKET = "files";

function formatWaktu(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

async function getTasks() {
  const { data, error } = await supabaseClient
    .from(TABLE)
    .select("*")
    .order("waktu", { ascending: false });

  if (error) throw error;
  return data;
}

function fileUrl(filePath) {
  const { data } = supabaseClient.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

function actionHtml(task, readonly = false) {
  if (task.tipe === "file") {
    return `
      <a class="small-btn download" href="${fileUrl(task.file_path)}" target="_blank" rel="noopener" download>Unduh</a>
      ${readonly ? "" : `<button class="small-btn delete" onclick="hapusTugas(${task.id})">Hapus</button>`}
    `;
  }

  return `
    <a class="small-btn open" href="${escapeHtml(task.value)}" target="_blank" rel="noopener">Buka Link</a>
    ${readonly ? "" : `<button class="small-btn delete" onclick="hapusTugas(${task.id})">Hapus</button>`}
  `;
}

function rowHtml(task, no, readonly = false) {
  const tipe = task.tipe === "file" ? "File" : "Link";
  const resource = task.tipe === "file"
    ? `<span class="file-name">📄 ${escapeHtml(task.value)}</span>`
    : `<a class="table-link" href="${escapeHtml(task.value)}" target="_blank" rel="noopener">${escapeHtml(task.value)}</a>`;

  return `
    <tr>
      <td>${no}</td>
      <td><strong>${escapeHtml(task.judul)}</strong></td>
      <td>${formatWaktu(task.waktu)}</td>
      <td><span class="badge ${task.tipe}">${tipe}</span></td>
      <td>${resource}</td>
      <td><div class="actions">${actionHtml(task, readonly)}</div></td>
    </tr>
  `;
}

async function renderTables() {
  const tasks = await getTasks();

  const historyBody = $("#historyBody");
  const emptyHistory = $("#emptyHistory");
  if (historyBody) {
    historyBody.innerHTML = tasks.map((t, i) => rowHtml(t, i + 1, false)).join("");
    emptyHistory.classList.toggle("show", tasks.length === 0);
    if ($("#historyTotal")) $("#historyTotal").textContent = tasks.length;
    if ($("#historyFiles")) $("#historyFiles").textContent = tasks.filter(t => t.tipe === "file").length;
    if ($("#historyLinks")) $("#historyLinks").textContent = tasks.filter(t => t.tipe === "link").length;
  }

  const dosenBody = $("#dosenBody");
  const emptyDosen = $("#emptyDosen");
  if (dosenBody) {
    dosenBody.innerHTML = tasks.map((t, i) => rowHtml(t, i + 1, true)).join("");
    emptyDosen.classList.toggle("show", tasks.length === 0);

    $("#total").textContent = tasks.length;
    $("#files").textContent = tasks.filter(t => t.tipe === "file").length;
    $("#links").textContent = tasks.filter(t => t.tipe === "link").length;
  }
}

async function hapusTugas(id) {
  if (!confirm("Yakin ingin menghapus tugas ini? File yang tersimpan juga akan dihapus.")) return;

  try {
    const { data: task, error: fetchError } = await supabaseClient
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    if (task.tipe === "file" && task.file_path) {
      await supabaseClient.storage.from(BUCKET).remove([task.file_path]);
    }

    const { error: deleteError } = await supabaseClient.from(TABLE).delete().eq("id", id);
    if (deleteError) throw deleteError;

    await renderTables();
  } catch (error) {
    alert(error.message || "Gagal menghapus tugas.");
  }
}

function setupSubmit() {
  const form = $("#taskForm");
  if (!form) return;

  let method = "file";
  const methods = document.querySelectorAll(".method");
  const fileArea = $("#fileArea");
  const linkArea = $("#linkArea");
  const fileInput = $("#file");
  const fileName = $("#fileName");
  const message = $("#message");

  methods.forEach(btn => {
    btn.addEventListener("click", () => {
      method = btn.dataset.method;
      methods.forEach(x => x.classList.toggle("active", x === btn));
      fileArea.classList.toggle("hidden", method !== "file");
      linkArea.classList.toggle("hidden", method !== "link");
    });
  });

  fileInput.addEventListener("change", () => {
    fileName.textContent = fileInput.files[0]?.name || "Tidak ada file yang dipilih";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.className = "message";
    message.textContent = "";

    const judul = $("#judul").value.trim();
    if (!judul) {
      showMessage("Judul tugas wajib diisi.", true);
      return;
    }

    const submitBtn = form.querySelector(".primary-btn");
    submitBtn.disabled = true;

    try {
      if (method === "file") {
        const file = fileInput.files[0];
        if (!file) {
          showMessage("Silakan pilih file tugas terlebih dahulu.", true);
          return;
        }

        const allowed = ["pdf", "doc", "docx", "zip"];
        const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
        if (!allowed.includes(ext)) {
          showMessage("Format file harus PDF, DOC, DOCX, atau ZIP.", true);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          showMessage("Ukuran file maksimal 10 MB.", true);
          return;
        }

        const filePath = `${Date.now()}-${file.name}`.replace(/\s+/g, "_");

        const { error: uploadError } = await supabaseClient.storage
          .from(BUCKET)
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { error: insertError } = await supabaseClient.from(TABLE).insert({
          judul,
          tipe: "file",
          value: file.name,
          file_path: filePath,
          waktu: new Date().toISOString()
        });
        if (insertError) throw insertError;
      } else {
        const link = $("#link").value.trim();
        if (!link) {
          showMessage("Link tugas wajib diisi.", true);
          return;
        }

        const { error: insertError } = await supabaseClient.from(TABLE).insert({
          judul,
          tipe: "link",
          value: link,
          waktu: new Date().toISOString()
        });
        if (insertError) throw insertError;
      }

      showMessage("Tugas berhasil dikumpulkan! Riwayat sudah tersimpan.", false);
      form.reset();
      fileName.textContent = "Tidak ada file yang dipilih";
      $("#link").value = "";
    } catch (error) {
      showMessage(error.message || "Gagal mengumpulkan tugas. Periksa koneksi atau konfigurasi Supabase.", true);
    } finally {
      submitBtn.disabled = false;
    }
  });

  function showMessage(text, error) {
    message.className = "message " + (error ? "error" : "success");
    message.textContent = text;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  setupSubmit();
  if ($("#historyBody") || $("#dosenBody")) {
    try {
      await renderTables();
    } catch (error) {
      const target = $("#emptyHistory") || $("#emptyDosen");
      if (target) {
        target.classList.add("show");
        target.innerHTML = "<div>⚠️</div><p>Gagal memuat data. Pastikan konfigurasi Supabase di js/config.js sudah benar.</p>";
      }
    }
  }
});
