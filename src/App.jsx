import { useState } from 'react';
import './App.css';

function App() {
  const [fact, setFact] = useState('');         // Holds the fetched cat fact
  const [loading, setLoading] = useState(false); // Tracks loading state
  const [fadeIn, setFadeIn] = useState(false);   // Controls animation class

  // Function to fetch a cat fact from the API
  const fetchCatFact = async () => {
    setLoading(true);      // Show loading state
    setFadeIn(false);      // Reset animation class
    try {
      const response = await fetch('https://catfact.ninja/fact');
      const data = await response.json();
      setFact(data.fact);  // Set the retrieved fact
      // Slight timeout to allow fade-in animation to apply
      setTimeout(() => setFadeIn(true), 50);
    } catch (error) {
      setFact('Failed to fetch fact. Please try again!');
      setFadeIn(true);
      console.error('Error fetching cat fact:', error);
    } finally {
      setLoading(false);   // Stop loading state
    }
  };

  return (
    <div className="wrapper">
      <div className="container">
        <h1>🐱 Random Cat Fact</h1>

        <button onClick={fetchCatFact} disabled={loading}>
          {loading ? 'Fetching...' : 'Get a Cat Fact'}
        </button>

        {/* Display fact with fade-in animation */}
        {fact && (
          <p className={`fact-box ${fadeIn ? 'fade-in' : ''}`}>
            {fact}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
