import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/useAuthStore';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PageHeader from './components/PageHeader';
import Dashboard from './pages/Dashboard';

import MedicineListPage from './pages/medicines/MedicineListPage';
import AddMedicinePage from './pages/medicines/AddMedicinePage';
import MedicineGroupsPage from './pages/medicine-groups/MedicineGroupsPage';
import InventoryPage from './pages/inventory/InventoryPage';
import ExpiryWarningPage from './pages/inventory/ExpiryWarningPage';
import PurchaseOrderPage from './pages/purchase/PurchaseOrderPage';
import PrescriptionScanPage from './pages/prescriptions/PrescriptionScanPage';
import POSPage from './pages/pos/POSPage';
import SalesInvoicePage from './pages/invoices/SalesInvoicePage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import SupplierDetailPage from './pages/suppliers/SupplierDetailPage';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';

// Placeholder components
const Sales = () => <div className="p-6"><PageHeader title="Quản lý bán hàng" subtitle="Tạo hóa đơn và quản lý giao dịch bán hàng" /></div>;

const PurchaseOrders = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <PageHeader 
        title="Đơn nhập hàng" 
        subtitle="Quản lý các đơn đặt hàng từ nhà cung cấp" 
        actions={
          <Button 
            type="primary" 
            onClick={() => navigate('/purchase-orders/create')}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] h-10 px-6 font-medium shadow-md"
          >
            + Tạo đơn nhập
          </Button>
        }
      />
      <div className="bg-white p-8 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] text-center">
        <div className="text-[var(--color-text-muted)] mb-4 italic">Chưa có dữ liệu đơn nhập hàng</div>
        <Button type="link" onClick={() => navigate('/purchase-orders/create')}>Bắt đầu tạo đơn nhập đầu tiên</Button>
      </div>
    </div>
  );
};

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
            <Route path="/medicine-groups" element={<MedicineGroupsPage />} />
            <Route path="/inventory/expiry" element={<ExpiryWarningPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/purchase-orders/create" element={<PurchaseOrderPage />} />
            <Route path="/invoices" element={<SalesInvoicePage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/:supplierId" element={<SupplierDetailPage />} />
            <Route path="/prescriptions/new" element={<div className="p-6"><PrescriptionScanPage /></div>} />
            <Route path="/settings" element={<div className="p-6"><PageHeader title="Cài đặt hệ thống" subtitle="Tùy chỉnh cấu hình hệ thống" /></div>} />
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
        <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
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
