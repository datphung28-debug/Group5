import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Radio, Space, Button } from 'antd';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { PlusCircle, Banknote, CreditCard } from 'lucide-react';

const { TextArea } = Input;

const ManualTransactionModal = ({ visible, onCancel, onSave }) => {
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      type: 'thu',
      amount: null,
      category: 'Thu thủ công',
      paymentMethod: 'Tiền mặt',
      description: '',
      note: '',
    }
  });

  const transactionType = useWatch({
    control,
    name: 'type',
    defaultValue: 'thu'
  });

  const onSubmit = (data) => {
    onSave(data);
    reset();
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setValue('type', type);
    setValue('category', type === 'thu' ? 'Thu thủ công' : 'Chi thủ công');
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <PlusCircle size={20} className="text-[var(--color-primary)]" />
          <span>Tạo giao dịch thu/chi thủ công</span>
        </div>
      }
      open={visible}
      onCancel={() => {
        reset();
        onCancel();
      }}
      footer={[
        <Button key="cancel" onClick={onCancel} className="rounded-[var(--radius-md)] h-10 px-6">
          Hủy
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          onClick={handleSubmit(onSubmit)}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] h-10 px-8 font-medium shadow-md"
        >
          Lưu giao dịch
        </Button>
      ]}
      width={600}
      className="manual-transaction-modal"
    >
      <Form layout="vertical" className="pt-4">
        <Form.Item label="Loại giao dịch" required>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Radio.Group 
                {...field} 
                onChange={handleTypeChange}
                className="w-full flex"
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="thu" className="flex-1 text-center h-12 flex items-center justify-center rounded-l-[var(--radius-md)] font-bold">
                  THU TIỀN
                </Radio.Button>
                <Radio.Button value="chi" className="flex-1 text-center h-12 flex items-center justify-center rounded-r-[var(--radius-md)] font-bold">
                  CHI TIỀN
                </Radio.Button>
              </Radio.Group>
            )}
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item 
            label="Số tiền" 
            required 
            validateStatus={errors.amount ? 'error' : ''}
            help={errors.amount?.message}
          >
            <Controller
              name="amount"
              control={control}
              rules={{ required: 'Vui lòng nhập số tiền', min: { value: 1, message: 'Số tiền phải lớn hơn 0' } }}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  className="w-full h-10 flex items-center rounded-[var(--radius-md)]"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="đ"
                  placeholder="0"
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Phương thức thanh toán" required>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select {...field} className="w-full h-10 rounded-[var(--radius-md)]">
                  <Select.Option value="Tiền mặt">
                    <div className="flex items-center gap-2">
                      <Banknote size={16} className="text-[#d97706]" />
                      <span>Tiền mặt</span>
                    </div>
                  </Select.Option>
                  <Select.Option value="Chuyển khoản">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-[#2563eb]" />
                      <span>Chuyển khoản</span>
                    </div>
                  </Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </div>

        <Form.Item label="Danh mục giao dịch" required>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select {...field} className="w-full h-10 rounded-[var(--radius-md)]">
                {transactionType === 'thu' ? (
                  <>
                    <Select.Option value="Thu thủ công">Thu thủ công</Select.Option>
                    <Select.Option value="Hoàn tiền">Hoàn tiền từ NCC</Select.Option>
                    <Select.Option value="Điều chỉnh quỹ">Điều chỉnh quỹ (Tăng)</Select.Option>
                    <Select.Option value="Khác">Khác</Select.Option>
                  </>
                ) : (
                  <>
                    <Select.Option value="Chi thủ công">Chi thủ công</Select.Option>
                    <Select.Option value="Chi phí vận hành">Chi phí vận hành</Select.Option>
                    <Select.Option value="Lương nhân viên">Lương nhân viên</Select.Option>
                    <Select.Option value="Hoàn tiền khách hàng">Hoàn tiền cho khách</Select.Option>
                    <Select.Option value="Điều chỉnh quỹ">Điều chỉnh quỹ (Giảm)</Select.Option>
                    <Select.Option value="Khác">Khác</Select.Option>
                  </>
                )}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item 
          label="Nội dung giao dịch" 
          required
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            rules={{ required: 'Vui lòng nhập nội dung giao dịch' }}
            render={({ field }) => (
              <Input {...field} placeholder="Ví dụ: Chi tiền điện tháng 03/2026" className="h-10 rounded-[var(--radius-md)]" />
            )}
          />
        </Form.Item>

        <Form.Item label="Ghi chú (Không bắt buộc)">
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <TextArea {...field} rows={3} placeholder="Thêm thông tin bổ sung nếu cần..." className="rounded-[var(--radius-md)]" />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ManualTransactionModal;
