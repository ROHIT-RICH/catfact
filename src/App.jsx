import { NavLink, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home.jsx';
import DailyReportPage from './pages/DailyReportPage.jsx';

function App() {
  return (
    <div>
      <header className="p-4 border-b flex gap-4">
        <NavLink to="/" className={({ isActive }) => isActive ? 'font-bold' : ''}>Home</NavLink>
        <NavLink to="/report" className={({ isActive }) => isActive ? 'font-bold' : ''}>Daily Report</NavLink>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<DailyReportPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
