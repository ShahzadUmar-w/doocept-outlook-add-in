/* eslint-disable prettier/prettier */
import React from 'react';
import RouterApp from './router/Routes';
import { ThemeProvider } from '../components/styles/TheemProvider'; // Import ThemeProvider

const App = () => {
  return (
    <ThemeProvider> {/* Wrap RouterApp with ThemeProvider */}
      <RouterApp />
    </ThemeProvider>
  );
};

export default App;