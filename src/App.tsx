import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Suppliers from './components/Suppliers';
import Associations from './components/Associations';
import Warehouses from './components/Warehouses';
import PetrolStations from './components/PetrolStations';
import GasWarehouses from './components/GasWarehouses';
import JamiyatiSystem from './components/JamiyatiSystem';
import Reports from './components/Reports';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/associations" element={<Associations />} />
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/petrol" element={<PetrolStations />} />
        <Route path="/gas" element={<GasWarehouses />} />
        <Route path="/jamiyati" element={<JamiyatiSystem />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
