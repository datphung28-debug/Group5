import React from 'react';
import { Button, Empty, Progress, Space, Table, Tag, Tooltip } from 'antd';
import { Eye, Phone, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, statusStyles } from '../../../suppliers/supplierData';

const getRisk = (supplier) => {
  if (supplier.status === 'Quá hạn') return { label: 'Rủi ro cao', color: 'var(--color-debt)', bg: 'var(--color-debt-bg)' };
  if (supplier.debtRatio >= 75) return { label: 'Cần theo dõi', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' };
  if (supplier.currentDebt > 0) return { label: 'Đang nợ', color: 'var(--color-primary)', bg: 'var(--color-primary-light)' };
  return { label: 'An toàn', color: 'var(--color-profit)', bg: 'var(--color-profit-bg)' };
};

const DebtTable = ({ data }) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Nhà cung cấp',
      dataIndex: 'name',
      fixed: 'left',
      width: 270,
      sorter: (a, b) => a.name.localeCompare(b.name, 'vi'),
      render: (name, record) => (
        <div className="min-w-0">
          <div className="font-semibold text-[var(--color-text-primary)]">{name}</div>
          <div className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)]">
            {record.code} · MST {record.taxCode}
          </div>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      width: 190,
      render: (_, record) => (
        <div>
          <div className="font-medium text-[var(--color-text-primary)]">{record.contactName}</div>
          <div className="mt-1 flex items-center gap-1 text-[12px] text-[var(--color-text-muted)]">
            <Phone size={13} />
            {record.contactPhone || record.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Nợ hiện tại',
      dataIndex: 'currentDebt',
      align: 'right',
      width: 150,
      sorter: (a, b) => a.currentDebt - b.currentDebt,
      render: (value) => (
        <span className={`font-bold ${value > 0 ? 'text-[var(--color-debt)]' : 'text-[var(--color-profit)]'}`}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Hạn mức',
      dataIndex: 'debtLimit',
      align: 'right',
      width: 140,
      sorter: (a, b) => a.debtLimit - b.debtLimit,
      render: (value) => <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(value)}</span>,
    },
    {
      title: 'Sử dụng hạn mức',
      dataIndex: 'debtRatio',
      width: 180,
      sorter: (a, b) => a.debtRatio - b.debtRatio,
      render: (value, record) => (
        <div>
          <div className="mb-1 flex justify-between text-[12px]">
            <span className="text-[var(--color-text-muted)]">Đã dùng</span>
            <span className="font-semibold text-[var(--color-text-primary)]">{Math.round(value)}%</span>
          </div>
          <Progress
            percent={Math.min(100, Math.round(value))}
            showInfo={false}
            size="small"
            strokeColor={record.status === 'Quá hạn' ? 'var(--color-debt)' : 'var(--color-primary)'}
            trailColor="var(--color-bg-subtle)"
          />
        </div>
      ),
    },
    {
      title: 'Điều khoản',
      dataIndex: 'paymentTerms',
      width: 130,
      render: (value) => <span className="text-[var(--color-text-secondary)]">{value}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (status) => <Tag color={statusStyles[status]} className="rounded-full px-3 py-1 font-medium">{status}</Tag>,
    },
    {
      title: 'Rủi ro',
      key: 'risk',
      width: 150,
      render: (_, record) => {
        const risk = getRisk(record);
        return (
          <span className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1" style={{ backgroundColor: risk.bg }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: risk.color }} />
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: risk.color }}>
              {risk.label}
            </span>
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 110,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<Eye size={17} />} onClick={() => navigate(`/suppliers/${record.id}`)} className="text-[var(--color-primary)]" />
          </Tooltip>
          <Tooltip title="Thanh toán">
            <Button type="text" icon={<WalletCards size={17} />} onClick={() => navigate(`/suppliers/${record.id}`)} className="text-[var(--color-profit)]" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="hidden rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] md:block">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          locale={{ emptyText: <Empty description="Không có dữ liệu công nợ" /> }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} nhà cung cấp`,
            className: 'px-6 py-4 border-t border-[var(--color-border-light)]',
          }}
          scroll={{ x: 1420 }}
          rowClassName="cursor-pointer transition-colors hover:bg-[var(--color-bg-subtle)]"
          onRow={(record) => ({ onClick: () => navigate(`/suppliers/${record.id}`) })}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {data.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
            <Empty description="Không có dữ liệu công nợ" />
          </div>
        )}

        {data.map((supplier) => {
          const risk = getRisk(supplier);
          return (
            <div key={supplier.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)]">{supplier.name}</h3>
                  <p className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)]">{supplier.code} · {supplier.paymentTerms}</p>
                </div>
                <Tag color={statusStyles[supplier.status]} className="m-0 rounded-full px-3 py-1 font-medium">{supplier.status}</Tag>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                <div className="rounded-[var(--radius-md)] bg-[var(--color-debt-bg)] p-3">
                  <div className="text-[var(--color-text-muted)]">Nợ hiện tại</div>
                  <div className="mt-1 font-bold text-[var(--color-debt)]">{formatCurrency(supplier.currentDebt)}</div>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
                  <div className="text-[var(--color-text-muted)]">Hạn mức</div>
                  <div className="mt-1 font-bold text-[var(--color-text-primary)]">{formatCurrency(supplier.debtLimit)}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-light)] pt-3">
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1" style={{ backgroundColor: risk.bg }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: risk.color }} />
                  <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: risk.color }}>{risk.label}</span>
                </span>
                <Button type="primary" size="small" onClick={() => navigate(`/suppliers/${supplier.id}`)} className="rounded-[var(--radius-md)] border-none bg-[var(--color-primary)]">
                  Chi tiết
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default DebtTable;
