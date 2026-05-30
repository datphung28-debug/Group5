import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, DatePicker, Descriptions, Empty, Form, Input, InputNumber, Select, Space, Spin, Table, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { ArrowLeft, CircleDollarSign, Mail, MapPin, Pencil, Phone, ReceiptText, ShieldCheck, UserRound, WalletCards } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import SupplierEditModal from './SupplierEditModal';
import useSupplierStore from '../../stores/useSupplierStore';
import { formatCurrency, statusStyles } from './supplierData';
import '../../styles/dashboard.css';

function MetricCard({ icon, label, value, valueClassName, iconClassName }) {
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

export default function SupplierDetailPage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const supplier = useSupplierStore((state) => state.getSupplierById(supplierId));
  const loading = useSupplierStore((state) => state.loading);
  const error = useSupplierStore((state) => state.error);
  const fetchSupplierById = useSupplierStore((state) => state.fetchSupplierById);
  const updateSupplier = useSupplierStore((state) => state.updateSupplier);
  const recordPayment = useSupplierStore((state) => state.recordPayment);
  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const paymentSectionRef = useRef(null);
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    fetchSupplierById(supplierId);
  }, [fetchSupplierById, supplierId]);

  const handleSave = async (values) => {
    const result = await updateSupplier(supplier.id, values);

    if (!result.success) {
      message.error(result.message);
      return;
    }

    setEditOpen(false);
    message.success('Đã cập nhật thông tin nhà cung cấp');
  };

  const handlePaymentSubmit = async (values) => {
    const amount = Number(values.amount || 0);

    if (amount > supplier.currentDebt) {
      message.error('Số tiền thanh toán không được vượt quá nợ hiện tại');
      return;
    }

    const result = await recordPayment(supplier.id, {
      amount,
      method: values.method,
      note: values.note,
      date: values.date.format('DD/MM/YYYY'),
    });

    if (!result.success) {
      message.error(result.message);
      return;
    }

    paymentForm.resetFields();
    paymentForm.setFieldsValue({ date: dayjs(), method: 'Chuyển khoản' });
    setPaymentOpen(false);
    message.success('Đã ghi nhận thanh toán công nợ');
  };

  const openPaymentForm = () => {
    setPaymentOpen(true);
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  if (loading && !supplier) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
        <Button icon={<ArrowLeft size={17} />} onClick={() => navigate('/suppliers')} className="mb-4 h-10 rounded-[var(--radius-md)]">
          Quay lại
        </Button>
        <div className="rounded-[var(--radius-lg)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
          <Spin />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
        <Button icon={<ArrowLeft size={17} />} onClick={() => navigate('/suppliers')} className="mb-4 h-10 rounded-[var(--radius-md)]">
          Quay lại
        </Button>
        {error && <Alert type="error" showIcon message={error} className="mb-4 rounded-[var(--radius-md)]" />}
        <Empty description="Không tìm thấy nhà cung cấp" className="rounded-[var(--radius-lg)] bg-white p-10 shadow-[var(--shadow-card)]" />
      </div>
    );
  }

  const purchaseColumns = [
    { title: 'Mã phiếu', dataIndex: 'id', render: (value) => <span className="font-semibold text-[var(--color-primary)]">{value}</span> },
    { title: 'Ngày nhập', dataIndex: 'date' },
    { title: 'Giá trị', dataIndex: 'value', align: 'right', render: (value) => <span className="font-semibold">{formatCurrency(value)}</span> },
    { title: 'Trạng thái', dataIndex: 'status', render: (status) => <Tag className="rounded-full px-3 py-1 font-medium">{status}</Tag> },
  ];

  const debtColumns = [
    { title: 'Mã GD', dataIndex: 'id', render: (value) => <span className="font-semibold text-[var(--color-primary)]">{value}</span> },
    { title: 'Ngày', dataIndex: 'date' },
    { title: 'Nội dung', dataIndex: 'note' },
    { title: 'Loại', dataIndex: 'amount', width: 120, render: (value) => <Tag color={value > 0 ? 'orange' : 'green'} className="rounded-full px-3 py-1 font-medium">{value > 0 ? 'Phát sinh' : 'Thanh toán'}</Tag> },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      align: 'right',
      render: (value) => (
        <span className={`font-semibold ${value > 0 ? 'text-[var(--color-debt)]' : 'text-[var(--color-profit)]'}`}>
          {value > 0 ? '+' : ''}{formatCurrency(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      <PageHeader
        title={supplier.name}
        subtitle={`${supplier.code} · Quản lý thông tin và công nợ nhà cung cấp`}
        actions={
          <Space size={10} wrap>
            <Button icon={<ArrowLeft size={17} />} onClick={() => navigate('/suppliers')} className="h-10 rounded-[var(--radius-md)] px-4 font-medium">
              Quay lại
            </Button>
            {supplier.currentDebt > 0 && (
              <Button type="primary" icon={<WalletCards size={17} />} onClick={openPaymentForm} className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-5 font-medium shadow-[var(--shadow-card)]">
                Thanh toán
              </Button>
            )}
            <Button icon={<Pencil size={17} />} onClick={() => setEditOpen(true)} className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 font-medium">
              Chỉnh sửa
            </Button>
          </Space>
        }
      />

      {error && <Alert type="error" showIcon message={error} className="mb-4 rounded-[var(--radius-md)]" />}

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard icon={CircleDollarSign} label="Nợ hiện tại" value={formatCurrency(supplier.currentDebt)} valueClassName={supplier.currentDebt > 0 ? 'text-[var(--color-debt)]' : 'text-[var(--color-profit)]'} iconClassName={supplier.currentDebt > 0 ? 'bg-[var(--color-debt-bg)] text-[var(--color-debt)]' : 'bg-[var(--color-profit-bg)] text-[var(--color-profit)]'} />
        <MetricCard icon={ShieldCheck} label="Hạn mức nợ" value={formatCurrency(supplier.debtLimit)} valueClassName="text-[var(--color-primary)]" iconClassName="bg-[var(--color-primary-light)] text-[var(--color-primary)]" />
        <MetricCard icon={ReceiptText} label="Lịch sử nhập hàng" value={supplier.purchaseHistory.length} valueClassName="text-[var(--color-inventory)]" iconClassName="bg-[var(--color-inventory-bg)] text-[var(--color-inventory)]" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="rounded-[var(--radius-lg)] border-[var(--color-border)] shadow-[var(--shadow-card)] xl:col-span-2" title="Thông tin nhà cung cấp">
          <Descriptions column={{ xs: 1, md: 2 }} size="middle">
            <Descriptions.Item label="Tên công ty">{supplier.name}</Descriptions.Item>
            <Descriptions.Item label="Mã nhà cung cấp">{supplier.code}</Descriptions.Item>
            <Descriptions.Item label="Mã số thuế">{supplier.taxCode}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={statusStyles[supplier.status]} className="rounded-full px-3 py-1 font-medium">{supplier.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Điều khoản thanh toán">{supplier.paymentTerms}</Descriptions.Item>
            <Descriptions.Item label="Email">{supplier.email}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>{supplier.address}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>{supplier.notes}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card className="rounded-[var(--radius-lg)] border-[var(--color-border)] shadow-[var(--shadow-card)]" title="Liên hệ chính">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="kpi-icon-wrapper bg-[var(--color-primary-light)] text-[var(--color-primary)]"><UserRound size={19} /></div>
              <div><p className="text-[12px] font-medium text-[var(--color-text-muted)]">Người liên hệ</p><p className="font-semibold text-[var(--color-text-primary)]">{supplier.contactName}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="kpi-icon-wrapper bg-[var(--color-profit-bg)] text-[var(--color-profit)]"><Phone size={19} /></div>
              <div><p className="text-[12px] font-medium text-[var(--color-text-muted)]">Điện thoại</p><p className="font-semibold text-[var(--color-text-primary)]">{supplier.contactPhone}</p><p className="text-[13px] text-[var(--color-text-secondary)]">{supplier.phone}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="kpi-icon-wrapper bg-[var(--color-warning-bg)] text-[var(--color-warning)]"><Mail size={19} /></div>
              <div><p className="text-[12px] font-medium text-[var(--color-text-muted)]">Email</p><p className="font-semibold text-[var(--color-text-primary)]">{supplier.email}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="kpi-icon-wrapper bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]"><MapPin size={19} /></div>
              <div><p className="text-[12px] font-medium text-[var(--color-text-muted)]">Địa chỉ</p><p className="font-semibold text-[var(--color-text-primary)]">{supplier.address}</p></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-[var(--radius-lg)] border-[var(--color-border)] shadow-[var(--shadow-card)]" title="Lịch sử công nợ">
          <Table rowKey="id" columns={debtColumns} dataSource={supplier.debtHistory} pagination={false} scroll={{ x: 760 }} />
        </Card>
        <Card className="rounded-[var(--radius-lg)] border-[var(--color-border)] shadow-[var(--shadow-card)]" title="Lịch sử nhập hàng">
          <Table rowKey="id" columns={purchaseColumns} dataSource={supplier.purchaseHistory} pagination={false} scroll={{ x: 560 }} />
        </Card>
      </div>

      {supplier.currentDebt > 0 && paymentOpen && (
        <Card
          ref={paymentSectionRef}
          className="mt-4 rounded-[var(--radius-lg)] border-[var(--color-border)] shadow-[var(--shadow-card)]"
          title={
            <div className="flex items-center gap-2">
              <WalletCards size={18} className="text-[var(--color-primary)]" />
              <span>Thanh toán công nợ</span>
            </div>
          }
        >
          <div className="mb-5 grid grid-cols-1 gap-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] p-4 md:grid-cols-3">
            <div>
              <p className="text-[12px] font-medium text-[var(--color-text-muted)]">Nợ hiện tại</p>
              <p className="mt-1 text-[20px] font-bold text-[var(--color-debt)]">{formatCurrency(supplier.currentDebt)}</p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[var(--color-text-muted)]">Hạn mức nợ</p>
              <p className="mt-1 text-[20px] font-bold text-[var(--color-primary)]">{formatCurrency(supplier.debtLimit)}</p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[var(--color-text-muted)]">Còn có thể thanh toán tối đa</p>
              <p className="mt-1 text-[20px] font-bold text-[var(--color-profit)]">{formatCurrency(supplier.currentDebt)}</p>
            </div>
          </div>

          <Form
            form={paymentForm}
            layout="vertical"
            initialValues={{ method: 'Chuyển khoản', date: dayjs() }}
            onFinish={handlePaymentSubmit}
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <Form.Item
                label="Số tiền thanh toán"
                name="amount"
                rules={[
                  { required: true, message: 'Vui lòng nhập số tiền thanh toán' },
                  { type: 'number', min: 1, message: 'Số tiền phải lớn hơn 0' },
                  {
                    validator: (_, value) => {
                      if (!value || Number(value) <= supplier.currentDebt) {
                        return Promise.resolve();
                      }

                      return Promise.reject(new Error('Không được vượt quá nợ hiện tại'));
                    },
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={supplier.currentDebt}
                  className="h-10 w-full rounded-[var(--radius-md)]"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/,/g, '')}
                  placeholder="Nhập số tiền"
                />
              </Form.Item>
              <Form.Item label="Phương thức" name="method" rules={[{ required: true, message: 'Chọn phương thức thanh toán' }]}>
                <Select
                  className="h-10"
                  options={[
                    { label: 'Chuyển khoản', value: 'Chuyển khoản' },
                    { label: 'Tiền mặt', value: 'Tiền mặt' },
                    { label: 'Ví điện tử', value: 'Ví điện tử' },
                    { label: 'Đối soát công nợ', value: 'Đối soát công nợ' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Ngày thanh toán" name="date" rules={[{ required: true, message: 'Chọn ngày thanh toán' }]}>
                <DatePicker format="DD/MM/YYYY" className="h-10 w-full rounded-[var(--radius-md)]" />
              </Form.Item>
              <Form.Item label="Ghi chú" name="note">
                <Input className="h-10 rounded-[var(--radius-md)]" placeholder="VD: UNC Vietcombank" />
              </Form.Item>
            </div>
            <div className="flex justify-end">
              <Button type="primary" htmlType="submit" className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-6 font-medium shadow-[var(--shadow-card)]">
                Ghi nhận thanh toán
              </Button>
            </div>
          </Form>
        </Card>
      )}

      <SupplierEditModal open={editOpen} supplier={supplier} confirmLoading={loading} onClose={() => setEditOpen(false)} onSave={handleSave} />
    </div>
  );
}
