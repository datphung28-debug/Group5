import React from 'react';
import { Button, Select, Input, DatePicker, Space, Row, Col, Segmented } from 'antd';
import { Search, Filter, RotateCcw } from 'lucide-react';
import dayjs from 'dayjs';

const CashbookFilter = ({ onFilter, onReset }) => {
  const [filters, setFilters] = React.useState({
    type: 'all',
    category: 'all',
    paymentMethod: 'all',
    search: '',
    startDate: null,
    endDate: null,
  });

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const buildParams = (nextFilters = filters) => ({
    ...(nextFilters.type !== 'all' ? { type: nextFilters.type } : {}),
    ...(nextFilters.category !== 'all' ? { category: nextFilters.category } : {}),
    ...(nextFilters.paymentMethod !== 'all' ? { paymentMethod: nextFilters.paymentMethod } : {}),
    ...(nextFilters.startDate ? { startDate: nextFilters.startDate.toISOString() } : {}),
    ...(nextFilters.endDate ? { endDate: nextFilters.endDate.toISOString() } : {}),
  });

  const handleQuickFilter = (value) => {
    const today = dayjs();
    const quarterStartMonth = Math.floor(today.month() / 3) * 3;
    const ranges = {
      'Hôm nay': [today.startOf('day'), today.endOf('day')],
      '7 ngày': [today.subtract(6, 'day').startOf('day'), today.endOf('day')],
      'Tháng này': [today.startOf('month'), today.endOf('day')],
      'Quý này': [today.month(quarterStartMonth).startOf('month'), today.endOf('day')],
    };
    const [startDate, endDate] = ranges[value] || [null, null];
    const nextFilters = { ...filters, startDate, endDate };
    setFilters(nextFilters);
    onFilter(buildParams(nextFilters));
  };

  const handleReset = () => {
    const nextFilters = {
      type: 'all',
      category: 'all',
      paymentMethod: 'all',
      search: '',
      startDate: null,
      endDate: null,
    };
    setFilters(nextFilters);
    onReset();
  };

  return (
    <div className="bg-white p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)] mb-6">
      {/* Quick Date Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-[var(--color-text-secondary)] font-medium">Lọc nhanh:</span>
        <Segmented
          options={['Hôm nay', '7 ngày', 'Tháng này', 'Quý này']}
          onChange={handleQuickFilter}
          className="bg-[var(--color-bg-subtle)]"
        />
      </div>

      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} sm={12} lg={4}>
          <div className="mb-1 text-[var(--color-text-secondary)] text-[13px] font-medium">Loại giao dịch</div>
          <Select
            className="w-full h-10"
            value={filters.type}
            onChange={(value) => updateFilter('type', value)}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'thu', label: 'Thu' },
              { value: 'chi', label: 'Chi' },
            ]}
          />
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <div className="mb-1 text-[var(--color-text-secondary)] text-[13px] font-medium">Danh mục</div>
          <Select
            className="w-full h-10"
            value={filters.category}
            onChange={(value) => updateFilter('category', value)}
            options={[
              { value: 'all', label: 'Tất cả danh mục' },
              { value: 'Bán hàng', label: 'Bán hàng' },
              { value: 'Nhập hàng', label: 'Nhập hàng' },
              { value: 'Thu thủ công', label: 'Thu thủ công' },
              { value: 'Chi thủ công', label: 'Chi thủ công' },
              { value: 'Chi phí vận hành', label: 'Chi phí vận hành' },
            ]}
          />
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <div className="mb-1 text-[var(--color-text-secondary)] text-[13px] font-medium">Thanh toán</div>
          <Select
            className="w-full h-10"
            value={filters.paymentMethod}
            onChange={(value) => updateFilter('paymentMethod', value)}
            options={[
              { value: 'all', label: 'Tất cả PT' },
              { value: 'cash', label: 'Tiền mặt' },
              { value: 'transfer', label: 'Chuyển khoản' },
            ]}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="mb-1 text-[var(--color-text-secondary)] text-[13px] font-medium">Tìm kiếm</div>
          <Input
            placeholder="Mã GD, nội dung, nhân viên..."
            prefix={<Search size={16} className="text-[var(--color-text-muted)] mr-1" />}
            className="h-10 rounded-[var(--radius-md)]"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
        </Col>

        <Col xs={24} lg={6}>
          <Space className="w-full justify-end">
            <Button 
              icon={<RotateCcw size={16} className="mr-2 inline" />}
              className="h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
              onClick={handleReset}
            >
              Đặt lại
            </Button>
            <Button 
              type="primary"
              icon={<Filter size={16} className="mr-2 inline" />}
              className="h-10 px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium"
              onClick={() => onFilter(buildParams())}
            >
              Lọc
            </Button>
          </Space>
        </Col>

        <Col xs={24}>
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[var(--color-border-light)]">
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-secondary)] text-[13px]">Từ ngày:</span>
              <DatePicker
                className="h-9"
                value={filters.startDate}
                onChange={(date) => updateFilter('startDate', date)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-secondary)] text-[13px]">Đến ngày:</span>
              <DatePicker
                className="h-9"
                value={filters.endDate}
                onChange={(date) => updateFilter('endDate', date)}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CashbookFilter;
