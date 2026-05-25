# 🎬 CineMatch — Movie Recommendation System

A full-stack ML web app that recommends movies using content-based filtering on the TMDB dataset.

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.x-black?logo=flask)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![scikit-learn](https://img.shields.io/badge/scikit--learn-orange?logo=scikit-learn)

---

## 🧠 ML Model

- **Dataset**: TMDB 5000 Movies + Credits
- **Technique**: Content-Based Filtering
- **Similarity**: Cosine Similarity on TF-IDF tag vectors
- **Index**: 4,806 movies

---

## 🗂️ Project Structure

```
MovieRecommender/
├── backend/
│   ├── app.py                 # Flask API
│   ├── requirements.txt
│   ├── movies1.pkl            # Movie data (title, tags, id)
│   └── similarites.pkl        # 4806×4806 cosine similarity matrix
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        └── App.jsx
```

---

## ⚙️ Setup & Run

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate.bat      # Windows
pip install -r requirements.txt
python app.py
```

Runs at **http://localhost:5000**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at **http://localhost:3000**

---

## 🔌 API Reference

| Method | Endpoint       | Description                        |
|--------|----------------|------------------------------------|
| GET    | `/health`      | Server status + movie count        |
| GET    | `/movies?q=`   | Search movies by title             |
| POST   | `/recommend`   | Get recommendations for a title    |

### POST `/recommend`

```json
{ "title": "Avatar", "n": 8 }
```

Response:
```json
{
  "query": "Avatar",
  "recommendations": [
    { "title": "Guardians of the Galaxy", "score": 0.3214, ... }
  ],
  "count": 8
}
```

---

## 👨‍💻 Author

**Nikhil Raj S** — [github.com/Nikhil-Raj-S](https://github.com/Nikhil-Raj-S)