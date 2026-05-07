import React, { useState, useMemo } from 'react';
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Segmented, 
  Table, 
  InputNumber, 
  Space, 
  Badge, 
  Alert,
  Popconfirm,
  message,
  Tooltip
} from 'antd';
import { 
  ArrowLeft, 
  Plus, 
  PlusSquare, 
  Trash2, 
  Calculator,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';

const { TextArea } = Input;

// Mock Suppliers
const SUPPLIERS = [
  { id: 'S1', name: 'DHG Pharma (Dược Hậu Giang)' },
  { id: 'S2', name: 'Imexpharm' },
  { id: 'S3', name: 'Traphaco' },
  { id: 'S4', name: 'Mekophar' },
  { id: 'S5', name: 'DKSH Việt Nam' },
];

// Mock Medicines for select
const MEDICINES = [
  { id: '1', code: 'TH001', name: 'Paracetamol 500mg', unit: 'Viên', price: 1200 },
  { id: '2', code: 'TH002', name: 'Amoxicillin 500mg', unit: 'Viên', price: 2800 },
  { id: '3', code: 'TH003', name: 'Panadol Extra', unit: 'Viên', price: 2100 },
  { id: '4', code: 'TH004', name: 'Berberin', unit: 'Viên', price: 400 },
  { id: '5', code: 'TH005', name: 'Efferalgan 500mg', unit: 'Viên', price: 2500 },
];

const PurchaseOrderPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [items, setItems] = useState([
    { key: 'first-row', medicineId: null, unit: '', quantity: 1, importPrice: 0, discount: 0, batchNumber: '', expiryDate: null }
  ]);
  
  const [discountPercent, setDiscountPercent] = useState(0);

  // Auto Calculations
  const summary = useMemo(() => {
    const totalItems = items.filter(item => item.medicineId).length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const subtotal = items.reduce((sum, item) => {
      const lineTotal = (item.quantity || 0) * (item.importPrice || 0) * (1 - (item.discount || 0) / 100);
      return sum + lineTotal;
    }, 0);
    const total = subtotal * (1 - discountPercent / 100);
    
    return {
      totalItems,
      totalQuantity,
      subtotal,
      total
    };
  }, [items, discountPercent]);

  const handleAddRow = () => {
    setItems([
      ...items,
      { key: Date.now(), medicineId: null, unit: '', quantity: 1, importPrice: 0, discount: 0, batchNumber: '', expiryDate: null }
    ]);
  };

  const handleRemoveRow = (key) => {
    if (items.length === 1) {
      setItems([{ key: Date.now(), medicineId: null, unit: '', quantity: 1, importPrice: 0, discount: 0, batchNumber: '', expiryDate: null }]);
    } else {
      setItems(items.filter(item => item.key !== key));
    }
  };

  const handleItemChange = (key, field, value) => {
    setItems(items.map(item => {
      if (item.key === key) {
        const newItem = { ...item, [field]: value };
        
        // Auto fill unit and price if medicine is selected
        if (field === 'medicineId') {
          const medicine = MEDICINES.find(m => m.id === value);
          if (medicine) {
            newItem.unit = medicine.unit;
            newItem.importPrice = medicine.price;
          }
        }
        
        return newItem;
      }
      return item;
    }));
  };

  const handleFinish = (values) => {
    const orderData = {
      ...values,
      discountPercent,
      items: items.filter(item => item.medicineId),
      totalAmount: summary.total
    };
    
    if (orderData.items.length === 0) {
      message.error('Vui lòng thêm ít nhất một loại thuốc');
      return;
    }
    
    console.log('Order Data:', orderData);
    message.success('Đã lưu đơn nhập hàng thành công');
    navigate('/purchase-orders');
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      width: 40,
      render: (_, __, index) => <span className="text-[var(--color-text-muted)]">{index + 1}</span>,
    },
    {
      title: 'Tên thuốc *',
      dataIndex: 'medicineId',
      key: 'medicineId',
      width: 250,
      render: (value, record) => (
        <Select
          showSearch
          placeholder="-- Chọn thuốc --"
          optionFilterProp="children"
          className="w-full"
          value={value}
          onChange={(val) => handleItemChange(record.key, 'medicineId', val)}
        >
          {MEDICINES.map(m => (
            <Select.Option key={m.id} value={m.id}>
              <div className="flex flex-col">
                <span className="font-medium">{m.name}</span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{m.code}</span>
              </div>
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      width: 80,
      render: (text) => <span className="text-[var(--color-text-secondary)]">{text || '--'}</span>,
    },
    {
      title: 'SL Đặt *',
      dataIndex: 'quantity',
      width: 100,
      render: (value, record) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'quantity', val)}
          className="w-full"
        />
      ),
    },
    {
      title: 'Giá nhập *',
      dataIndex: 'importPrice',
      width: 130,
      render: (value, record) => (
        <InputNumber
          min={0}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'importPrice', val)}
          className="w-full"
          suffix="đ"
        />
      ),
    },
    {
      title: 'CK (%)',
      dataIndex: 'discount',
      width: 80,
      render: (value, record) => (
        <InputNumber
          min={0}
          max={100}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'discount', val)}
          className="w-full"
        />
      ),
    },
    {
      title: 'Thành tiền',
      width: 140,
      render: (_, record) => {
        const lineTotal = (record.quantity || 0) * (record.importPrice || 0) * (1 - (record.discount || 0) / 100);
        return (
          <span className="font-semibold text-[var(--color-text-primary)]">
            {Math.round(lineTotal).toLocaleString('vi-VN')}đ
          </span>
        );
      },
    },
    {
      title: 'Lô / HSD',
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={4} className="w-full">
          <Input 
            placeholder="Số lô" 
            value={record.batchNumber}
            onChange={(e) => handleItemChange(record.key, 'batchNumber', e.target.value)}
            className="text-[12px]"
          />
          <DatePicker 
            placeholder="Hạn dùng" 
            className="w-full text-[12px]"
            value={record.expiryDate}
            onChange={(date) => handleItemChange(record.key, 'expiryDate', date)}
          />
        </Space>
      ),
    },
    {
      title: '',
      width: 50,
      render: (_, record) => (
        <Popconfirm
          title="Xóa dòng này?"
          onConfirm={() => handleRemoveRow(record.key)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button 
            type="text" 
            danger 
            icon={<Trash2 size={16} />} 
            className="flex items-center justify-center hover:bg-[var(--color-debt-bg)]"
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg-app)]">
      <PageHeader
        title="Tạo đơn nhập hàng"
        subtitle="Đặt hàng từ nhà cung cấp — tuân thủ GPP/TT02-2018"
        actions={
          <Button
            icon={<ArrowLeft size={18} className="mr-2 inline" />}
            className="flex items-center h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            onClick={() => navigate('/purchase-orders')}
          >
            Quay lại
          </Button>
        }
      />

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SIDEBAR */}
          <div className="w-full lg:w-[320px] flex flex-col gap-6">
            <Card 
              title={<span className="text-[var(--font-size-md)] font-semibold">Thông tin đơn hàng</span>}
              className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]"
            >
              <Form.Item
                name="supplierId"
                label="Nhà cung cấp"
                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
              >
                <Select
                  showSearch
                  placeholder="-- Chọn nhà cung cấp --"
                  optionFilterProp="children"
                >
                  {SUPPLIERS.map(s => (
                    <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="invoiceNumber" label="Số hóa đơn NCC">
                <Input placeholder="VD: HD-2024-001234" />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-4">
                <Form.Item name="orderDate" label="Ngày đặt hàng" initialValue={null}>
                  <DatePicker className="w-full" placeholder="Chọn ngày" />
                </Form.Item>
                <Form.Item name="expectedDate" label="Dự kiến nhận">
                  <DatePicker className="w-full" placeholder="Chọn ngày" />
                </Form.Item>
              </div>

              <Form.Item name="paymentMethod" label="Phương thức thanh toán" initialValue="cash">
                <Segmented
                  block
                  options={[
                    { label: 'Tiền mặt', value: 'cash' },
                    { label: 'Chuyển khoản', value: 'transfer' },
                    { label: 'Ghi nợ', value: 'debt' },
                  ]}
                  className="bg-[var(--color-bg-subtle)]"
                />
              </Form.Item>

              <Form.Item name="note" label="Ghi chú đơn hàng" className="mb-0">
                <TextArea rows={3} placeholder="Ghi chú thêm về đơn hàng..." />
              </Form.Item>
            </Card>

            <Card 
              className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)] sticky top-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[var(--font-size-sm)]">
                  <span className="text-[var(--color-text-secondary)]">Số mặt hàng:</span>
                  <span className="font-semibold">{summary.totalItems}</span>
                </div>
                <div className="flex justify-between items-center text-[var(--font-size-sm)]">
                  <span className="text-[var(--color-text-secondary)]">Tổng số lượng:</span>
                  <span className="font-semibold">{summary.totalQuantity}</span>
                </div>
                <div className="flex justify-between items-center text-[var(--font-size-sm)]">
                  <span className="text-[var(--color-text-secondary)]">Tổng tiền hàng:</span>
                  <span className="font-semibold">{summary.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center text-[var(--font-size-sm)]">
                  <span className="text-[var(--color-text-secondary)]">Chiết khấu tổng (%):</span>
                  <InputNumber
                    min={0}
                    max={100}
                    value={discountPercent}
                    onChange={setDiscountPercent}
                    size="small"
                    className="w-20"
                  />
                </div>
                
                <div className="pt-4 border-t border-[var(--color-border-light)]">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-[var(--font-size-base)] font-semibold text-[var(--color-text-primary)]">Tổng cộng:</span>
                    <span className="text-[var(--font-size-lg)] font-bold text-[var(--color-primary)]">
                      {Math.round(summary.total).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    className="h-12 rounded-[var(--radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none shadow-md font-bold text-[var(--font-size-md)]"
                  >
                    HOÀN TẤT ĐƠN HÀNG
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 min-w-0">
            <Card 
              className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]"
              bodyStyle={{ padding: '0' }}
            >
              <div className="p-4 border-b border-[var(--color-border-light)] flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--font-size-md)] font-semibold text-[var(--color-text-primary)]">
                    Danh sách thuốc cần nhập
                  </span>
                  <Badge 
                    count={`${summary.totalItems} mặt hàng`} 
                    className="purchase-badge"
                    style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-text)', borderColor: 'var(--color-primary-border)' }}
                  />
                </div>
                
                <Space size={12}>
                  <Button
                    icon={<PlusSquare size={18} className="mr-2 inline" />}
                    className="flex items-center border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                  >
                    Thuốc mới
                  </Button>
                  <Button
                    type="primary"
                    icon={<Plus size={18} className="mr-2 inline" />}
                    onClick={handleAddRow}
                    className="flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium"
                  >
                    Thêm dòng
                  </Button>
                </Space>
              </div>

              <div className="overflow-x-auto">
                <Table
                  dataSource={items}
                  columns={columns}
                  pagination={false}
                  className="purchase-table"
                  rowClassName="hover:bg-[var(--color-bg-app)] transition-colors"
                />
              </div>

              <div className="p-4 bg-[var(--color-bg-subtle)] border-t border-[var(--color-border-light)]">
                <Alert
                  message={
                    <div className="flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text-primary)]">
                      <Info size={16} className="text-[var(--color-primary)]" />
                      <span>Số lô & hạn dùng có thể điền ngay hoặc điền sau khi nhận hàng thực tế.</span>
                    </div>
                  }
                  type="info"
                  className="bg-white border-[var(--color-primary-border)] rounded-[var(--radius-md)]"
                />
              </div>
            </Card>
          </div>
        </div>
      </Form>
      
      <style>{`
        .purchase-table .ant-table-thead > tr > th {
          background-color: transparent !important;
          border-bottom: 1px solid var(--color-border-light);
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: 13px;
        }
        .purchase-table .ant-table-tbody > tr > td {
          padding: 12px 8px !important;
          border-bottom: 1px solid var(--color-border-light);
        }
        .purchase-badge .ant-scroll-number {
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default PurchaseOrderPage;
