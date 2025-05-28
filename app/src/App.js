import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Some stuff here
        </p>
        <br />
        <Link to="/compare">Compare MacBooks</Link>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compare" element={<ComparisonPage />} />
      </Routes>
    </Router>
  );
}

function ComparisonPage() {
  const [pro, setPro] = useState(null);
  const [air, setAir] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/data/macbookPro.json').then(res => res.json()),
      fetch('/data/macbookAir.json').then(res => res.json())
    ])
      .then(([proData, airData]) => {
        setPro(proData);
        setAir(airData);
      })
      .catch(err => setError('Failed to load data.'));
  }, []);

  if (error) return <div>{error}</div>;
  if (!pro || !air) return <div>Loading...</div>;

  const keys = [
    'display', 'chip', 'cpu', 'gpu', 'memory', 'storage', 'battery', 'weight', 'ports', 'price'
  ];

  function getCellStyle(key, proVal, airVal, isPro) {
    // price, lower is better
    // weight, lower is better
    // memory/storage, higher is better
    let style = {};
    if (proVal === airVal) return style;
    if (key === 'price') {
      const proNum = Number(proVal.replace(/[^\d.]/g, ''));
      const airNum = Number(airVal.replace(/[^\d.]/g, ''));
      if (proNum < airNum) style.color = isPro ? 'green' : 'red';
      else style.color = isPro ? 'red' : 'green';
    } else if (key === 'weight') {
      const proNum = Number(proVal);
      const airNum = Number(airVal);
      if (proNum < airNum) style.color = isPro ? 'green' : 'red';
      else style.color = isPro ? 'red' : 'green';
    } else if (["memory", "storage"].includes(key)) {
      const proNum = Number(proVal);
      const airNum = Number(airVal);
      if (proNum > airNum) style.color = isPro ? 'green' : 'red';
      else style.color = isPro ? 'red' : 'green';
    } else {
      style.color = isPro ? 'green' : 'red';
    }
    return style;
  }

  function renderValue(key, value) {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  }

  return (
    <div className="comparison-container">
      <div className="comparison-title">MacBook Pro vs MacBook Air</div>
      <table className="comparison-table" border="0" cellPadding="0">
        <thead>
          <tr>
            <th>Spec</th>
            <th>
              <img src={pro.image} alt={pro.name} className="comparison-img" />
              <div>{pro.name}</div>
            </th>
            <th>
              <img src={air.image} alt={air.name} className="comparison-img" />
              <div>{air.name}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map(key => (
            <tr key={key}>
              <td style={{ fontWeight: 'bold' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
              <td style={getCellStyle(key, pro[key], air[key], true)}>{renderValue(key, pro[key])}</td>
              <td style={getCellStyle(key, pro[key], air[key], false)}>{renderValue(key, air[key])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <Link to="/" className="comparison-back">Back to Home</Link>
    </div>
  );
}

export default App;
