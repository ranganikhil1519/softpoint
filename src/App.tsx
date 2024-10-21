// src/App.tsx
import React from 'react';
import CountrySelector from './components/CountrySelector';
import './components/CountrySelector.css';

const App: React.FC = () => {
  return (
    <div className='heading'>
      <CountrySelector />
    </div>
  );
};

export default App;
