/* ═══════════════════════════════════════════════════════
   L'ORACLE DU DESTIN — Route : Connexion
   routeConnexion.js

   POST /api/connexion
   Body   : { email, motDePasse }
   Succès : { succes: true, token, utilisateur: { id, email, prenom, nom, aDejasTire, voie, destin } }
   Erreur : { succes: false, message }
═══════════════════════════════════════════════════════ */

const express = require('express');
const { sign } = require('jsonwebtoken');

// ✦ MODIFIÉ — reçoit User (modèle Mongoose) au lieu de users (tableau)
module.exports = (User, bcrypt, jwt, JWT_SECRET) => {
    const router = express.Router();

    router.post('/api/connexion', async (req, res) => {
        const { email, motDePasse } = req.body;
        
        // ── 1. Validation des champs ─────────────────────
        if (!email || !motDePasse) {
            return res.status(400).json({
                succes: false,
                message: "L'email et le mot de passe sont obligatoires."
            });
        }

        // ── 2. Recherche de l'utilisateur ────────────────

        // ✦ MODIFIÉ — User.findOne() remplace users.find()
        const utilisateur = await User.findOne({ email: email.trim().toLowerCase() });

        if (!utilisateur) {
            return res.status(401).json({
                succes: false,
                message: "Email ou mot de passe incorrect."
            });
        }

        // ── 3. Vérification du mot de passe ──────────────
        const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.password);

        if (!motDePasseValide) {
            return res.status(401).json({
                succes: false,
                message: "Email ou mot de passe incorrect."
            });
        }

        // ── 4. Génération du token JWT ────────────────────

        // ✦ MODIFIÉ — on utilise _id (identifiant MongoDB) au lieu de id numérique
        const token = jwt.sign(
            { id: utilisateur._id, email: utilisateur.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // ── 5. Réponse (sans renvoyer le mot de passe) ────
        console.log(`✦ Connexion : ${utilisateur.email} | Tirage : ${utilisateur.aDejasTire}`);

        return res.status(200).json({
            succes: true,
            token,
            utilisateur: {
                id:         utilisateur._id,    // ✦ MODIFIÉ — _id MongoDB
                email:      utilisateur.email,
                prenom:     utilisateur.prenom,
                nom:        utilisateur.nom,
                aDejasTire: utilisateur.aDejasTire,
                voie:       utilisateur.voie   || null,
                symbole:    utilisateur.symbole || null,
                question:   utilisateur.question || null,
                reponse:    utilisateur.reponse  || null,
                signe:      utilisateur.signe   || null,
                mission:    utilisateur.mission || null,
                artefact:   utilisateur.artefact || null,
                destin:     utilisateur.destin || null,
            }
        });
    });

    return router;
};

console.log("Route de connexion prête à être utilisée.");
console.log("utilisateur : { email, prenom, nom, aDejasTire, voie, destin }");