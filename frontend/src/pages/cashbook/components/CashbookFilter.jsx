import React from 'react';
import { Button, Select, Input, DatePicker, Space, Row, Col, Segmented } from 'antd';
import { Search, Filter, RotateCcw } from 'lucide-react';

const { RangePicker } = DatePicker;

const CashbookFilter = ({ onFilter, onReset }) => {
  return (
    <div className="bg-white p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)] mb-6">
      {/* Quick Date Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-[var(--color-text-secondary)] font-medium">Lọc nhanh:</span>
        <Segmented
          options={['Hôm nay', '7 ngày', 'Tháng này', 'Quý này']}
          onChange={(value) => console.log('Quick filter:', value)}
          className="bg-[var(--color-bg-subtle)]"
        />
      </div>

      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} sm={12} lg={4}>
          <div className="mb-1 text-[var(--color-text-secondary)] text-[13px] font-medium">Loại giao dịch</div>
          <Select
            className="w-full h-10"
            defaultValue="all"
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
            defaultValue="all"
            options={[
              { value: 'all', label: 'Tất cả danh mục' },
              { value: 'sales', label: 'Bán hàng' },
              { value: 'supplier', label: 'Trả NCC' },
              { value: 'inventory', label: 'Điều chỉnh kho' },
              { value: 'manual_thu', label: 'Thu thủ công' },
              { value: 'manual_chi', label: 'Chi thủ công' },
            ]}
          />
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <div className="mb-1 text-[var(--color-text-secondary)] text-[13px] font-medium">Thanh toán</div>
          <Select
            className="w-full h-10"
            defaultValue="all"
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
          />
        </Col>

        <Col xs={24} lg={6}>
          <Space className="w-full justify-end">
            <Button 
              icon={<RotateCcw size={16} className="mr-2 inline" />}
              className="h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
              onClick={onReset}
            >
              Đặt lại
            </Button>
            <Button 
              type="primary"
              icon={<Filter size={16} className="mr-2 inline" />}
              className="h-10 px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium"
              onClick={onFilter}
            >
              Lọc
            </Button>
          </Space>
        </Col>

        <Col xs={24}>
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[var(--color-border-light)]">
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-secondary)] text-[13px]">Từ ngày:</span>
              <DatePicker className="h-9" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-secondary)] text-[13px]">Đến ngày:</span>
              <DatePicker className="h-9" />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CashbookFilter;
