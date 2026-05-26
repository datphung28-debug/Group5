import React, { useMemo, useState } from 'react';
import { Button, Descriptions, Drawer, Space, Table, Tag, message } from 'antd';
import { CheckCircle2, FilePlus, Printer, XCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ReturnFilter from './components/ReturnFilter';
import ReturnKPIs from './components/ReturnKPIs';
import ReturnTable from './components/ReturnTable';

const RETURN_RECORDS = [
  {
    id: 'RT-1',
    code: 'TH20260526001',
    invoiceCode: 'HD202605260004',
    customer: 'Nguyễn Văn An',
    phone: '0901111111',
    createdAt: '26/05/2026 09:20',
    isoDate: '2026-05-26',
    staff: 'Dược sĩ Minh',
    reason: 'Khách mua nhầm hàm lượng',
    refundMethod: 'cash',
    status: 'pending',
    refundAmount: 70000,
    itemCount: 2,
    note: 'Kiểm tra vỏ hộp còn nguyên, chờ quản lý duyệt nhập lại kho.',
    items: [
      { id: '1', name: 'Paracetamol 500mg', batch: 'DHG2026B', quantity: 2, unitPrice: 35000, total: 70000, condition: 'Còn nguyên' },
    ],
  },
  {
    id: 'RT-2',
    code: 'TH20260525003',
    invoiceCode: 'HD202605250012',
    customer: 'Trần Thị Bình',
    phone: '0902222222',
    createdAt: '25/05/2026 16:45',
    isoDate: '2026-05-25',
    staff: 'Admin GPP',
    reason: 'Đổi sản phẩm theo tư vấn',
    refundMethod: 'store_credit',
    status: 'completed',
    refundAmount: 125000,
    itemCount: 1,
    note: 'Đã chuyển thành khoản trừ cho hóa đơn kế tiếp.',
    items: [
      { id: '2', name: 'Memantine 10mg', batch: 'IME2026B', quantity: 1, unitPrice: 125000, total: 125000, condition: 'Không nhập kho' },
    ],
  },
  {
    id: 'RT-3',
    code: 'TH20260523002',
    invoiceCode: 'HD202605230007',
    customer: 'Khách lẻ',
    phone: '-',
    createdAt: '23/05/2026 10:05',
    isoDate: '2026-05-23',
    staff: 'Dược sĩ Minh',
    reason: 'Lỗi bao bì',
    refundMethod: 'transfer',
    status: 'approved',
    refundAmount: 84000,
    itemCount: 2,
    note: 'Đã duyệt hoàn tiền, chuyển sản phẩm sang khu chờ xử lý.',
    items: [
      { id: '3', name: 'Acetylcysteine 600mg', batch: 'TRA2026A', quantity: 2, unitPrice: 42000, total: 84000, condition: 'Chờ xử lý' },
    ],
  },
  {
    id: 'RT-4',
    code: 'TH20260518001',
    invoiceCode: 'HD202605180009',
    customer: 'Lê Minh Châu',
    phone: '0903333333',
    createdAt: '18/05/2026 14:12',
    isoDate: '2026-05-18',
    staff: 'Admin GPP',
    reason: 'Quá thời hạn đổi trả',
    refundMethod: 'cash',
    status: 'rejected',
    refundAmount: 0,
    itemCount: 1,
    note: 'Từ chối do phiếu bán quá thời hạn tiếp nhận trả hàng.',
    items: [
      { id: '4', name: 'Vitamin C 500mg', batch: 'DHG2027A', quantity: 1, unitPrice: 15000, total: 0, condition: 'Trả lại khách' },
    ],
  },
];

const initialFilters = {
  period: 'month',
  search: '',
  status: 'all',
  refundMethod: 'all',
  dateRange: null,
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const STATUS_LABELS = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  completed: 'Hoàn tất',
  rejected: 'Từ chối',
};

const ReturnsPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const filteredReturns = useMemo(() => {
    const keyword = activeFilters.search.trim().toLowerCase();

    return RETURN_RECORDS.filter((record) => {
      const matchesKeyword =
        !keyword ||
        record.code.toLowerCase().includes(keyword) ||
        record.invoiceCode.toLowerCase().includes(keyword) ||
        record.customer.toLowerCase().includes(keyword) ||
        record.phone.toLowerCase().includes(keyword);
      const matchesStatus = activeFilters.status === 'all' || record.status === activeFilters.status;
      const matchesRefundMethod = activeFilters.refundMethod === 'all' || record.refundMethod === activeFilters.refundMethod;
      const matchesDate =
        !activeFilters.dateRange ||
        activeFilters.dateRange.length !== 2 ||
        (() => {
          const fromDay = activeFilters.dateRange[0].format('YYYY-MM-DD');
          const toDay = activeFilters.dateRange[1].format('YYYY-MM-DD');
          return record.isoDate >= fromDay && record.isoDate <= toDay;
        })();

      return matchesKeyword && matchesStatus && matchesRefundMethod && matchesDate;
    });
  }, [activeFilters]);

  const summary = useMemo(() => (
    filteredReturns.reduce(
      (acc, record) => ({
        totalReturns: acc.totalReturns + 1,
        refundAmount: acc.refundAmount + record.refundAmount,
        pendingCount: acc.pendingCount + (record.status === 'pending' ? 1 : 0),
        completedCount: acc.completedCount + (record.status === 'completed' ? 1 : 0),
        totalItems: acc.totalItems + record.itemCount,
      }),
      { totalReturns: 0, refundAmount: 0, pendingCount: 0, completedCount: 0, totalItems: 0 }
    )
  ), [filteredReturns]);

  const handleFilterChange = (nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
  };

  const handleStatusAction = (action) => {
    messageApi.info(`Chức năng ${action} phiếu trả hàng sẽ được nối với API khi có backend.`);
  };

  const itemColumns = [
    { title: 'Thuốc', dataIndex: 'name', render: (value) => <span className="font-semibold text-[var(--color-text-primary)]">{value}</span> },
    { title: 'Số lô', dataIndex: 'batch', width: 120 },
    { title: 'SL', dataIndex: 'quantity', align: 'right', width: 80 },
    { title: 'Đơn giá', dataIndex: 'unitPrice', align: 'right', width: 130, render: formatCurrency },
    { title: 'Hoàn', dataIndex: 'total', align: 'right', width: 130, render: (value) => <span className="font-semibold text-[var(--color-debt)]">{formatCurrency(value)}</span> },
    { title: 'Tình trạng', dataIndex: 'condition', width: 130, render: (value) => <Tag className="rounded-full px-3 py-1">{value}</Tag> },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      {contextHolder}
      <PageHeader
        title="Phiếu trả hàng"
        subtitle="Tiếp nhận, duyệt và theo dõi các yêu cầu trả hàng sau bán"
        actions={
          <Space size={12} wrap>
            <Button
              icon={<Printer size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              onClick={() => messageApi.info('Chức năng in danh sách phiếu trả hàng sẽ được bổ sung sau.')}
            >
              In danh sách
            </Button>
            <Button
              type="primary"
              icon={<FilePlus size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-6 font-medium shadow-[var(--shadow-card)] hover:bg-[var(--color-primary-hover)]"
              onClick={() => messageApi.info('Chức năng tạo phiếu trả hàng sẽ được nối với API khi có backend.')}
            >
              Tạo phiếu trả
            </Button>
          </Space>
        }
      />

      <ReturnFilter
        filters={filters}
        onChange={handleFilterChange}
        onApply={() => setActiveFilters(filters)}
        onReset={handleReset}
      />

      <ReturnKPIs summary={summary} />
      <ReturnTable data={filteredReturns} onSelect={setSelectedReturn} />

      <Drawer
        title="Chi tiết phiếu trả hàng"
        placement="right"
        width={760}
        open={Boolean(selectedReturn)}
        onClose={() => setSelectedReturn(null)}
        extra={
          selectedReturn && (
            <Space size={10}>
              <Button icon={<Printer size={16} />} className="rounded-[var(--radius-md)]">In phiếu</Button>
              {selectedReturn.status === 'pending' && (
                <>
                  <Button icon={<XCircle size={16} />} danger className="rounded-[var(--radius-md)]" onClick={() => handleStatusAction('từ chối')}>
                    Từ chối
                  </Button>
                  <Button type="primary" icon={<CheckCircle2 size={16} />} className="rounded-[var(--radius-md)] border-none bg-[var(--color-primary)]" onClick={() => handleStatusAction('duyệt')}>
                    Duyệt phiếu
                  </Button>
                </>
              )}
            </Space>
          )
        }
      >
        {selectedReturn && (
          <div className="space-y-5">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <p className="text-[12px] font-medium text-[var(--color-text-muted)]">Mã phiếu</p>
                  <p className="mt-1 font-bold text-[var(--color-primary)]">{selectedReturn.code}</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-[var(--color-text-muted)]">Tiền hoàn</p>
                  <p className="mt-1 font-bold text-[var(--color-debt)]">{formatCurrency(selectedReturn.refundAmount)}</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-[var(--color-text-muted)]">Trạng thái</p>
                  <p className="mt-1 font-bold text-[var(--color-text-primary)]">{STATUS_LABELS[selectedReturn.status]}</p>
                </div>
              </div>
            </div>

            <Descriptions column={{ xs: 1, md: 2 }} bordered size="middle">
              <Descriptions.Item label="Hóa đơn gốc">{selectedReturn.invoiceCode}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{selectedReturn.createdAt}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{selectedReturn.customer}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedReturn.phone}</Descriptions.Item>
              <Descriptions.Item label="Nhân viên xử lý">{selectedReturn.staff}</Descriptions.Item>
              <Descriptions.Item label="Lý do trả">{selectedReturn.reason}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>{selectedReturn.note}</Descriptions.Item>
            </Descriptions>

            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
              <Table
                rowKey="id"
                columns={itemColumns}
                dataSource={selectedReturn.items}
                pagination={false}
                scroll={{ x: 720 }}
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ReturnsPage;
