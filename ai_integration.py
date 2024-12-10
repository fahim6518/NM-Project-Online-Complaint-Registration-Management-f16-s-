from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from transformers import pipeline
import joblib

# Initialize Flask app
app = Flask(__name__)

# Load pre-trained AI model for complaint classification
try:
    classifier_model = joblib.load('complaint_classifier_model.pkl')  # pre-trained model for classification
    vectorizer = joblib.load('tfidf_vectorizer.pkl')  # TF-IDF vectorizer for feature extraction
except Exception as e:
    print(f"Error loading AI models: {e}")

# Initialize sentiment analysis pipeline from Hugging Face
sentiment_analyzer = pipeline('sentiment-analysis')

# Example training data for complaint classification (you should have your actual model training code here)
complaints_data = [
    ('The server is down and cannot connect to the website', 'Technical'),
    ('The staff was rude and unprofessional', 'Customer Service'),
    ('I am not happy with the food quality at the cafeteria', 'Food Quality'),
    ('The payment system is not secure and keeps crashing', 'Technical'),
    ('I am facing billing issues and incorrect charges', 'Billing')
]

# Convert complaints into a dataframe
df = pd.DataFrame(complaints_data, columns=['complaint_text', 'category'])

# Train a simple Naive Bayes model (for demonstration purposes)
def train_classifier():
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(df['complaint_text'])
    y = df['category']
    classifier = MultinomialNB()
    classifier.fit(X, y)
    
    # Save the trained model and vectorizer
    joblib.dump(classifier, 'complaint_classifier_model.pkl')
    joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')
    
train_classifier()

# Route to classify complaints
@app.route('/classify', methods=['POST'])
def classify_complaint():
    try:
        data = request.get_json()
        complaint_text = data['complaint_text']
        
        # Preprocess and vectorize complaint text
        vectorized_input = vectorizer.transform([complaint_text])
        
        # Predict the category of the complaint
        category = classifier_model.predict(vectorized_input)[0]
        
        return jsonify({"category": category})
    except Exception as e:
        return jsonify({"error": f"Error classifying complaint: {str(e)}"}), 400

# Route to analyze sentiment of complaint
@app.route('/sentiment', methods=['POST'])
def analyze_sentiment():
    try:
        data = request.get_json()
        complaint_text = data['complaint_text']
        
        # Perform sentiment analysis using Hugging Face pipeline
        sentiment_result = sentiment_analyzer(complaint_text)
        
        return jsonify({"sentiment": sentiment_result[0]})
    except Exception as e:
        return jsonify({"error": f"Error analyzing sentiment: {str(e)}"}), 400

# Root Route
@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Complaint Management System API!"

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5000)
