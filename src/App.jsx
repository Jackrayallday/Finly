// App.jsx
// use: npm run dev (frontend) + npm start (backend)

import { useState } from "react";
import "./App.css"; // import the styles

function App() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  // get a Users API access token (optional for debugging)
  const getAuthToken = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth", { method: "POST" });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("Auth Response:", data);
      setToken(data.access_token);
      setError(null);
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message);
    }
  };

  // pick file from devic
  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setStatus("");
    setError(null);
  };

  // send file to your backend to recognize
  const runRecognition = async () => {
    if (!file) return;
    try {
      setStatus("Uploading & recognizing…");
      setError(null);
      setResult(null);

      const form = new FormData();
      form.append("image", file, file.name);

      const resp = await fetch("http://localhost:5000/recognize?topK=3&decimals=3", {
        method: "POST",
        body: form,
      });

      const text = await resp.text();
      if (!resp.ok) throw new Error(`Recognition failed ${resp.status}: ${text}`);

      const data = JSON.parse(text);
      console.log("Recognition:", data);
      setResult(data);
      setStatus("Done");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
      setStatus("");
    }
  };

  return (
    <div className="app-container">
      <h1>Finly</h1>

      {/* Existing auth test */}
      <div className="auth-row">
        <button onClick={getAuthToken}>Get Access Token</button>
        {token && <code className="token-code">{token}</code>}
      </div>

      {/* File picker */}
      <input type="file" accept="image/*" onChange={onPick} />

      {/* Preview */}
      {previewUrl && <img src={previewUrl} alt="preview" className="file-preview" />}

      {/* Actions + status */}
      <div className="actions">
        <button onClick={runRecognition} disabled={!file}>
          Run Recognition
        </button>
        {!!status && <span>{status}</span>}
        {!!error && <span className="error">Error: {error}</span>}
      </div>

      {/* Results */}
      {result && (
        <div className="results-container">
          <h3>Results</h3>
          {result.feedback_id && (
            <div className="feedback-id">
              <strong>feedback-id:</strong> {result.feedback_id}
            </div>
          )}
          {Array.isArray(result.results) && result.results.length > 0 ? (
            result.results.map((r, i) => (
              <div key={i} className="result-box">
                {r.shape ? (
                  <div>
                    <strong>bbox:</strong> xMin {r.shape.xMin}, yMin {r.shape.yMin}, xMax{" "}
                    {r.shape.xMax}, yMax {r.shape.yMax}
                  </div>
                ) : (
                  <div>
                    <em>No shape returned</em>
                  </div>
                )}

                {typeof r.detection_score === "number" && (
                  <div>
                    <strong>detection score:</strong> {r.detection_score}
                  </div>
                )}

                {Array.isArray(r.species) && r.species.length > 0 ? (
                  <ul>
                    {r.species.map((s, j) => (
                      <li key={j}>
                        <span>
                          {s.common_name
                            ? `${s.common_name} (${s.scientific_name})`
                            : s.scientific_name}
                        </span>
                        {typeof s.accuracy === "number" &&
                          ` — ${(s.accuracy * 100).toFixed(1)}%`}
                        {s.species_id && <span> — id: {s.species_id}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>
                    <em>No species candidates returned</em>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div>No detections.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
