// Guards app pages: redirects to login if no active session.
async function requireSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return null;
  }
  const nameEl = document.getElementById("userEmail");
  if (nameEl) nameEl.textContent = session.user.email;
  return session;
}

async function signOut() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "signOutBtn") signOut();
});
