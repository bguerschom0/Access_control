import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ControllersManagement from '@/pages/access-control/controllers/ControllersManagement';

function App() {
  return (
    <Router>
      <main className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/controllers" replace />} />
          <Route path="/controllers" element={<ControllersManagement />} />
        </Routes>
        <Toaster />
      </main>
    </Router>
  );
}

export default App;
