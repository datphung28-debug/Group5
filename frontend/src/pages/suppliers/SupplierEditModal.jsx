import { useEffect } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select } from 'antd';
import { supplierStatusOptions } from './supplierData';

export default function SupplierEditModal({ open, supplier, confirmLoading = false, onClose, onSave }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && supplier) {
      form.setFieldsValue(supplier);
      return;
    }

    if (open) {
      form.setFieldsValue({
        status: 'Bình thường',
        currentDebt: 0,
        debtLimit: 0,
        purchaseHistory: [],
        debtHistory: [],
      });
    }
  }, [form, open, supplier]);

  const handleFinish = (values) => {
    onSave(values);
  };

  return (
    <Modal
      title={supplier ? 'Chỉnh sửa thông tin nhà cung cấp' : 'Thêm nhà cung cấp'}
      open={open}
      onCancel={onClose}
      width={720}
      destroyOnClose
      centered
      styles={{ body: { background: 'var(--color-bg-app)', padding: '20px', maxHeight: '70vh', overflowY: 'auto' } }}
      footer={
        <div className="flex justify-end gap-3 pt-3">
          <Button onClick={onClose} className="h-10 rounded-[var(--radius-md)] px-5 font-medium">
            Hủy
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={() => form.submit()} className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-5 font-medium">
            {supplier ? 'Lưu thay đổi' : 'Thêm nhà cung cấp'}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="p-0">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 font-semibold text-[var(--color-text-primary)]">Thông tin cơ bản</h3>
          <Form.Item label="Tên nhà cung cấp" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}>
            <Input className="h-10 rounded-[var(--radius-md)]" />
          </Form.Item>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item label="Mã nhà cung cấp" name="code">
              <Input className="h-10 rounded-[var(--radius-md)]" />
            </Form.Item>
            <Form.Item label="Mã số thuế" name="taxCode">
              <Input className="h-10 rounded-[var(--radius-md)]" />
            </Form.Item>
          </div>
          <Form.Item label="Địa chỉ" name="address">
            <Input.TextArea rows={3} className="rounded-[var(--radius-md)]" />
          </Form.Item>
        </div>

        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 font-semibold text-[var(--color-text-primary)]">Thông tin liên hệ</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item label="SĐT công ty" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
              <Input className="h-10 rounded-[var(--radius-md)]" />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input className="h-10 rounded-[var(--radius-md)]" />
            </Form.Item>
            <Form.Item label="Người liên hệ" name="contactName">
              <Input className="h-10 rounded-[var(--radius-md)]" />
            </Form.Item>
            <Form.Item label="SĐT người liên hệ" name="contactPhone">
              <Input className="h-10 rounded-[var(--radius-md)]" />
            </Form.Item>
            <Form.Item label="Tên người liên hệ cũ" name="contactPerson" hidden>
              <Input />
            </Form.Item>
          </div>
        </div>

        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 font-semibold text-[var(--color-text-primary)]">Thông tin tài chính</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item label="Hạn mức nợ" name="debtLimit">
              <InputNumber min={0} className="h-10 w-full rounded-[var(--radius-md)]" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/,/g, '')} />
            </Form.Item>
            <Form.Item label="Điều khoản thanh toán" name="paymentTerms">
              <Input className="h-10 rounded-[var(--radius-md)]" />
            </Form.Item>
            <Form.Item label="Trạng thái" name="status" className="md:col-span-2">
              <Select className="h-10" options={supplierStatusOptions.map((status) => ({ label: status, value: status }))} />
            </Form.Item>
          </div>
          <Form.Item label="Ghi chú nội bộ" name="notes">
            <Input.TextArea rows={3} className="rounded-[var(--radius-md)]" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
