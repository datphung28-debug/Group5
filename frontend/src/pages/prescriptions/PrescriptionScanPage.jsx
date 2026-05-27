import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, InputNumber, Row, Col, Card, Space, Divider, message, AutoComplete, Typography, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined, PrinterOutlined, ScanOutlined, WarningOutlined } from '@ant-design/icons';
import { Map, Pill } from 'lucide-react';
import PharmacyMap from './components/PharmacyMap';
import OCRScanner from './components/OCRScanner';
import { medicineAPI } from '../../api/api';
import { generatePrescriptionPDF } from '../../utils/generatePrescriptionPDF';
import { checkPrescriptionSafety } from '../../utils/drugSafety';

const { Title, Text } = Typography;

const PrescriptionScanPage = () => {
  const [form] = Form.useForm();
  const [medicines, setMedicines] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [safetyCheck, setSafetyCheck] = useState({ interactions: [], dosageWarnings: [] });

  const fetchMedicines = async () => {
    try {
      const res = await medicineAPI.getAll({ limit: 100 });
      const meds = res.data?.medicines || res.data?.data || res.data || [];
      setMedicines(Array.isArray(meds) ? meds : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách thuốc", error);
      message.error("Không thể lấy danh sách thuốc");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMedicines();
  }, []);

  const handlePrint = async () => {
    try {
      const values = await form.validateFields();
      
      if (!values.items || values.items.length === 0) {
        return message.warning("Vui lòng thêm ít nhất 1 loại thuốc vào đơn!");
      }

      // Xây dựng object prescription từ form
      const prescriptionData = {
        code: `RX${Date.now()}`,
        patientName: values.patientName,
        patientPhone: values.patientPhone,
        patientAge: values.patientAge,
        patientGender: values.patientGender,
        diagnosis: values.diagnosis,
        doctorName: values.doctorName,
        hospitalName: values.hospitalName,
        items: values.items.map(item => {
          const med = medicines.find(m => m._id === item.medicineId);
          return {
            medicineId: item.medicineId,
            medicineName: med?.name || 'Unknown',
            dosage: item.dosage,
            frequency: item.frequency,
            days: item.days,
            quantity: item.quantity,
            unitPrice: med?.sellPrice || 0,
            location: med?.location
          };
        }),
        pharmacist: 'Admin GPP',
        discount: 0
      };

      // Tạo PDF
      generatePrescriptionPDF(prescriptionData);
      message.success("Đã xuất phiếu cấp phát thuốc thành công!");
      
    } catch (error) {
      console.error(error);
      message.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
    }
  };

  const medicineOptions = medicines.map(m => ({
    label: `${m.name} (${m.code}) - Tồn: ${m.stock} ${typeof m.unit === 'object' ? m.unit?.name : m.unit}`,
    value: m._id,
    medicine: m
  }));

  const handleValuesChange = (changedValues, allValues) => {
    if (changedValues.items) {
      updateMapHighlights(allValues.items);
    }
  };

  const updateMapHighlights = (items) => {
    const validItems = items.filter(item => item && item.medicineId).map(item => {
      const med = medicines.find(m => m._id === item.medicineId);
      return {
        medicine: med,
        quantity: item.quantity || 1,
        days: item.days || 1
      };
    });
    setSelectedItems(validItems);
    
    // Chạy kiểm tra an toàn
    const safety = checkPrescriptionSafety(validItems);
    setSafetyCheck(safety);
  };

  const handleOCRComplete = (scannedResults) => {
    // Map kết quả OCR vào form items
    const currentItems = form.getFieldValue('items') || [];
    // Nếu dòng đầu tiên đang trống thì ghi đè, nếu không thì append
    let newItems = currentItems;
    if (currentItems.length === 1 && !currentItems[0].medicineId) {
      newItems = [];
    }

    const ocrItems = scannedResults.map(res => ({
      medicineId: res.medicine._id,
      quantity: res.quantity || 1,
      dosage: '',
      frequency: 2,
      days: 5
    }));

    const finalItems = [...newItems, ...ocrItems];
    form.setFieldsValue({ items: finalItems });
    updateMapHighlights(finalItems);
    message.success(`Đã thêm ${ocrItems.length} loại thuốc từ ảnh vào đơn!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={4} className="!mb-1">Cấp Phát Thuốc Theo Đơn</Title>
          <Text type="secondary">Nhập đơn thuốc thủ công, xem sơ đồ kho và in phiếu cấp phát</Text>
        </div>
        <Space>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint} className="bg-blue-600">
            In Phiếu & Lưu
          </Button>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Form nhập thông tin */}
        <Col span={10}>
          <Card title="Thông tin đơn thuốc" bordered={false} className="shadow-sm">
            <Form 
              form={form} 
              layout="vertical"
              onValuesChange={handleValuesChange}
              initialValues={{ items: [{}] }}
            >
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <Row gutter={16}>
                  <Col span={16}>
                    <Form.Item label="Tên Bệnh Nhân" name="patientName" rules={[{ required: true }]}>
                      <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Tuổi/Năm sinh" name="patientAge">
                      <Input placeholder="1990" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Số điện thoại" name="patientPhone">
                      <Input placeholder="090..." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Giới tính" name="patientGender">
                      <Select placeholder="Chọn">
                        <Select.Option value="male">Nam</Select.Option>
                        <Select.Option value="female">Nữ</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Chẩn đoán" name="diagnosis" rules={[{ required: true }]}>
                      <Input placeholder="Viêm họng cấp..." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Bác sĩ kê đơn" name="doctorName">
                      <Input placeholder="BS. Trần Minh" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Cơ sở y tế" name="hospitalName">
                      <Input placeholder="BV Chợ Rẫy" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <OCRScanner onScanComplete={handleOCRComplete} allMedicines={medicines} />

              {/* Safety Alerts */}
              {(safetyCheck.interactions.length > 0 || safetyCheck.dosageWarnings.length > 0) && (
                <div className="mb-6 space-y-3">
                  {safetyCheck.interactions.map((interaction, idx) => (
                    <Alert
                      key={`int-${idx}`}
                      message={
                        <span className="font-semibold">
                          ⚠️ Tương tác: {interaction.drugPair[0]} & {interaction.drugPair[1]}
                        </span>
                      }
                      description={interaction.warning}
                      type={interaction.severity === 'high' ? 'error' : 'warning'}
                      showIcon
                      icon={<WarningOutlined />}
                    />
                  ))}
                  {safetyCheck.dosageWarnings.map((warn, idx) => (
                    <Alert
                      key={`dose-${idx}`}
                      message={<span className="font-semibold">⚠️ Vượt liều: {warn.medicine}</span>}
                      description={`Đang kê: ${warn.qtyPerDay} viên/ngày. ${warn.warning}`}
                      type="error"
                      showIcon
                      icon={<WarningOutlined />}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <Text strong className="text-lg">Danh sách thuốc kê đơn</Text>
              </div>

              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <div className="space-y-4">
                    {fields.map(({ key, name, ...restField }, index) => (
                      <div key={key} className="p-3 border border-slate-200 rounded-lg relative bg-white">
                        <div className="absolute top-2 right-2">
                          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                        </div>
                        <Row gutter={12}>
                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, 'medicineId']}
                              label={`Thuốc #${index + 1}`}
                              rules={[{ required: true, message: 'Chọn thuốc' }]}
                              className="mb-3"
                            >
                              <Select
                                showSearch
                                placeholder="Tìm theo tên hoặc mã thuốc..."
                                options={medicineOptions}
                                filterOption={(input, option) =>
                                  option.label.toLowerCase().includes(input.toLowerCase())
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item {...restField} name={[name, 'dosage']} label="Hàm lượng" className="mb-0">
                              <Input placeholder="500mg" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item {...restField} name={[name, 'frequency']} label="Lần/ngày" className="mb-0">
                              <InputNumber min={1} className="w-full" placeholder="3" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item {...restField} name={[name, 'days']} label="Số ngày" className="mb-0">
                              <InputNumber min={1} className="w-full" placeholder="7" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item {...restField} name={[name, 'quantity']} label="Tổng SL" rules={[{ required: true }]} className="mb-0">
                              <InputNumber min={1} className="w-full font-bold text-blue-600" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="mt-2">
                      Thêm thuốc
                    </Button>
                  </div>
                )}
              </Form.List>
            </Form>
          </Card>
        </Col>

        {/* Bản đồ kho thuốc */}
        <Col span={14}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Map className="text-blue-500" size={20} />
                <span>Sơ đồ nhặt thuốc thông minh</span>
              </div>
            }
            bordered={false} 
            className="shadow-sm sticky top-6"
          >
            <PharmacyMap 
              allMedicines={medicines}
              highlightMedicines={selectedItems}
              onCellClick={(med, key) => {
                if (med) {
                  message.info(`Vị trí: ${med.name} - Kệ ${key.split('-')[1]}, Hàng ${key.split('-')[2]}`);
                }
              }}
            />
            
            {/* Hướng dẫn nhặt thuốc theo thứ tự */}
            {selectedItems.length > 0 && (
              <div className="mt-6">
                <Text strong>Trình tự nhặt thuốc tối ưu:</Text>
                <div className="mt-3 space-y-2">
                  {selectedItems
                    .sort((a, b) => {
                      // Sắp xếp theo zone -> shelf -> row
                      const locA = a.medicine?.location;
                      const locB = b.medicine?.location;
                      if (!locA) return 1;
                      if (!locB) return -1;
                      if (locA.zone !== locB.zone) return locA.zone.localeCompare(locB.zone);
                      if (locA.shelf !== locB.shelf) return locA.shelf - locB.shelf;
                      return locA.row - locB.row;
                    })
                    .map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{item.medicine?.name}</div>
                          <div className="text-xs text-slate-500">Số lượng: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-700 uppercase">
                          Khu {item.medicine?.location?.zone || '?'}
                        </div>
                        <div className="text-xs text-slate-500">
                          Kệ {item.medicine?.location?.shelf} - Hàng {item.medicine?.location?.row}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PrescriptionScanPage;
