/* ═══════════════════════════════════════════════════════
   L'ORACLE DU DESTIN — Modèle Mongoose
   models/User.js
═══════════════════════════════════════════════════════ */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    prenom:     { type: String, required: true, trim: true },
    nom:        { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, required: true },
    aDejasTire: { type: Boolean, default: false },
    voie:       { type: String, default: null },       // 'ordinaire' | 'audacieux'
    symbole:    { type: String, default: null },       // 'lune' | 'epees' | 'couronne'
    question:   { type: String, default: null },       // question absurde posée
    reponse:    { type: String, default: null },       // réponse de l'utilisateur
    destin:     { type: String, default: null },       // thème de déguisement
    signe:      { type: String, default: null },       // phrase poétique/prophétique
    mission:    { type: String, default: null },       // mission secrète pour la soirée
    artefact:   { type: String, default: null },       // objet à porter/apporter
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);