import { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Button, Result, Spin } from 'antd';
import useAuthStore from './stores/useAuthStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PageHeader from './components/PageHeader';

// Phân tách Code (Code Splitting) giúp giảm dung lượng ban đầu
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MedicineListPage = lazy(() => import('./pages/medicines/MedicineListPage'));
const AddMedicinePage = lazy(() => import('./pages/medicines/AddMedicinePage'));
const MedicineGroupsPage = lazy(() => import('./pages/medicine-groups/MedicineGroupsPage'));
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'));
const ExpiryWarningPage = lazy(() => import('./pages/inventory/ExpiryWarningPage'));
const PurchaseOrdersPage = lazy(() => import('./pages/purchase/PurchaseOrdersPage'));
const PurchaseOrderPage = lazy(() => import('./pages/purchase/PurchaseOrderPage'));
const PrescriptionScanPage = lazy(() => import('./pages/prescriptions/PrescriptionScanPage'));
const POSPage = lazy(() => import('./pages/pos/POSPage'));
const EInvoicePage = lazy(() => import('./pages/pos/EInvoicePage'));
const SalesInvoicePage = lazy(() => import('./pages/invoices/SalesInvoicePage'));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'));
const SuppliersPage = lazy(() => import('./pages/suppliers/SuppliersPage'));
const SupplierDetailPage = lazy(() => import('./pages/suppliers/SupplierDetailPage'));
const StaffPage = lazy(() => import('./pages/staff/StaffPage'));
const ActivityPage = lazy(() => import('./pages/activity/ActivityPage'));
const SchedulePage = lazy(() => import('./pages/schedule/SchedulePage'));
const TimesheetPage = lazy(() => import('./pages/timesheet/TimesheetPage'));
const PayrollPage = lazy(() => import('./pages/payroll/PayrollPage'));
const CashbookPage = lazy(() => import('./pages/cashbook/CashbookPage'));
const ReturnsPage = lazy(() => import('./pages/returns/ReturnsPage'));
const RevenueReportPage = lazy(() => import('./pages/reports/revenue/RevenueReportPage'));
const InventoryFlowReportPage = lazy(() => import('./pages/reports/inventory-flow/InventoryFlowReportPage'));
const DebtReportPage = lazy(() => import('./pages/reports/debt/DebtReportPage'));

// Generic Backlog component for under-construction features
const BacklogPage = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] p-6 bg-[var(--color-bg-app)]">
      <Result
        status="info"
        title={<span className="text-xl font-bold text-[var(--color-text-primary)]">{title} đang được phát triển</span>}
        subTitle={<span className="text-[var(--color-text-secondary)]">Tính năng này nằm trong lộ trình cập nhật tiếp theo của hệ thống GPP Manager.</span>}
        extra={
          <Button 
            type="primary" 
            onClick={() => navigate('/')}
            className="bg-[var(--color-primary)] border-none h-10 px-6 rounded-[var(--radius-md)] font-medium hover:bg-[var(--color-primary-hover)]"
          >
            Quay lại trang chủ
          </Button>
        }
      />
    </div>
  );
};

// Màn hình tải (Loading) chung
const PageLoader = () => (
  <div className="flex justify-center items-center h-full w-full bg-slate-50 min-h-[400px]">
    <Spin size="large" tip="Đang tải trang..." />
  </div>
);

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
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/cash-book" element={<CashbookPage />} />
              <Route path="/report-revenue" element={<RevenueReportPage />} />
              <Route path="/report-io" element={<InventoryFlowReportPage />} />
              <Route path="/report-debt" element={<DebtReportPage />} />
              
              {/* Backlog routes routed to the construction/backlog screen */}
              <Route path="/activity" element={<BacklogPage title="Lịch sử hoạt động" />} />
              <Route path="/schedule" element={<BacklogPage title="Lịch phân ca" />} />
              <Route path="/timesheet" element={<BacklogPage title="Chấm công" />} />
              <Route path="/payroll" element={<BacklogPage title="Bảng lương" />} />
              <Route path="/returns" element={<BacklogPage title="Trả hàng" />} />
              <Route path="/settings" element={<BacklogPage title="Cài đặt hệ thống" />} />
              <Route path="/my-schedule" element={<BacklogPage title="Lịch cá nhân" />} />
              <Route path="/my-timesheet" element={<BacklogPage title="Chấm công cá nhân" />} />

              <Route path="/prescriptions/new" element={<div className="p-6"><PrescriptionScanPage /></div>} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>
        } />
        <Route path="/e-invoice/:id" element={
          <Suspense fallback={<PageLoader />}><EInvoicePage /></Suspense>
        } />
        <Route path="/pos" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}><POSPage /></Suspense>
          </ProtectedRoute>
        } />
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
