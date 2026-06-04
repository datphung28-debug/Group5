import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Select, message, Spin, Alert, Table, Checkbox } from 'antd';
import { Search } from 'lucide-react';
import { saleAPI, returnAPI } from '../../../api/api';

const CreateReturnModal = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sale, setSale] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnQuantities, setReturnQuantities] = useState({});

  const handleSearch = async (value) => {
    if (!value) return;
    setSearching(true);
    setSale(null);
    setSelectedItems([]);
    setReturnQuantities({});
    try {
      const res = await saleAPI.getAll({ search: value, limit: 1 });
      if (res.data.sales && res.data.sales.length > 0) {
        const foundSale = res.data.sales[0];
        if (foundSale.status !== 'completed') {
          message.error('Hóa đơn này không ở trạng thái hoàn thành (không thể trả hàng)');
          return;
        }
        
        // Fetch full sale to get items properly populated
        const fullSaleRes = await saleAPI.getById(foundSale._id);
        setSale(fullSaleRes.data);
      } else {
        message.error('Không tìm thấy hóa đơn mã: ' + value);
      }
    } catch {
      message.error('Lỗi khi tìm hóa đơn');
    } finally {
      setSearching(false);
    }
  };

  const handleFinish = async (values) => {
    if (!sale) return message.error('Vui lòng tìm hóa đơn trước');
    if (selectedItems.length === 0) return message.error('Vui lòng chọn ít nhất 1 sản phẩm để trả');

    const itemsToReturn = selectedItems.map(item => {
      const qty = returnQuantities[item._id] || item.quantity;
      return {
        medicine: item.medicine._id,
        quantity: qty,
        unitPrice: item.unitPrice,
        total: qty * item.unitPrice * (1 - (item.discount || 0) / 100),
      };
    });

    const refundAmount = itemsToReturn.reduce((sum, item) => sum + item.total, 0);

    setLoading(true);
    try {
      const payload = {
        saleId: sale._id,
        items: itemsToReturn,
        refundAmount,
        refundMethod: values.refundMethod,
        reason: values.reason,
        note: values.note,
      };

      const res = await returnAPI.create(payload);
      
      // Auto approve right after creation
      await returnAPI.updateStatus(res.data._id, 'approved');

      message.success('Tạo phiếu trả hàng và duyệt tự động thành công');
      form.resetFields();
      setSale(null);
      setSelectedItems([]);
      onSuccess();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi tạo phiếu trả hàng');
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = [
    {
      title: '',
      dataIndex: 'checkbox',
      width: 50,
      render: (_, record) => (
        <Checkbox 
          checked={selectedItems.some(i => i._id === record._id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedItems([...selectedItems, record]);
              setReturnQuantities({ ...returnQuantities, [record._id]: record.quantity });
            } else {
              setSelectedItems(selectedItems.filter(i => i._id !== record._id));
            }
          }}
        />
      )
    },
    { title: 'Tên thuốc', dataIndex: ['medicine', 'name'] },
    { title: 'Đã mua', dataIndex: 'quantity', width: 80 },
    { title: 'Đơn giá', dataIndex: 'unitPrice', render: val => val.toLocaleString('vi-VN') + 'đ' },
    { title: 'SL Trả', dataIndex: 'returnQuantity', width: 120, render: (_, record) => {
      const isSelected = selectedItems.some(i => i._id === record._id);
      return (
        <InputNumber 
          min={1} 
          max={record.quantity} 
          disabled={!isSelected}
          value={returnQuantities[record._id]}
          onChange={(val) => setReturnQuantities({ ...returnQuantities, [record._id]: val })}
        />
      );
    }}
  ];

  return (
    <Modal
      title="Tạo phiếu trả hàng (Auto Refund)"
      open={open}
      onCancel={() => {
        form.resetFields();
        setSale(null);
        setSelectedItems([]);
        onCancel();
      }}
      footer={null}
      width={800}
    >
      <div className="mb-6 mt-4 flex items-center space-x-2">
        <Input.Search 
          placeholder="Nhập mã hóa đơn (VD: HD2026...)" 
          allowClear 
          enterButton={<Button type="primary" icon={<Search size={16} />}>Tìm kiếm</Button>}
          size="large"
          onSearch={handleSearch}
          loading={searching}
        />
      </div>

      {sale && (
        <Form layout="vertical" form={form} onFinish={handleFinish} initialValues={{ refundMethod: 'cash' }}>
          <Alert
            message={`Hóa đơn ${sale.code}`}
            description={`Khách hàng: ${sale.customer?.name || 'Khách lẻ'} - Tổng tiền hóa đơn: ${sale.totalAmount.toLocaleString('vi-VN')}đ`}
            type="info"
            showIcon
            className="mb-4"
          />

          <h4 className="font-semibold mb-2">Chọn sản phẩm cần trả</h4>
          <Table 
            rowKey="_id"
            columns={itemColumns}
            dataSource={sale.items}
            pagination={false}
            size="small"
            className="mb-6"
          />

          <Form.Item name="refundMethod" label="Phương thức hoàn tiền" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="cash">Tiền mặt</Select.Option>
              <Select.Option value="transfer">Chuyển khoản</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="reason" label="Lý do trả hàng" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
            <Input.TextArea rows={2} placeholder="Nhập lý do khách hàng trả sản phẩm..." />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú thêm">
            <Input.TextArea rows={2} />
          </Form.Item>

          <div className="flex justify-end space-x-3 mt-6">
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading} className="bg-purple-600 hover:bg-purple-700 border-none">
              Tạo phiếu & Duyệt tự động
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default CreateReturnModal;
