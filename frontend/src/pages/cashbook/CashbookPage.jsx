import React, { useState, useEffect } from 'react';
import { Button, Space, message } from 'antd';
import { Plus, Download, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import KPICards from './components/KPICards';
import CashbookFilter from './components/CashbookFilter';
import CashbookTable from './components/CashbookTable';
import TransactionDetailDrawer from './components/TransactionDetailDrawer';
import ManualTransactionModal from './components/ManualTransactionModal';
import useCashbookStore from '../../stores/useCashbookStore';

const CashbookPage = () => {
  const { fetchTransactions, addTransaction } = useCashbookStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilter = (filters) => {
    fetchTransactions(filters);
  };

  const handleReset = () => {
    fetchTransactions();
  };

  const handleSaveTransaction = async (data) => {
    const result = await addTransaction(data);
    if (result.success) {
      setIsModalVisible(false);
      message.success('Đã lưu giao dịch mới thành công');
      return;
    }
    message.error(result.message || 'Không thể lưu giao dịch');
  };

  const handleViewDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDrawerVisible(true);
  };

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg-app)]">
      <PageHeader
        title="Sổ quỹ tiền mặt"
        subtitle="Theo dõi toàn bộ thu chi trong nhà thuốc"
        actions={
          <Space size={12}>
            <Button
              icon={<Download size={18} className="mr-2 inline" />}
              className="flex items-center h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Xuất Excel
            </Button>
            <Button
              icon={<FileText size={18} className="mr-2 inline" />}
              className="flex items-center h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Xuất PDF
            </Button>
            <Button
              type="primary"
              icon={<Plus size={18} className="mr-2 inline" />}
              className="flex items-center h-10 px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-card)]"
              onClick={() => setIsModalVisible(true)}
            >
              Thu/Chi thủ công
            </Button>
          </Space>
        }
      />

      {/* KPI Section */}
      <KPICards />

      {/* Filter Section */}
      <CashbookFilter onFilter={handleFilter} onReset={handleReset} />

      {/* Transaction Table */}
      <CashbookTable onViewDetail={handleViewDetail} />

      {/* Detail Drawer */}
      <TransactionDetailDrawer 
        visible={isDrawerVisible}
        transaction={selectedTransaction}
        onClose={() => setIsDrawerVisible(false)}
      />

      {/* Create Transaction Modal */}
      <ManualTransactionModal 
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSaveTransaction}
      />
    </div>
  );
};

export default CashbookPage;
