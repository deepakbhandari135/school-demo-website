let rosterState = {}; // studentId -> "present" | "absent"

(async () => {
  const session = await requireSession();
  if (!session) return;

  document.getElementById("dateInput").value = new Date().toISOString().slice(0, 10);

  const { data: classes } = await supabaseClient.from("classes").select("*").order("name");
  const sel = document.getElementById("classSelect");
  sel.innerHTML = `<option value="">Select class…</option>` +
    (classes || []).map(c => `<option value="${c.id}">${c.name} - ${c.section}</option>`).join("");

  sel.addEventListener("change", loadRoster);
  document.getElementById("dateInput").addEventListener("change", loadRoster);
  document.getElementById("saveAttendanceBtn").addEventListener("click", saveAttendance);
})();

async function loadRoster() {
  const classId = document.getElementById("classSelect").value;
  const date = document.getElementById("dateInput").value;
  const wrap = document.getElementById("attendanceWrap");

  if (!classId) {
    wrap.innerHTML = `<div class="loader">Pick a class to begin.</div>`;
    return;
  }
  wrap.innerHTML = `<div class="loader">Loading roster…</div>`;

  const { data: students, error } = await supabaseClient
    .from("students")
    .select("id, full_name, roll_no")
    .eq("class_id", classId)
    .order("full_name");

  if (error) {
    wrap.innerHTML = `<div class="empty-state"><div class="glyph">!</div>${error.message}</div>`;
    return;
  }
  if (!students || students.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="glyph">＋</div>No students in this class yet.</div>`;
    return;
  }

  const { data: existing } = await supabaseClient
    .from("attendance")
    .select("student_id, status")
    .eq("class_id", classId)
    .eq("date", date);

  rosterState = {};
  students.forEach(s => {
    const found = (existing || []).find(a => a.student_id === s.id);
    rosterState[s.id] = found ? found.status : "present";
  });

  wrap.innerHTML = `<div class="attendance-grid">${students.map(s => attendanceRow(s)).join("")}</div>`;
}

function attendanceRow(s) {
  const status = rosterState[s.id];
  return `
    <div class="attendance-row" data-id="${s.id}">
      <div class="who">
        <span>${escapeHtmlA(s.full_name)}</span>
        <span class="roll mono badge badge-neutral">${escapeHtmlA(s.roll_no)}</span>
      </div>
      <div class="toggle-group">
        <button type="button" class="toggle-btn present ${status === "present" ? "active" : ""}" onclick="setStatus('${s.id}','present')">Present</button>
        <button type="button" class="toggle-btn absent ${status === "absent" ? "active" : ""}" onclick="setStatus('${s.id}','absent')">Absent</button>
      </div>
    </div>
  `;
}

function setStatus(studentId, status) {
  rosterState[studentId] = status;
  const row = document.querySelector(`.attendance-row[data-id="${studentId}"]`);
  row.querySelector(".present").classList.toggle("active", status === "present");
  row.querySelector(".absent").classList.toggle("active", status === "absent");
}

async function saveAttendance() {
  const classId = document.getElementById("classSelect").value;
  const date = document.getElementById("dateInput").value;
  if (!classId) return;

  const btn = document.getElementById("saveAttendanceBtn");
  btn.disabled = true;
  btn.textContent = "Saving…";

  const rows = Object.entries(rosterState).map(([student_id, status]) => ({
    student_id, class_id: classId, date, status,
  }));

  const { error } = await supabaseClient
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,date" });

  btn.disabled = false;
  btn.textContent = "Save attendance";

  if (error) { alert(error.message); return; }
  btn.textContent = "Saved ✓";
  setTimeout(() => (btn.textContent = "Save attendance"), 1500);
}

function escapeHtmlA(str) {
  return String(str).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
