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
import PurchaseOrdersPage from './pages/purchase/PurchaseOrdersPage';
import PurchaseOrderPage from './pages/purchase/PurchaseOrderPage';
import PrescriptionScanPage from './pages/prescriptions/PrescriptionScanPage';
import POSPage from './pages/pos/POSPage';
import SalesInvoicePage from './pages/invoices/SalesInvoicePage';
import CustomersPage from './pages/customers/CustomersPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import SupplierDetailPage from './pages/suppliers/SupplierDetailPage';
import StaffPage from './pages/staff/StaffPage';
import ActivityPage from './pages/activity/ActivityPage';
import SchedulePage from './pages/schedule/SchedulePage';
import TimesheetPage from './pages/timesheet/TimesheetPage';
import PayrollPage from './pages/payroll/PayrollPage';
import CashbookPage from './pages/cashbook/CashbookPage';
import ReturnsPage from './pages/returns/ReturnsPage';
import RevenueReportPage from './pages/reports/revenue/RevenueReportPage';
import InventoryFlowReportPage from './pages/reports/inventory-flow/InventoryFlowReportPage';
import DebtReportPage from './pages/reports/debt/DebtReportPage';

// Placeholder components
const Sales = () => <div className="p-6"><PageHeader title="Quản lý bán hàng" subtitle="Tạo hóa đơn và quản lý giao dịch bán hàng" /></div>;

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
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/purchase-orders/create" element={<PurchaseOrderPage />} />
            <Route path="/invoices" element={<SalesInvoicePage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/:supplierId" element={<SupplierDetailPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/timesheet" element={<TimesheetPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/cash-book" element={<CashbookPage />} />
            <Route path="/report-revenue" element={<RevenueReportPage />} />
            <Route path="/report-io" element={<InventoryFlowReportPage />} />
            <Route path="/report-debt" element={<DebtReportPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
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
