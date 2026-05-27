/* ═══════════════════════════════════════════════════════
   L'ORACLE DU DESTIN — Serveur principal
   app.js
═══════════════════════════════════════════════════════ */

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const path    = require('node:path');

require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✦ Oracle connecté à MongoDB Atlas'))
    .catch(err => {
        console.error('✦ Erreur de connexion MongoDB :', err.message);
        process.exit(1);
    });

const User = require('./models/User');

// ──────────────────────────────────────────────
//  Questions absurdes (tirées aléatoirement)
// ──────────────────────────────────────────────

const QUESTIONS_ABSURDES = [
    "Tu fais plus confiance à ton instinct ou à ta logique ?",
    "Quel moment de la journée te ressemble le plus ?",
    "Tu préfères comprendre ou ressentir ?",
    "Tu préfères être oublié ou être mal compris ?",
    "Tu fais plus confiance au passé ou au futur ?",
    "Tu es plus calme ou tempête ?",
    "Tu préfères suivre ou dévier ?",
    "Tu es plus proche de partir ou d’arriver ?",
    "Tu crois plus aux choix ou aux coincidences ?",
    "Tu préfères le bruit ou le silence ?",
];

// ──────────────────────────────────────────────
//  Destins — 6 pools (symbole x voie)
//  Chaque destin : { theme, signe, mission, artefact }
// ──────────────────────────────────────────────

/*
        {
            theme: "theme",
            signe: "Prophetie",
            mission: "Mission",
            artefact: "Artefact"
        },

*/

const DESTINS = {

    // ═══ LUNE x ORDINAIRE ═══
    "lune-ordinaire": [
        {
            theme: "Medium voyant frauduleux",
            signe: "Tu vois et entends, les esprits ont parlé: ton verre ne restra pas vide.",
            mission: "Prédis 3 événements de la soirée à 3 personnes différentes en leur tirant les cartes (Les prédictions devront se réaliser)",
            artefact: "Une boule de cristal et Carnet de prédictions"
        },
        {
            theme: "Celui/Celle qui a trouvé son déguisement en 10 minutes",
            signe: "L'improvisation est ta forme de génie.",
            mission: "Explique ton costume comme si tu l'avais préparé pendant des semaines.",
            artefact: "Une étiquette DEGUISEMENT épinglée sur toi"
        },
        {
            theme: "Dormeur professionnel",
            signe: "Tu rêves plus que tu ne vis, et pourtant tu es toujours là au réveil.",
            mission: "Faire une sieste de 5 minutes en plein milieu de la soirée, n'importe où, n'importe comment.",
            artefact: "Un oreiller et un plaid"
        },
        {
            theme: "Détective de nanars",
            signe: "Tu lis entre les lignes et tu en fais ta vérité.",
            mission: "Désigner 2 suspects imaginaires et les interroger avec une lampe",
            artefact: "Imperméable trop grand"
        },
        {
            theme: "Extraterrestre en visite sur Terre",
            signe: "Venu de loin et arrivé de nulle part, tu es en quête de ton nouveau chez toi.",
            mission: "Demander à quelqu'un de t'expliquer un concept humain incompréhensible pour toi (ex : 'l'amour', 'le temps', 'les réseaux sociaux').",
            artefact: "Un t-shirt I LOVE EARTH"
        },
        {
            theme: "Voyageur temporel qui vient du futur",
            signe: "Tu connais déjà la fin, tu ne dois pas la laisser arriver.",
            mission: "Montre à quelqu'un un objet qui vient du futur et explique-lui comment il fonctionne.",
            artefact: "Gadget pour voyager dans le temps"
        },
        {
            theme: "Scientifique fou",
            signe: "Ce que tu appelles une erreur deviendra ta plus grande découverte.",
            mission: "Convaincs 2 personnes de tester ton invention",
            artefact: "Un outil de labo et la blouse blanche"
        }
        
    ],

    // ═══ LUNE x AUDACIEUX ═══
    "lune-audacieux": [
        {
            theme: "Plombier de film X",
            signe: "La fuite sera colmatée. Ce qui débordera ensuite ne regardera que toi.  ",
            mission: "Proposer tes services à 3 personnes pour résoudre un problème, avec un sous-entendu permanent",
            artefact: "Une clé à molette ou un outil de plomberie porté ostensiblement"
        },
        {
            theme: "Sapin de Noël",
            signe: "Tu donneras sans recevoir, tu brilleras sans être vu, tu vivras sans être compris.",
            mission: "Distribue trois 'cadeaux' symboliques (compliments, objets, gestes).",
            artefact: "Objets accrochés aux branches"
        },
        {
            theme: "Dresseur de pokémon professionnel",
            signe: "Tu les choperas tous, même les plus rares et les plus dangereux.",
            mission: "Constitue une équipe de dresseur de pokémon en choisissant deux personnes et capturez un pokémon ensemble",
            artefact: "Pokeballs accrochées à ta ceinture"
        },
        {
            theme: "Clown dépressif",
            signe: "Les larmes qui coulent ce soir irrigueront les rires de demain.",
            mission: "Fais rire 3 personnes puis casse l'ambiance immédiatement",
            artefact: "Un ballon dégonflé à garder en main"
        },
        {
            theme: "Théoricien du complot",
            signe: "Tout est lié, tu le sais. Bientôt, tout le monde le saura.",
            mission: "Fais croire à 2 personnes que 2 invités sont liés par un secret",
            artefact: "Tableau avec des photos et des fils rouges (en miniature pour emmener partout) "
        },
        {
            theme: "Oeuvre d'art vivante",
            signe: "Tu seras regardé et interprété sans être compris.",
            mission: "3 personnes doivent te contempler et donner une interprétation différente de toi.",
            artefact: "Un cadre + fiche titre de l'oeuvre"
        }
        
    ],

    // ═══ EPEES x ORDINAIRE ═══
    "epees-ordinaire": [
        {
            theme: "Cougar/Pervers de boîte de nuit",
            signe: "L'amour frappe toujours là où on ne l'attend pas. Tu devras cepedant attendre encore un peu.",
            mission: "Placer des répliques de blagues lourdes et essayer de faire un coller/serrer",
            artefact: "Motif léopard/Col de chemise relevé "
        },
        {
            theme: "Coach fitness extrême (très actif.ve sur Tinder)",
            signe: "Tu transformeras quelqu'un ce soir. Cette personne ne s'y attend pas encore.",
            mission: "Evaluer le potentiel physique de 2 personnes et leur faire faire un exercice de muscu",
            artefact: "Pot de protéines (pas rempli de protéines)"
        },
        {
            theme: "DJ kermesse",
            signe: "Les moments calmes ne dureront jamais longtemps avec toi",
            mission: "Propose une playlist à quelqu'un. Défends tes choix musicaux avec passion.",
            artefact: "Platine en carton"
        },
        {
            theme: "Animateur de Club Med",
            signe: "Tu porteras l'énergie de tous, même ceux qui feront semblant de ne pas te voir.",
            mission: "Lancer une activité collective avec au moins 5 participants",
            artefact: "Micro casque et sifflet"
        },
        {
            theme: "Dernier au cross du collège",
            signe: "Tu arriveras, pas en premier, mais tu arriveras.",
            mission: "Arriver en retard pour le gâteau à cause d'une pointe de coté",
            artefact: "Dossard numéroté"
        },
        {
            theme: "Survivant de festival",
            signe: "La boue d'hier nourrit la légende de demain",
            mission: "Raconter à 3 personnes un souvenir de festival totalement inventé avec nostalgie",
            artefact: "Bracelets de festivals sur le bras"
        },
        {
            theme: "Version opposée de toi-même",
            signe: "Ton double te regarde faire sans te reconnaître. Il se demande comment tu as pu devenir ce que tu es.",
            mission: "Se présenter avec un nom et une personnalité inventés",
            artefact: "Un vêtement et accessoire que tu ne porterais jamais d'habitude"
        },
        
    ],

    // ═══ EPEES x AUDACIEUX ═══
    "epees-audacieux": [
        
        {
            theme: "Sac poubelle fashion",
            signe: "Tu transformes le rejeté en désiré, le laid en sublime, le jetable en indispensable.",
            mission: "Organiser un défilé de mode avec au moins 2 personnes",
            artefact: "Le nom de ta marque de mode sur ta tenue (ex: 'Garbage Couture')+ Ton portfolio de toi avec tes différentes créations "
        },
        {
            theme: "Éthiquement discutable",
            signe: "Ce qui choque aujourd'hui fera réfléchir demain.",
            mission: "Défends publiquement une opinion que tu ne tiens pas vraiment. Jusqu'au bout.",
            artefact: "Un argumentaire écrit et plastifié à distribuer pour défendre son costume."
        },
        {
            theme: "Résident d'EHPAD en cavale",
            signe: "La liberté retrouvée cette nuit fera le tour des couloirs. On en parlera longtemps. ",
            mission: "Raconter à 3 personnes ton évasion, avec des détails logistiques très précis",
            artefact: "Ton déambulateur "
        },
        {
            theme: "Boss final de jeu vidéo",
            signe: "Quelqu’un pensera pouvoir te battre. Il aura tort…",
            mission: "Défier 3 personnes en duel (en annonçant le jeu et les règles)",
            artefact: "Barre de vie + une carte de stats "
        },
        {
            theme: "Objet du quotidien",
            signe: "Tu seras indispensable et personne ne te remerciera",
            mission: "Tu dois te faire utiliser par 3 personnes.",
            artefact: "Un mode d'emploi fait maison, illustré, plastifié — décrivant comment t'utiliser."
        },
        {
            theme: "Fan extrême d'un concept ultra-niche",
            signe: "Tu aimeras profondément ce que les autres ne voient pas. Et tu le feras savoir.",
            mission: "Rallier 2 nouveaux fans à ta cause avant la fin de la soirée.",
            artefact: "Un merch fait maison de ta passion"
        }
        
    ],

    // ═══ COURONNE x ORDINAIRE ═══
    "couronne-ordinaire": [
        {
            theme: "Star de Tv réalité",
            signe: "La France entière finira par savoir qui tu es.",
            mission: "Dire à quelqu'un que son comportement n'est pas correct et aller expliquer ton point de vue à une personne non-concernée",
            artefact: "Faux micro-cravate accroché au col"
        },
        {
            theme: "Rockstar en fin de carrière",
            signe: "Ton dernier moment sera le plus grand",
            mission: "Performer ton concert d'adieu avec les meilleurs hits de ta carrière",
            artefact: "Une guitare (peu importe comment elle est faite)"
        },
        {
            theme: "Icône de mode incomprise",
            signe: "L'avant-garde souffre toujours en silence. Le monde finira par voir ce que tu vois",
            mission: "Expliquer chaque pièce de ta tenue comme unique et avant-gardiste",
            artefact: "Accessoire totalement inexplicable porté comme une évidence."
        },
        {
            theme: "Véronique (50 ans) qui va faire la bringue avec ses cops",
            signe: "Tu porteras la soirée sur tes épaules. Comme toujours depuis trente ans.",
            mission: "Glisser A MON EPOQUE dans au moins 3 conversations sans que personne ne se plaigne. ",
            artefact: "Un verre de rosé en main"
        },
        {
            theme: "Prince/Princesse Disney en dépression",
            signe: "Le happy end existe mais ne dure jamais très longtemps.",
            mission: "Raconter à 3 personnes comment l'histoire s'est réellement finie",
            artefact: "La cigarette toujours à la main"
        },
        {
            theme: "Magicien de mariage pas cher",
            signe: "Le grand tour arrive et tu seras acclamé.",
            mission: "Réaliser 3 tours de magie qui fonctionnent plus ou moins bien, et assurer quand même grâce à ton charisme",
            artefact: "Baguette, cape et chapeau"
        },
        {
            theme: "Version cheap d'un héros",
            signe: "Le sauveur n'est pas celui qu'on attend. Tu en seras la démonstration.",
            mission: "Secourir 2 personnes du situation banale avec un sérieux de superhéros.",
            artefact: "Un accessoire symbolisant un héros complètement raté"
        }
    ],

    // ═══ COURONNE x AUDACIEUX ═══
    "couronne-audacieux": [
        {
            theme: "Dieu/Déesse viré de l'Olympe",
            signe: "L'exil est temporaire mais les mortels s'en souviendront.",
            mission: "Accorder 2 faveurs divines à des mortels, en echange d'une offrande.",
            artefact: "Posséder les attributs qui te correspondent"
        },
        {
            theme: "Drag queen",
            signe: "Personne ne regardera ailleurs quand tu entreras dans la pièce.",
            mission: "Organiser un lip-sync avec au moins 2 personnes",
            artefact: "Ta perruque est ta meilleure amie"
        },
        {
            theme: "Homme-Carton/Femme-Carton",
            signe: "Tu te caches derrière une façade...Mais tôt ou tard on te pliera.",
            mission: "Les invités doivent signer sur ton costume",
            artefact: "Un costume entièrement en carton avec au moins 3 éléments découpés et assemblés."
        },
        {
            theme: "Expert en EVJF/EVG insupportable",
            signe: "La soirée que tu organises sera racontée pendant des années (pas toujours en bien)",
            mission: "Organise un strip-tease pour l'élu de la soirée (avec le strip-teaser de ton choix)",
            artefact: "Accessoires de (très) mauvais goût trouvés à GIFI."
        },
        {
            theme: "Gourou de secte",
            signe: "Le mouvement commence toujours par une nuit. Ils te suivront sans savoir pourquoi.",
            mission: "Recruter 3 disciples et leur enseigner un geste rituel secret.",
            artefact: "Ton baton de gourou et ton propectus de recrutement"
        },
        {
            theme: "Champion régional d'un sport inexistant",
            signe: "La discipline que tu représentes sera reconnue, sois-en sûr",
            mission: "Organiser un mini-tournoi avec quelques personnes de ton sport",
            artefact: "Médailles et coupe portées avec fierté"
        },
    ]
};

// ──────────────────────────────────────────────
//  App & Middleware
// ──────────────────────────────────────────────

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const authRegister = require('./routeInscription');
const authLogin    = require('./routeConnexion');

app.use(authRegister(User, bcrypt, jwt, JWT_SECRET));
app.use(authLogin(User, bcrypt, jwt, JWT_SECRET));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// ──────────────────────────────────────────────
//  Middleware d'authentification JWT
// ──────────────────────────────────────────────

async function authentifier(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Vous devez être connecté pour consulter l'Oracle." });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const utilisateur = await User.findById(payload.id);
        if (!utilisateur) {
            return res.status(401).json({ error: "Utilisateur introuvable." });
        }
        req.utilisateur = utilisateur;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token invalide ou expiré." });
    }
}

// ──────────────────────────────────────────────
//  GET /api/question — tire une question absurde
// ──────────────────────────────────────────────

app.get('/api/question', authentifier, (req, res) => {
    const q = QUESTIONS_ABSURDES[Math.floor(Math.random() * QUESTIONS_ABSURDES.length)];
    res.json({ question: q });
});

// ──────────────────────────────────────────────
//  POST /tirage
// ──────────────────────────────────────────────

app.post('/tirage', authentifier, async (req, res) => {
    const utilisateur = req.utilisateur;

    if (utilisateur.aDejasTire) {
        return res.status(403).json({
            error: "L'Oracle a déjà parlé pour toi. Ton destin est scellé."
        });
    }

    const { voie, symbole, question, reponse } = req.body;

    // Validation
    const voiesValides    = ['ordinaire', 'audacieux'];
    const symbolesValides = ['lune', 'epees', 'couronne'];

    if (!voiesValides.includes(voie)) {
        return res.status(400).json({ error: "Voie invalide." });
    }
    if (!symbolesValides.includes(symbole)) {
        return res.status(400).json({ error: "Symbole invalide." });
    }

    const cle = `${symbole}-${voie}`;
    const pool = DESTINS[cle];

    if (!pool) {
        return res.status(400).json({ error: "Combinaison symbole/voie inconnue." });
    }

    // Destins déjà attribués pour ce pool
    const dejaAttribues = await User.find(
        { aDejasTire: true, symbole, voie },
        'destin'
    ).then(users => users.map(u => u.destin));

    const disponibles = pool.filter(d => !dejaAttribues.includes(d.theme));

    if (disponibles.length === 0) {
        return res.status(409).json({
            error: "L'Oracle a épuisé tous les destins pour cette combinaison. Contacte l'organisateur."
        });
    }

    // Tirage
    const destins_tire = disponibles[Math.floor(Math.random() * disponibles.length)];

    /* Intégration de la réponse absurde dans le signe (optionnel, subtil)
    let signePersonnalise = destins_tire.signe;
    if (reponse && reponse.trim().length > 0) {
        signePersonnalise = signePersonnalise + ` (Et tu le sais — "${reponse.trim()}".)`;
    }
    */ 

    // Sauvegarde
    utilisateur.aDejasTire = true;
    utilisateur.voie       = voie;
    utilisateur.symbole    = symbole;
    utilisateur.question   = question || null;
    utilisateur.reponse    = reponse  || null;
    utilisateur.destin     = destins_tire.theme;
    utilisateur.signe      = destins_tire.signe;
    utilisateur.mission    = destins_tire.mission;
    utilisateur.artefact   = destins_tire.artefact;
    await utilisateur.save();

    console.log(`✦ Tirage : ${utilisateur.prenom} → [${cle}] ${destins_tire.theme}`);

    res.json({
        voie,
        symbole,
        theme:    destins_tire.theme,
        signe:    destins_tire.signe,
        mission:  destins_tire.mission,
        artefact: destins_tire.artefact
    });
});

// ──────────────────────────────────────────────
//  GET /api/disponibilites
//  Retourne le nombre de destins encore disponibles
//  par combinaison symbole-voie.
//  Format : { "lune-ordinaire": 3, "lune-audacieux": 2, … }
//
//  À INSÉRER dans app.js, juste avant le bloc
//  "GET /api/stats" (ou n'importe où après le middleware
//  authentifier).
// ──────────────────────────────────────────────
app.get("/api/disponibilites", authentifier, async (req, res) => {
    const resultat = {};

    for (const [cle, pool] of Object.entries(DESTINS)) {
        const [symbole, voie] = cle.split("-");

        const dejaAttribues = await User.find(
            { aDejasTire: true, symbole, voie },
            "destin"
        ).then(users => users.map(u => u.destin));

        resultat[cle] = pool.filter(d => !dejaAttribues.includes(d.theme)).length;
    }

    res.json(resultat);
});



// ──────────────────────────────────────────────
//  GET /api/stats
// ──────────────────────────────────────────────

app.get("/api/stats", authentifier, async (req, res) => {
    const total      = await User.countDocuments({ aDejasTire: true });
    const ordinaire  = await User.countDocuments({ aDejasTire: true, voie: "ordinaire" });
    const audacieux  = await User.countDocuments({ aDejasTire: true, voie: "audacieux" });
    const lune       = await User.countDocuments({ aDejasTire: true, symbole: "lune" });
    const epees     = await User.countDocuments({ aDejasTire: true, symbole: "epees" });
    const couronne   = await User.countDocuments({ aDejasTire: true, symbole: "couronne" });

    res.json({ total, ordinaire, audacieux, lune, epees, couronne });
});

// ──────────────────────────────────────────────
//  Routes admin
// ──────────────────────────────────────────────

app.get('/admin/users', async (req, res) => {
    const tous = await User.find({}, 'prenom nom email aDejasTire voie symbole destin signe mission artefact createdAt');
    res.json(tous);
});

app.delete('/admin/users', async (req, res) => {
    await User.deleteMany({});
    res.json({ message: 'Base vidée avec succès.' });
});

app.delete('/admin/users/:email', async (req, res) => {
    const utilisateur = await User.findOneAndDelete({ email: req.params.email.toLowerCase() });
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: `${utilisateur.prenom} ${utilisateur.nom} supprimé.` });
});

app.patch('/admin/users/:email/reset', async (req, res) => {
    const utilisateur = await User.findOneAndUpdate(
        { email: req.params.email.toLowerCase() },
        { aDejasTire: false, voie: null, symbole: null, destin: null, signe: null, mission: null, artefact: null, question: null, reponse: null },
        { new: true }
    );
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: `Tirage de ${utilisateur.prenom} réinitialisé.` });
});

app.get('/admin/themes', async (req, res) => {
    const resultat = {};
    for (const [cle, pool] of Object.entries(DESTINS)) {
        const [symbole, voie] = cle.split('-');
        const dejaAttribues = await User.find(
            { aDejasTire: true, symbole, voie },
            'destin'
        ).then(users => users.map(u => u.destin));

        resultat[cle] = {
            total:       pool.length,
            attribues:   dejaAttribues.length,
            disponibles: pool.filter(d => !dejaAttribues.includes(d.theme)).map(d => d.theme)
        };
    }
    res.json(resultat);
});

// ──────────────────────────────────────────────
//  Lancement
// ──────────────────────────────────────────────

app.listen(3000, () => {
    console.log(`L'Oracle est éveillé sur http://localhost:3000`);
});