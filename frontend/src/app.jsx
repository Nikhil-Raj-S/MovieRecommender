import { useState, useEffect, useRef } from "react";

const API = "http://localhost:5000";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #d4a853;
    --gold-dim: #8a6930;
    --red: #c0392b;
    --bg: #080808;
    --surface: #111111;
    --surface2: #1a1a1a;
    --border: rgba(255,255,255,0.06);
    --text: #e8e4dc;
    --muted: #5a5650;
  }

  html, body { background: var(--bg); color: var(--text); min-height: 100vh; }
  body { font-family: 'DM Sans', sans-serif; }

  /* film grain overlay */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 9999; opacity: 0.35;
  }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
  @keyframes shimmer  { 0%,100% { opacity:.4 } 50% { opacity:1 } }
  @keyframes pulse    { 0%,100% { box-shadow: 0 0 0 0 rgba(212,168,83,0.3) } 50% { box-shadow: 0 0 0 8px rgba(212,168,83,0) } }
`;

function ScoreBar({ score }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 2, background: "var(--surface2)", borderRadius: 1, overflow: "hidden" }}>
        <div style={{ width: `${score * 100}%`, height: "100%", background: "var(--gold)", borderRadius: 1, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 10, color: "var(--gold-dim)", fontFamily: "'DM Mono', monospace", minWidth: 32 }}>
        {Math.round(score * 100)}%
      </span>
    </div>
  );
}

function MovieCard({ movie, index }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 4,
      padding: "20px 22px",
      animation: `fadeUp 0.4s ease ${index * 0.06}s both`,
      transition: "border-color 0.2s, transform 0.2s",
      cursor: "default",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold-dim)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
    >
      {/* rank */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        background: "var(--surface2)",
        borderBottomLeftRadius: 4,
        padding: "4px 10px",
        fontSize: 10,
        fontFamily: "'DM Mono', monospace",
        color: "var(--muted)",
        letterSpacing: "0.08em",
      }}>#{index + 1}</div>

      <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em", color: "var(--gold)", marginBottom: 2 }}>
        {movie.title}
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5, fontStyle: "italic" }}>
        {movie.tags_preview}
      </div>
      <ScoreBar score={movie.score} />
    </div>
  );
}

export default function App() {
  const [query, setQuery]         = useState("");
  const [suggestions, setSugg]    = useState([]);
  const [selected, setSelected]   = useState("");
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [showSugg, setShowSugg]   = useState(false);
  const inputRef = useRef();
  const debounceRef = useRef();

  // Search suggestions
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setSugg([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`${API}/movies?q=${encodeURIComponent(query)}`);
        const d = await r.json();
        setSugg(d.movies || []);
        setShowSugg(true);
      } catch { setSugg([]); }
    }, 250);
  }, [query]);

  async function handleRecommend(title) {
    setSelected(title);
    setQuery(title);
    setShowSugg(false);
    setSugg([]);
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const r = await fetch(`${API}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, n: 8 }),
      });
      const d = await r.json();
      if (!r.ok) setError(d.error || "Failed to get recommendations");
      else setResults(d);
    } catch {
      setError("Cannot reach backend. Make sure Flask is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", maxWidth: 860, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 56, animation: "fadeUp 0.5s ease" }}>
          <div style={{
            display: "inline-block",
            background: "var(--red)",
            color: "#fff",
            fontSize: 9,
            letterSpacing: "0.2em",
            padding: "4px 10px",
            marginBottom: 16,
            fontFamily: "'DM Mono', monospace",
            textTransform: "uppercase",
          }}>ML · Content-Based Filtering</div>

          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(52px, 10vw, 96px)",
            lineHeight: 0.9,
            letterSpacing: "0.02em",
            color: "#fff",
          }}>
            FIND YOUR<br />
            <span style={{ color: "var(--gold)", WebkitTextStroke: "1px var(--gold)" }}>NEXT FILM</span>
          </h1>

          <p style={{ marginTop: 20, color: "var(--muted)", fontSize: 13, lineHeight: 1.7, maxWidth: 480, fontWeight: 300 }}>
            Powered by cosine similarity across 4,806 TMDB movies. Pick a title, discover what's next.
          </p>
        </div>

        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: 8, animation: "fadeUp 0.5s ease 0.1s both" }}>
          <div style={{
            display: "flex",
            border: selected ? "1px solid var(--gold-dim)" : "1px solid var(--border)",
            borderRadius: 4,
            background: "var(--surface)",
            transition: "border-color 0.2s",
          }}>
            <div style={{ padding: "18px 20px", color: "var(--muted)", fontSize: 14 }}>🎬</div>
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(""); setResults(null); }}
              onFocus={() => suggestions.length && setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 150)}
              placeholder="Search a movie title…"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text)",
                fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
              }}
            />
            {selected && (
              <button
                onClick={() => handleRecommend(selected)}
                disabled={loading}
                style={{
                  margin: 8,
                  padding: "0 24px",
                  background: loading ? "var(--surface2)" : "var(--gold)",
                  color: loading ? "var(--muted)" : "#080808",
                  border: "none",
                  borderRadius: 2,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                  animation: "pulse 2s infinite",
                }}
              >
                {loading ? "…" : "Recommend →"}
              </button>
            )}
          </div>

          {/* Dropdown suggestions */}
          {showSugg && suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderTop: "none",
              borderRadius: "0 0 4px 4px",
              maxHeight: 280,
              overflowY: "auto",
            }}>
              {suggestions.map(title => (
                <div
                  key={title}
                  onMouseDown={() => handleRecommend(title)}
                  style={{
                    padding: "12px 20px",
                    cursor: "pointer",
                    fontSize: 13,
                    borderBottom: "1px solid var(--border)",
                    transition: "background 0.15s",
                    color: "var(--text)",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {title}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 48, fontFamily: "'DM Mono', monospace" }}>
          4,806 movies indexed · type at least 2 characters to search
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)",
            borderRadius: 4, padding: "14px 18px", fontSize: 13, color: "#e07070", marginBottom: 32
          }}>{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--muted)", animation: "shimmer 1.2s infinite", fontFamily: "'DM Mono', monospace" }}>
              COMPUTING SIMILARITY…
            </div>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 28 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: "0.05em", color: "var(--gold)" }}>
                Because you liked
              </h2>
              <span style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>{results.query}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {results.recommendations.map((m, i) => (
                <MovieCard
                  key={m.movie_id}
                  movie={m}
                  index={i}
                />
              ))}
            </div>

            <div style={{ marginTop: 32, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>
                {results.count} recommendations · cosine similarity on TF-IDF tags
              </span>
              <button
                onClick={() => { setQuery(""); setSelected(""); setResults(null); inputRef.current?.focus(); }}
                style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)", padding: "6px 14px", borderRadius: 2, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
              >
                Search again
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!results && !loading && !error && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
            START TYPING TO DISCOVER YOUR NEXT WATCH
          </div>
        )}

      </div>
    </>
  );
}