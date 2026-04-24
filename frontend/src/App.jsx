import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/useAuthStore';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';

// Placeholder components
const MedicineList = () => <div className="p-6"><h1>Danh mục thuốc</h1></div>;
const Sales = () => <div className="p-6"><h1>Quản lý bán hàng</h1></div>;

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-app)]">
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        badges={{ inventory: 12 }}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white px-6 flex items-center justify-between border-b border-[var(--color-border-light)] flex-shrink-0">
          <span className="font-semibold text-[15px] text-[var(--color-text-primary)]">
            Hệ thống Nhà thuốc GPP
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              Chào, {user?.name || 'Dược sĩ'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/medicines" element={<div className="p-6"><div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border-light)] min-h-[calc(100vh-8rem)] p-6"><MedicineList /></div></div>} />
            <Route path="/pos" element={<div className="p-6"><div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border-light)] min-h-[calc(100vh-8rem)] p-6"><Sales /></div></div>} />
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
