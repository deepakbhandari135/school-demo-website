(async () => {
  const session = await requireSession();
  if (!session) return;

  const today = new Date().toISOString().slice(0, 10);

  const [{ count: studentCount }, { count: classCount }, { data: todayAttendance }] = await Promise.all([
    supabaseClient.from("students").select("*", { count: "exact", head: true }),
    supabaseClient.from("classes").select("*", { count: "exact", head: true }),
    supabaseClient.from("attendance").select("status").eq("date", today),
  ]);

  document.getElementById("statStudents").textContent = studentCount ?? 0;
  document.getElementById("statClasses").textContent = classCount ?? 0;

  const present = (todayAttendance || []).filter(r => r.status === "present").length;
  const absent = (todayAttendance || []).filter(r => r.status === "absent").length;
  document.getElementById("statPresent").textContent = present;
  document.getElementById("statAbsent").textContent = absent;

  const { data: recent, error } = await supabaseClient
    .from("students")
    .select("id, full_name, roll_no, classes(name, section)")
    .order("created_at", { ascending: false })
    .limit(6);

  const wrap = document.getElementById("recentWrap");

  if (error) {
    wrap.innerHTML = `<div class="empty-state"><div class="glyph">!</div>Could not load students.<br><span style="font-size:12px">${error.message}</span></div>`;
    return;
  }

  if (!recent || recent.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="glyph">＋</div>No students yet.<br><a href="students.html" class="btn btn-accent btn-sm" style="margin-top:12px;">Add your first student</a></div>`;
    return;
  }

  wrap.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Roll No.</th><th>Class</th></tr></thead>
      <tbody>
        ${recent.map(s => `
          <tr>
            <td>${s.full_name}</td>
            <td class="roll">${s.roll_no}</td>
            <td>${s.classes ? `${s.classes.name} - ${s.classes.section}` : "—"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
})();
