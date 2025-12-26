import { useState, useEffect } from 'react'
import './App.css'
// Note: We deleted "import axios" because we are using the built-in tool now

function App() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. The Request: "Go get the data"
    fetch('http://localhost:8080/api/leagues')
      
      // 2. The Unpacking: Fetch brings back a raw stream. We must convert it to JSON.
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      
      // 3. The Delivery: Now we have the actual data list
      .then(data => {
        console.log("Data received:", data);
        setLeagues(data);
        setLoading(false);
      })
      
      // 4. Breakdown: Catch any errors
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏓 Pickleball League Manager</h1>
      <h2>Current Leagues (Loaded via Fetch)</h2>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px' }}>
          {leagues.map((league) => (
            <div key={league.id} style={{ 
              border: '2px solid #4CAF50', 
              borderRadius: '10px',
              padding: '20px',
              width: '200px',
              textAlign: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#2E7D32' }}>{league.name}</h3>
              <p><strong>Time:</strong></p>
              <p>{league.time_slot_start} - {league.time_slot_end}</p>
              <button style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                View Players
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App