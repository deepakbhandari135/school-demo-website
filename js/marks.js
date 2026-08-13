let allMarks = [];
let studentsCache = [];

(async () => {
  const session = await requireSession();
  if (!session) return;

  const { data: classes } = await supabaseClient.from("classes").select("*").order("name");
  const classFilter = document.getElementById("classFilter");
  (classes || []).forEach(c => classFilter.insertAdjacentHTML("beforeend", `<option value="${c.id}">${c.name} - ${c.section}</option>`));

  const { data: students } = await supabaseClient.from("students").select("id, full_name, roll_no, class_id").order("full_name");
  studentsCache = students || [];
  const markStudent = document.getElementById("markStudent");
  markStudent.innerHTML = studentsCache.map(s => `<option value="${s.id}">${s.full_name} (${s.roll_no})</option>`).join("");

  await loadMarks();

  classFilter.addEventListener("change", renderMarks);
  document.getElementById("examFilter").addEventListener("input", renderMarks);
  document.getElementById("addMarkBtn").addEventListener("click", () => document.getElementById("markModal").classList.add("open"));
  document.getElementById("markCancelBtn").addEventListener("click", () => document.getElementById("markModal").classList.remove("open"));
  document.getElementById("markForm").addEventListener("submit", saveMark);
})();

async function loadMarks() {
  const { data, error } = await supabaseClient
    .from("marks")
    .select("*, students(full_name, roll_no, class_id, classes(name, section))")
    .order("created_at", { ascending: false });

  const wrap = document.getElementById("marksWrap");
  if (error) {
    wrap.innerHTML = `<div class="empty-state"><div class="glyph">!</div>${error.message}</div>`;
    return;
  }
  allMarks = data || [];
  renderMarks();
}

function renderMarks() {
  const wrap = document.getElementById("marksWrap");
  const classId = document.getElementById("classFilter").value;
  const examQ = document.getElementById("examFilter").value.trim().toLowerCase();

  let list = allMarks.filter(m => {
    const matchesClass = !classId || m.students?.class_id === classId;
    const matchesExam = !examQ || m.exam_name.toLowerCase().includes(examQ);
    return matchesClass && matchesExam;
  });

  if (list.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="glyph">＋</div>No marks recorded yet.</div>`;
    return;
  }

  wrap.innerHTML = `
    <table>
      <thead><tr><th>Student</th><th>Class</th><th>Subject</th><th>Exam</th><th>Score</th><th></th></tr></thead>
      <tbody>
        ${list.map(m => {
          const pct = Math.round((m.marks_obtained / m.max_marks) * 100);
          const badgeClass = pct >= 60 ? "badge-success" : pct >= 33 ? "badge-neutral" : "badge-danger";
          return `
          <tr>
            <td>${m.students?.full_name || "—"} <span class="roll mono" style="font-size:12px;color:var(--ink-soft);">${m.students?.roll_no || ""}</span></td>
            <td>${m.students?.classes ? `${m.students.classes.name} - ${m.students.classes.section}` : "—"}</td>
            <td>${m.subject}</td>
            <td>${m.exam_name}</td>
            <td><span class="badge ${badgeClass}">${m.marks_obtained}/${m.max_marks} (${pct}%)</span></td>
            <td><button class="icon-btn" style="color:var(--danger)" onclick="deleteMark('${m.id}')">Delete</button></td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  `;
}

async function deleteMark(id) {
  if (!confirm("Delete this mark entry?")) return;
  const { error } = await supabaseClient.from("marks").delete().eq("id", id);
  if (error) { alert(error.message); return; }
  await loadMarks();
}

async function saveMark(e) {
  e.preventDefault();
  const errorMsg = document.getElementById("markFormError");
  errorMsg.style.display = "none";

  const payload = {
    student_id: document.getElementById("markStudent").value,
    subject: document.getElementById("markSubject").value.trim(),
    exam_name: document.getElementById("markExam").value.trim(),
    marks_obtained: Number(document.getElementById("marksObtained").value),
    max_marks: Number(document.getElementById("maxMarks").value),
  };

  const { error } = await supabaseClient.from("marks").insert(payload);
  if (error) {
    errorMsg.textContent = error.message;
    errorMsg.style.display = "block";
    return;
  }

  document.getElementById("markModal").classList.remove("open");
  document.getElementById("markForm").reset();
  document.getElementById("maxMarks").value = 100;
  await loadMarks();
}
