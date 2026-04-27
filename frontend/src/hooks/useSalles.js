import { useContext } from 'react';
import { SalleContext } from '../context/SalleContext';

export function useSalles() {
  const context = useContext(SalleContext);
  if (!context) {
    throw new Error('useSalles must be used within a SalleProvider');
  }
  return context;
}

