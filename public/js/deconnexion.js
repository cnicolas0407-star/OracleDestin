document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnDeconnexion");
    if (!btn) return;

    btn.addEventListener("click", () => {
        localStorage.removeItem("oracle_token");
        localStorage.removeItem("oracle_user");
        window.location.href = "/index.html";
    });
});