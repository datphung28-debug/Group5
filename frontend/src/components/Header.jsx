import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, Plus, ChevronDown, User } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';

export default function Header() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Simple route name mapping
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/medicines': return 'Danh mục thuốc';
      case '/medicines/add': return 'Thêm thuốc mới';
      case '/inventory': return 'Tồn kho';
      case '/inventory/expiry': return 'Cảnh báo hết hạn';
      case '/pos': return 'Quản lý bán hàng';
      default: return 'Tổng quan';
    }
  };

  return (
    <header className="h-16 bg-white px-6 flex items-center justify-between border-b border-[var(--color-border-light)] flex-shrink-0">
      {/* Left: Page Title */}
      <div className="w-1/4">
        <h1 className="text-[var(--color-text-primary)] text-[18px] font-bold m-0 leading-none">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 flex justify-center max-w-2xl">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-[var(--color-text-muted)]" />
          </div>
          <input
            type="text"
            placeholder="Tìm thuốc, hóa đơn, khách hàng..."
            className="w-full bg-[var(--color-bg-app)] border-transparent focus:border-[var(--color-primary-border)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary-light)] text-[13px] rounded-[var(--radius-md)] py-2 pl-10 pr-4 transition-all outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
          />
        </div>
      </div>

      {/* Right: Actions & User */}
      <div className="w-1/4 flex items-center justify-end gap-5">
        <Link
          to="/pos"
          className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[13px] font-medium px-4 py-2 rounded-[var(--radius-md)] transition-colors"
        >
          <Plus size={16} />
          Bán hàng
        </Link>

        <button className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[var(--color-debt)] border border-white"></span>
        </button>

        <div className="h-6 w-[1px] bg-[var(--color-border-light)] mx-1"></div>

        <button className="flex items-center gap-3 hover:bg-[var(--color-bg-subtle)] p-1.5 -m-1.5 rounded-[var(--radius-md)] transition-colors cursor-pointer text-left">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center overflow-hidden flex-shrink-0">
            <User size={18} />
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[13px] font-medium text-[var(--color-text-primary)] leading-tight">
              {user?.name || 'Dược sĩ'}
            </span>
            <span className="text-[11px] text-[var(--color-text-secondary)] leading-tight">
              admin
            </span>
          </div>
          <ChevronDown size={14} className="text-[var(--color-text-muted)] hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
