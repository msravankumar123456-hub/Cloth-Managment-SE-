import { supabase } from './supabase';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

// Supabase connection test
async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('retailers')
    .select('*');

  if (error) {
    console.error('Supabase error:', error.message);
  } else {
    console.log('Supabase connected successfully!');
    console.log('Retailers:', data);
  }
}

testSupabaseConnection();

// Existing React application
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);