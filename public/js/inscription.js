/* ═══════════════════════════════════════════════════════
   L'ORACLE DU DESTIN — JS Inscription
   public/js/inscription.js
   Branche le formulaire sur POST /api/inscription
═══════════════════════════════════════════════════════ */
"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ── Si déjà connecté, rediriger ──────────────────────
    if (localStorage.getItem("oracle_token")) {
        const u = JSON.parse(localStorage.getItem("oracle_user") || "{}");
        window.location.href = u.aDejasTire ? "/profil.html" : "/accueil.html";
        return;
    }*/

    const form = document.getElementById("formInscription");
    const btnInscrire = document.getElementById("btnInscrire");
    const msgRetour = document.getElementById("messageRetour");

    // ── Helpers affichage ────────────────────────────────

    function afficherErreurChamp(idErreur, message) {
        const el = document.getElementById(idErreur);
        if (!el) return;
        el.textContent = message;
        el.style.display = message ? "block" : "none";
    }

    function effacerErreurs() {
        ["errNom", "errPrenom", "errEmail", "errMdp", "errConf"].forEach(id => {
            afficherErreurChamp(id, "");
        });
        msgRetour.textContent = "";
        msgRetour.className   = "message-retour";
    }

    function afficherMessageGlobal(texte, type) {
        msgRetour.textContent = texte;
        msgRetour.className   = `message-retour ${type}`; // "succes" ou "erreur"
    }

    // ── Validation côté client ───────────────────────────

    function valider(nom, prenom, email, mdp, conf) {
        let valide = true;

        if (nom.trim().length < 2) {
            afficherErreurChamp("errNom", "Le nom doit contenir au moins 2 caractères.");
            valide = false;
        }
        if (prenom.trim().length < 2) {
            afficherErreurChamp("errPrenom", "Le prénom doit contenir au moins 2 caractères.");
            valide = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            afficherErreurChamp("errEmail", "Adresse email invalide.");
            valide = false;
}
        if (mdp.length < 8) {
            afficherErreurChamp("errMdp", "Le mot de passe doit contenir au moins 8 caractères.");
            valide = false;
        }
        if (mdp !== conf) {
            afficherErreurChamp("errConf", "Les mots de passe ne correspondent pas.");
            valide = false;
        }

        return valide;
    }

    // ── Soumission du formulaire ─────────────────────────

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        effacerErreurs();

        const nom = document.getElementById("nom").value;
        const prenom = document.getElementById("prenom").value;
        const email = document.getElementById("email").value;
        const motDePasse = document.getElementById("motDePasse").value;
        const confirmation = document.getElementById("confirmation").value;

        // Validation locale avant d'envoyer
        if (!valider(nom, prenom, email, motDePasse, confirmation)) return;

        // Désactiver le bouton pendant la requête
        btnInscrire.disabled    = true;
        btnInscrire.textContent = "Inscription en cours…";

        try {
            const reponse = await fetch("/api/inscription", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom, prenom, email, motDePasse }),
            });

            const data = await reponse.json();

            if (data.succes) {
                // Stocker le token et les infos utilisateur
                localStorage.setItem("oracle_token", data.token);
                localStorage.setItem("oracle_user",  JSON.stringify({
                    id: data.utilisateur.id,
                    email: data.utilisateur.email,
                    prenom: data.utilisateur.prenom,
                    aDejasTire: false,
                }));

                afficherMessageGlobal("Inscription réussie ! Redirection…", "succes");

                // Redirection vers le choix de voie
                setTimeout(() => {
                    window.location.href = "/accueil.html";
                }, 1000);

            } else {
                // Erreur renvoyée par le serveur (email déjà utilisé, etc.)
                afficherMessageGlobal(data.message || "Une erreur est survenue.", "erreur");
                btnInscrire.disabled    = false;
                btnInscrire.textContent = "Inscription échouée, réessayer";
            }

        } catch (erreur) {
            // Problème réseau ou serveur hors ligne
            afficherMessageGlobal("Impossible de contacter l'Oracle. Vérifiez votre connexion.", "erreur");
            btnInscrire.disabled    = false;
            btnInscrire.textContent = "Inscription échouée, réessayer";
        }
    });
});