from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Load model data at startup
# ---------------------------------------------------------------------------
BASE = os.path.dirname(__file__)
movies_dict  = pickle.load(open(os.path.join(BASE, 'movies1.pkl'),      'rb'))
similarity   = pickle.load(open(os.path.join(BASE, 'similarites.pkl'),  'rb'))
movies       = pd.DataFrame(movies_dict)
movie_titles = sorted(movies['title'].tolist())


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def recommend(title, n=8):
    if title not in movies['title'].values:
        return None
    idx         = movies[movies['title'] == title].index[0]
    scores      = list(enumerate(similarity[idx]))
    scores      = sorted(scores, key=lambda x: x[1], reverse=True)
    scores      = scores[1:n+1]          # skip self
    results = []
    for i, score in scores:
        row = movies.iloc[i]
        results.append({
            'movie_id':    int(row['movie_id']),
            'title':       row['title'],
            'score':       round(float(score), 4),
            'tags_preview': str(row['tags'])[:120] + '…',
        })
    return results


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'movies': len(movies)})


@app.route('/movies')
def get_movies():
    q = request.args.get('q', '').strip().lower()
    if q:
        filtered = [t for t in movie_titles if q in t.lower()][:50]
    else:
        filtered = movie_titles[:100]
    return jsonify({'movies': filtered, 'total': len(movie_titles)})


@app.route('/recommend', methods=['POST'])
def get_recommendations():
    data  = request.get_json(silent=True) or {}
    title = str(data.get('title', '')).strip()
    n     = int(data.get('n', 8))

    if not title:
        return jsonify({'error': 'title is required'}), 400
    if title not in movies['title'].values:
        return jsonify({'error': f'Movie not found: {title}'}), 404
    if not (1 <= n <= 20):
        return jsonify({'error': 'n must be between 1 and 20'}), 400

    results = recommend(title, n)
    return jsonify({
        'query':           title,
        'recommendations': results,
        'count':           len(results),
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)