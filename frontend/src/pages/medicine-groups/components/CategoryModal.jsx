import { Modal, Form, Input, Select } from 'antd';
import {
  Pill,
  Thermometer,
  Heart,
  Apple,
  Wind,
  Hand,
  Brain,
  Sun,
  Eye,
  Activity,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useEffect } from 'react';

const { TextArea } = Input;

const ICONS = [
  { value: 'pill', icon: Pill, label: 'Viên thuốc' },
  { value: 'thermometer', icon: Thermometer, label: 'Cảm sốt' },
  { value: 'heart', icon: Heart, label: 'Tim mạch' },
  { value: 'apple', icon: Apple, label: 'Tiêu hóa' },
  { value: 'wind', icon: Wind, label: 'Hô hấp' },
  { value: 'hand', icon: Hand, label: 'Da liễu' },
  { value: 'brain', icon: Brain, label: 'Thần kinh' },
  { value: 'sun', icon: Sun, label: 'Vitamin' },
  { value: 'eye', icon: Eye, label: 'Mắt' },
  { value: 'activity', icon: Activity, label: 'Nội tiết' },
  { value: 'shield', icon: Shield, label: 'Phòng vệ' },
];

export default function CategoryModal({ open, category, onCancel, onSave }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (category) {
        form.setFieldsValue(category);
      } else {
        form.resetFields();
        form.setFieldsValue({ icon: 'pill' });
      }
    }
  }, [open, category, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={category ? 'Sửa nhóm thuốc' : 'Thêm nhóm thuốc mới'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={category ? 'Cập nhật' : 'Thêm mới'}
      cancelText="Hủy"
      width={480}
      className="custom-modal"
      centered
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{ icon: 'pill' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Form.Item
            name="name"
            label="Tên nhóm"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}
            className="sm:col-span-1"
          >
            <Input placeholder="VD: Kháng sinh" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã viết tắt"
            rules={[{ max: 4, message: 'Tối đa 4 ký tự' }]}
            className="sm:col-span-1"
          >
            <Input placeholder="VD: KS" className="uppercase" />
          </Form.Item>
        </div>

        <Form.Item
          name="icon"
          label="Biểu tượng"
          rules={[{ required: true, message: 'Vui lòng chọn biểu tượng' }]}
        >
          <Select placeholder="Chọn biểu tượng">
            {ICONS.map((item) => (
              <Select.Option key={item.value} value={item.value}>
                <div className="flex items-center gap-2">
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="description" label="Mô tả" className="mb-0">
          <TextArea
            placeholder="Mô tả ngắn về nhóm thuốc này..."
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
