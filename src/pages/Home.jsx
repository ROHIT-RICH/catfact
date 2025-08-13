import { useState } from 'react';
import '../App.css';

export default function Home() {
  const [fact, setFact] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const fetchCatFact = async () => {
    setLoading(true);
    setFadeIn(false);
    try {
      const response = await fetch('https://catfact.ninja/fact');
      const data = await response.json();
      setFact(data.fact);
      setTimeout(() => setFadeIn(true), 50);
    } catch (error) {
      setFact('Failed to fetch fact. Please try again!');
      setFadeIn(true);
      console.error('Error fetching cat fact:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="container">
        <h1>🐱 Random Cat Fact</h1>

        <button onClick={fetchCatFact} disabled={loading}>
          {loading ? 'Fetching...' : 'Get a Cat Fact'}
        </button>

        {fact && (
          <p className={`fact-box ${fadeIn ? 'fade-in' : ''}`}>
            {fact}
          </p>
        )}
      </div>
    </div>
  );
}