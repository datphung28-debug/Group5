import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Empty, Input, Space, Spin, Table, Tag, Tooltip, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CircleDollarSign,
  Eye,
  Filter,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import SupplierEditModal from './SupplierEditModal';
import useSupplierStore from '../../stores/useSupplierStore';
import { formatCurrency, statusStyles } from './supplierData';
import '../../styles/dashboard.css';

function SummaryCard({ icon, label, value, valueClassName, iconClassName }) {
  const IconComponent = icon;

  return (
    <Card className="kpi-card">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="kpi-label">{label}</p>
          <h3 className={`kpi-value truncate ${valueClassName}`}>{value}</h3>
        </div>
        <div className={`kpi-icon-wrapper ${iconClassName}`}>
          <IconComponent size={20} />
        </div>
      </div>
    </Card>
  );
}

export default function SuppliersPage() {
  const navigate = useNavigate();
  const suppliers = useSupplierStore((state) => state.suppliers);
  const loading = useSupplierStore((state) => state.loading);
  const error = useSupplierStore((state) => state.error);
  const fetchSuppliers = useSupplierStore((state) => state.fetchSuppliers);
  const createSupplier = useSupplierStore((state) => state.createSupplier);
  const updateSupplier = useSupplierStore((state) => state.updateSupplier);
  const [searchValue, setSearchValue] = useState('');
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) {
      return suppliers;
    }

    return suppliers.filter((supplier) => (
      supplier.name.toLowerCase().includes(keyword)
      || supplier.code.toLowerCase().includes(keyword)
      || supplier.phone.toLowerCase().includes(keyword)
      || supplier.taxCode.toLowerCase().includes(keyword)
    ));
  }, [searchValue, suppliers]);

  const summary = useMemo(() => ({
    total: suppliers.length,
    totalDebt: suppliers.reduce((total, supplier) => total + supplier.currentDebt, 0),
    fullyPaid: suppliers.filter((supplier) => supplier.currentDebt === 0).length,
  }), [suppliers]);

  const handleSave = async (values) => {
    const result = editingSupplier
      ? await updateSupplier(editingSupplier.id, values)
      : await createSupplier(values);

    if (!result.success) {
      messageApi.error(result.message);
      return;
    }

    setEditingSupplier(null);
    setDrawerOpen(false);
    messageApi.success(editingSupplier ? 'Đã cập nhật nhà cung cấp' : 'Đã thêm nhà cung cấp');
  };

  const columns = [
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, 'vi'),
      render: (name, record) => (
        <div className="min-w-[220px]">
          <div className="font-semibold text-[var(--color-text-primary)]">{name}</div>
          <div className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)]">{record.code}</div>
        </div>
      ),
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxCode',
      width: 140,
      render: (value) => <span className="text-[var(--color-text-secondary)]">{value}</span>,
    },
    {
      title: 'SĐT liên hệ',
      dataIndex: 'phone',
      width: 150,
      render: (value) => <span className="font-medium text-[var(--color-text-primary)]">{value}</span>,
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contactName',
      width: 180,
      render: (name, record) => (
        <div>
          <div className="font-medium text-[var(--color-text-primary)]">{name}</div>
          <div className="mt-1 text-[12px] text-[var(--color-text-muted)]">{record.contactPhone}</div>
        </div>
      ),
    },
    {
      title: 'Nợ hiện tại',
      dataIndex: 'currentDebt',
      width: 150,
      sorter: (a, b) => a.currentDebt - b.currentDebt,
      render: (value) => (
        <span className={`font-semibold ${value > 0 ? 'text-[var(--color-debt)]' : 'text-[var(--color-profit)]'}`}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Hạn mức nợ',
      dataIndex: 'debtLimit',
      width: 150,
      sorter: (a, b) => a.debtLimit - b.debtLimit,
      render: (value) => <span className="font-medium text-[var(--color-text-primary)]">{formatCurrency(value)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (status) => <Tag color={statusStyles[status]} className="rounded-full px-3 py-1 font-medium">{status}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 110,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết nhà cung cấp">
            <Button type="text" icon={<Eye size={17} />} onClick={(event) => { event.stopPropagation(); navigate(`/suppliers/${record._id || record.id}`); }} className="text-[var(--color-primary)]" />
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông tin">
            <Button type="text" icon={<Pencil size={17} />} onClick={(event) => { event.stopPropagation(); setEditingSupplier(record); setDrawerOpen(true); }} className="text-[var(--color-text-secondary)]" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      {contextHolder}
      <PageHeader
        title="Nhà cung cấp"
        subtitle="Quản lý danh sách nhà cung cấp thuốc"
        actions={
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={() => { setEditingSupplier(null); setDrawerOpen(true); }}
            className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-5 font-medium shadow-[var(--shadow-card)] hover:bg-[var(--color-primary-hover)]"
          >
            Thêm nhà cung cấp
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={Building2}
          label="Tổng nhà cung cấp"
          value={summary.total}
          valueClassName="text-[var(--color-primary)]"
          iconClassName="bg-[var(--color-primary-light)] text-[var(--color-primary)]"
        />
        <SummaryCard
          icon={CircleDollarSign}
          label="Tổng nợ NCC"
          value={formatCurrency(summary.totalDebt)}
          valueClassName="text-[var(--color-debt)]"
          iconClassName="bg-[var(--color-debt-bg)] text-[var(--color-debt)]"
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Đã thanh toán đầy đủ"
          value={summary.fullyPaid}
          valueClassName="text-[var(--color-profit)]"
          iconClassName="bg-[var(--color-profit-bg)] text-[var(--color-profit)]"
        />
      </div>

      <div className="mb-5 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input
            allowClear
            size="large"
            prefix={<Search size={18} className="text-[var(--color-text-muted)]" />}
            placeholder="Tìm theo tên, mã, SĐT..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="max-w-full rounded-[var(--radius-md)] border-[var(--color-border)] lg:max-w-[420px]"
          />
          <Space size={10} wrap>
            <Button icon={<Filter size={17} />} className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)]">
              Lọc
            </Button>
            <Button icon={<RotateCcw size={17} />} onClick={() => setSearchValue('')} className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-secondary)]">
              Reset
            </Button>
          </Space>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          className="mb-4 rounded-[var(--radius-md)]"
        />
      )}

      <div className="hidden rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] md:block">
        <Table
          rowKey={(record) => record._id || record.id}
          columns={columns}
          dataSource={filteredSuppliers}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 1180 }}
          locale={{ emptyText: <Empty description="Chưa có nhà cung cấp" /> }}
          rowClassName="cursor-pointer transition-colors hover:bg-[var(--color-bg-subtle)]"
          onRow={(record) => ({ onClick: () => navigate(`/suppliers/${record._id || record.id}`) })}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {loading && (
          <div className="rounded-[var(--radius-lg)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
            <Spin />
          </div>
        )}
        {!loading && filteredSuppliers.length === 0 && (
          <div className="rounded-[var(--radius-lg)] bg-white p-8 shadow-[var(--shadow-card)]">
            <Empty description="Chưa có nhà cung cấp" />
          </div>
        )}
        {filteredSuppliers.map((supplier) => (
          <div key={supplier._id || supplier.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">{supplier.name}</h3>
                <p className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)]">{supplier.code} · MST {supplier.taxCode}</p>
              </div>
              <Tag color={statusStyles[supplier.status]} className="m-0 rounded-full px-3 py-1 font-medium">{supplier.status}</Tag>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
                <div className="text-[var(--color-text-muted)]">Nợ hiện tại</div>
                <div className="mt-1 font-semibold text-[var(--color-debt)]">{formatCurrency(supplier.currentDebt)}</div>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
                <div className="text-[var(--color-text-muted)]">Hạn mức nợ</div>
                <div className="mt-1 font-semibold text-[var(--color-text-primary)]">{formatCurrency(supplier.debtLimit)}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-border-light)] pt-3">
              <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
                <Phone size={15} />
                <span>{supplier.contactName} · {supplier.contactPhone}</span>
              </div>
              <Space size={4}>
                <Button type="text" icon={<Eye size={17} />} onClick={() => navigate(`/suppliers/${supplier._id || supplier.id}`)} className="text-[var(--color-primary)]" />
                <Button type="text" icon={<Pencil size={17} />} onClick={() => { setEditingSupplier(supplier); setDrawerOpen(true); }} className="text-[var(--color-text-secondary)]" />
              </Space>
            </div>
          </div>
        ))}
      </div>

      <SupplierEditModal
        open={drawerOpen}
        supplier={editingSupplier}
        confirmLoading={loading}
        onClose={() => { setEditingSupplier(null); setDrawerOpen(false); }}
        onSave={handleSave}
      />
    </div>
  );
}
