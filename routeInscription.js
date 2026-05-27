/* ═══════════════════════════════════════════════════════
   L'ORACLE DU DESTIN — Route : Inscription
   routeInscription.js

   POST /api/inscription
   Body   : { prenom, nom, email, motDePasse }
   Succès : { succes: true, token, utilisateur: { id, email, prenom, nom, aDejasTire } }
   Erreur : { succes: false, message }
═══════════════════════════════════════════════════════ */

const express = require('express');

// ✦ MODIFIÉ — reçoit User (modèle Mongoose) au lieu de users (tableau)
module.exports = (User, bcrypt, jwt, JWT_SECRET) => {
    const router = express.Router();

    router.post('/api/inscription', async (req, res) => {
        const { prenom, nom, email, motDePasse } = req.body;

        /* ── 1. Validation des champs ─────────────────── */

        if (!prenom || !nom || !email || !motDePasse) {
            return res.status(400).json({
                succes: false,
                message: "Tous les champs sont obligatoires."
            });
        }

        if (motDePasse.length < 8) {
            return res.status(400).json({
                succes: false,
                message: "Le mot de passe doit contenir au moins 8 caractères."
            });
        }

        /* ── 2. Vérifier si l'email existe déjà ──────── */

        // ✦ MODIFIÉ — User.findOne() remplace users.find()
        const emailExistant = await User.findOne({ email: email.trim().toLowerCase() });
        if (emailExistant) {
            return res.status(409).json({ succes: false, message: "Cet email est déjà utilisé." });
        }

        /* ── 3. Hachage du mot de passe ───────────────── */

        const motDePasseHache = await bcrypt.hash(motDePasse, 12);

        /* ── 4. Création de l'utilisateur ─────────────── */

        // ✦ MODIFIÉ — User.create() remplace la construction manuelle + users.push()
        const nouvelUtilisateur = await User.create({
            prenom:     prenom.trim(),
            nom:        nom.trim(),
            email:      email.trim(),
            password:   motDePasseHache,
            // aDejasTire, voie, destin : valeurs par défaut définies dans le schéma
        });

        /* ── 5. Génération du token JWT ───────────────── */

        // ✦ MODIFIÉ — on utilise _id (identifiant MongoDB) au lieu de Date.now()
        const token = jwt.sign(
            { id: nouvelUtilisateur._id, email: nouvelUtilisateur.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        /* ── 6. Réponse (sans renvoyer le mot de passe) ─ */

        console.log(`✦ Nouvelle âme inscrite : ${nouvelUtilisateur.prenom} ${nouvelUtilisateur.nom} — ${nouvelUtilisateur.email}`);

        return res.status(201).json({
            succes: true,
            token,
            utilisateur: {
                id:         nouvelUtilisateur._id,  // ✦ MODIFIÉ — _id MongoDB
                email:      nouvelUtilisateur.email,
                prenom:     nouvelUtilisateur.prenom,
                nom:        nouvelUtilisateur.nom,
                aDejasTire: false,
            }
        });
    });

    return router;
};

