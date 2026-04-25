import React from 'react';
import { Card, Input, Select, Button, Space } from 'antd';
import { Search, Filter, X } from 'lucide-react';

const { Option } = Select;

const FilterBar = ({ onFilter, onReset }) => {
  return (
    <Card 
      className="mb-4 shadow-[var(--shadow-card)] border-[var(--color-border-light)]"
      bodyStyle={{ padding: '16px' }}
    >
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <Input
            placeholder="Tên thuốc, hoạt chất, mã, barcode..."
            prefix={<Search size={18} className="text-[var(--color-text-muted)]" />}
            className="rounded-[var(--radius-md)]"
          />
        </div>
        
        <Select
          placeholder="Nhóm thuốc"
          defaultValue="all"
          className="w-[200px]"
          dropdownClassName="rounded-[var(--radius-md)]"
        >
          <Option value="all">Tất cả nhóm</Option>
          <Option value="khang-sinh">Kháng sinh</Option>
          <Option value="giam-dau">Giảm đau - Hạ sốt</Option>
          <Option value="tieu-hoa">Tiêu hóa</Option>
        </Select>

        <Select
          placeholder="Trạng thái"
          defaultValue="active"
          className="w-[160px]"
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="active">Đang bán</Option>
          <Option value="inactive">Ngừng bán</Option>
        </Select>

        <Space gap={8}>
          <Button 
            type="primary" 
            icon={<Filter size={16} className="mr-2 inline" />}
            className="flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none"
            onClick={onFilter}
          >
            Lọc
          </Button>
          <Button 
            icon={<X size={16} className="mr-2 inline" />}
            className="flex items-center text-[var(--color-text-secondary)] border-[var(--color-border)]"
            onClick={onReset}
          >
            Reset
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default FilterBar;
