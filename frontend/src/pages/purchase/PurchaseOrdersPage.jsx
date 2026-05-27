import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Empty, Space, Spin, Table, Tag } from 'antd';
import { Plus, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { importAPI } from '../../api/api';
import {
  getImportId,
  getImportsFromResponse,
  getPaymentStatusMeta,
  getSupplierName,
} from './purchaseOrdersListUtils';

const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN');

const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchImports = useCallback(async (params = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 10;

    setLoading(true);
    setError('');
    try {
      const res = await importAPI.getAll({ page, limit });
      const data = getImportsFromResponse(res.data);
      setImports(data);
      setPagination((current) => ({
        ...current,
        current: Number(res.data?.page || page),
        pageSize: limit,
        total: Number(res.data?.total ?? data.length),
      }));
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể tải danh sách phiếu nhập';
      setError(message);
      setImports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchImports({ page: 1 }));
  }, [fetchImports]);

  const columns = useMemo(() => [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code) => (
        <span className="font-semibold text-[var(--color-primary)]">{code || '—'}</span>
      ),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--color-text-primary)]">{getSupplierName(record)}</span>
          {record.supplier?.phone && (
            <span className="text-[12px] text-[var(--color-text-secondary)]">{record.supplier.phone}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Số mặt hàng',
      dataIndex: 'items',
      key: 'items',
      width: 120,
      align: 'right',
      render: (items = []) => `${items.length} mặt hàng`,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 160,
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(value)}đ</span>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 170,
      render: (status) => {
        const meta = getPaymentStatusMeta(status);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'importDate',
      key: 'importDate',
      width: 140,
      render: (value) => <span className="text-[var(--color-text-secondary)]">{formatDate(value)}</span>,
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 150,
      render: (createdBy) => createdBy?.name || '—',
    },
  ], []);

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg-app)]">
      <PageHeader
        title="Đơn nhập hàng"
        subtitle="Quản lý các phiếu nhập hàng từ nhà cung cấp"
        actions={
          <Space size={12}>
            <Button
              icon={<RotateCw size={16} className="mr-2 inline" />}
              onClick={() => fetchImports({ page: pagination.current, limit: pagination.pageSize })}
              loading={loading}
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] font-medium"
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<Plus size={16} className="mr-2 inline" />}
              onClick={() => navigate('/purchase-orders/create')}
              className="h-10 rounded-[var(--radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none font-medium shadow-md"
            >
              Tạo đơn nhập
            </Button>
          </Space>
        }
      />

      {error && (
        <Alert
          type="error"
          message="Lỗi tải dữ liệu"
          description={error}
          className="mb-4"
          action={
            <Button size="small" onClick={() => fetchImports({ page: pagination.current, limit: pagination.pageSize })} loading={loading}>
              Thử lại
            </Button>
          }
        />
      )}

      <Spin spinning={loading}>
        <Table
          dataSource={imports}
          columns={columns}
          rowKey={(record) => getImportId(record)}
          locale={{
            emptyText: (
              <Empty
                description="Chưa có phiếu nhập hàng"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/purchase-orders/create')}>
                  Tạo phiếu nhập đầu tiên
                </Button>
              </Empty>
            ),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phiếu nhập`,
            onChange: (page, pageSize) => fetchImports({ page, limit: pageSize }),
          }}
          className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)]"
          scroll={{ x: 960 }}
        />
      </Spin>
    </div>
  );
};

export default PurchaseOrdersPage;
