import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';

// Pages
import ControllersManagement from '@/pages/access-control/controllers/ControllersManagement';
import AttendanceView from '@/pages/access-control/attendance/AttendanceView';

// Placeholder components for other routes
const Dashboard = () => <div className="p-6">Dashboard Coming Soon</div>;
const Users = () => <div className="p-6">Users Management Coming Soon</div>;
const Settings = () => <div className="p-6">Settings Coming Soon</div>;

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/controllers" element={<ControllersManagement />} />
          <Route path="/attendance" element={<AttendanceView />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App;
