import os
import io
import json
import base64
from typing import Dict, Any, List, Optional
from flask import Flask, request, jsonify, send_from_stdio
from google.generativeai import GoogleGenAI
import google.generativeai as genai

app = Flask(__name__)

# Default portfolio data
DEFAULT_DATA = {
    "profile": {
        "name": "Tamir",
        "title": "Entrepreneur. AI builder. Genomics expert.",
        "intro": "I build at the intersection of genomics and AI.",
        "description": "Entrepreneur, builder and consultant. Co-founded **Sequentify**, a patent-backed genomics company that raised **£7M** and led development from R&D to an ISO 13485-accredited product. Today, building AI tools that matter.\n\nPassionate about science and technology.",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
        "links": [
            {"label": "Book a call", "url": "#", "icon": "Calendar"},
            {"label": "LinkedIn", "url": "#", "icon": "Linkedin"},
            {"label": "Twitter", "url": "#", "icon": "Twitter"}
        ]
    },
    "stats": [
        {"label": "Companies Co-founded", "value": "2"},
        {"label": "Capital Raised", "value": "$7M+"},
        {"label": "Products Launched", "value": "5+"},
        {"label": "Coffee Consumed", "value": "∞"}
    ],
    "projects": [
        {
            "id": "1",
            "name": "Sequentify",
            "title": "Revolutionizing DNA Library Preparation",
            "description": "Led the R&D and product development for a breakthrough genomics technology.",
            "image": "https://images.unsplash.com/photo-1530973427-2851fe75d749?auto=format&fit=crop&q=80&w=800",
            "url": "#",
            "learnMoreContent": "Detailed info about Sequentify...",
            "websiteUrl": "https://sequentify.com",
            "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
    ]
}

def get_data():
    try:
        with open('data.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return DEFAULT_DATA

@app.route('/api/data', methods=['GET'])
def data_get():
    return jsonify(get_data())

@app.route('/api/data', methods=['POST'])
def data_post():
    data = request.json
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=2)
    return jsonify({"status": "success"})

@app.route('/api/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = f"{int(os.time.time())}_{file.filename}"
    upload_path = os.path.join('uploads', filename)
    file.save(upload_path)
    
    return jsonify({"imageUrl": f"/uploads/{filename}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
