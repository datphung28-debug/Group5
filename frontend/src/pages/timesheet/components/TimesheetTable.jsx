import React from 'react';
import { Button, Empty, Space, Table, Tag, Tooltip } from 'antd';
import { Eye } from 'lucide-react';

const TimesheetTable = ({ data, onSelect }) => {
  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'staffName',
      fixed: 'left',
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-bold text-[var(--color-text-primary)] text-[14px]">{record.staffName}</div>
          <div className="mt-1 text-[12px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">{record.role}</div>
        </div>
      ),
    },
    {
      title: 'Tổng ca',
      dataIndex: 'totalShifts',
      align: 'center',
      width: 100,
      render: (val) => <span className="font-semibold text-[var(--color-text-primary)]">{val} ca</span>,
    },
    {
      title: 'Hoàn thành',
      dataIndex: 'completeShifts',
      align: 'center',
      width: 120,
      render: (val) => <Tag color="success" className="m-0 rounded-full px-3 font-semibold">{val} ca</Tag>,
    },
    {
      title: 'Đi muộn',
      dataIndex: 'lateShifts',
      align: 'center',
      width: 100,
      render: (val) => <Tag color="warning" className="m-0 rounded-full px-3 font-semibold">{val} ca</Tag>,
    },
    {
      title: 'Vắng / Thiếu công',
      dataIndex: 'absentShifts',
      align: 'center',
      width: 130,
      render: (val) => <Tag color="error" className="m-0 rounded-full px-3 font-semibold">{val} ca</Tag>,
    },
    {
      title: 'Tổng giờ làm',
      dataIndex: 'totalHours',
      align: 'right',
      width: 120,
      render: (val) => <span className="font-bold text-[var(--color-primary)] text-[15px]">{val.toFixed(1)}h</span>,
    },
    {
      title: 'Lương tạm tính',
      dataIndex: 'salary',
      align: 'right',
      width: 160,
      render: (val) => <span className="font-extrabold text-[var(--color-profit)] text-[15px]">{val.toLocaleString('vi-VN')} đ</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 90,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết bảng công">
            <Button type="text" icon={<Eye size={17} />} onClick={() => onSelect(record)} className="text-[var(--color-primary)]" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="hidden rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] md:block">
        <Table
          rowKey="staffId"
          columns={columns}
          dataSource={data}
          locale={{ emptyText: <Empty description="Không có dữ liệu chấm công" /> }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} nhân sự`, className: 'px-6 py-4 border-t border-[var(--color-border-light)]' }}
          scroll={{ x: 1000 }}
          rowClassName="cursor-pointer transition-colors hover:bg-[var(--color-bg-subtle)]"
          onRow={(record) => ({ onClick: () => onSelect(record) })}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {data.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
            <Empty description="Không có dữ liệu chấm công" />
          </div>
        )}
        {data.map((record) => (
          <div key={record.staffId} className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-[var(--color-text-primary)] text-[14px]">{record.staffName}</h3>
                <p className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{record.role}</p>
              </div>
              <span className="font-extrabold text-[var(--color-profit)] text-[15px]">{record.salary.toLocaleString('vi-VN')} đ</span>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2 text-[12px] text-center">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-2">
                <div className="text-[var(--color-text-muted)]">Tổng ca</div>
                <div className="mt-0.5 font-bold text-[var(--color-text-primary)]">{record.totalShifts}</div>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-2">
                <div className="text-[var(--color-text-muted)]">Giờ làm</div>
                <div className="mt-0.5 font-bold text-[var(--color-primary)]">{record.totalHours.toFixed(1)}h</div>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-2">
                <div className="text-[var(--color-text-muted)]">Đi muộn</div>
                <div className="mt-0.5 font-bold text-amber-600">{record.lateShifts}</div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end border-t border-[var(--color-border-light)] pt-3">
              <Button type="primary" size="small" onClick={() => onSelect(record)} className="rounded-[var(--radius-md)] border-none bg-[var(--color-primary)]">
                Chi tiết bảng công
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TimesheetTable;
