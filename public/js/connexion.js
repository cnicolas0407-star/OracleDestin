/* ═══════════════════════════════════════════════════════
   L'ORACLE DU DESTIN — JS Connexion
   public/js/connexion.js
   Branche le formulaire sur POST /api/connexion
═══════════════════════════════════════════════════════ */
"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ── Si déjà connecté, rediriger ──────────────────────
    if (localStorage.getItem("oracle_token")) {
        const u = JSON.parse(localStorage.getItem("oracle_user") || "{}");
        window.location.href = u.aDejasTire ? "/profil.html" : "/accueil.html";
        return;
    }*/

    const form = document.getElementById("formConnexion");
    const btnConnecter = document.getElementById("btnConnecter");
    const msgRetour = document.getElementById("messageRetour");

    // ── Helpers affichage ────────────────────────────────

    function afficherErreurChamp(idErreur, message) {
        const el = document.getElementById(idErreur);
        if (!el) return;
        el.textContent   = message;
        el.style.display = message ? "block" : "none";
    }

    function effacerErreurs() {
        ["errEmail", "errMdp"].forEach(id => afficherErreurChamp(id, ""));
        msgRetour.textContent = "";
        msgRetour.className   = "message-retour";
    }

    function afficherMessageGlobal(texte, type) {
        msgRetour.textContent = texte;
        msgRetour.className   = `message-retour ${type}`; // "succes" ou "erreur"
    }

    // ── Soumission du formulaire ─────────────────────────

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        effacerErreurs();

        const email = document.getElementById("email").value.trim();
        const motDePasse = document.getElementById("motDePasse").value;

        // Validation minimale avant envoi
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            afficherErreurChamp("errEmail", "Email invalide.");
            return;
}
        if (motDePasse.length < 8) {
            afficherErreurChamp("errMdp", "Mot de passe trop court.");
            return;
        }

        btnConnecter.disabled    = true;
        btnConnecter.textContent = "Vérification…";

        try {
            const reponse = await fetch("/api/connexion", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, motDePasse }),
            });

            const data = await reponse.json();

            if (data.succes) {
                // Stocker le token et les infos utilisateur
                localStorage.setItem("oracle_token", data.token);
                localStorage.setItem("oracle_user",  JSON.stringify({
                    id:         data.utilisateur.id,
                    pseudo:     data.utilisateur.pseudo,
                    prenom:     data.utilisateur.prenom,
                    aDejasTire: data.utilisateur.aDejasTire,
                    voie:       data.utilisateur.voie   || null,
                    destin:     data.utilisateur.destin || null,
                    symbole:    data.utilisateur.symbole || [],
                    question:   data.utilisateur.question || null,
                    reponse:    data.utilisateur.reponse  || null,
                    signe:      data.utilisateur.signe   || [],
                    mission:    data.utilisateur.mission || null,
                    artefact:   data.utilisateur.artefact || null,
                }));

                afficherMessageGlobal("Connexion réussie ! Redirection…", "succes");

                // Redirection selon si tirage déjà effectué ou non
                setTimeout(() => {
                    if (data.utilisateur.aDejasTire) {
                        window.location.href = "/profil.html";
                    } else {
                        window.location.href = "/accueil.html";
                    }
                }, 800);

            } else {
                afficherMessageGlobal(data.message || "Pseudo ou mot de passe incorrect.", "erreur");
                btnConnecter.disabled    = false;
                btnConnecter.textContent = "Connexion échouée, réessayer";
            }

        } catch (erreur) {
            afficherMessageGlobal("Impossible de contacter l'Oracle. Vérifiez votre connexion.", "erreur");
            btnConnecter.disabled    = false;
            btnConnecter.textContent = "Connexion échouée, réessayer";
        }
    });
});
