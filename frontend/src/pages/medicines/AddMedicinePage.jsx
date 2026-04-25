import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, Input, Select, InputNumber, Switch, Button, Space, Divider, Typography, Row, Col, Alert } from 'antd';
import { Save, X, Info, Pill, DollarSign, FileText, Settings, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddMedicinePage = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      code: '',
      barcode: '',
      registrationNumber: '',
      name: '',
      genericName: '',
      categoryId: '',
      manufacturer: '',
      unit: 'Viên',
      packageUnit: 'Hộp',
      quantityPerPackage: 1,
      minStock: 10,
      retailPrice: 0,
      wholesalePrice: 0,
      description: '',
      contraindication: '',
      storage: '',
      usageGuide: '',
      isPrescription: false,
      isAntibiotic: false,
      isNarcotic: false
    }
  });

  const onSubmit = (data) => {
    console.log('Form Data:', data);
    // Handle API call
  };

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
        <Icon size={18} />
      </div>
      <Title level={5} className="m-0 !text-[var(--color-text-primary)]">{title}</Title>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--color-bg-app)] min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          {/* LEFT COLUMN */}
          <Col span={16}>
            <Space direction="vertical" size={16} className="w-full">
              {/* Section: Thông tin cơ bản */}
              <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]">
                <SectionHeader icon={Pill} title="Thông tin cơ bản" />
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Mã thuốc <span className="text-red-500">*</span></Text>
                      <Controller
                        name="code"
                        control={control}
                        rules={{ required: 'Bắt buộc nhập mã thuốc' }}
                        render={({ field }) => (
                          <Input {...field} placeholder="VD: TH021" status={errors.code ? 'error' : ''} className="rounded-[var(--radius-md)] h-10" />
                        )}
                      />
                      {errors.code && <Text type="danger" className="text-[11px]">{errors.code.message}</Text>}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Mã vạch (Barcode)</Text>
                      <Controller
                        name="barcode"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="EAN-13" className="rounded-[var(--radius-md)] h-10" />}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Số đăng ký lưu hành</Text>
                      <Controller
                        name="registrationNumber"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="VD-12345-21" className="rounded-[var(--radius-md)] h-10" />}
                      />
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Tên thuốc (thương mại) <span className="text-red-500">*</span></Text>
                      <Controller
                        name="name"
                        control={control}
                        rules={{ required: 'Bắt buộc nhập tên thuốc' }}
                        render={({ field }) => (
                          <Input {...field} placeholder="Tên thuốc hiển thị trên hóa đơn" status={errors.name ? 'error' : ''} className="rounded-[var(--radius-md)] h-10" />
                        )}
                      />
                      {errors.name && <Text type="danger" className="text-[11px]">{errors.name.message}</Text>}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Nhóm thuốc</Text>
                      <Controller
                        name="categoryId"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} placeholder="-- Chọn nhóm --" className="w-full rounded-[var(--radius-md)] h-10">
                            <Option value="khang-sinh">Kháng sinh</Option>
                            <Option value="giam-dau">Giảm đau - Hạ sốt</Option>
                            <Option value="tieu-hoa">Tiêu hóa</Option>
                          </Select>
                        )}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Nhà sản xuất</Text>
                      <Controller
                        name="manufacturer"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="VD: DHG Pharma" className="rounded-[var(--radius-md)] h-10" />}
                      />
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Tên hoạt chất (generic name)</Text>
                      <Controller
                        name="genericName"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="VD: Paracetamol 500mg" className="rounded-[var(--radius-md)] h-10" />}
                      />
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Section: Đơn vị & Giá bán */}
              <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]">
                <SectionHeader icon={DollarSign} title="Đơn vị & Giá bán" />
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Đơn vị bán lẻ <span className="text-red-500">*</span></Text>
                      <Controller
                        name="unit"
                        control={control}
                        rules={{ required: 'Bắt buộc chọn đơn vị' }}
                        render={({ field }) => (
                          <Select {...field} className="w-full rounded-[var(--radius-md)] h-10">
                            <Option value="Viên">Viên</Option>
                            <Option value="Vỉ">Vỉ</Option>
                            <Option value="Chai">Chai</Option>
                            <Option value="Tuýp">Tuýp</Option>
                          </Select>
                        )}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Đơn vị đóng gói</Text>
                      <Controller
                        name="packageUnit"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} className="w-full rounded-[var(--radius-md)] h-10">
                            <Option value="Hộp">Hộp</Option>
                            <Option value="Thùng">Thùng</Option>
                          </Select>
                        )}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Số lượng / gói</Text>
                      <Controller
                        name="quantityPerPackage"
                        control={control}
                        render={({ field }) => (
                          <InputNumber {...field} min={1} className="w-full rounded-[var(--radius-md)] h-10 flex items-center" />
                        )}
                      />
                      <Text className="text-[11px] text-[var(--color-text-muted)] italic">1 hộp = ? viên</Text>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Tồn kho tối thiểu</Text>
                      <Controller
                        name="minStock"
                        control={control}
                        render={({ field }) => (
                          <InputNumber {...field} min={0} className="w-full rounded-[var(--radius-md)] h-10 flex items-center" />
                        )}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Giá bán lẻ (VND) <span className="text-red-500">*</span></Text>
                        <Info size={14} className="text-[var(--color-text-muted)]" />
                      </div>
                      <Controller
                        name="retailPrice"
                        control={control}
                        rules={{ required: 'Bắt buộc nhập giá' }}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="w-full rounded-[var(--radius-md)] h-10 flex items-center"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Giá bán sỉ (VND)</Text>
                      <Controller
                        name="wholesalePrice"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="w-full rounded-[var(--radius-md)] h-10 flex items-center"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                            placeholder="Để trống nếu không có"
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Section: Thông tin bổ sung */}
              <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]">
                <SectionHeader icon={FileText} title="Thông tin bổ sung" />
                <Space direction="vertical" size={16} className="w-full">
                  <div className="flex flex-col gap-1">
                    <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Công dụng / Mô tả</Text>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => <TextArea {...field} rows={3} className="rounded-[var(--radius-md)]" />}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Chống chỉ định</Text>
                    <Controller
                      name="contraindication"
                      control={control}
                      render={({ field }) => <TextArea {...field} rows={2} className="rounded-[var(--radius-md)]" />}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Hướng dẫn bảo quản</Text>
                    <Controller
                      name="storage"
                      control={control}
                      render={({ field }) => <Input {...field} placeholder="VD: Nơi khô ráo, tránh ánh nắng trực tiếp" className="rounded-[var(--radius-md)] h-10" />}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Hướng dẫn sử dụng</Text>
                    <Controller
                      name="usageGuide"
                      control={control}
                      render={({ field }) => (
                        <TextArea 
                          {...field} 
                          rows={3} 
                          placeholder="Liều dùng, cách dùng, thời điểm sử dụng..." 
                          className="rounded-[var(--radius-md)]" 
                        />
                      )}
                    />
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>

          {/* RIGHT COLUMN */}
          <Col span={8}>
            <Space direction="vertical" size={16} className="w-full">
              {/* Section: Phân loại thuốc */}
              <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]">
                <SectionHeader icon={Settings} title="Phân loại thuốc" />
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Text className="font-semibold text-[var(--color-text-primary)]">Kê đơn (Rx)</Text>
                        <div className="px-1.5 py-0.5 bg-[var(--color-debt-bg)] text-[var(--color-debt)] text-[10px] font-bold rounded uppercase">Kê đơn</div>
                      </div>
                      <Text className="text-[11px] text-[var(--color-text-secondary)]">Bắt buộc có đơn bác sĩ khi bán</Text>
                    </div>
                    <Controller
                      name="isPrescription"
                      control={control}
                      render={({ field: { value, onChange } }) => <Switch checked={value} onChange={onChange} />}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Text className="font-semibold text-[var(--color-text-primary)]">Kháng sinh (KS)</Text>
                        <div className="px-1.5 py-0.5 bg-[var(--color-warning-bg)] text-[var(--color-warning)] text-[10px] font-bold rounded uppercase">KS</div>
                      </div>
                      <Text className="text-[11px] text-[var(--color-text-secondary)]">Cần tư vấn dược sĩ khi bán</Text>
                    </div>
                    <Controller
                      name="isAntibiotic"
                      control={control}
                      render={({ field: { value, onChange } }) => <Switch checked={value} onChange={onChange} />}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Text className="font-semibold text-[var(--color-text-primary)]">Thuốc gây nghiện (GN)</Text>
                        <div className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">GN</div>
                      </div>
                      <Text className="text-[11px] text-[var(--color-text-secondary)]">Bắt buộc ghi CCCD người mua</Text>
                    </div>
                    <Controller
                      name="isNarcotic"
                      control={control}
                      render={({ field: { value, onChange } }) => <Switch checked={value} onChange={onChange} />}
                    />
                  </div>

                  <Alert
                    message={
                      <Text className="text-[12px] text-[var(--color-text-secondary)]">
                        Thuốc không thuộc các loại trên sẽ được xem là <strong>OTC</strong>
                      </Text>
                    }
                    type="info"
                    showIcon
                    className="bg-[var(--color-bg-subtle)] border-[var(--color-primary-border)]"
                  />
                </div>
              </Card>

              {/* Section: Actions */}
              <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]">
                <Space direction="vertical" size={12} className="w-full">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    icon={<Save size={18} className="mr-2 inline" />}
                    className="h-12 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] text-[15px] font-bold flex items-center justify-center shadow-lg shadow-blue-500/20"
                  >
                    Lưu thuốc mới
                  </Button>
                  <Button
                    block
                    icon={<X size={18} className="mr-2 inline" />}
                    onClick={() => navigate('/medicines')}
                    className="h-12 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] rounded-[var(--radius-md)] font-semibold flex items-center justify-center"
                  >
                    Hủy bỏ
                  </Button>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </form>
    </div>
  );
};

export default AddMedicinePage;
