import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/useAuthStore';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';

import MedicineListPage from './pages/medicines/MedicineListPage';
import AddMedicinePage from './pages/medicines/AddMedicinePage';

// Placeholder components
const Sales = () => <div className="p-6"><h1>Quản lý bán hàng</h1></div>;

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-app)]">
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        badges={{ inventory: 12 }}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/medicines" element={<MedicineListPage />} />
            <Route path="/medicines/add" element={<AddMedicinePage />} />
            <Route path="/pos" element={<div className="p-6"><div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border-light)] min-h-[calc(100vh-8rem)] p-6"><Sales /></div></div>} />
            <Route path="/settings" element={<div className="p-6"><div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border-light)] min-h-[calc(100vh-8rem)] p-6"><h1>Cài đặt hệ thống</h1></div></div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
