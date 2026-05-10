import React, { useMemo, useState } from 'react';
import { Button, Card, DatePicker, Descriptions, Drawer, Dropdown, Empty, Input, Select, Space, Table, Tag, message } from 'antd';
import { Eye, Filter, MoreVertical, Plus, Printer, ReceiptText, RotateCcw, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';

const { RangePicker } = DatePicker;

const INVOICE_STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunded', label: 'Hoàn tiền' },
];

const STATUS_META = {
  completed: {
    label: 'Hoàn thành',
    color: 'var(--color-profit)',
    background: 'var(--color-profit-bg)',
    border: 'var(--color-profit)',
  },
  pending: {
    label: 'Chờ thanh toán',
    color: 'var(--color-warning)',
    background: 'var(--color-warning-bg)',
    border: 'var(--color-warning)',
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'var(--color-debt)',
    background: 'var(--color-debt-bg)',
    border: 'var(--color-debt)',
  },
  refunded: {
    label: 'Hoàn tiền',
    color: 'var(--color-primary-text)',
    background: 'var(--color-primary-light)',
    border: 'var(--color-primary-border)',
  },
};

const PAYMENT_METHOD_LABELS = {
  cash: 'Tiền mặt',
  bank: 'Chuyển khoản',
  card: 'Thẻ',
  wallet: 'Ví điện tử',
};

const INVOICES = [
  {
    id: '1',
    code: 'INV-20260510-0001',
    customer: 'Khách lẻ',
    createdAt: '2026-05-10 08:24',
    staff: 'DS. Minh Anh',
    total: 428000,
    paid: 428000,
    paymentMethod: 'cash',
    status: 'completed',
    customerPhone: '—',
    loyaltyPoints: 0,
    items: [
      { id: '1-1', name: 'Paracetamol 500mg', quantity: 2, unitPrice: 24000, discount: 0, total: 48000 },
      { id: '1-2', name: 'Vitamin C 1000mg', quantity: 1, unitPrice: 180000, discount: 10000, total: 170000 },
      { id: '1-3', name: 'Nước muối sinh lý', quantity: 5, unitPrice: 42000, discount: 0, total: 210000 },
    ],
    discount: 10000,
  },
  {
    id: '2',
    code: 'INV-20260510-0002',
    customer: 'Nguyễn Hoàng Nam',
    createdAt: '2026-05-10 09:12',
    staff: 'DS. Quốc Bảo',
    total: 1265000,
    paid: 700000,
    paymentMethod: 'bank',
    status: 'pending',
    customerPhone: '0908 245 668',
    loyaltyPoints: 1250,
    items: [
      { id: '2-1', name: 'Omeprazole 20mg', quantity: 2, unitPrice: 315000, discount: 0, total: 630000 },
      { id: '2-2', name: 'Men vi sinh Enterogermina', quantity: 3, unitPrice: 225000, discount: 40000, total: 635000 },
    ],
    discount: 40000,
  },
  {
    id: '3',
    code: 'INV-20260509-0018',
    customer: 'Trần Thị Mai',
    createdAt: '2026-05-09 17:40',
    staff: 'DS. Minh Anh',
    total: 184000,
    paid: 184000,
    paymentMethod: 'wallet',
    status: 'refunded',
    customerPhone: '0912 771 904',
    loyaltyPoints: 480,
    items: [
      { id: '3-1', name: 'Berberin', quantity: 4, unitPrice: 28000, discount: 0, total: 112000 },
      { id: '3-2', name: 'Oresol', quantity: 3, unitPrice: 24000, discount: 0, total: 72000 },
    ],
    discount: 0,
  },
  {
    id: '4',
    code: 'INV-20260509-0017',
    customer: 'Khách lẻ',
    createdAt: '2026-05-09 16:05',
    staff: 'DS. Lan Chi',
    total: 93000,
    paid: 0,
    paymentMethod: 'cash',
    status: 'cancelled',
    customerPhone: '—',
    loyaltyPoints: 0,
    items: [
      { id: '4-1', name: 'Khẩu trang y tế', quantity: 3, unitPrice: 31000, discount: 0, total: 93000 },
    ],
    discount: 0,
  },
  {
    id: '5',
    code: 'INV-20260508-0011',
    customer: 'Phạm Gia Hân',
    createdAt: '2026-05-08 11:32',
    staff: 'DS. Quốc Bảo',
    total: 612000,
    paid: 612000,
    paymentMethod: 'card',
    status: 'completed',
    customerPhone: '0935 105 779',
    loyaltyPoints: 2180,
    items: [
      { id: '5-1', name: 'Hapacol 650', quantity: 6, unitPrice: 38000, discount: 0, total: 228000 },
      { id: '5-2', name: 'Xịt mũi thảo dược', quantity: 2, unitPrice: 192000, discount: 0, total: 384000 },
    ],
    discount: 0,
  },
  {
    id: '6',
    code: 'INV-20260508-0010',
    customer: 'Khách lẻ',
    createdAt: '2026-05-08 10:18',
    staff: 'DS. Lan Chi',
    total: 249000,
    paid: 249000,
    paymentMethod: 'cash',
    status: 'completed',
    customerPhone: '—',
    loyaltyPoints: 0,
    items: [
      { id: '6-1', name: 'Dầu gió xanh', quantity: 3, unitPrice: 45000, discount: 0, total: 135000 },
      { id: '6-2', name: 'Băng cá nhân', quantity: 6, unitPrice: 19000, discount: 0, total: 114000 },
    ],
    discount: 0,
  },
];

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')}đ`;

const formatDate = (value) => {
  const [date, time] = value.split(' ');
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time}`;
};

const StatusTag = ({ status }) => {
  const meta = STATUS_META[status];

  return (
    <Tag
      className="m-0 rounded-full px-3 py-1 font-medium border"
      style={{
        color: meta.color,
        backgroundColor: meta.background,
        borderColor: meta.border,
      }}
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
  const [filters, setFilters] = useState({ search: '', status: 'all', dateRange: null });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filteredInvoices = useMemo(() => {
    return INVOICES.filter((invoice) => {
      const matchesSearch = invoice.code.toLowerCase().includes(activeFilters.search.trim().toLowerCase());
      const matchesStatus = activeFilters.status === 'all' || invoice.status === activeFilters.status;
      const matchesDate = !activeFilters.dateRange || activeFilters.dateRange.length !== 2 || (() => {
        const invoiceDay = invoice.createdAt.slice(0, 10);
        const fromDay = activeFilters.dateRange[0].format('YYYY-MM-DD');
        const toDay = activeFilters.dateRange[1].format('YYYY-MM-DD');
        return invoiceDay >= fromDay && invoiceDay <= toDay;
      })();

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [activeFilters]);

  const handleFilter = () => {
    setActiveFilters(filters);
  };

  const handleReset = () => {
    const resetFilters = { search: '', status: 'all', dateRange: null };
    setFilters(resetFilters);
    setActiveFilters(resetFilters);
  };

  const handleViewInvoice = (record) => {
    setSelectedInvoice(record);
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
        <Button
          type="link"
          className="h-auto p-0 font-semibold text-[var(--color-primary)]"
          onClick={() => handleViewInvoice(record)}
        >
          {code}
        </Button>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      width: 180,
      render: (customer) => (
        <span className="font-medium text-[var(--color-text-primary)]">{customer}</span>
      ),
    },
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
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      width: 130,
      align: 'right',
      render: (total) => <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(total)}</span>,
    },
    {
      title: 'Đã thu',
      dataIndex: 'paid',
      key: 'paid',
      width: 130,
      align: 'right',
      render: (paid) => <span className="font-medium text-[var(--color-profit)]">{formatCurrency(paid)}</span>,
    },
    {
      title: 'Còn nợ',
      key: 'debt',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const debt = Math.max(record.total - record.paid, 0);

        if (!debt) {
          return <span className="text-[var(--color-text-muted)]">—</span>;
        }

        return <span className="font-semibold text-[var(--color-debt)]">{formatCurrency(debt)}</span>;
      },
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 130,
      render: (paymentMethod) => (
        <Tag className="m-0 rounded-full border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)]">
          {PAYMENT_METHOD_LABELS[paymentMethod]}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 110,
      fixed: 'right',
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <Eye size={16} />,
            onClick: () => handleViewInvoice(record),
          },
          {
            key: 'print',
            label: 'In hóa đơn',
            icon: <Printer size={16} />,
            onClick: () => handlePrintInvoice(record),
          },
        ];

        return (
          <Space size={4}>
            <Button
              type="text"
              aria-label="Xem hóa đơn"
              icon={<Eye size={17} className="text-[var(--color-primary)]" />}
              className="rounded-full hover:bg-[var(--color-primary-light)]"
              onClick={() => handleViewInvoice(record)}
            />
            <Button
              type="text"
              aria-label="In hóa đơn"
              icon={<Printer size={17} className="text-[var(--color-text-secondary)]" />}
              className="rounded-full hover:bg-[var(--color-bg-subtle)]"
              onClick={() => handlePrintInvoice(record)}
            />
            <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
              <Button
                type="text"
                aria-label="Thêm thao tác"
                icon={<MoreVertical size={17} className="text-[var(--color-text-secondary)]" />}
                className="rounded-full hover:bg-[var(--color-bg-subtle)] sm:hidden"
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const detailColumns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="font-medium text-[var(--color-text-primary)]">{name}</span>,
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 64,
      align: 'center',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (unitPrice) => formatCurrency(unitPrice),
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
      width: 110,
      align: 'right',
      render: (discount) => discount ? formatCurrency(discount) : <span className="text-[var(--color-text-muted)]">—</span>,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      width: 130,
      align: 'right',
      render: (total) => <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(total)}</span>,
    },
  ];

  const selectedDebt = selectedInvoice ? Math.max(selectedInvoice.total - selectedInvoice.paid, 0) : 0;
  const selectedSubtotal = selectedInvoice ? selectedInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) : 0;

  return (
    <div className="p-4 md:p-6 min-h-screen bg-[var(--color-bg-app)]">
      <PageHeader
        title="Hóa đơn bán hàng"
        subtitle="Lịch sử tất cả giao dịch bán hàng"
        actions={
          <Button
            type="primary"
            icon={<Plus size={18} className="mr-2 inline" />}
            className="flex items-center h-10 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-card)]"
            onClick={() => navigate('/pos')}
          >
            Bán hàng mới (POS)
          </Button>
        }
      />

      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border-light)] p-4 md:p-5 mb-5 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_300px_auto] gap-3 items-end">
          <div>
            <label className="block mb-1.5 text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">
              Tìm mã hóa đơn
            </label>
            <Input
              allowClear
              value={filters.search}
              placeholder="VD: INV-20250101-0001"
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              className="h-10 rounded-[var(--radius-md)]"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">
              Trạng thái
            </label>
            <Select
              value={filters.status}
              options={INVOICE_STATUS_OPTIONS}
              onChange={(status) => setFilters((prev) => ({ ...prev, status }))}
              className="w-full h-10"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">
              Từ ngày - Đến ngày
            </label>
            <RangePicker
              value={filters.dateRange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={(dateRange) => setFilters((prev) => ({ ...prev, dateRange }))}
              className="w-full h-10 rounded-[var(--radius-md)]"
            />
          </div>

          <Space className="w-full sm:w-auto" wrap>
            <Button
              type="primary"
              icon={<Filter size={16} />}
              onClick={handleFilter}
              className="h-10 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium"
            >
              Lọc
            </Button>
            <Button
              icon={<RotateCcw size={16} />}
              onClick={handleReset}
              className="h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Reset
            </Button>
          </Space>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
          Tổng: <span className="font-semibold text-[var(--color-primary)]">{filteredInvoices.length.toLocaleString('vi-VN')}</span> hóa đơn
        </span>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border-light)] overflow-hidden shadow-[var(--shadow-card)]">
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          scroll={{ x: 1280 }}
          locale={{ emptyText: <Empty description="Không tìm thấy hóa đơn phù hợp" /> }}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} hóa đơn`,
            className: 'px-6 py-4 border-t border-[var(--color-border-light)]',
            position: ['bottomRight'],
          }}
          rowClassName="hover:bg-[var(--color-bg-app)] transition-colors"
        />
      </div>

      <Drawer
        title={
          selectedInvoice && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <ReceiptText size={20} />
              </div>
              <div>
                <p className="m-0 text-[var(--font-size-md)] font-bold text-[var(--color-text-primary)]">Chi tiết hóa đơn</p>
                <p className="m-0 text-[var(--font-size-sm)] font-medium text-[var(--color-primary)]">{selectedInvoice.code}</p>
              </div>
            </div>
          )
        }
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        width={760}
        className="invoice-detail-drawer"
        extra={
          selectedInvoice && (
            <Button
              type="primary"
              icon={<Printer size={16} />}
              onClick={() => handlePrintInvoice(selectedInvoice)}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium"
            >
              In hóa đơn
            </Button>
          )
        }
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DetailMetric label="Tổng tiền" value={formatCurrency(selectedInvoice.total)} tone="text-[var(--color-primary)]" />
              <DetailMetric label="Đã thu" value={formatCurrency(selectedInvoice.paid)} tone="text-[var(--color-profit)]" />
              <DetailMetric label="Còn nợ" value={selectedDebt ? formatCurrency(selectedDebt) : '—'} tone={selectedDebt ? 'text-[var(--color-debt)]' : 'text-[var(--color-text-muted)]'} />
            </div>

            <Card
              className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]"
              title={
                <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                  <ReceiptText size={18} className="text-[var(--color-primary)]" />
                  <span>Thông tin hóa đơn</span>
                </div>
              }
            >
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Mã hóa đơn">{selectedInvoice.code}</Descriptions.Item>
                <Descriptions.Item label="Thời gian">{formatDate(selectedInvoice.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="Nhân viên">{selectedInvoice.staff}</Descriptions.Item>
                <Descriptions.Item label="Thanh toán">{PAYMENT_METHOD_LABELS[selectedInvoice.paymentMethod]}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái"><StatusTag status={selectedInvoice.status} /></Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]"
              title={
                <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                  <UserRound size={18} className="text-[var(--color-primary)]" />
                  <span>Thông tin khách hàng</span>
                </div>
              }
            >
              <Descriptions column={{ xs: 1, sm: 3 }} size="small">
                <Descriptions.Item label="Khách hàng">{selectedInvoice.customer}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{selectedInvoice.customerPhone}</Descriptions.Item>
                <Descriptions.Item label="Điểm tích lũy">{selectedInvoice.loyaltyPoints.toLocaleString('vi-VN')}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]"
              title="Danh sách thuốc"
            >
              <Table
                rowKey="id"
                columns={detailColumns}
                dataSource={selectedInvoice.items}
                pagination={false}
                scroll={{ x: 640 }}
              />
            </Card>

            <Card
              className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]"
              title="Tổng kết thanh toán"
            >
              <div className="ml-auto max-w-sm space-y-3">
                <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
                  <span>Tạm tính</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{formatCurrency(selectedSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
                  <span>Giảm giá</span>
                  <span className="font-medium text-[var(--color-warning)]">{selectedInvoice.discount ? `-${formatCurrency(selectedInvoice.discount)}` : '—'}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
                  <span>Đã thu</span>
                  <span className="font-medium text-[var(--color-profit)]">{formatCurrency(selectedInvoice.paid)}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
                  <span>Còn nợ</span>
                  <span className={`font-medium ${selectedDebt ? 'text-[var(--color-debt)]' : 'text-[var(--color-text-muted)]'}`}>{selectedDebt ? formatCurrency(selectedDebt) : '—'}</span>
                </div>
                <div className="border-t border-[var(--color-border-light)] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--color-text-primary)]">Thành tiền</span>
                    <span className="text-[20px] font-bold text-[var(--color-primary)]">{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SalesInvoicePage;
