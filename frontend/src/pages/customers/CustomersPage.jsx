import React, { useMemo, useState } from 'react';
import { Button, Card, Descriptions, Drawer, Dropdown, Empty, Form, Input, Modal, Pagination, Select, Space, Table, Tag, message } from 'antd';
import { Activity, CalendarClock, Edit3, Eye, Filter, HeartPulse, MoreVertical, Plus, ReceiptText, RotateCcw, Sparkles, Star, UserRound, Users } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const SEGMENT_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'new', label: 'Khách mới' },
  { value: 'loyal', label: 'Thân thiết' },
  { value: 'regular', label: 'Mua định kỳ' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const INITIAL_CUSTOMERS = [
  {
    id: '1',
    code: 'KH-0001',
    name: 'Nguyễn Hoàng Nam',
    segment: 'regular',
    gender: 'Nam',
    dateOfBirth: '12/08/1984',
    phone: '0908 245 668',
    address: 'Quận Bình Thạnh, TP.HCM',
    allergies: 'Dị ứng Penicillin',
    chronicDiseases: 'Viêm dạ dày',
    medicationWarnings: 'Tránh NSAID khi đau dạ dày',
    medicalNotes: 'Ưu tiên thuốc ít kích ứng tiêu hóa',
    loyaltyPoints: 1250,
    totalSpending: 8650000,
    monthlyPurchases: 3,
    lastPurchase: '10/05/2026',
    joinedThisMonth: false,
    insight: 'Thường mua thuốc tiêu hóa và vitamin vào buổi sáng',
    purchases: [
      { id: 'INV-20260510-0002', date: '10/05/2026', total: 1265000, items: 5, status: 'Hoàn thành' },
      { id: 'INV-20260422-0016', date: '22/04/2026', total: 450000, items: 2, status: 'Hoàn thành' },
      { id: 'INV-20260410-0008', date: '10/04/2026', total: 680000, items: 4, status: 'Hoàn thành' },
    ],
  },
  {
    id: '2',
    code: 'KH-0002',
    name: 'Trần Thị Mai',
    segment: 'loyal',
    gender: 'Nữ',
    dateOfBirth: '05/02/1991',
    phone: '0912 771 904',
    address: 'Quận 3, TP.HCM',
    allergies: 'Không ghi nhận',
    chronicDiseases: 'Không',
    medicationWarnings: 'Theo dõi khi dùng thuốc cảm',
    medicalNotes: 'Khách hàng ưu tiên tư vấn sản phẩm chăm sóc gia đình',
    loyaltyPoints: 2480,
    totalSpending: 4280000,
    monthlyPurchases: 2,
    lastPurchase: '09/05/2026',
    joinedThisMonth: false,
    insight: 'Phản hồi tốt với nhắc lịch tái mua sản phẩm hô hấp',
    purchases: [
      { id: 'INV-20260509-0018', date: '09/05/2026', total: 184000, items: 2, status: 'Hoàn tiền' },
      { id: 'INV-20260418-0007', date: '18/04/2026', total: 320000, items: 3, status: 'Hoàn thành' },
    ],
  },
  {
    id: '3',
    code: 'KH-0003',
    name: 'Phạm Gia Hân',
    segment: 'loyal',
    gender: 'Nữ',
    dateOfBirth: '21/11/1978',
    phone: '0935 105 779',
    address: 'TP. Thủ Đức, TP.HCM',
    allergies: 'Dị ứng Aspirin',
    chronicDiseases: 'Tăng huyết áp',
    medicationWarnings: 'Kiểm tra tương tác thuốc tim mạch',
    medicalNotes: 'Cần tư vấn kỹ liều dùng và thời điểm uống thuốc',
    loyaltyPoints: 5360,
    totalSpending: 12780000,
    monthlyPurchases: 4,
    lastPurchase: '08/05/2026',
    joinedThisMonth: false,
    insight: 'Nhóm khách giá trị cao, mua đều đơn chăm sóc huyết áp',
    purchases: [
      { id: 'INV-20260508-0011', date: '08/05/2026', total: 612000, items: 4, status: 'Hoàn thành' },
      { id: 'INV-20260430-0009', date: '30/04/2026', total: 980000, items: 6, status: 'Hoàn thành' },
      { id: 'INV-20260412-0004', date: '12/04/2026', total: 740000, items: 5, status: 'Hoàn thành' },
    ],
  },
  {
    id: '4',
    code: 'KH-0004',
    name: 'Lê Minh Khoa',
    segment: 'regular',
    gender: 'Nam',
    dateOfBirth: '18/06/1966',
    phone: '0986 334 120',
    address: 'Quận Tân Bình, TP.HCM',
    allergies: 'Không rõ',
    chronicDiseases: 'Đái tháo đường type 2',
    medicationWarnings: 'Tránh sản phẩm nhiều đường',
    medicalNotes: 'Theo dõi đơn định kỳ hàng tháng',
    loyaltyPoints: 3120,
    totalSpending: 18540000,
    monthlyPurchases: 2,
    lastPurchase: '02/05/2026',
    joinedThisMonth: false,
    insight: 'Nên chủ động nhắc lịch mua sản phẩm kiểm soát đường huyết',
    purchases: [
      { id: 'INV-20260502-0005', date: '02/05/2026', total: 1380000, items: 7, status: 'Hoàn thành' },
      { id: 'INV-20260402-0003', date: '02/04/2026', total: 920000, items: 5, status: 'Hoàn thành' },
    ],
  },
  {
    id: '5',
    code: 'KH-0005',
    name: 'Võ Thanh Bình',
    segment: 'new',
    gender: 'Nam',
    dateOfBirth: '30/01/1995',
    phone: '0977 420 318',
    address: 'Quận 7, TP.HCM',
    allergies: '',
    chronicDiseases: '',
    medicationWarnings: '',
    medicalNotes: 'Không có ghi chú',
    loyaltyPoints: 240,
    totalSpending: 2160000,
    monthlyPurchases: 1,
    lastPurchase: '06/05/2026',
    joinedThisMonth: true,
    insight: 'Khách mới, phù hợp chương trình tích điểm lần mua tiếp theo',
    purchases: [
      { id: 'INV-20260506-0008', date: '06/05/2026', total: 240000, items: 3, status: 'Hoàn thành' },
    ],
  },
];

const SEGMENT_META = {
  new: { label: 'Khách mới', className: 'border-[var(--color-primary-border)] bg-[var(--color-primary-light)] text-[var(--color-primary-text)]' },
  loyal: { label: 'Thân thiết', className: 'border-[var(--color-profit)] bg-[var(--color-profit-bg)] text-[var(--color-profit)]' },
  regular: { label: 'Mua định kỳ', className: 'border-[var(--color-warning)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]' },
};

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')}đ`;

const CustomerKpiCard = ({ label, value, icon: Icon, toneClass }) => (
  <Card className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]">
    <div className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] ${toneClass}`}>
        <Icon size={21} />
      </div>
      <div>
        <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-muted)]">{label}</p>
        <p className="mt-1 text-[22px] font-bold text-[var(--color-text-primary)]">{value}</p>
      </div>
    </div>
  </Card>
);

const SegmentTag = ({ segment }) => {
  const meta = SEGMENT_META[segment] || SEGMENT_META.regular;
  return <Tag className={`m-0 rounded-full px-3 py-1 font-medium ${meta.className}`}>{meta.label}</Tag>;
};

const HealthNotes = ({ customer }) => {
  const notes = [customer.allergies, customer.chronicDiseases, customer.medicationWarnings].filter(Boolean);

  if (!notes.length) {
    return <span className="text-[var(--color-text-muted)]">—</span>;
  }

  return (
    <div className="flex max-w-[280px] flex-wrap gap-1">
      {notes.slice(0, 2).map((note) => (
        <Tag key={note} className="m-0 rounded-full border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]">
          {note}
        </Tag>
      ))}
      {notes.length > 2 && (
        <Tag className="m-0 rounded-full border-[var(--color-primary-border)] bg-[var(--color-primary-light)] text-[var(--color-primary-text)]">
          +{notes.length - 2}
        </Tag>
      )}
    </div>
  );
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [filters, setFilters] = useState({ search: '', segment: 'all' });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [mobilePage, setMobilePage] = useState(1);
  const [customerForm] = Form.useForm();

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const search = activeFilters.search.trim().toLowerCase();
      const matchesSearch = !search || [customer.name, customer.phone, customer.code].some((value) => value.toLowerCase().includes(search));
      const matchesSegment = activeFilters.segment === 'all' || customer.segment === activeFilters.segment;

      return matchesSearch && matchesSegment;
    });
  }, [activeFilters, customers]);

  const stats = useMemo(() => ({
    newThisMonth: customers.filter((customer) => customer.joinedThisMonth).length,
    loyal: customers.filter((customer) => customer.segment === 'loyal').length,
    monthlyPurchases: customers.reduce((sum, customer) => sum + customer.monthlyPurchases, 0),
  }), [customers]);

  const mobileCustomers = filteredCustomers.slice((mobilePage - 1) * 4, mobilePage * 4);

  const handleFilter = () => {
    setActiveFilters(filters);
    setMobilePage(1);
  };

  const handleReset = () => {
    const resetFilters = { search: '', segment: 'all' };
    setFilters(resetFilters);
    setActiveFilters(resetFilters);
    setMobilePage(1);
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    customerForm.resetFields();
    customerForm.setFieldsValue({ gender: 'other', segment: 'new' });
    setCustomerModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    customerForm.setFieldsValue({
      name: customer.name,
      phone: customer.phone,
      gender: customer.gender === 'Nam' ? 'male' : customer.gender === 'Nữ' ? 'female' : 'other',
      segment: customer.segment,
      address: customer.address,
      allergies: customer.allergies,
      chronicDiseases: customer.chronicDiseases,
      medicationWarnings: customer.medicationWarnings,
      notes: customer.medicalNotes,
      insight: customer.insight,
    });
    setCustomerModalOpen(true);
  };

  const handleSaveCustomer = async () => {
    const values = await customerForm.validateFields();
    const genderLabel = GENDER_OPTIONS.find((option) => option.value === values.gender)?.label || 'Khác';

    if (editingCustomer) {
      const nextCustomers = customers.map((customer) => customer.id === editingCustomer.id ? {
        ...customer,
        name: values.name,
        phone: values.phone,
        gender: genderLabel,
        segment: values.segment,
        address: values.address || '',
        allergies: values.allergies || '',
        chronicDiseases: values.chronicDiseases || '',
        medicationWarnings: values.medicationWarnings || '',
        medicalNotes: values.notes || '',
        insight: values.insight || customer.insight,
      } : customer);
      setCustomers(nextCustomers);
      setSelectedCustomer(nextCustomers.find((customer) => customer.id === editingCustomer.id) || null);
      message.success('Đã cập nhật khách hàng');
    } else {
      const newCustomer = {
        id: String(Date.now()),
        code: `KH-${String(customers.length + 1).padStart(4, '0')}`,
        name: values.name,
        segment: values.segment,
        gender: genderLabel,
        dateOfBirth: '—',
        phone: values.phone,
        address: values.address || '',
        allergies: values.allergies || '',
        chronicDiseases: values.chronicDiseases || '',
        medicationWarnings: values.medicationWarnings || '',
        medicalNotes: values.notes || '',
        loyaltyPoints: 0,
        totalSpending: 0,
        monthlyPurchases: 0,
        lastPurchase: '—',
        joinedThisMonth: true,
        insight: values.insight || 'Khách mới, cần theo dõi hành vi mua hàng sau lần đầu',
        purchases: [],
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      message.success('Đã thêm khách hàng');
    }

    setCustomerModalOpen(false);
  };

  const purchaseColumns = [
    { title: 'Hóa đơn', dataIndex: 'id', key: 'id', width: 160, render: (id) => <span className="font-medium text-[var(--color-primary)]">{id}</span> },
    { title: 'Ngày', dataIndex: 'date', key: 'date', width: 110 },
    { title: 'Số món', dataIndex: 'items', key: 'items', width: 90, align: 'center' },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total', width: 130, align: 'right', render: (total) => <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(total)}</span> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140, render: (status) => <Tag className="m-0 rounded-full border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]">{status}</Tag> },
  ];

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, customer) => (
        <div className="grid min-h-12 content-center gap-1">
          <button
            type="button"
            className="w-fit cursor-pointer border-0 bg-transparent p-0 text-left leading-5 font-semibold text-[var(--color-primary)]"
            onClick={(event) => { event.stopPropagation(); setSelectedCustomer(customer); }}
          >
            {customer.name}
          </button>
          <div className="flex flex-wrap items-center gap-2 leading-none">
            <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{customer.code}</span>
            <SegmentTag segment={customer.segment} />
          </div>
        </div>
      ),
    },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone', width: 140, render: (phone) => <div className="flex min-h-12 items-center"><span className="text-[var(--color-text-secondary)]">{phone}</span></div> },
    { title: 'Ghi chú hồ sơ', key: 'health', width: 300, render: (_, customer) => <div className="flex min-h-12 items-center"><HealthNotes customer={customer} /></div> },
    { title: 'Tổng chi tiêu', dataIndex: 'totalSpending', key: 'totalSpending', width: 150, align: 'right', sorter: (a, b) => a.totalSpending - b.totalSpending, render: (totalSpending) => <div className="flex min-h-12 items-center justify-end"><span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(totalSpending)}</span></div> },
    { title: 'Điểm tích lũy', dataIndex: 'loyaltyPoints', key: 'loyaltyPoints', width: 140, align: 'right', sorter: (a, b) => a.loyaltyPoints - b.loyaltyPoints, render: (points) => <div className="flex min-h-12 items-center justify-end"><span className="font-semibold text-[var(--color-profit)]">{points.toLocaleString('vi-VN')}</span></div> },
    { title: 'Lần mua gần nhất', dataIndex: 'lastPurchase', key: 'lastPurchase', width: 150, render: (lastPurchase) => <div className="flex min-h-12 items-center"><span className="text-[var(--color-text-secondary)]">{lastPurchase}</span></div> },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, customer) => {
        const items = [
          { key: 'view', label: 'Xem chi tiết', icon: <Eye size={16} />, onClick: () => setSelectedCustomer(customer) },
          { key: 'edit', label: 'Chỉnh sửa', icon: <Edit3 size={16} />, onClick: () => handleOpenEdit(customer) },
        ];

        return (
          <div className="flex min-h-12 items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
            <Button type="text" aria-label="Xem khách hàng" icon={<Eye size={17} className="text-[var(--color-primary)]" />} className="rounded-full hover:bg-[var(--color-primary-light)]" onClick={() => setSelectedCustomer(customer)} />
            <Button type="text" aria-label="Sửa khách hàng" icon={<Edit3 size={17} className="text-[var(--color-text-secondary)]" />} className="rounded-full hover:bg-[var(--color-bg-subtle)]" onClick={() => handleOpenEdit(customer)} />
            <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
              <Button type="text" aria-label="Thêm thao tác" icon={<MoreVertical size={17} className="text-[var(--color-text-secondary)]" />} className="rounded-full hover:bg-[var(--color-bg-subtle)] sm:hidden" />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-4 md:p-6">
      <PageHeader
        title="Khách hàng"
        subtitle="Quản lý hồ sơ khách hàng, điểm tích lũy và lịch sử mua thuốc"
        actions={
          <Button
            type="primary"
            icon={<Plus size={18} className="mr-2 inline" />}
            className="flex h-10 items-center rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-4 font-medium shadow-[var(--shadow-card)] hover:bg-[var(--color-primary-hover)]"
            onClick={handleOpenCreate}
          >
            Thêm khách hàng
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CustomerKpiCard label="Khách hàng mới tháng này" value={stats.newThisMonth.toLocaleString('vi-VN')} icon={Users} toneClass="bg-[var(--color-primary-light)] text-[var(--color-primary)]" />
        <CustomerKpiCard label="Khách hàng thân thiết" value={stats.loyal.toLocaleString('vi-VN')} icon={Star} toneClass="bg-[var(--color-profit-bg)] text-[var(--color-profit)]" />
        <CustomerKpiCard label="Tổng lượt mua tháng" value={stats.monthlyPurchases.toLocaleString('vi-VN')} icon={ReceiptText} toneClass="bg-[var(--color-warning-bg)] text-[var(--color-warning)]" />
      </div>

      <div className="mb-5 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] p-4 shadow-[var(--shadow-card)] md:p-5">
        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(240px,1fr)_180px_auto]">
          <div>
            <label className="mb-1.5 block text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Tìm kiếm</label>
            <Input
              allowClear
              value={filters.search}
              placeholder="Tìm tên, SĐT, mã KH..."
              className="h-10 rounded-[var(--radius-md)]"
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Nhóm khách</label>
            <Select className="h-10 w-full" value={filters.segment} options={SEGMENT_FILTER_OPTIONS} onChange={(segment) => setFilters((prev) => ({ ...prev, segment }))} />
          </div>
          <Space wrap>
            <Button type="primary" icon={<Filter size={16} />} onClick={handleFilter} className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-4 font-medium hover:bg-[var(--color-primary-hover)]">Lọc</Button>
            <Button icon={<RotateCcw size={16} />} onClick={handleReset} className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">Reset</Button>
          </Space>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
          Tổng: <span className="font-semibold text-[var(--color-primary)]">{filteredCustomers.length.toLocaleString('vi-VN')}</span> khách hàng
        </span>
      </div>

      <div className="hidden rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-card)] md:block">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredCustomers}
          scroll={{ x: 1120 }}
          locale={{ emptyText: <Empty description="Không tìm thấy khách hàng phù hợp" /> }}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} khách hàng`,
            className: 'px-6 py-4 border-t border-[var(--color-border-light)]',
            position: ['bottomRight'],
          }}
          rowClassName="cursor-pointer hover:bg-[var(--color-bg-app)] transition-colors"
          onRow={(customer) => ({ onClick: () => setSelectedCustomer(customer) })}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {mobileCustomers.length ? mobileCustomers.map((customer) => (
          <Card key={customer.id} className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">{customer.name}</p>
                <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{customer.code} · {customer.phone}</p>
              </div>
              <Dropdown menu={{ items: [{ key: 'view', label: 'Xem chi tiết', icon: <Eye size={16} />, onClick: () => setSelectedCustomer(customer) }, { key: 'edit', label: 'Chỉnh sửa', icon: <Edit3 size={16} />, onClick: () => handleOpenEdit(customer) }] }} trigger={['click']}>
                <Button type="text" icon={<MoreVertical size={18} className="text-[var(--color-text-secondary)]" />} />
              </Dropdown>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
              <div>
                <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">Tổng chi tiêu</p>
                <p className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(customer.totalSpending)}</p>
              </div>
              <div>
                <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">Điểm tích lũy</p>
                <p className="font-semibold text-[var(--color-profit)]">{customer.loyaltyPoints.toLocaleString('vi-VN')}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <SegmentTag segment={customer.segment} />
              <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">Mua gần nhất: {customer.lastPurchase}</span>
            </div>
            <div className="mt-3"><HealthNotes customer={customer} /></div>
          </Card>
        )) : <Empty description="Không tìm thấy khách hàng phù hợp" />}
        {filteredCustomers.length > 4 && (
          <div className="flex justify-end">
            <Pagination current={mobilePage} pageSize={4} total={filteredCustomers.length} onChange={setMobilePage} size="small" />
          </div>
        )}
      </div>

      <Drawer
        title={selectedCustomer && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"><UserRound size={20} /></div>
            <div>
              <p className="m-0 text-[var(--font-size-md)] font-bold text-[var(--color-text-primary)]">Hồ sơ khách hàng</p>
              <p className="m-0 text-[var(--font-size-sm)] font-medium text-[var(--color-primary)]">{selectedCustomer.name}</p>
            </div>
          </div>
        )}
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        width={820}
        extra={selectedCustomer && (
          <Button icon={<Edit3 size={16} />} onClick={() => handleOpenEdit(selectedCustomer)} className="rounded-[var(--radius-md)] border-[var(--color-border)] text-[var(--color-text-primary)]">Sửa</Button>
        )}
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]"><p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">Điểm tích lũy</p><p className="mt-1 text-[20px] font-bold text-[var(--color-profit)]">{selectedCustomer.loyaltyPoints.toLocaleString('vi-VN')}</p></Card>
              <Card className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]"><p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">Tổng chi tiêu</p><p className="mt-1 text-[20px] font-bold text-[var(--color-primary)]">{formatCurrency(selectedCustomer.totalSpending)}</p></Card>
              <Card className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]"><p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">Lượt mua tháng</p><p className="mt-1 text-[20px] font-bold text-[var(--color-warning)]">{selectedCustomer.monthlyPurchases.toLocaleString('vi-VN')}</p></Card>
            </div>

            <Card className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]" title={<div className="flex items-center gap-2"><Sparkles size={18} className="text-[var(--color-profit)]" />Điểm tích lũy</div>}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-[var(--radius-md)] bg-[var(--color-profit-bg)] p-3 text-[var(--color-profit)]">
                  <p className="text-[var(--font-size-xs)] font-medium">Số điểm hiện có</p>
                  <p className="mt-1 text-[22px] font-bold">{selectedCustomer.loyaltyPoints.toLocaleString('vi-VN')}</p>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--color-primary-light)] p-3 text-[var(--color-primary)]">
                  <p className="text-[var(--font-size-xs)] font-medium">Hạng khách hàng</p>
                  <p className="mt-1 text-[18px] font-bold">{SEGMENT_META[selectedCustomer.segment]?.label}</p>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--color-warning-bg)] p-3 text-[var(--color-warning)]">
                  <p className="text-[var(--font-size-xs)] font-medium">Mua gần nhất</p>
                  <p className="mt-1 text-[18px] font-bold">{selectedCustomer.lastPurchase}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]" title={<div className="flex items-center gap-2"><Activity size={18} className="text-[var(--color-primary)]" />Hoạt động & gợi ý chăm sóc</div>}>
              <div className="flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-4">
                <CalendarClock size={20} className="mt-0.5 text-[var(--color-primary)]" />
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">Insight khách hàng</p>
                  <p className="mt-1 text-[var(--color-text-secondary)]">{selectedCustomer.insight}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]" title="Thông tin cơ bản">
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Mã KH">{selectedCustomer.code}</Descriptions.Item>
                <Descriptions.Item label="Họ tên">{selectedCustomer.name}</Descriptions.Item>
                <Descriptions.Item label="Nhóm khách"><SegmentTag segment={selectedCustomer.segment} /></Descriptions.Item>
                <Descriptions.Item label="Giới tính">{selectedCustomer.gender}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">{selectedCustomer.dateOfBirth}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{selectedCustomer.phone}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{selectedCustomer.address}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]" title={<div className="flex items-center gap-2"><HeartPulse size={18} className="text-[var(--color-warning)]" />Ghi chú sức khỏe / hồ sơ</div>}>
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Dị ứng">{selectedCustomer.allergies || '—'}</Descriptions.Item>
                <Descriptions.Item label="Bệnh mãn tính">{selectedCustomer.chronicDiseases || '—'}</Descriptions.Item>
                <Descriptions.Item label="Cảnh báo thuốc">{selectedCustomer.medicationWarnings || '—'}</Descriptions.Item>
                <Descriptions.Item label="Ghi chú">{selectedCustomer.medicalNotes || '—'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]" title={<div className="flex items-center gap-2"><ReceiptText size={18} className="text-[var(--color-primary)]" />Lịch sử mua gần đây</div>}>
              <Table rowKey="id" columns={purchaseColumns} dataSource={selectedCustomer.purchases} pagination={false} scroll={{ x: 640 }} locale={{ emptyText: <Empty description="Chưa có lịch sử mua hàng" /> }} />
            </Card>
          </div>
        )}
      </Drawer>

      <Modal
        title={editingCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng'}
        open={customerModalOpen}
        onCancel={() => setCustomerModalOpen(false)}
        onOk={handleSaveCustomer}
        okText={editingCustomer ? 'Lưu thay đổi' : 'Thêm khách hàng'}
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)]' }}
        width={760}
      >
        <Form form={customerForm} layout="vertical">
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item name="name" label="Tên khách hàng" rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}><Input /></Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}><Input /></Form.Item>
            <Form.Item name="gender" label="Giới tính"><Select options={GENDER_OPTIONS} /></Form.Item>
            <Form.Item name="segment" label="Nhóm khách"><Select options={SEGMENT_FILTER_OPTIONS.filter((option) => option.value !== 'all')} /></Form.Item>
            <Form.Item name="address" label="Địa chỉ" className="md:col-span-2"><Input /></Form.Item>
            <Form.Item name="allergies" label="Dị ứng"><Input placeholder="VD: Penicillin" /></Form.Item>
            <Form.Item name="chronicDiseases" label="Bệnh mãn tính"><Input placeholder="VD: Tăng huyết áp" /></Form.Item>
            <Form.Item name="medicationWarnings" label="Cảnh báo thuốc" className="md:col-span-2"><Input /></Form.Item>
            <Form.Item name="notes" label="Ghi chú sức khỏe / hồ sơ" className="md:col-span-2"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="insight" label="Insight chăm sóc khách hàng" className="md:col-span-2"><Input.TextArea rows={2} /></Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
