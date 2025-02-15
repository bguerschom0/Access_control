import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';

// Pages
import ControllersManagement from '@/pages/access-control/controllers/ControllersManagement';
import AttendanceView from '@/pages/access-control/attendance/AttendanceView';
import AttendanceReports from '@/pages/access-control/reports/AttendanceReports';
import ControllerConfig from '@/pages/access-control/controllers/ControllerConfig';
import PersonnelManagement from '@/pages/access-control/personnel/PersonnelManagement';

// Placeholder components for other routes
const Dashboard = () => <div className="p-6">Dashboard Coming Soon</div>;

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/controllers" element={<ControllersManagement />} />
          <Route path="/attendance" element={<AttendanceView />} /> 
          <Route path="/reports" element={<AttendanceReports />} />
          <Route path="/personnel" element={<PersonnelManagement />} />
          <Route path="/controller-config" element={<ControllerConfig />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App;
