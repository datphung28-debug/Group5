import React, { useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Form, Input, Select, Space, message } from 'antd';
import { Plus, Save, UserCog } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { userAPI } from '../../api/api';
import UserFilter from './components/UserFilter';
import UserKPIs from './components/UserKPIs';
import UserTable from './components/UserTable';
import { ROLE_META } from './userData';

const initialFilters = {
  role: 'all',
  search: '',
  status: 'all',
};

const normalizeUsers = (payload) => {
  const users = payload?.users || payload?.data || payload || [];
  return Array.isArray(users) ? users : [];
};

const StaffPage = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await userAPI.getAll({ limit: 100 });
        const nextUsers = normalizeUsers(res.data);
        setUsers(nextUsers);
        setLoadError(null);
      } catch (error) {
        setUsers([]);
        setLoadError(error.response?.data?.message || 'Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (editingUser) {
      form.setFieldsValue(editingUser);
    } else {
      form.resetFields();
    }
  }, [editingUser, form]);

  const filteredUsers = useMemo(() => {
    const keyword = activeFilters.search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesKeyword =
        !keyword ||
        user.name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword);
      const matchesRole = activeFilters.role === 'all' || user.role === activeFilters.role;
      const matchesStatus =
        activeFilters.status === 'all' ||
        (activeFilters.status === 'active' && user.isActive) ||
        (activeFilters.status === 'locked' && !user.isActive);

      return matchesKeyword && matchesRole && matchesStatus;
    });
  }, [activeFilters, users]);

  const summary = useMemo(() => (
    users.reduce(
      (acc, user) => ({
        total: acc.total + 1,
        admins: acc.admins + (user.role === 'admin' ? 1 : 0),
        pharmacists: acc.pharmacists + (user.role === 'pharmacist' ? 1 : 0),
        locked: acc.locked + (!user.isActive ? 1 : 0),
      }),
      { total: 0, admins: 0, pharmacists: 0, locked: 0 }
    )
  ), [users]);

  const handleFilterChange = (nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  };

  const updateLocalUser = (updatedUser) => {
    setUsers((current) => current.map((user) => ((user._id || user.id) === (updatedUser._id || updatedUser.id) ? updatedUser : user)));
  };

  const handleSave = async (values) => {
    if (!editingUser) return;

    const userId = editingUser._id || editingUser.id;
    const nextUser = { ...editingUser, ...values };

    try {
      if (editingUser._id) {
        const res = await userAPI.update(userId, values);
        updateLocalUser(res.data);
      } else {
        updateLocalUser(nextUser);
      }
      setEditingUser(null);
      messageApi.success('Đã cập nhật người dùng');
    } catch (err) {
      messageApi.error(err.response?.data?.message || 'Không thể cập nhật người dùng');
    }
  };

  const handleToggleStatus = async (user) => {
    const userId = user._id || user.id;
    const nextActive = !user.isActive;

    try {
      if (user._id) {
        if (nextActive) {
          const res = await userAPI.update(userId, { isActive: true });
          updateLocalUser(res.data);
        } else {
          await userAPI.delete(userId);
          updateLocalUser({ ...user, isActive: false });
        }
      } else {
        updateLocalUser({ ...user, isActive: nextActive });
      }
      messageApi.success(nextActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
    } catch (err) {
      messageApi.error(err.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      {contextHolder}
      <PageHeader
        title="Quản lý người dùng"
        subtitle="Quản lý tài khoản đăng nhập, vai trò và trạng thái sử dụng hệ thống"
        actions={
          <Button
            type="primary"
            icon={<Plus size={18} className="mr-2 inline" />}
            className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-6 font-medium shadow-[var(--shadow-card)] hover:bg-[var(--color-primary-hover)]"
            onClick={() => messageApi.info('Tạo người dùng mới sẽ được nối với API đăng ký khi cần.')}
          >
            Thêm người dùng
          </Button>
        }
      />

      {loadError && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-debt)] bg-[var(--color-debt-bg)] px-4 py-3 text-[13px] font-medium text-[var(--color-debt)]">
          {loadError}
        </div>
      )}

      <UserFilter
        filters={filters}
        onChange={handleFilterChange}
        onApply={() => setActiveFilters(filters)}
        onReset={() => {
          setFilters(initialFilters);
          setActiveFilters(initialFilters);
        }}
      />

      <UserKPIs summary={summary} />
      <UserTable data={filteredUsers} loading={loading} onEdit={setEditingUser} onToggleStatus={handleToggleStatus} />

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <UserCog size={19} className="text-[var(--color-primary)]" />
            <span>Chỉnh sửa người dùng</span>
          </div>
        }
        placement="right"
        width={520}
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        extra={
          <Space size={10}>
            <Button className="rounded-[var(--radius-md)]" onClick={() => setEditingUser(null)}>Hủy</Button>
            <Button
              type="primary"
              icon={<Save size={16} />}
              className="rounded-[var(--radius-md)] border-none bg-[var(--color-primary)]"
              onClick={() => form.submit()}
            >
              Lưu
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input className="h-10 rounded-[var(--radius-md)]" placeholder="Nhập họ tên" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input className="h-10 rounded-[var(--radius-md)]" placeholder="name@example.com" />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone">
            <Input className="h-10 rounded-[var(--radius-md)]" placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select
              className="h-10"
              options={Object.entries(ROLE_META).map(([value, meta]) => ({ value, label: meta.label }))}
            />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="address">
            <Input.TextArea rows={3} className="rounded-[var(--radius-md)]" placeholder="Nhập địa chỉ hoặc ghi chú vị trí làm việc" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="isActive" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select
              className="h-10"
              options={[
                { value: true, label: 'Đang hoạt động' },
                { value: false, label: 'Đã khóa' },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default StaffPage;
