import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Plus, ChevronDown, User, X } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="h-14 md:h-16 bg-white border-b border-[var(--color-border-light)] flex-shrink-0 relative z-10">
      {/* Main header row */}
      <div className="h-full px-3 sm:px-4 md:px-6 flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Left: Search Bar — fills available space, collapses on mobile */}
        <div className="hidden sm:flex flex-1 min-w-0">
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-[var(--color-text-muted)]" />
            </div>
            <input
              type="text"
              placeholder="Tìm thuốc, hóa đơn, khách hàng..."
              className="w-full bg-[var(--color-bg-app)] border border-transparent focus:border-[var(--color-primary-border)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary-light)] text-[13px] rounded-[var(--radius-md)] py-2 pl-10 pr-4 transition-all outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
          </div>
        </div>

        {/* Right: Actions & User — never shrinks, items hide progressively */}
        <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-5 ml-auto">
          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
          >
            {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          {/* "Bán hàng" CTA — icon-only on small screens */}
          <Link
            to="/pos"
            className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[13px] font-medium px-2.5 sm:px-3 md:px-4 py-2 rounded-[var(--radius-md)] transition-colors flex-shrink-0"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Bán hàng</span>
          </Link>

          {/* Bell notification */}
          <button className="relative flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer flex-shrink-0">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-debt)] border-2 border-white"></span>
          </button>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-[var(--color-border-light)]"></div>

          {/* User avatar + info */}
          <button className="flex items-center gap-2 md:gap-3 hover:bg-[var(--color-bg-subtle)] p-1.5 -m-1.5 rounded-[var(--radius-md)] transition-colors cursor-pointer text-left flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center overflow-hidden flex-shrink-0">
              <User size={18} />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-[13px] font-medium text-[var(--color-text-primary)] leading-tight whitespace-nowrap">
                {user?.name || 'Dược sĩ'}
              </span>
              <span className="text-[11px] text-[var(--color-text-secondary)] leading-tight">
                admin
              </span>
            </div>
            <ChevronDown size={14} className="text-[var(--color-text-muted)] hidden lg:block" />
          </button>
        </div>
      </div>

      {/* Mobile search dropdown */}
      {mobileSearchOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-[var(--color-border-light)] px-3 py-2.5 shadow-sm z-20">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-[var(--color-text-muted)]" />
            </div>
            <input
              type="text"
              placeholder="Tìm thuốc, hóa đơn, khách hàng..."
              autoFocus
              className="w-full bg-[var(--color-bg-app)] border border-transparent focus:border-[var(--color-primary-border)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary-light)] text-[13px] rounded-[var(--radius-md)] py-2.5 pl-10 pr-4 transition-all outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
          </div>
        </div>
      )}
    </header>
  );
}
