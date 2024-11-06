// Importation des modules nécessaires
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3001;

// Chargement du fichier JSON avec gestion des erreurs
let questionsData = {};
try {
    questionsData = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));
} catch (err) {
    console.error('Erreur lors du chargement du fichier questions.json:', err);
}

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
