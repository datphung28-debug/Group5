import React, { useMemo, useState } from 'react';
import { Button, Descriptions, Drawer, Space, message } from 'antd';
import { Download, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ActivityFilter from './components/ActivityFilter';
import ActivityKPIs from './components/ActivityKPIs';
import ActivityTable from './components/ActivityTable';
import { ACTION_META, MODULE_LABELS } from './activityData';

const initialFilters = {
  period: 'month',
  search: '',
  module: 'all',
  action: 'all',
  dateRange: null,
};

const ActivityPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const filteredActivities = useMemo(() => {
    const keyword = activeFilters.search.trim().toLowerCase();

    return [].filter((activity) => {
      const matchesKeyword =
        !keyword ||
        activity.userName.toLowerCase().includes(keyword) ||
        activity.target.toLowerCase().includes(keyword) ||
        activity.description.toLowerCase().includes(keyword) ||
        activity.ipAddress.toLowerCase().includes(keyword);
      const matchesModule = activeFilters.module === 'all' || activity.module === activeFilters.module;
      const matchesAction = activeFilters.action === 'all' || activity.action === activeFilters.action;
      const matchesDate =
        !activeFilters.dateRange ||
        activeFilters.dateRange.length !== 2 ||
        (() => {
          const activityDay = activity.timestamp.slice(0, 10);
          const fromDay = activeFilters.dateRange[0].format('YYYY-MM-DD');
          const toDay = activeFilters.dateRange[1].format('YYYY-MM-DD');
          return activityDay >= fromDay && activityDay <= toDay;
        })();

      return matchesKeyword && matchesModule && matchesAction && matchesDate;
    });
  }, [activeFilters]);

  const summary = useMemo(() => {
    const users = new Set(filteredActivities.map((activity) => activity.userName));
    return {
      total: filteredActivities.length,
      users: users.size,
      warnings: filteredActivities.filter((activity) => activity.status === 'warning').length,
      exports: filteredActivities.filter((activity) => activity.action === 'export').length,
    };
  }, [filteredActivities]);

  const handleChange = (nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      {contextHolder}
      <PageHeader
        title="Lịch sử hoạt động"
        subtitle="Theo dõi các thao tác người dùng, phân hệ tác động và dấu vết truy cập"
        actions={
          <Space size={12} wrap>
            <Button
              icon={<Download size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              onClick={() => messageApi.info('Chức năng xuất lịch sử hoạt động sẽ được nối với API audit log.')}
            >
              Xuất Excel
            </Button>
            <Button
              icon={<FileText size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              onClick={() => messageApi.info('Chức năng xuất PDF sẽ được bổ sung sau.')}
            >
              Xuất PDF
            </Button>
          </Space>
        }
      />

      <ActivityFilter
        filters={filters}
        onChange={handleChange}
        onApply={() => setActiveFilters(filters)}
        onReset={() => {
          setFilters(initialFilters);
          setActiveFilters(initialFilters);
        }}
      />
      <ActivityKPIs summary={summary} />
      <ActivityTable data={filteredActivities} onSelect={setSelectedActivity} />

      <Drawer
        title="Chi tiết hoạt động"
        placement="right"
        width={560}
        open={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
      >
        {selectedActivity && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Mã hoạt động">{selectedActivity.id}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">{selectedActivity.timestamp}</Descriptions.Item>
            <Descriptions.Item label="Người dùng">{selectedActivity.userName}</Descriptions.Item>
            <Descriptions.Item label="Vai trò">{selectedActivity.userRole}</Descriptions.Item>
            <Descriptions.Item label="Thao tác">{ACTION_META[selectedActivity.action].label}</Descriptions.Item>
            <Descriptions.Item label="Phân hệ">{MODULE_LABELS[selectedActivity.module]}</Descriptions.Item>
            <Descriptions.Item label="Đối tượng">{selectedActivity.target}</Descriptions.Item>
            <Descriptions.Item label="Nội dung">{selectedActivity.description}</Descriptions.Item>
            <Descriptions.Item label="IP">{selectedActivity.ipAddress}</Descriptions.Item>
            <Descriptions.Item label="Thiết bị">{selectedActivity.device}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default ActivityPage;
