/* ═══════════════════════════════════════════════════════
   L'ORACLE DU DESTIN — Tirage JS enrichi
   public/js/tirage.js
═══════════════════════════════════════════════════════ */
"use strict";

const PHASES = [
    "Établissement du contact avec l'Oracle",
    "L'Oracle consulte les astres",
    "L'Oracle interprète les signes",
    "L'Oracle prépare la révélation",
    "…",
    "Ton destin est :"
];

const LIBELLE_VOIE = {
    ordinaire:  "Voie Ordinaire",
    audacieux:  "Voie Audacieuse"
};

const LIBELLE_SYMBOLE = {
    lune:     "☽ Lune",
    epees:   "⚔︎ Epées",
    couronne: "♛ Couronne"
};

// ──────────────────────────────────────────────
//  Utilitaires
// ──────────────────────────────────────────────

function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setTexte(texte) {
    const el = document.getElementById("texteTirage");
    el.classList.remove("show");
    el.classList.add("hidden");
    await pause(1400);
    el.textContent = texte;
    el.classList.remove("hidden");
    el.classList.add("show");
}

function afficherRevelation(theme, symbole) {
    const el = document.getElementById("revelationDestin");
    el.innerHTML = `<div>${theme}</div>`;
    // Forcer un reflow avant d'ajouter la classe
    el.offsetHeight;
    el.classList.add("show");
}

async function afficherDetails(signe, mission, artefact) {
    document.getElementById("texteSigne").textContent    = signe;
    document.getElementById("texteMission").textContent  = mission;
    document.getElementById("texteArtefact").textContent = artefact;

    document.getElementById("destinsDetails").classList.add("show");

    await pause(200);
    document.getElementById("carteSigne").classList.add("visible");
    await pause(300);
    document.getElementById("carteArtefact").classList.add("visible");
    await pause(400);
    document.getElementById("carteMission").classList.add("visible");
}

function afficherSerment() {
    document.getElementById("sermentZone").classList.add("show");
}

function afficherActions() {
    const el = document.getElementById("actions");
    if (el) el.classList.add("show");
}

// ──────────────────────────────────────────────
//  Appel API /tirage
// ──────────────────────────────────────────────

async function tirerDestin(voie, symbole, question, reponse) {
    const token = localStorage.getItem("oracle_token");
    if (!token) {
        window.location.href = "/index.html";
        throw new Error("Non connecté.");
    }

    const response = await fetch("/tirage", {
        method: "POST",
        headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ voie, symbole, question, reponse })
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 403) {
            window.location.href = "/profil.html";
        }
        throw new Error(data.error ?? `Erreur serveur (${response.status})`);
    }

    return data;
}

// ──────────────────────────────────────────────
//  Sauvegarde localStorage
// ──────────────────────────────────────────────

function sauvegarderDestin(data) {
    const user = JSON.parse(localStorage.getItem("oracle_user") || "{}");
    user.aDejasTire = true;
    user.voie       = data.voie;
    user.symbole    = data.symbole;
    user.destin     = data.theme;
    user.signe      = data.signe;
    user.mission    = data.mission;
    user.artefact   = data.artefact;
    localStorage.setItem("oracle_user", JSON.stringify(user));
}

// ──────────────────────────────────────────────
//  Serment
// ──────────────────────────────────────────────

function jurer() {
    const btn = document.getElementById("btnSerment");
   // btn.textContent = "✦ Serment prononcé ✦";
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.cursor = "default";
    setTimeout(() => afficherActions(), 600);
}

// ──────────────────────────────────────────────
//  Navigation
// ──────────────────────────────────────────────

function voirProfil() {
    window.location.href = "profil.html";
}

// ──────────────────────────────────────────────
//  Séquence principale
// ──────────────────────────────────────────────

async function lancerTirage() {
    // Récupérer les données du rituel depuis sessionStorage
    const voie     = sessionStorage.getItem("oracle_voie");
    const symbole  = sessionStorage.getItem("oracle_symbole");
    const question = sessionStorage.getItem("oracle_question") || "";
    const reponse  = sessionStorage.getItem("oracle_reponse")  || "";

    if (!voie || !symbole) {
        window.location.href = "rituel.html";
        return;
    }

    // ── Phase 1 : suspense ──
    for (let i = 0; i < PHASES.length; i++) {
        await setTexte(PHASES[i]);
        await pause(3000);
    }

    // ── Phase 2 : appel API + effacement en parallèle ──
    try {
        const [_, resultat] = await Promise.all([
            setTexte(""),
            tirerDestin(voie, symbole, question, reponse)
        ]);

        await pause(800);

        // ── Phase 3 : révélation du thème ──
        afficherRevelation(resultat.theme, resultat.voie, resultat.symbole);
        sauvegarderDestin(resultat);

        await pause(1200);

        // ── Phase 4 : signe, mission, artefact ──
        await afficherDetails(resultat.signe, resultat.mission, resultat.artefact);

        await pause(1000);

        // ── Phase 5 : serment ──
        afficherSerment();

        // Nettoyer sessionStorage
        sessionStorage.removeItem("oracle_voie");
        sessionStorage.removeItem("oracle_symbole");
        sessionStorage.removeItem("oracle_question");
        sessionStorage.removeItem("oracle_reponse");

    } catch (erreur) {
        await setTexte("L'Oracle est silencieux… Une ombre trouble la révélation.");
        console.error("[Tirage] Erreur API :", erreur.message);
    }
}

window.addEventListener("DOMContentLoaded", lancerTirage);