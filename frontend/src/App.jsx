import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null); // Which league did we click?
  const [players, setPlayers] = useState([]); // List of players for that league

  useEffect(() => {
    axios.get('http://localhost:8080/api/leagues')
      .then((response) => setLeagues(response.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // FUNCTION: What happens when you click "View Details"
  const handleViewDetails = (league) => {
    // 1. Save the league info so we can show the title
    setSelectedLeague(league);
    
    // 2. Fetch the players for THIS specific league ID
    axios.get(`http://localhost:8080/api/leagues/${league.id}/players`)
      .then((response) => {
        setPlayers(response.data);
      })
      .catch((error) => console.error("Error fetching players:", error));
  };

  // FUNCTION: Close the popup
  const closePopup = () => {
    setSelectedLeague(null);
    setPlayers([]);
  };

  // Sorting Lists
  const beginners = leagues.filter(l => l.skill_level_req <= 2.5);
  const intermediates = leagues.filter(l => l.skill_level_req > 2.5 && l.skill_level_req < 4.0);
  const advanced = leagues.filter(l => l.skill_level_req >= 4.0);

  // Card Component
  const LeagueCard = ({ league, levelClass }) => (
    <div className={`league-card ${levelClass}`}>
      <h2>{league.name}</h2>
      <div className="league-details">
        <p><strong>📍</strong> {league.location}</p>
        <p><strong>⏰</strong> {league.time_slot_start.slice(0, 5)} - {league.time_slot_end.slice(0, 5)}</p>
      </div>
      {/* ADD CLICK HANDLER HERE */}
      <button className="join-btn" onClick={() => handleViewDetails(league)}>
        View Players
      </button>
    </div>
  );

  return (
    <div className="app-container">
      <h1>🏓 3D Fit Arena Schedule</h1>
      
      <div className="dashboard-columns">
        <div className="column">
          <h2 className="column-title" style={{ color: '#2ecc71' }}>Beginner</h2>
          <div className="card-stack">
            {beginners.map(l => <LeagueCard key={l.id} league={l} levelClass="beginner" />)}
          </div>
        </div>

        <div className="column">
          <h2 className="column-title" style={{ color: '#f1c40f' }}>Intermediate</h2>
          <div className="card-stack">
            {intermediates.map(l => <LeagueCard key={l.id} league={l} levelClass="intermediate" />)}
          </div>
        </div>

        <div className="column">
          <h2 className="column-title" style={{ color: '#e74c3c' }}>Advanced</h2>
          <div className="card-stack">
            {advanced.map(l => <LeagueCard key={l.id} league={l} levelClass="advanced" />)}
          </div>
        </div>
      </div>

      {/* --- THE POPUP WINDOW (MODAL) --- */}
      {selectedLeague && (
        <div className="modal-overlay" onClick={closePopup}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closePopup}>✖</button>
            
            <h2>{selectedLeague.name}</h2>
            <p className="modal-subtitle">Skill Requirement: {selectedLeague.skill_level_req}+</p>
            
            <h3>Registered Players:</h3>
            {players.length > 0 ? (
              <ul className="player-list">
                {players.map((player, index) => (
                  <li key={index}>
                    <span className="player-name">👤 {player.name}</span>
                    <span className="player-rating">Rating: {player.skill_rating}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No players registered yet. Be the first!</p>
            )}
            
            <button className="join-confirm-btn">Register for this League</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;