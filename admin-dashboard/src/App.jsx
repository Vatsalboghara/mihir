import { Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardContent from './components/DashboardContent';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TurfManagement from './pages/TurfManagement';
import Bookings from './pages/Bookings';
import Analytics from './pages/Analytics';
import { Toaster } from 'sonner';
import { TurfProvider } from './context/TurfContext';

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background flex font-sans text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <TurfProvider>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardContent />} />
            <Route path="turf-management" element={<TurfManagement />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
        <Toaster richColors position="top-center" />
      </TurfProvider>
    </>
  );
}

export default App;
