let voieChoisie = null;

const config={
    ordinaire: {
        titre: "Voie Ordinaire",
        texte: "Tu as choisi la clémence. Ton destin sera facile à réaliser — mais l'Oracle n'en reste pas moins imprévisible. Prêt à entendre sa sentence ?",
    },
    audacieuse: {
        titre: "Voie Audacieuse",
        texte: "Tu as choisi l'audace. L'Oracle va piocher dans ses destins les plus fous — certains demanderont du courage, de la créativité, peut-être même du sacrifice vestimentaire. Dernière chance de reculer.",
    }
};

function ConfirmerVoie(voie) {
    voieChoisie = voie;
    const c = config[voie];

    document.getElementById("modaleTitre").textContent = c.titre;
    document.getElementById("modaleTexte").textContent = c.texte;

    document.getElementById("modaleConfirmation").className = voie;
    document.getElementById("btnConfirmer").className = voie;

    document.getElementById("overlayConfirmation").classList.add("show");

}

function fermerModale() {
    document.getElementById("overlayConfirmation").classList.remove("show");
    voieChoisie = null;
}

function procederTirage() {
    if (voieChoisie) {
        window.location.href = "tirage.html?voie=" + voieChoisie;
    }
}

document.getElementById("overlayConfirmation").addEventListener("click", function(e) {
    if (e.target === this) fermerModale();
});