import React from 'react';
import { Modal, Form, Input, Select } from 'antd';

const AddCustomerModal = ({ open, onCancel, onOk, form }) => {
  return (
    <Modal
      title="Thêm Khách Hàng Mới"
      open={open}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      onOk={onOk}
      okText="Lưu Khách Hàng"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="name" label="Tên khách hàng" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
          <Input placeholder="Nhập tên khách hàng" />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
        <Form.Item name="gender" label="Giới tính">
          <Select placeholder="Chọn giới tính">
            <Select.Option value="male">Nam</Select.Option>
            <Select.Option value="female">Nữ</Select.Option>
            <Select.Option value="other">Khác</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="address" label="Địa chỉ">
          <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCustomerModal;
