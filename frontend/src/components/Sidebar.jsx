import { Link, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import {
  LayoutDashboard,
  Pill,
  Tags,
  Boxes,
  ClipboardList,
  Truck,
  ShoppingCart,
  Receipt,
  Users,
  Wallet,
  TrendingUp,
  FileBox,
  BadgeAlert,
  Archive,
  Undo2,
  ActivitySquare,
  UserSquare2,
  CalendarDays,
  Clock,
  Banknote,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldPlus
} from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';

// Type definitions internally documented since we are using JS
// interface SidebarProps {
//   collapsed: boolean
//   onCollapse: (val: boolean) => void
//   badges?: { inventory?: number }
// }

export default function Sidebar({ collapsed, onCollapse, badges = {} }) {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuGroups = [
    {
      title: 'TỔNG QUAN',
      items: [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      ],
    },
    {
      title: 'DANH MỤC',
      items: [
        { path: '/medicines', icon: Pill, label: 'Danh mục thuốc' },
        { path: '/medicine-groups', icon: Tags, label: 'Nhóm thuốc' },
        { path: '/inventory', icon: Boxes, label: 'Tồn kho', badge: badges.inventory },
      ],
    },
    {
      title: 'NHẬP HÀNG',
      items: [
        { path: '/purchase-orders', icon: ClipboardList, label: 'Đơn nhập hàng' },
        { path: '/suppliers', icon: Truck, label: 'Nhà cung cấp' },
      ],
    },
    {
      title: 'BÁN HÀNG',
      items: [
        { path: '/pos', icon: ShoppingCart, label: 'Bán hàng (POS)' },
        { path: '/invoices', icon: Receipt, label: 'Hóa đơn' },
        { path: '/customers', icon: Users, label: 'Khách hàng' },
      ],
    },
    {
      title: 'TÀI CHÍNH',
      items: [
        { path: '/cash-book', icon: Wallet, label: 'Sổ quỹ' },
      ],
    },
    {
      title: 'BÁO CÁO',
      items: [
        { path: '/report-revenue', icon: TrendingUp, label: 'Doanh thu' },
        { path: '/report-io', icon: FileBox, label: 'Báo cáo NXT' },
        { path: '/report-debt', icon: BadgeAlert, label: 'Công nợ' },
        { path: '/report-inventory', icon: Archive, label: 'Sổ xuất nhập tồn' },
        { path: '/report-debt-detail', icon: Receipt, label: 'Công nợ chi tiết' },
      ],
    },
    {
      title: 'TRẢ HÀNG',
      items: [
        { path: '/returns', icon: Undo2, label: 'Phiếu trả hàng' },
      ],
    },
    {
      title: 'HỆ THỐNG',
      items: [
        { path: '/activity', icon: ActivitySquare, label: 'Lịch sử hoạt động' },
        { path: '/staff', icon: UserSquare2, label: 'Nhân viên' },
        { path: '/schedule', icon: CalendarDays, label: 'Lịch phân ca' },
        { path: '/timesheet', icon: Clock, label: 'Chấm công' },
        { path: '/payroll', icon: Banknote, label: 'Bảng lương' },
      ],
    },
    {
      title: 'NHÂN VIÊN',
      items: [
        { path: '/my-schedule', icon: CalendarDays, label: 'Lịch của tôi' },
        { path: '/my-timesheet', icon: Clock, label: 'Chấm công POS' },
      ],
    },
  ];

  return (
    <aside
      className="flex flex-col h-screen transition-all duration-300 ease-in-out relative group/sidebar z-20"
      style={{
        backgroundColor: 'var(--color-sidebar-bg)',
        width: collapsed ? '72px' : '240px',
        borderRight: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 flex-shrink-0 relative group/header">
        <div className={`flex items-center gap-3 transition-opacity duration-200 ${collapsed ? 'opacity-100 group-hover/header:opacity-0' : 'opacity-100'}`}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <ShieldPlus size={18} color="white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap overflow-hidden">
              GPP Manager
            </span>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => onCollapse(!collapsed)}
          className={`flex items-center justify-center w-7 h-7 rounded transition-all cursor-pointer hover:bg-[var(--color-sidebar-hover-bg)]
            ${collapsed
              ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/header:opacity-100 text-white'
              : 'text-[var(--color-sidebar-text)] hover:text-white'
            }
          `}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-2 scrollbar-thin">
        <style>{`
          .scrollbar-thin::-webkit-scrollbar { width: 4px; }
          .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
          .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
          .scrollbar-thin:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
        `}</style>

        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            {/* Group Label */}
            {!collapsed ? (
              <div
                className="px-6 mb-2 text-[11px] font-semibold tracking-wider"
                style={{ color: 'var(--color-sidebar-label)' }}
              >
                {group.title}
              </div>
            ) : (
              <div className="h-4"></div> /* Spacing when collapsed */
            )}

            {/* Items */}
            <ul className="flex flex-col gap-1 px-3">
              {group.items.map((item, itemIdx) => {
                const isActive = location.pathname === item.path;

                const NavItem = (
                  <Link
                    to={item.path}
                    className="flex items-center rounded-lg px-3 py-2.5 transition-colors relative group"
                    style={{
                      backgroundColor: isActive ? 'var(--color-sidebar-active-bg)' : 'transparent',
                      color: isActive ? 'var(--color-sidebar-active)' : 'var(--color-sidebar-text)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover-bg)';
                      if (!isActive) e.currentTarget.style.color = 'var(--color-sidebar-active)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                      if (!isActive) e.currentTarget.style.color = 'var(--color-sidebar-text)';
                    }}
                  >
                    {/* Active pill indicator (subtle detail) */}
                    {isActive && !collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full bg-white opacity-50" />
                    )}

                    <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                      <item.icon size={18} />
                    </div>

                    {!collapsed && (
                      <div className="ml-3 flex-1 flex justify-between items-center whitespace-nowrap overflow-hidden">
                        <span className="text-[13px] font-medium truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-primary-light)',
                              color: isActive ? 'white' : 'var(--color-primary-text)'
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {collapsed && item.badge !== undefined && (
                      <div
                        className="absolute top-2 right-2 w-2 h-2 rounded-full border border-sidebar-bg"
                        style={{ backgroundColor: 'var(--color-inventory)' }}
                      />
                    )}
                  </Link>
                );

                return (
                  <li key={itemIdx}>
                    {collapsed ? (
                      <Tooltip placement="right" title={item.label}>
                        {NavItem}
                      </Tooltip>
                    ) : (
                      NavItem
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <button
          onClick={logout}
          className="w-full flex items-center rounded-lg px-3 py-2.5 transition-colors cursor-pointer"
          style={{ color: 'var(--color-debt)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            <LogOut size={18} />
          </div>
          {!collapsed && (
            <span className="ml-3 text-[13px] font-medium whitespace-nowrap">Đăng xuất</span>
          )}
        </button>
      </div>
    </aside>
  );
}