import React from 'react';
import { Table, Tag, Button, Space, Typography } from 'antd';
import { Eye, Printer } from 'lucide-react';
import useCashbookStore from '../../../stores/useCashbookStore';
import dayjs from 'dayjs';

const { Text } = Typography;

const CashbookTable = ({ onViewDetail }) => {
  const { transactions, loading, kpis } = useCashbookStore();

  const columns = [
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'thu' ? 'green' : 'red'} className="rounded-full px-3 uppercase text-[11px] font-bold">
          {type === 'thu' ? 'Thu' : 'Chi'}
        </Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--color-text-primary)]">{text}</span>
          {record.reference && (
            <span className="text-[12px] text-[var(--color-text-muted)]">{record.reference}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag className="bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-md">
          {category}
        </Tag>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method, record) => (
        <Tag className="border-[var(--color-primary-border)] text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-md">
          {record.paymentMethodLabel || method}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (ts) => (
        <div className="flex flex-col text-[13px]">
          <span className="font-medium text-[var(--color-text-primary)]">{dayjs(ts).format('HH:mm')}</span>
          <span className="text-[var(--color-text-secondary)]">{dayjs(ts).format('DD/MM/YYYY')}</span>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount, record) => (
        <span className={`font-bold ${record.type === 'thu' ? 'text-[var(--color-profit)]' : 'text-[var(--color-debt)]'}`}>
          {record.type === 'thu' ? '+' : '-'}{amount.toLocaleString()}đ
        </span>
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'staff',
      key: 'staff',
      render: (staff) => (
        <span className="text-[13px] text-[var(--color-text-secondary)] font-medium">{staff}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size={8}>
          <Button 
            type="text" 
            size="small" 
            icon={<Eye size={16} className="text-[var(--color-primary)]" />}
            onClick={() => onViewDetail(record)}
            className="hover:bg-[var(--color-primary-light)]"
          />
          <Button 
            type="text" 
            size="small" 
            icon={<Printer size={16} className="text-[var(--color-text-secondary)]" />}
            className="hover:bg-[var(--color-bg-subtle)]"
          />
        </Space>
      ),
    },
  ];

  const summaryFooter = () => (
    <div className="flex justify-end gap-12 p-3 bg-[var(--color-bg-subtle)] border-t border-[var(--color-border)] sticky bottom-0 z-10 rounded-b-[var(--radius-lg)]">
      <div className="flex flex-col items-end">
        <span className="text-[12px] text-[var(--color-text-muted)] uppercase font-bold">Tổng thu</span>
        <span className="text-[var(--font-size-md)] font-bold text-[var(--color-profit)]">+{kpis.totalRevenue.toLocaleString()}đ</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[12px] text-[var(--color-text-muted)] uppercase font-bold">Tổng chi</span>
        <span className="text-[var(--font-size-md)] font-bold text-[var(--color-debt)]">-{kpis.totalExpense.toLocaleString()}đ</span>
      </div>
      <div className="flex flex-col items-end pr-4 border-l border-[var(--color-border)] pl-12">
        <span className="text-[12px] text-[var(--color-text-muted)] uppercase font-bold">Chênh lệch</span>
        <span className={`text-[var(--font-size-md)] font-bold ${kpis.netBalance >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-debt)]'}`}>
          {kpis.netBalance >= 0 ? '+' : ''}{kpis.netBalance.toLocaleString()}đ
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)] overflow-hidden">
      <Table
        columns={columns}
        dataSource={transactions}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          className: "px-4",
        }}
        scroll={{ x: 1000 }}
        footer={summaryFooter}
        locale={{
          emptyText: (
            <div className="py-12 text-center">
              <div className="text-[var(--color-text-muted)] italic">Chưa có giao dịch nào trong khoảng thời gian này</div>
            </div>
          )
        }}
        className="cashbook-table"
      />
    </div>
  );
};

export default CashbookTable;
