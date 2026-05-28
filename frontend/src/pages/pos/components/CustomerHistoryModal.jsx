import React from 'react';
import { Modal, Table, Tag, Button } from 'antd';
import { HistoryOutlined, FileSearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const CustomerHistoryModal = ({ open, onCancel, customerHistory, isHistoryLoading }) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <HistoryOutlined className="text-blue-600 text-xl" />
          <span>Lịch sử mua hàng của khách</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Table 
        dataSource={customerHistory} 
        rowKey="_id"
        loading={isHistoryLoading}
        pagination={{ pageSize: 5 }}
        className="mt-4"
        columns={[
          { title: 'Mã HĐ', dataIndex: 'code', key: 'code', render: (text) => <span className="font-mono text-blue-600 font-bold">{text}</span> },
          { title: 'Ngày mua', dataIndex: 'createdAt', key: 'createdAt', render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm') },
          { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (amt) => <span className="font-bold text-emerald-600">{(amt || 0).toLocaleString('vi-VN')}đ</span> },
          { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'cancelled' ? 'error' : 'success'}>{status === 'cancelled' ? 'HỦY' : 'HOÀN THÀNH'}</Tag> },
          { 
            title: 'Thao tác', 
            key: 'action', 
            align: 'center',
            render: (_, record) => (
              <Button 
                size="small" 
                type="primary"
                ghost
                icon={<FileSearchOutlined />}
                onClick={() => window.open(`/invoices?search=${record.code}`, '_blank')}
              >
                Chi tiết
              </Button>
            )
          }
        ]}
      />
    </Modal>
  );
};

export default CustomerHistoryModal;
