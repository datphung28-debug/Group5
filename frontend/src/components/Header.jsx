import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Empty, Popover, Tag, Spin } from 'antd';
import { Search, Bell, Plus, ChevronDown, User, X, LogOut } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import { medicineAPI, importAPI } from '../api/api';



export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch real alerts and updates from database
  useEffect(() => {
    const fetchRealNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const [lowStockRes, expiringRes, importsRes] = await Promise.all([
          medicineAPI.getAll({ lowStock: 'true', limit: 10 }),
          medicineAPI.getExpiring(30),
          importAPI.getAll({ limit: 5 })
        ]);

        const lowStock = lowStockRes.data?.medicines || lowStockRes.data?.data || lowStockRes.data || [];
        const expiring = expiringRes.data?.medicines || expiringRes.data?.data || expiringRes.data || [];
        const imports = importsRes.data?.imports || importsRes.data?.data || importsRes.data || [];

        const list = [];
        
        // Map medicines with low stock
        if (lowStock.length > 0) {
          list.push({
            id: 'low-stock',
            title: `${lowStock.length} thuốc sắp hết tồn`,
            description: `Bao gồm: ${lowStock.slice(0, 3).map((m) => m.name).join(', ')}${lowStock.length > 3 ? '...' : ''}.`,
            time: 'Hiện tại',
            type: 'Tồn kho',
            unread: true,
          });
        }

        // Map medicines expiring in 30 days
        if (expiring.length > 0) {
          list.push({
            id: 'expiring-soon',
            title: `${expiring.length} lô thuốc sắp hết hạn`,
            description: `Bao gồm: ${expiring.slice(0, 3).map((m) => m.name).join(', ')}${expiring.length > 3 ? '...' : ''}.`,
            time: 'Hiện tại',
            type: 'Cảnh báo',
            unread: true,
          });
        }

        // Map recent completed import transactions
        if (imports.length > 0) {
          const latestImport = imports[0];
          list.push({
            id: `import-${latestImport._id}`,
            title: `Phiếu nhập ${latestImport.code} hoàn tất`,
            description: `Nhập hàng từ nhà cung cấp ${latestImport.supplier?.name || 'NCC'} thành công.`,
            time: 'Gần đây',
            type: 'Nhập hàng',
            unread: false,
          });
        }

        setNotifications(list);
      } catch (err) {
        console.error('Failed to fetch real notifications:', err);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchRealNotifications();
  }, []);

  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const handleNotificationOpenChange = (open) => {
    setNotificationOpen(open);
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  };

  const markAsRead = (notificationId) => {
    setNotifications((current) => current.map((item) => (
      item.id === notificationId ? { ...item, unread: false } : item
    )));
  };

  // Content for the user avatar dropdown popover
  const userContent = (
    <div className="w-[200px] py-1">
      <div className="px-4 py-2 border-b border-[var(--color-border-light)]">
        <p className="m-0 text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{user?.name || 'Dược sĩ'}</p>
        <p className="m-0 mt-0.5 text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
          {user?.role === 'admin' ? 'Quản trị viên' : 'Dược sĩ'}
        </p>
        <p className="m-0 mt-0.5 text-[11px] text-[var(--color-text-muted)] truncate">{user?.email}</p>
      </div>
      <div className="py-1">
        <button
          onClick={logout}
          type="button"
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] font-medium text-[var(--color-debt)] hover:bg-[var(--color-debt-bg)] transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  const notificationContent = (
    <div className="w-[calc(100vw-32px)] max-w-[360px]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-light)] px-4 py-3">
        <div>
          <h3 className="m-0 text-[15px] font-semibold text-[var(--color-text-primary)]">Thông báo</h3>
          <p className="m-0 mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead} className="p-0 text-[12px] font-medium">
            Đã đọc
          </Button>
        )}
      </div>

      {loadingNotifications ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="small" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-4 py-8">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo" />
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto py-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => markAsRead(notification.id)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-subtle)]"
            >
              <span className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${notification.unread ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold leading-5 text-[var(--color-text-primary)]">{notification.title}</span>
                  <Tag className="m-0 rounded-full px-2 text-[11px]">{notification.type}</Tag>
                </span>
                <span className="mt-1 block text-[12px] leading-5 text-[var(--color-text-secondary)]">{notification.description}</span>
                <span className="mt-1 block text-[11px] font-medium text-[var(--color-text-muted)]">{notification.time}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className="h-14 md:h-16 bg-white border-b border-[var(--color-border-light)] flex-shrink-0 relative z-20">
      {/* Main header row */}
      <div className="h-full px-3 sm:px-4 md:px-6 flex items-center justify-between gap-4">
        
        {/* Left Section: Context/Status (Desktop only) */}
        <div className="hidden lg:flex flex-1 items-center min-w-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-profit)] animate-pulse"></div>
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)] whitespace-nowrap">
              Hệ thống trực tuyến
            </span>
          </div>
        </div>

        {/* Center Section: Search Bar (Desktop/Tablet) */}
        <div className="hidden sm:flex flex-[2] md:flex-[2.5] lg:flex-[2] justify-center px-4">
          <div className="relative w-full max-w-md lg:max-w-lg group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={16} className="text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm thuốc, hóa đơn, khách hàng..."
              className="w-full bg-[var(--color-bg-app)] border border-transparent focus:border-[var(--color-primary-border)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary-light)] text-[13px] rounded-[var(--radius-md)] py-2 pl-10 pr-4 transition-all duration-200 outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
          </div>
        </div>

        {/* Right Section: Actions & User */}
        <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-2 md:gap-3 lg:gap-5">
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
            className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[13px] font-medium px-2.5 sm:px-3 md:px-4 py-2 rounded-[var(--radius-md)] transition-all hover:shadow-md active:scale-95 flex-shrink-0"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Bán hàng</span>
          </Link>

          {/* Bell notification */}
          <Popover
            trigger="click"
            placement="bottomRight"
            open={notificationOpen}
            onOpenChange={handleNotificationOpenChange}
            content={notificationContent}
            arrow={false}
            overlayInnerStyle={{ padding: 0, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-dropdown)' }}
          >
            <button className={`relative flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] transition-colors cursor-pointer flex-shrink-0 ${notificationOpen ? 'bg-[var(--color-bg-subtle)] text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-subtle)]'}`}>
              <Badge count={unreadCount} size="small" offset={[1, 2]} overflowCount={9}>
                <Bell size={20} className={notificationOpen ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'} />
              </Badge>
            </button>
          </Popover>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-[var(--color-border-light)] mx-1"></div>

          {/* User avatar + info */}
          <Popover
            trigger="click"
            placement="bottomRight"
            open={userDropdownOpen}
            onOpenChange={setUserDropdownOpen}
            content={userContent}
            arrow={false}
            overlayInnerStyle={{ padding: 0, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-dropdown)' }}
          >
            <button className={`flex items-center gap-2 md:gap-3 p-1.5 -m-1.5 rounded-[var(--radius-md)] transition-colors cursor-pointer text-left flex-shrink-0 group ${userDropdownOpen ? 'bg-[var(--color-bg-subtle)]' : 'hover:bg-[var(--color-bg-subtle)]'}`}>
              <div className={`w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center overflow-hidden flex-shrink-0 border transition-all ${userDropdownOpen ? 'border-[var(--color-primary-border)]' : 'border-transparent group-hover:border-[var(--color-primary-border)]'}`}>
                <User size={18} />
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-tight whitespace-nowrap">
                  {user?.name || 'Dược sĩ'}
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)] leading-tight uppercase tracking-wider font-medium">
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Dược sĩ'}
                </span>
              </div>
              <ChevronDown size={14} className={`text-[var(--color-text-muted)] hidden lg:block transition-colors ${userDropdownOpen ? 'text-[var(--color-primary)]' : 'group-hover:text-[var(--color-primary)]'}`} />
            </button>
          </Popover>
        </div>
      </div>


      {/* Mobile search dropdown */}
      {mobileSearchOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-[var(--color-border-light)] px-3 py-2.5 shadow-lg z-20 animate-in slide-in-from-top-2 duration-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={16} className="text-[var(--color-primary)]" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm thuốc, hóa đơn..."
              autoFocus
              className="w-full bg-white border-none focus:ring-0 text-[14px] py-3 pl-10 pr-4 outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
          </div>
        </div>
      )}
    </header>
  );
}
