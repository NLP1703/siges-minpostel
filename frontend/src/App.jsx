import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SalleProvider } from './context/SalleContext';
import { ReservationProvider } from './context/ReservationContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SalleProvider>
          <ReservationProvider>
            <AppRouter />
          </ReservationProvider>
        </SalleProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
