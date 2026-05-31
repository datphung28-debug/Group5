import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Button, Descriptions, Drawer, Space, message, Alert, Spin } from 'antd';
import { Download, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import ActivityFilter from './components/ActivityFilter';
import ActivityKPIs from './components/ActivityKPIs';
import ActivityTable from './components/ActivityTable';
import { ACTION_META, MODULE_LABELS } from './activityData';
import { activityLogAPI } from '../../api/api';

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

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let startDate;
      let endDate;

      if (activeFilters.period === 'today') {
        startDate = dayjs().startOf('day').format('YYYY-MM-DD');
        endDate = dayjs().endOf('day').format('YYYY-MM-DD');
      } else if (activeFilters.period === '7days') {
        startDate = dayjs().subtract(6, 'day').startOf('day').format('YYYY-MM-DD');
        endDate = dayjs().endOf('day').format('YYYY-MM-DD');
      } else if (activeFilters.period === 'month') {
        startDate = dayjs().startOf('month').format('YYYY-MM-DD');
        endDate = dayjs().endOf('day').format('YYYY-MM-DD');
      } else if (activeFilters.period === 'custom' && activeFilters.dateRange?.length === 2) {
        startDate = activeFilters.dateRange[0].format('YYYY-MM-DD');
        endDate = activeFilters.dateRange[1].format('YYYY-MM-DD');
      }

      const params = {
        search: activeFilters.search?.trim() || undefined,
        module: activeFilters.module === 'all' ? undefined : activeFilters.module,
        action: activeFilters.action === 'all' ? undefined : activeFilters.action,
        startDate,
        endDate,
        limit: 1000,
      };

      const res = await activityLogAPI.getAll(params);
      setActivities(res.data?.activities || []);
    } catch (err) {
      console.error("Lỗi lấy lịch sử hoạt động:", err);
      const msg = err.response?.data?.message || "Không thể tải dữ liệu lịch sử hoạt động từ server.";
      setError(msg);
      messageApi.error(msg);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, messageApi]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActivities();
  }, [fetchActivities]);

  const summary = useMemo(() => {
    const users = new Set(activities.map((activity) => activity.userName));
    return {
      total: activities.length,
      users: users.size,
      warnings: activities.filter((activity) => activity.status === 'warning').length,
      exports: activities.filter((activity) => activity.action === 'export').length,
    };
  }, [activities]);

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

      {error && (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          closable
          className="mb-6 rounded-[var(--radius-lg)]"
        />
      )}

      <ActivityKPIs summary={summary} />

      {loading && activities.length === 0 ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-[var(--radius-lg)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)]">
          <Spin size="large" tip="Đang tải lịch sử hoạt động..." />
        </div>
      ) : (
        <ActivityTable data={activities} onSelect={setSelectedActivity} loading={loading} />
      )}

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
            <Descriptions.Item label="Thao tác">{ACTION_META[selectedActivity.action]?.label || selectedActivity.action}</Descriptions.Item>
            <Descriptions.Item label="Phân hệ">{MODULE_LABELS[selectedActivity.module] || selectedActivity.module}</Descriptions.Item>
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
