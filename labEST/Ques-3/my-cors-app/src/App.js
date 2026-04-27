import React, { useState } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    // Reset states before trying
    setData(null);
    setError(null);

    try {
      // Step: Fetching from the Spring Boot port
      const response = await fetch('http://localhost:8080/api/hello');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Response from Server:", result);
      setData(result);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h2>CORS Experiment</h2>
      <p>React is running on: <strong>http://localhost:3000</strong></p>
      
      <button 
        onClick={fetchData} 
        style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#61dafb', border: 'none', borderRadius: '5px' }}
      >
        Make Fetch Request
      </button>

      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <strong>Server Response:</strong>
        {data && <pre style={{ color: 'green' }}>{JSON.stringify(data, null, 2)}</pre>}
        {error && <pre style={{ color: 'red' }}>Error: {error} (Check Console for CORS details)</pre>}
        {!data && !error && <p>No data yet. Click the button.</p>}
      </div>
    </div>
  );
}

export default App;