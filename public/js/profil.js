/* ═══════════════════════════════════════════════════════
   L'ORACLE DU DESTIN — JS Profil enrichi
   public/js/profil.js
═══════════════════════════════════════════════════════ */
"use strict";

const LIBELLE_VOIE = {
    ordinaire:  "Voie Ordinaire",
    audacieux:  "Voie Audacieuse"
};

const LIBELLE_SYMBOLE = {
    lune:     "☽ Lune",
    epees:   "⚔︎ Epées",
    couronne: "♛ Couronne"
};

document.addEventListener("DOMContentLoaded", async () => {

    // ── 1. Vérifier la connexion ──
    const token = localStorage.getItem("oracle_token");
    const user  = JSON.parse(localStorage.getItem("oracle_user") || "{}");

    if (!token) {
        window.location.href = "/index.html";
        return;
    }

    // ── 2. Header ──
    const prenom = user.prenom ?? "Ton";
    document.getElementById("profilTitre").textContent = `Le destin de ${prenom} est révélé`;

    // ── 3. Animer le header ──
    const header = document.getElementById("profilHeader");
    if (header) {
        header.style.opacity   = "1";
        header.style.transform = "translateY(0)";
    }

    // ── 4. Symbole ──
    const profilSymbole = document.getElementById("profilSymbole");
    profilSymbole.textContent = LIBELLE_SYMBOLE[user.symbole] ?? user.symbole ?? "Inconnu";

    // ── 5. Voie ──
    const profilVoie = document.getElementById("profilVoie");
    profilVoie.textContent = LIBELLE_VOIE[user.voie] ?? user.voie ?? "Inconnue";
    profilVoie.className   = user.voie === "audacieux" ? "voieAudacieuse" : "voieOrdinaire";

    // ── 6. Destin ──
    document.getElementById("profilDestin").textContent = user.destin ?? "Destin inconnu";

    // ── 7. Signe, mission, artefact ──
    document.getElementById("profilSigne").textContent    = user.signe    ?? "—";
    document.getElementById("profilMission").textContent  = user.mission  ?? "—";
    document.getElementById("profilArtefact").textContent = user.artefact ?? "—";

    // ── 8. Couleur de la carte selon la voie ──
    const carteDestin = document.getElementById("monDestin");
    if (user.voie === "audacieux") {
        carteDestin.classList.add("audacieuse");
    } else {
        carteDestin.classList.add("ordinaire");
    }

    // ── 9. Animations d'entrée ──
    setTimeout(() => {
        document.getElementById("monDestin")?.classList.add("visible");
        document.getElementById("statistiques")?.classList.add("visible");
    }, 200);

    setTimeout(() => {
        document.getElementById("profilCarteArtefact")?.classList.add("visible");
    }, 400);

    setTimeout(() => {
        document.getElementById("profilCarteMission")?.classList.add("visible");
    }, 600);

    setTimeout(() => {
        document.getElementById("profilCarteSigne")?.classList.add("visible");
    }, 800);
    
    
    // ── 10. Statistiques ──
    try {
        const reponse = await fetch("/api/stats", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!reponse.ok) throw new Error("Erreur stats");

        const stats = await reponse.json();

        document.getElementById("statTotal").textContent      = stats.total;
        document.getElementById("statOrdinaire").textContent  = stats.ordinaire;
        document.getElementById("statAudacieuse").textContent = stats.audacieux;
        document.getElementById("statLune").textContent       = stats.lune     ?? "0";
        document.getElementById("statEpees").textContent     = stats.epees   ?? "0";
        document.getElementById("statCouronne").textContent   = stats.couronne ?? "0";

        // Barre voies
        const total = stats.total || 1;
        const pctOrdinaire  = Math.round((stats.ordinaire  / total) * 100);
        const pctAudacieuse = Math.round((stats.audacieux  / total) * 100);

        setTimeout(() => {
            document.getElementById("barreOrdinaire").style.width  = pctOrdinaire  + "%";
            document.getElementById("barreAudacieuse").style.width = pctAudacieuse + "%";
        }, 500);

    } catch (err) {
        document.getElementById("statTotal").textContent      = "—";
        document.getElementById("statOrdinaire").textContent  = "—";
        document.getElementById("statAudacieuse").textContent = "—";
        console.error("[Profil] Erreur stats :", err.message);
    }
});