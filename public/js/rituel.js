/* ═══════════════════════════════════════════════════════
   L'ORACLE DU DESTIN — Rituel JS
   public/js/rituel.js
═══════════════════════════════════════════════════════ */
"use strict";

// ── État ──
let voieChoisie      = null;
let symboleChoisi    = null;
let questionTiree    = null;
let disponibilites   = null;   // données de /api/disponibilites

// ── Config voies (pour la modale de confirmation du symbole) ──
const LIBELLE_VOIE = {
    ordinaire:  "Voie Ordinaire",
    audacieuse: "Voie Audacieuse",
};

const CONFIG_SYMBOLE = {
    lune:     { titre: "☽ Lune",     texte: "Tu t'apprêtes à choisir le symbole de la Lune. L'Oracle consultera les ombres et les illusions : ton destin se tissera dans le mystère." },
    epees:    { titre: "⚔︎ Épées",    texte: "Tu t'apprêtes à choisir le symbole des Epées. L'Oracle lira dans l'acier et le courage : ton destin sera forgé dans le feu." },
    couronne: { titre: "♛ Couronne", texte: "Tu t'apprêtes à choisir le symbole de la Couronne. L'Oracle consultera les arcanes du pouvoir : ton destin sera grand ou écrasant." },
};

// ──────────────────────────────────────────────
//  Init
// ──────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {

    // Vérifier connexion
    const token = localStorage.getItem("oracle_token");
    if (!token) {
        window.location.href = "/index.html";
        return;
    }

    // Charger disponibilités + question en parallèle
    await Promise.all([
        chargerDisponibilites(token),
        chargerQuestion(token),
    ]);
});

// ──────────────────────────────────────────────
//  API — disponibilités
// ──────────────────────────────────────────────

async function chargerDisponibilites(token) {
    try {
        const res = await fetch("/api/disponibilites", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erreur disponibilités");
        disponibilites = await res.json();
        afficherCompteursVoie();
    } catch (e) {
        console.warn("[Rituel] Impossible de charger les disponibilités :", e.message);
        // On laisse les compteurs vides — pas bloquant
        document.getElementById("compteurOrdinaire").textContent  = "";
        document.getElementById("compteurAudacieuse").textContent = "";
    }
}

// ──────────────────────────────────────────────
//  API — question absurde
// ──────────────────────────────────────────────

async function chargerQuestion(token) {
    try {
        const res = await fetch("/api/question", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        questionTiree = data.question;
        document.getElementById("texteQuestion").textContent = questionTiree;
    } catch (e) {
        questionTiree = "Si tu étais un mensonge, lequel serais-tu ?";
        document.getElementById("texteQuestion").textContent = questionTiree;
    }
}

// ──────────────────────────────────────────────
//  Affichage compteurs — étape 1 (voies)
// ──────────────────────────────────────────────

function afficherCompteursVoie() {
    if (!disponibilites) return;

    const totalOrdinaire  = calculerTotalVoie("ordinaire");
    const totalAudacieuse = calculerTotalVoie("audacieux");

    const elOrd = document.getElementById("compteurOrdinaire");
    const elAud = document.getElementById("compteurAudacieuse");

    elOrd.textContent = totalOrdinaire > 0
        ? `${totalOrdinaire} destin${totalOrdinaire > 1 ? "s" : ""} disponible${totalOrdinaire > 1 ? "s" : ""}`
        : "Aucun destin disponible";

    elAud.textContent = totalAudacieuse > 0
        ? `${totalAudacieuse} destin${totalAudacieuse > 1 ? "s" : ""} disponible${totalAudacieuse > 1 ? "s" : ""}`
        : "Aucun destin disponible";

    // ── Grisage si épuisé ──
    document.getElementById("voieOrdinaire").classList.toggle("epuise", totalOrdinaire === 0);
    document.getElementById("voieAudacieuse").classList.toggle("epuise", totalAudacieuse === 0);
}

function calculerTotalVoie(voieAPI) {
    if (!disponibilites) return 0;
    // voieAPI = "ordinaire" ou "audacieux"
    // les clés de disponibilites : "lune-ordinaire", "epees-audacieux", etc.
    return ["lune", "epees", "couronne"].reduce((sum, symbole) => {
        const cle = `${symbole}-${voieAPI}`;
        return sum + (disponibilites[cle] ?? 0);
    }, 0);
}

// ──────────────────────────────────────────────
//  Affichage compteurs — étape 3 (symboles)
// ──────────────────────────────────────────────

function afficherCompteursSymboles() {
    if (!disponibilites || !voieChoisie) return;

    // voieChoisie = "ordinaire" | "audacieuse" (affichage)
    // l'API stocke "ordinaire" | "audacieux"
    const voieAPI = voieChoisie === "audacieuse" ? "audacieux" : "ordinaire";

    const map = {
        lune:     "compteurSymboleLune",
        epees:    "compteurSymboleEpees",
        couronne: "compteurSymboleCouronne",
    };

    for (const [symbole, elId] of Object.entries(map)) {
        const cle  = `${symbole}-${voieAPI}`;
        const dispo = disponibilites[cle] ?? 0;
        const btn  = document.querySelector(`.symboleBtn[data-symbole="${symbole}"]`);
        const el   = document.getElementById(elId);

        if (dispo === 0) {
            btn.classList.add("epuise");
            el.textContent = "Plus de destins disponibles";
        } else {
            btn.classList.remove("epuise");
           // el.textContent = `${dispo} destin${dispo > 1 ? "s" : ""} disponible${dispo > 1 ? "s" : ""}`; //
        }
    }
}

// ──────────────────────────────────────────────
//  Étape 1 — Choix de la voie
// ──────────────────────────────────────────────

function choisirVoie(voie) {
    // Sécurité : bloquer si la voie est épuisée
    const elVoie = document.getElementById(voie === "ordinaire" ? "voieOrdinaire" : "voieAudacieuse");
    if (elVoie && elVoie.classList.contains("epuise")) return;
    
    voieChoisie = voie;  // "ordinaire" | "audacieuse"

    // Feedback visuel sur la carte
    document.getElementById("voieOrdinaire").style.opacity  = voie === "ordinaire"  ? "1" : "0.6";
    document.getElementById("voieAudacieuse").style.opacity = voie === "audacieuse" ? "1" : "0.6";

    // Mettre à jour les compteurs de symboles avant d'afficher l'étape 3
    afficherCompteursSymboles();

    setTimeout(() => allerEtape(2), 350);
}

// ──────────────────────────────────────────────
//  Étape 2 — Question absurde
// ──────────────────────────────────────────────

function validerQuestion() {
    const reponse = document.getElementById("reponseQuestion").value.trim();
    if (!reponse) {
        document.getElementById("reponseQuestion").focus();
        return;
    }
    sessionStorage.setItem("oracle_reponse", reponse);
    allerEtape(3);
}

// ──────────────────────────────────────────────
//  Étape 3 — Choix du symbole
// ──────────────────────────────────────────────

function choisirSymbole(symbole) {
    // Vérifier que le symbole n'est pas épuisé (sécurité double)
    const btn = document.querySelector(`.symboleBtn[data-symbole="${symbole}"]`);
    if (btn && btn.classList.contains("epuise")) return;

    symboleChoisi = symbole;

    // Feedback visuel
    document.querySelectorAll(".symboleBtn").forEach(b => {
        b.classList.toggle("selectionne", b.dataset.symbole === symbole);
    });

    // Ouvrir la modale de confirmation
    setTimeout(() => ouvrirModaleSymbole(), 400);
}

function ouvrirModaleSymbole() {
    const c     = CONFIG_SYMBOLE[symboleChoisi];
    const voie  = LIBELLE_VOIE[voieChoisie] ?? voieChoisie;

    document.getElementById("modaleTitre").textContent = c.titre;
    document.getElementById("modaleTexte").textContent = c.texte;

    // Coloration selon la voie
    const voieCss = voieChoisie; // "ordinaire" | "audacieuse"
    document.getElementById("modaleConfirmation").className = voieCss;
    document.getElementById("btnConfirmer").className       = voieCss;

    document.getElementById("overlayConfirmation").classList.add("show");
}

function fermerModale() {
    document.getElementById("overlayConfirmation").classList.remove("show");
    symboleChoisi = null;
    document.querySelectorAll(".symboleBtn").forEach(b => b.classList.remove("selectionne"));
}

function procederTirage() {
    if (!voieChoisie || !symboleChoisi) return;

    // Convertir "audacieuse" (affichage) → "audacieux" (API)
    const voieAPI = voieChoisie === "audacieuse" ? "audacieux" : "ordinaire";

    sessionStorage.setItem("oracle_symbole",  symboleChoisi);
    sessionStorage.setItem("oracle_voie",     voieAPI);
    sessionStorage.setItem("oracle_question", questionTiree || "");

    window.location.href = "tirage.html";
}

// Fermer la modale en cliquant l'overlay
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("overlayConfirmation");
    if (overlay) {
        overlay.addEventListener("click", function(e) {
            if (e.target === this) fermerModale();
        });
    }
});

// ──────────────────────────────────────────────
//  Navigation entre étapes
// ──────────────────────────────────────────────

function allerEtape(num) {
    document.querySelectorAll(".etape").forEach((el, i) => {
        el.classList.toggle("active", i + 1 === num);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}