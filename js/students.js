let allStudents = [];
let allClasses = [];

(async () => {
  const session = await requireSession();
  if (!session) return;

  await loadClasses();
  await loadStudents();

  document.getElementById("searchInput").addEventListener("input", renderStudents);
  document.getElementById("classFilter").addEventListener("change", renderStudents);
  document.getElementById("addStudentBtn").addEventListener("click", () => openModal());
  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  document.getElementById("studentForm").addEventListener("submit", saveStudent);
})();

async function loadClasses() {
  const { data, error } = await supabaseClient.from("classes").select("*").order("name");
  if (error) { console.error(error); return; }
  allClasses = data || [];

  const filterSel = document.getElementById("classFilter");
  const formSel = document.getElementById("classSelect");
  allClasses.forEach(c => {
    const label = `${c.name} - ${c.section}`;
    filterSel.insertAdjacentHTML("beforeend", `<option value="${c.id}">${label}</option>`);
    formSel.insertAdjacentHTML("beforeend", `<option value="${c.id}">${label}</option>`);
  });
}

async function loadStudents() {
  const { data, error } = await supabaseClient
    .from("students")
    .select("*, classes(name, section)")
    .order("full_name");

  const wrap = document.getElementById("studentsWrap");
  if (error) {
    wrap.innerHTML = `<div class="empty-state"><div class="glyph">!</div>Could not load students.<br><span style="font-size:12px">${error.message}</span></div>`;
    return;
  }
  allStudents = data || [];
  renderStudents();
}

function renderStudents() {
  const wrap = document.getElementById("studentsWrap");
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const classFilter = document.getElementById("classFilter").value;

  let list = allStudents.filter(s => {
    const matchesQ = !q || s.full_name.toLowerCase().includes(q) || String(s.roll_no).toLowerCase().includes(q);
    const matchesClass = !classFilter || s.class_id === classFilter;
    return matchesQ && matchesClass;
  });

  if (list.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="glyph">＋</div>No students match.<br><a href="#" onclick="document.getElementById('addStudentBtn').click(); return false;" class="btn btn-accent btn-sm" style="margin-top:12px;">Add a student</a></div>`;
    return;
  }

  wrap.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Roll No.</th><th>Class</th><th>Parent contact</th><th></th></tr></thead>
      <tbody>
        ${list.map(s => `
          <tr>
            <td>${escapeHtml(s.full_name)}</td>
            <td class="roll">${escapeHtml(s.roll_no)}</td>
            <td>${s.classes ? `${s.classes.name} - ${s.classes.section}` : "—"}</td>
            <td>${escapeHtml(s.parent_phone || "—")}</td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" onclick="editStudent('${s.id}')">Edit</button>
                <button class="icon-btn" onclick="deleteStudent('${s.id}')" style="color:var(--danger);">Delete</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function openModal(student = null) {
  document.getElementById("formError").style.display = "none";
  document.getElementById("modalTitle").textContent = student ? "Edit student" : "Add student";
  document.getElementById("studentId").value = student?.id || "";
  document.getElementById("fullName").value = student?.full_name || "";
  document.getElementById("rollNo").value = student?.roll_no || "";
  document.getElementById("classSelect").value = student?.class_id || "";
  document.getElementById("parentName").value = student?.parent_name || "";
  document.getElementById("parentPhone").value = student?.parent_phone || "";
  document.getElementById("studentEmail").value = student?.email || "";
  document.getElementById("address").value = student?.address || "";
  document.getElementById("studentModal").classList.add("open");
}

function closeModal() {
  document.getElementById("studentModal").classList.remove("open");
}

function editStudent(id) {
  const student = allStudents.find(s => s.id === id);
  if (student) openModal(student);
}

async function deleteStudent(id) {
  if (!confirm("Remove this student? This cannot be undone.")) return;
  const { error } = await supabaseClient.from("students").delete().eq("id", id);
  if (error) { alert(error.message); return; }
  await loadStudents();
}

async function saveStudent(e) {
  e.preventDefault();
  const saveBtn = document.getElementById("saveBtn");
  const errorMsg = document.getElementById("formError");
  errorMsg.style.display = "none";
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  const id = document.getElementById("studentId").value;
  const payload = {
    full_name: document.getElementById("fullName").value.trim(),
    roll_no: document.getElementById("rollNo").value.trim(),
    class_id: document.getElementById("classSelect").value,
    parent_name: document.getElementById("parentName").value.trim() || null,
    parent_phone: document.getElementById("parentPhone").value.trim() || null,
    email: document.getElementById("studentEmail").value.trim() || null,
    address: document.getElementById("address").value.trim() || null,
  };

  const { error } = id
    ? await supabaseClient.from("students").update(payload).eq("id", id)
    : await supabaseClient.from("students").insert(payload);

  saveBtn.disabled = false;
  saveBtn.textContent = "Save student";

  if (error) {
    errorMsg.textContent = error.message;
    errorMsg.style.display = "block";
    return;
  }

  closeModal();
  await loadStudents();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
