import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { 
  LayoutDashboard, 
  Pill, 
  ShoppingCart, 
  Users, 
  Settings,
  ClipboardList
} from 'lucide-react';

const { Header, Content, Sider } = Layout;

// Placeholder components
const Dashboard = () => <div className="p-6"><h1>Dashboard Tổng quan GPP</h1></div>;
const MedicineList = () => <div className="p-6"><h1>Danh mục thuốc</h1></div>;
const Sales = () => <div className="p-6"><h1>Quản lý bán hàng</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider breakpoint="lg" collapsedWidth="0">
          <div className="h-16 m-4 bg-white/20 flex items-center justify-center text-white font-bold">
            GPP MANAGER
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1" icon={<LayoutDashboard size={18} />}>
              <Link to="/">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<Pill size={18} />}>
              <Link to="/medicines">Danh mục thuốc</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<ShoppingCart size={18} />}>
              <Link to="/sales">Bán hàng</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<ClipboardList size={18} />}>
              <Link to="/prescriptions">Đơn thuốc</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<Users size={18} />}>
              <Link to="/customers">Khách hàng</Link>
            </Menu.Item>
            <Menu.Item key="6" icon={<Settings size={18} />}>
              <Link to="/settings">Cài đặt</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header className="bg-white p-0 px-6 flex items-center justify-between shadow-sm">
            <span className="font-medium text-lg">Hệ thống Nhà thuốc GPP</span>
            <div className="flex items-center gap-4">
              <span>Chào, Dược sĩ Admin</span>
            </div>
          </Header>
          <Content className="m-4 bg-white rounded-lg shadow-sm">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/medicines" element={<MedicineList />} />
              <Route path="/sales" element={<Sales />} />
              {/* Thêm các route khác ở đây */}
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
