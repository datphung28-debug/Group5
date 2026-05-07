import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, Input, Select, InputNumber, Switch, Button, Space, Typography, Row, Col, Alert, message, Spin } from 'antd';
import { Save, X, Info, Pill, DollarSign, FileText, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import useMedicineStore from '../../stores/useMedicineStore';
import useCategoryStore from '../../stores/useCategoryStore';
import { unitAPI, supplierAPI } from '../../api/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddMedicinePage = () => {
  const navigate = useNavigate();
  const { createMedicine } = useMedicineStore();
  const { categories, fetchCategories, loading: catLoading } = useCategoryStore();

  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [unitLoading, setUnitLoading] = useState(false);
  const [supplierLoading, setSupplierLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      code: '',
      name: '',
      genericName: '',       // hiển thị trên form nhưng sẽ map → ingredients
      category: '',          // ObjectId của category
      supplier: '',          // ObjectId của supplier
      unit: '',              // ObjectId của unit
      manufacturer: '',
      minStock: 10,
      importPrice: 0,
      sellPrice: 0,          // đây là tên đúng backend
      description: '',
      ingredients: '',
      usage: '',
      contraindications: '', // tên đúng backend
      sideEffects: '',
      requiresPrescription: false, // tên đúng backend
      isAntibiotic: false,
      isNarcotic: false,
    }
  });

  // Load data khi mount
  useEffect(() => {
    fetchCategories();

    const loadUnits = async () => {
      setUnitLoading(true);
      try {
        const res = await unitAPI.getAll();
        setUnits(res.data || []);
      } catch {
        // Fallback hardcode
        setUnits([
          { _id: 'vien', name: 'Viên' },
          { _id: 'chai', name: 'Chai' },
          { _id: 'tuyp', name: 'Tuýp' },
          { _id: 'hop', name: 'Hộp' },
          { _id: 'goi', name: 'Gói' },
        ]);
      } finally {
        setUnitLoading(false);
      }
    };

    const loadSuppliers = async () => {
      setSupplierLoading(true);
      try {
        const res = await supplierAPI.getAll();
        setSuppliers(res.data || []);
      } catch {
        setSuppliers([]);
      } finally {
        setSupplierLoading(false);
      }
    };

    loadUnits();
    loadSuppliers();
  }, []);

  const onSubmit = async (formData) => {
    // Map tên field frontend → backend model
    const payload = {
      code: formData.code,
      name: formData.name,
      category: formData.category,        // ObjectId
      unit: formData.unit,                // ObjectId
      supplier: formData.supplier || undefined,
      manufacturer: formData.manufacturer,
      description: formData.description,
      ingredients: formData.genericName || formData.ingredients, // map genericName → ingredients
      usage: formData.usage,
      contraindications: formData.contraindications,
      sideEffects: formData.sideEffects,
      requiresPrescription: formData.requiresPrescription, // đúng tên backend
      importPrice: formData.importPrice || 0,
      sellPrice: formData.sellPrice,      // đúng tên backend (không phải retailPrice)
      minStock: formData.minStock,
    };

    // Bỏ các field undefined
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    const result = await createMedicine(payload);
    if (result.success) {
      message.success('Thêm thuốc thành công!');
      navigate('/medicines');
    } else {
      message.error(result.message || 'Không thể thêm thuốc. Vui lòng thử lại.');
    }
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
      <PageHeader
        title="Thêm thuốc mới"
        subtitle="Nhập thông tin thuốc vào hệ thống"
        actions={
          <Button
            icon={<ArrowLeft size={18} className="mr-2 inline" />}
            className="flex items-center h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
            onClick={() => navigate('/medicines')}
          >
            Quay lại
          </Button>
        }
      />

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

                  <Col span={16}>
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

                  <Col span={24}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Tên hoạt chất (Ingredients)</Text>
                      <Controller
                        name="genericName"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="VD: Paracetamol 500mg" className="rounded-[var(--radius-md)] h-10" />}
                      />
                    </div>
                  </Col>

                  <Col span={8}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Nhóm thuốc <span className="text-red-500">*</span></Text>
                      <Controller
                        name="category"
                        control={control}
                        rules={{ required: 'Bắt buộc chọn nhóm thuốc' }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            placeholder={catLoading ? 'Đang tải...' : '-- Chọn nhóm --'}
                            className="w-full rounded-[var(--radius-md)] h-10"
                            loading={catLoading}
                            status={errors.category ? 'error' : ''}
                            notFoundContent={catLoading ? <Spin size="small" /> : 'Không có nhóm thuốc'}
                          >
                            {categories.map((cat) => (
                              <Option key={cat._id || cat.id} value={cat._id || cat.id}>
                                {cat.name}
                              </Option>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.category && <Text type="danger" className="text-[11px]">{errors.category.message}</Text>}
                    </div>
                  </Col>

                  <Col span={8}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Đơn vị tính <span className="text-red-500">*</span></Text>
                      <Controller
                        name="unit"
                        control={control}
                        rules={{ required: 'Bắt buộc chọn đơn vị' }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            placeholder={unitLoading ? 'Đang tải...' : '-- Chọn đơn vị --'}
                            className="w-full rounded-[var(--radius-md)] h-10"
                            loading={unitLoading}
                            status={errors.unit ? 'error' : ''}
                            notFoundContent={unitLoading ? <Spin size="small" /> : 'Không có đơn vị'}
                          >
                            {units.map((u) => (
                              <Option key={u._id || u.id} value={u._id || u.id}>
                                {u.name}
                              </Option>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.unit && <Text type="danger" className="text-[11px]">{errors.unit.message}</Text>}
                    </div>
                  </Col>

                  <Col span={8}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Nhà cung cấp</Text>
                      <Controller
                        name="supplier"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            placeholder={supplierLoading ? 'Đang tải...' : '-- Chọn NCC --'}
                            className="w-full rounded-[var(--radius-md)] h-10"
                            loading={supplierLoading}
                            allowClear
                            notFoundContent={supplierLoading ? <Spin size="small" /> : 'Không có nhà cung cấp'}
                          >
                            {suppliers.map((s) => (
                              <Option key={s._id || s.id} value={s._id || s.id}>
                                {s.name}
                              </Option>
                            ))}
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

                  <Col span={12}>
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
                </Row>
              </Card>

              {/* Section: Giá */}
              <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]">
                <SectionHeader icon={DollarSign} title="Giá nhập & Giá bán" />
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Giá nhập (VND)</Text>
                      <Controller
                        name="importPrice"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="w-full rounded-[var(--radius-md)] h-10 flex items-center"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                            min={0}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex flex-col gap-1">
                      <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Giá bán (VND) <span className="text-red-500">*</span></Text>
                      <Controller
                        name="sellPrice"
                        control={control}
                        rules={{ required: 'Bắt buộc nhập giá bán', min: { value: 1, message: 'Giá bán phải lớn hơn 0' } }}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="w-full rounded-[var(--radius-md)] h-10 flex items-center"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                            status={errors.sellPrice ? 'error' : ''}
                            min={0}
                          />
                        )}
                      />
                      {errors.sellPrice && <Text type="danger" className="text-[11px]">{errors.sellPrice.message}</Text>}
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
                      render={({ field }) => <TextArea {...field} rows={3} className="rounded-[var(--radius-md)]" placeholder="Mô tả công dụng thuốc..." />}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Cách dùng (Usage)</Text>
                    <Controller
                      name="usage"
                      control={control}
                      render={({ field }) => (
                        <TextArea {...field} rows={2} className="rounded-[var(--radius-md)]" placeholder="Liều dùng, cách dùng, thời điểm sử dụng..." />
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Tác dụng phụ</Text>
                    <Controller
                      name="sideEffects"
                      control={control}
                      render={({ field }) => <TextArea {...field} rows={2} className="rounded-[var(--radius-md)]" />}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">Chống chỉ định</Text>
                    <Controller
                      name="contraindications"
                      control={control}
                      render={({ field }) => <TextArea {...field} rows={2} className="rounded-[var(--radius-md)]" />}
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
                      name="requiresPrescription"
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
