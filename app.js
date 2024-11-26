// Importation des modules nécessaires
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3001;
const cors = require('cors');
app.use(cors());


// Chargement du fichier JSON avec gestion des erreurs
let questionsData = {};
try {
    questionsData = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));
} catch (err) {
    console.error('Erreur lors du chargement du fichier questions.json:', err);
}

// Route pour la racine "/"
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API ! Les routes disponibles sont : /api/categories, /api/categories/:category/questions, etc.');
});

// Route pour obtenir la liste des catégories
app.get('/api/categories', (req, res) => {
    const categories = Object.keys(questionsData);
    res.json(categories);
});

// Route pour obtenir les questions d'une catégorie spécifique
app.get('/api/categories/:category/questions', (req, res) => {
    const category = req.params.category;
    if (questionsData[category]) {
        res.json(questionsData[category].questions);
    } else {
        res.status(404).json({ error: 'Catégorie non trouvée' });
    }
});

// Route pour obtenir la réponse à une question dans une catégorie
app.get('/api/categories/:category/reponses/:questionKey', (req, res) => {
    const category = req.params.category;
    const questionKey = req.params.questionKey;

    if (questionsData[category] && questionsData[category].reponses && questionsData[category].reponses[questionKey]) {
        res.json(questionsData[category].reponses[questionKey]);
    } else {
        res.status(404).json({ error: 'Question ou réponse non trouvée' });
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`API en cours d'exécution sur http://localhost:${port}`);
});

// Middleware pour analyser les requêtes JSON
app.use(express.json());


// Route POST pour gérer les messages du chatbot
/*app.post('/api/chat', (req, res) => {
    const userMessage = req.body.message;

    // Recherche de la réponse dans le fichier JSON
    let botResponse = "Je ne connais pas la réponse à cette question.";
    for (const category in questionsData) {
        if (questionsData[category].reponses && questionsData[category].reponses[userMessage]) {
            botResponse = questionsData[category].reponses[userMessage];
            break;
        }
    }

    res.json({ reply: botResponse });
});*/

app.post('/api/chat', (req, res) => {
    const userMessage = req.body.message.toLowerCase(); // Convertir en minuscule pour éviter les problèmes de casse
    console.log('Message reçu :', userMessage);

    let botResponse = "Je ne connais pas la réponse à cette question.";

    for (const category in questionsData) {
        const categoryData = questionsData[category];
        const reponses = categoryData["reponses"];
        const questions = categoryData["questions"];

        console.log(`Analyse de la catégorie : ${category}`);
        console.log('Questions disponibles :', questions);

        if (questions && questions.includes(userMessage)) {
            botResponse = reponses.default || "Réponse non définie.";
            break;
        }
    }

    console.log('Réponse du bot :', botResponse);
    res.json({ reply: botResponse });
});


