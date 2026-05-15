import React from 'react';
import { Drawer, Descriptions, Tag, Divider, Typography, Space } from 'antd';
import { Calendar, User, CreditCard, Tag as TagIcon, FileText, History } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TransactionDetailDrawer = ({ visible, transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-[var(--color-primary)]" />
          <span>Chi tiết giao dịch {transaction.id}</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={480}
      className="transaction-detail-drawer"
    >
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="bg-[var(--color-bg-subtle)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] text-center">
          <Tag color={transaction.type === 'thu' ? 'green' : 'red'} className="rounded-full px-4 mb-3 uppercase font-bold">
            {transaction.type === 'thu' ? 'Thu' : 'Chi'}
          </Tag>
          <div className={`text-3xl font-bold mb-1 ${transaction.type === 'thu' ? 'text-[var(--color-profit)]' : 'text-[var(--color-debt)]'}`}>
            {transaction.type === 'thu' ? '+' : '-'}{transaction.amount.toLocaleString()}đ
          </div>
          <Text type="secondary" className="text-[13px]">{transaction.description}</Text>
        </div>

        {/* Info Section */}
        <div>
          <Title level={5} className="flex items-center gap-2 mb-4">
            <TagIcon size={18} className="text-[var(--color-text-muted)]" />
            Thông tin chung
          </Title>
          <Descriptions column={1} bordered size="small" className="bg-white">
            <Descriptions.Item label="Mã giao dịch">{transaction.id}</Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              <Tag className="rounded-md">{transaction.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức">
              <Tag color="blue" className="rounded-md">{transaction.paymentMethod}</Tag>
            </Descriptions.Item>
            {transaction.reference && (
              <Descriptions.Item label="Tham chiếu">
                <Text copyable className="text-[var(--color-primary)] font-medium">{transaction.reference}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        <Divider className="my-0" />

        {/* Timeline Section */}
        <div>
          <Title level={5} className="flex items-center gap-2 mb-4">
            <History size={18} className="text-[var(--color-text-muted)]" />
            Lịch sử & Nhân viên
          </Title>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
                <User size={16} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <div className="font-medium text-[var(--color-text-primary)]">{transaction.staff}</div>
                <div className="text-[12px] text-[var(--color-text-muted)]">Nhân viên tạo giao dịch</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-[var(--color-text-secondary)]" />
              </div>
              <div>
                <div className="font-medium text-[var(--color-text-primary)]">
                  {dayjs(transaction.timestamp).format('HH:mm - DD/MM/YYYY')}
                </div>
                <div className="text-[12px] text-[var(--color-text-muted)]">Thời gian ghi nhận</div>
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-0" />

        {/* Notes Section */}
        <div>
          <Title level={5} className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-[var(--color-text-muted)]" />
            Ghi chú
          </Title>
          <div className="p-4 bg-[var(--color-bg-app)] rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] italic text-[var(--color-text-secondary)]">
            {transaction.note || 'Không có ghi chú nào cho giao dịch này.'}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default TransactionDetailDrawer;
