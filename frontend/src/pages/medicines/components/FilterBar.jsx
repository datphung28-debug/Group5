import React, { useEffect, useState } from 'react';
import { Card, Input, Select, Button, Space, Spin, message } from 'antd';
import { Search, Filter, X } from 'lucide-react';
import { categoryAPI } from '../../../api/api';

const { Option } = Select;

const FilterBar = ({ onFilter, onReset, initialCategory }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory || '');
  const [prevInitialCategory, setPrevInitialCategory] = useState(initialCategory);
  const [requiresPrescription, setRequiresPrescription] = useState('');
  const [lowStock, setLowStock] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  if (initialCategory !== prevInitialCategory) {
    setPrevInitialCategory(initialCategory);
    setCategory(initialCategory || '');
  }

  useEffect(() => {
    const loadCategories = async () => {
      setCategoryLoading(true);
      try {
        const res = await categoryAPI.getAll();
        setCategories(res.data || []);
      } catch (err) {
        message.error(err.response?.data?.message || 'Không thể tải nhóm thuốc');
        setCategories([]);
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategories();
  }, []);

  const getFilterValues = () => ({
    search: search.trim(),
    category,
    requiresPrescription,
    lowStock,
  });

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setRequiresPrescription('');
    setLowStock('');
    onReset();
  };

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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onPressEnter={() => onFilter(getFilterValues())}
            className="rounded-[var(--radius-md)]"
          />
        </div>
        
        <Select
          placeholder="Nhóm thuốc"
          value={category}
          onChange={setCategory}
          className="w-[200px]"
          dropdownClassName="rounded-[var(--radius-md)]"
          loading={categoryLoading}
          notFoundContent={categoryLoading ? <Spin size="small" /> : 'Không có nhóm thuốc'}
        >
          <Option value="">Tất cả nhóm</Option>
          {categories.map((item) => (
            <Option key={item._id || item.id} value={item._id || item.id}>
              {item.name}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Loại thuốc"
          value={requiresPrescription}
          onChange={setRequiresPrescription}
          className="w-[160px]"
        >
          <Option value="">Tất cả loại</Option>
          <Option value="false">OTC</Option>
          <Option value="true">Kê đơn</Option>
        </Select>

        <Select
          placeholder="Tồn kho"
          value={lowStock}
          onChange={setLowStock}
          className="w-[160px]"
        >
          <Option value="">Tất cả tồn kho</Option>
          <Option value="true">Sắp hết hàng</Option>
        </Select>

        <Space gap={8}>
          <Button 
            type="primary" 
            icon={<Filter size={16} className="mr-2 inline" />}
            className="flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none"
            onClick={() => onFilter(getFilterValues())}
          >
            Lọc
          </Button>
          <Button 
            icon={<X size={16} className="mr-2 inline" />}
            className="flex items-center text-[var(--color-text-secondary)] border-[var(--color-border)]"
            onClick={handleReset}
          >
            Reset
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default FilterBar;
