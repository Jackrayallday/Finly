import { useState } from "react";

function App() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const getAuthToken = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Auth Response:", data);

      setToken(data.access_token);
      setError(null);
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Fishial API Auth Test</h1>
      <button onClick={getAuthToken}>Get Access Token</button>
      {token && (
        <div>
          <h3>Access Token:</h3>
          <code>{token}</code>
        </div>
      )}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}

export default App;
