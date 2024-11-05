from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Charger les réponses du fichier JSON une seule fois au démarrage de l'application
with open('questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Fonction pour trouver la réponse en fonction des mots-clés
def find_answer(user_question):
    # Diviser la question de l'utilisateur en mots-clés
    keywords = user_question.lower().split()

    # Parcourir les réponses et vérifier si les mots-clés sont présents
    for item in data['responses']:
        if any(keyword in item['keywords'] for keyword in keywords):
            return item['answer']
    return "Désolé, je n'ai pas de réponse pour cette question."

# Route principale pour recevoir les questions du frontend
@app.route('/get_answer', methods=['POST'])
def get_answer():
    # Récupérer la question depuis la requête
    user_data = request.get_json()
    user_question = user_data.get("question", "")

    # Trouver la réponse
    answer = find_answer(user_question)

    # Retourner la réponse au frontend
    return jsonify({"answer": answer})

if __name__ == '__main__':
    app.run(debug=True)
