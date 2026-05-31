import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, DatePicker, Descriptions, Dropdown, Empty, Input, Modal, Select, Space, Table, Tag, message, Image } from 'antd';
import { Eye, Filter, MoreVertical, Plus, Printer, RotateCcw, UserRound, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { saleAPI } from '../../api/api';
import { getSalesFromResponse, normalizeInvoice } from './salesInvoiceUtils';

const { RangePicker } = DatePicker;

const INVOICE_STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunded', label: 'Hoàn tiền' },
];

const STATUS_META = {
  completed: { label: 'Hoàn thành', color: 'var(--color-profit)', background: 'var(--color-profit-bg)', border: 'var(--color-profit)' },
  cancelled: { label: 'Đã hủy', color: 'var(--color-debt)', background: 'var(--color-debt-bg)', border: 'var(--color-debt)' },
  refunded: { label: 'Hoàn tiền', color: 'var(--color-primary-text)', background: 'var(--color-primary-light)', border: 'var(--color-primary-border)' },
};

const PAYMENT_METHOD_LABELS = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  card: 'Thẻ',
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const formatDate = (value) => value ? new Date(value).toLocaleString('vi-VN') : '—';

const StatusTag = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.completed;
  return (
    <Tag
      className="m-0 rounded-full px-3 py-1 font-medium border"
      style={{ color: meta.color, backgroundColor: meta.background, borderColor: meta.border }}
    >
      {meta.label}
    </Tag>
  );
};

const DetailMetric = ({ label, value, tone }) => (
  <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
    <p className="text-[var(--font-size-xs)] font-medium text-[var(--color-text-muted)]">{label}</p>
    <p className={`mt-1 text-[var(--font-size-md)] font-bold ${tone || 'text-[var(--color-text-primary)]'}`}>{value}</p>
  </div>
);

const SalesInvoicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialSearch = searchParams.get('search') || '';

  const [filters, setFilters] = useState({ search: initialSearch, status: 'all', dateRange: null });
  const [activeFilters, setActiveFilters] = useState({ search: initialSearch, status: 'all', dateRange: null });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = useCallback(async (nextFilters = activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        limit: 200,
        ...(nextFilters.dateRange?.length === 2 ? {
          startDate: nextFilters.dateRange[0].toISOString(),
          endDate: nextFilters.dateRange[1].toISOString(),
        } : {}),
      };
      const response = await saleAPI.getAll(params);
      const sales = getSalesFromResponse(response.data);
      setInvoices(sales.map(normalizeInvoice));
    } catch (error) {
      const messageText = error.response?.data?.message || 'Không thể tải danh sách hóa đơn';
      setError(messageText);
      message.error(messageText);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    void Promise.resolve().then(() => fetchInvoices());
  }, [fetchInvoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const keyword = activeFilters.search.trim().toLowerCase();
      const matchesSearch = !keyword
        || invoice.code?.toLowerCase().includes(keyword)
        || invoice.customerName?.toLowerCase().includes(keyword)
        || invoice.customerPhone?.toLowerCase().includes(keyword);
      const matchesStatus = activeFilters.status === 'all' || invoice.status === activeFilters.status;
      return matchesSearch && matchesStatus;
    });
  }, [activeFilters, invoices]);

  const handleFilter = () => {
    setActiveFilters(filters);
    fetchInvoices(filters);
  };

  const handleReset = () => {
    const resetFilters = { search: '', status: 'all', dateRange: null };
    setFilters(resetFilters);
    setActiveFilters(resetFilters);
    fetchInvoices(resetFilters);
  };

  const handleViewInvoice = async (record) => {
    setSelectedInvoice(record);
    try {
      const response = await saleAPI.getById(record.id);
      setSelectedInvoice(normalizeInvoice(response.data));
    } catch {
      message.error('Không thể tải chi tiết hóa đơn');
    }
  };

  const handlePrintInvoice = (record) => {
    message.success(`Đang chuẩn bị in hóa đơn ${record.code}`);
  };

  const columns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'code',
      key: 'code',
      width: 170,
      fixed: 'left',
      render: (code, record) => (
        <Button type="link" className="h-auto p-0 font-semibold text-[var(--color-primary)]" onClick={() => handleViewInvoice(record)}>
          {code}
        </Button>
      ),
    },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName', width: 180, render: (customer) => <span className="font-medium text-[var(--color-text-primary)]">{customer}</span> },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 190,
      render: (createdAt, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--color-text-primary)]">{formatDate(createdAt)}</span>
          <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{record.staff}</span>
        </div>
      ),
    },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total', width: 130, align: 'right', render: (total) => <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(total)}</span> },
    { title: 'Đã thu', dataIndex: 'paid', key: 'paid', width: 130, align: 'right', render: (paid) => <span className="font-medium text-[var(--color-profit)]">{formatCurrency(paid)}</span> },
    {
      title: 'Còn nợ',
      key: 'debt',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const debt = Math.max(record.total - record.paid, 0);
        return debt ? <span className="font-semibold text-[var(--color-debt)]">{formatCurrency(debt)}</span> : <span className="text-[var(--color-text-muted)]">—</span>;
      },
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 130,
      render: (paymentMethod) => (
        <Tag className="m-0 rounded-full border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)]">
          {PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}
        </Tag>
      ),
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 150, render: (status) => <StatusTag status={status} /> },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 110,
      fixed: 'right',
      render: (_, record) => {
        const items = [
          { key: 'view', label: 'Xem chi tiết', icon: <Eye size={16} />, onClick: () => handleViewInvoice(record) },
          { key: 'print', label: 'In hóa đơn', icon: <Printer size={16} />, onClick: () => handlePrintInvoice(record) },
        ];

        return (
          <Space size={4}>
            <Button type="text" aria-label="Xem hóa đơn" icon={<Eye size={17} className="text-[var(--color-primary)]" />} className="rounded-full hover:bg-[var(--color-primary-light)]" onClick={() => handleViewInvoice(record)} />
            <Button type="text" aria-label="In hóa đơn" icon={<Printer size={17} className="text-[var(--color-text-secondary)]" />} className="rounded-full hover:bg-[var(--color-bg-subtle)]" onClick={() => handlePrintInvoice(record)} />
            <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
              <Button type="text" aria-label="Thêm thao tác" icon={<MoreVertical size={17} className="text-[var(--color-text-secondary)]" />} className="rounded-full hover:bg-[var(--color-bg-subtle)] sm:hidden" />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const detailColumns = [
    { title: 'Tên thuốc', dataIndex: 'name', key: 'name', render: (name) => <span className="font-medium text-[var(--color-text-primary)]">{name}</span> },
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 64, align: 'center' },
    { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, align: 'right', render: (unitPrice) => formatCurrency(unitPrice) },
    { title: 'Giảm giá', dataIndex: 'discount', key: 'discount', width: 110, align: 'right', render: (discount) => discount ? `${discount}%` : <span className="text-[var(--color-text-muted)]">—</span> },
    { title: 'Thành tiền', dataIndex: 'total', key: 'total', width: 130, align: 'right', render: (total) => <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(total)}</span> },
  ];

  const selectedDebt = selectedInvoice ? Math.max(selectedInvoice.total - selectedInvoice.paid, 0) : 0;
  const selectedSubtotal = selectedInvoice ? selectedInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) : 0;

  return (
    <div className="p-4 md:p-6 min-h-screen bg-[var(--color-bg-app)]">
      <PageHeader
        title="Hóa đơn bán hàng"
        subtitle="Lịch sử tất cả giao dịch bán hàng"
        actions={
          <Button type="primary" icon={<Plus size={18} className="mr-2 inline" />} className="flex items-center h-10 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-card)]" onClick={() => navigate('/pos')}>
            Bán hàng mới (POS)
          </Button>
        }
      />

      <Card className="mb-4 rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]">
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_1.2fr_auto] md:items-end">
          <Input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Tìm mã hóa đơn, khách hàng, SĐT" />
          <Select value={filters.status} options={INVOICE_STATUS_OPTIONS} onChange={(status) => setFilters((current) => ({ ...current, status }))} />
          <RangePicker value={filters.dateRange} onChange={(dateRange) => setFilters((current) => ({ ...current, dateRange }))} />
          <Space>
            <Button icon={<Filter size={16} />} type="primary" onClick={handleFilter}>Lọc</Button>
            <Button icon={<RotateCcw size={16} />} onClick={handleReset}>Reset</Button>
          </Space>
        </div>
      </Card>

      {error && (
        <Alert
          type="error"
          message="Lỗi tải dữ liệu"
          description={error}
          className="mb-4"
          action={
            <Button size="small" onClick={() => fetchInvoices(activeFilters)} loading={loading}>
              Thử lại
            </Button>
          }
        />
      )}

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredInvoices}
        loading={loading}
        scroll={{ x: 1120 }}
        className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]"
        locale={{ emptyText: <Empty description="Chưa có hóa đơn bán hàng" /> }}
      />

      <Modal
        title={selectedInvoice?.code || 'Chi tiết hóa đơn'}
        width={720}
        open={!!selectedInvoice}
        onCancel={() => setSelectedInvoice(null)}
        centered
        footer={null}
        destroyOnClose
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', padding: '10px 0' } }}
      >
        {selectedInvoice && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <DetailMetric label="Tổng tiền" value={formatCurrency(selectedInvoice.total)} />
              <DetailMetric label="Đã thu" value={formatCurrency(selectedInvoice.paid)} tone="text-[var(--color-profit)]" />
              <DetailMetric label="Còn nợ" value={formatCurrency(selectedDebt)} tone={selectedDebt ? 'text-[var(--color-debt)]' : 'text-[var(--color-text-primary)]'} />
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Khách hàng">{selectedInvoice.customerName}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedInvoice.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="Nhân viên">{selectedInvoice.staff}</Descriptions.Item>
              <Descriptions.Item label="Thời gian">{formatDate(selectedInvoice.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Thanh toán">{PAYMENT_METHOD_LABELS[selectedInvoice.paymentMethod] || selectedInvoice.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><StatusTag status={selectedInvoice.status} /></Descriptions.Item>
            </Descriptions>

            {selectedInvoice.prescriptionImage && (
              <Card size="small" className="rounded-[var(--radius-md)] border-[var(--color-border-light)] bg-[var(--color-bg-subtle)]" title={<span className="flex items-center text-[var(--color-text-primary)] font-medium"><FileText size={16} className="mr-2 text-[var(--color-primary)]" /> Chứng từ đính kèm (Ảnh đơn thuốc)</span>}>
                <div className="flex flex-col items-center justify-center p-2">
                  <Image
                    width={200}
                    src={selectedInvoice.prescriptionImage}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-sm object-cover"
                    fallback="https://via.placeholder.com/200?text=Lỗi+tải+ảnh"
                    preview={{
                      mask: <div className="text-white flex items-center justify-center"><Eye size={20} className="mr-1"/> Phóng to</div>,
                      maskClassName: "rounded-[var(--radius-md)]"
                    }}
                  />
                  <p className="mt-2 text-[var(--font-size-xs)] text-[var(--color-text-muted)] text-center">
                    Mã đơn: <span className="font-medium text-[var(--color-primary)]">{selectedInvoice.prescriptionCode}</span> - Bệnh nhân: {selectedInvoice.prescriptionPatient}
                  </p>
                </div>
              </Card>
            )}

            <Table rowKey="id" columns={detailColumns} dataSource={selectedInvoice.items} pagination={false} scroll={{ x: 640 }} locale={{ emptyText: <Empty description="Hóa đơn chưa có chi tiết sản phẩm" /> }} />

            <Card size="small" className="rounded-[var(--radius-md)] border-[var(--color-border-light)]">
              <div className="flex justify-between text-sm">
                <span>Tạm tính</span>
                <strong>{formatCurrency(selectedSubtotal)}</strong>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span>Giảm giá</span>
                <strong>{formatCurrency(selectedInvoice.discount)}</strong>
              </div>
              <div className="mt-3 flex justify-between border-t border-[var(--color-border-light)] pt-3 text-base">
                <span className="font-semibold">Tổng cộng</span>
                <strong className="text-[var(--color-primary)]">{formatCurrency(selectedInvoice.total)}</strong>
              </div>
            </Card>

            <Space>
              <Button type="primary" icon={<Printer size={16} />} onClick={() => handlePrintInvoice(selectedInvoice)}>In hóa đơn</Button>
              <Button icon={<UserRound size={16} />} disabled={selectedInvoice.customerName === 'Khách lẻ'}>Hồ sơ khách hàng</Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesInvoicePage;
