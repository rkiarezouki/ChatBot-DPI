// Importation des modules nécessaires
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3001;
const cors = require('cors');
app.use(cors());

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Chargement du fichier JSON avec gestion des erreurs
let questionsData = {};
try {
    questionsData = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));
} catch (err) {
    console.error('Erreur lors du chargement du fichier questions.json:', err);
}

// Fonction pour parcourir récursivement les catégories et sous-catégories regroupées
const traverseCategories = (data, userMessage) => {
    for (const category in data) {
        const categoryData = data[category];

        // Vérifie si la catégorie contient des sous-catégories
        if (categoryData && typeof categoryData === 'object' && !categoryData.questions) {
            const subResponse = traverseCategories(categoryData, userMessage);
            if (subResponse) return subResponse;
        }

        // Vérifie si la question correspond (en ignorant la casse)
        const questions = categoryData.questions || [];
        if (questions.some(q => q.toLowerCase() === userMessage)) {
            return categoryData.response || "Réponse non définie.";
        }
    }
    return null;
};

// Route pour obtenir les données d'une catégorie principale
app.get('/api/categories/:mainCategory', (req, res) => {
    const mainCategory = req.params.mainCategory;
    const categoryData = questionsData[mainCategory];

    if (categoryData) {
        res.json(categoryData); // Retourne toutes les données de la catégorie principale
    } else {
        res.status(404).json({ error: 'Catégorie principale non trouvée' });
    }
});

// Route pour obtenir la liste des catégories principales
app.get('/api/categories', (req, res) => {
    const categories = Object.keys(questionsData);
    res.json(categories); // Liste des catégories principales
});

// Route pour obtenir les questions d'une sous-catégorie spécifique
app.get('/api/categories/:mainCategory/:subCategory/questions', (req, res) => {
    const { mainCategory, subCategory } = req.params;
    const mainCategoryData = questionsData[mainCategory];

    if (mainCategoryData && mainCategoryData[subCategory]) {
        res.json(mainCategoryData[subCategory].questions || []);
    } else {
        res.status(404).json({ error: 'Sous-catégorie non trouvée' });
    }
});

// Route pour obtenir la réponse à une question dans une sous-catégorie spécifique
app.get('/api/categories/:mainCategory/:subCategory/response', (req, res) => {
    const { mainCategory, subCategory } = req.params;
    const mainCategoryData = questionsData[mainCategory];

    if (mainCategoryData && mainCategoryData[subCategory]) {
        res.json(mainCategoryData[subCategory].response || 'Réponse non disponible');
    } else {
        res.status(404).json({ error: 'Sous-catégorie ou réponse non trouvée' });
    }
});

// Route POST pour gérer les messages du chatbot
app.post('/api/chat', (req, res) => {
    const userMessage = req.body.message.toLowerCase(); // Convertir en minuscule pour éviter les problèmes de casse
    console.log('Message reçu :', userMessage);

    // Fonction de recherche récursive pour répondre à une question
    const traverseCategories = (data, message) => {
        for (const category in data) {
            const categoryData = data[category];

            // Si la catégorie contient des sous-catégories, continuer la recherche
            if (typeof categoryData === 'object' && !categoryData.questions) {
                const subResponse = traverseCategories(categoryData, message);
                if (subResponse) return subResponse;
            }

            // Vérifie si la question correspond (en ignorant la casse)
            const questions = categoryData.questions || [];
            if (questions.some(q => q.toLowerCase() === message)) {
                return categoryData.response || 'Réponse non définie.';
            }
        }
        return null;
    };

    // Recherche de la réponse
    const botResponse = traverseCategories(questionsData, userMessage) || "Je ne connais pas la réponse à cette question.";
    console.log('Réponse du bot :', botResponse);

    res.json({ reply: botResponse });
});


// Démarrer le serveur
app.listen(port, () => {
    console.log(`API en cours d'exécution sur http://localhost:${port}`);
});
