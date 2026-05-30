import React, { useState } from 'react';
import { Upload, Button, Progress, Modal, Table, Tag, message, Alert } from 'antd';
import { InboxOutlined, ScanOutlined, CameraOutlined, CheckCircleOutlined, AlertOutlined, ThunderboltOutlined } from '@ant-design/icons';
import api from '../../../api/api';
import fuzzysort from 'fuzzysort';

const { Dragger } = Upload;

const OCRScanner = ({ onScanComplete, allMedicines }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  
  // Kết quả OCR
  const [showResults, setShowResults] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [prescriptionInfo, setPrescriptionInfo] = useState(null);

  // Xử lý khi upload file
  const handleUpload = async (file) => {
    // Hiển thị preview ảnh
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageBase64 = e.target.result;
      setPreviewImage(imageBase64);

      setIsScanning(true);
      setProgress(10);
      setStatusText('🚀 Đang gửi ảnh lên AI Gemini...');

      try {
        // ═══ BƯỚC 1: Gọi Backend → Gemini AI Vision ═══
        setProgress(30);
        setStatusText('🧠 AI đang phân tích đơn thuốc...');

        const response = await api.post('/prescriptions/scan-ai', {
          imageBase64: imageBase64,
          mimeType: file.type || 'image/jpeg',
        });

        if (!response.data?.success) {
          throw new Error(response.data?.error || 'AI không thể đọc đơn thuốc');
        }

        setProgress(70);
        setStatusText('🔍 Đang đối chiếu với kho thuốc...');

        const aiResult = response.data.data;
        setPrescriptionInfo({
          patientName: aiResult.patientName,
          doctorName: aiResult.doctorName,
          diagnosis: aiResult.diagnosis,
          clinicName: aiResult.clinicName,
          prescriptionDate: aiResult.prescriptionDate,
        });

        // ═══ BƯỚC 2: Đối chiếu tên thuốc AI đọc được với Database ═══
        const matchedMeds = matchAIResultsWithDatabase(aiResult.items || []);
        
        setProgress(100);
        setStatusText('✅ Hoàn tất!');
        setScannedItems(matchedMeds);
        setShowResults(true);

      } catch (error) {
        console.error('Lỗi AI Scan:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Không xác định';
        message.error(`Nhận dạng thất bại: ${errorMsg}. Hãy thử lại bằng ảnh rõ nét hơn.`);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
    return false; // Chặn upload mặc định của antd
  };

  // Đối chiếu kết quả AI với danh sách thuốc trong Database (Fuzzy Matching)
  const matchAIResultsWithDatabase = (aiItems) => {
    const results = [];

    // Chuẩn bị data thuốc cho fuzzysort
    const targets = allMedicines.map(m => ({
      ...m,
      searchStr: `${m.name} ${m.ingredients || ''} ${m.code}`,
    }));

    aiItems.forEach((aiItem) => {
      const drugName = aiItem.drugName || '';
      if (!drugName.trim()) return;

      // Fuzzy search tên thuốc AI đọc được trong database
      const searchRes = fuzzysort.go(drugName, targets, {
        key: 'searchStr',
        threshold: -5000,
        limit: 3,
      });

      if (searchRes.length > 0) {
        const bestMatch = searchRes[0].obj;
        const score = searchRes[0].score;

        // Tính % confidence dựa trên score
        let confidence = 0;
        if (score > -10) confidence = 99;
        else if (score > -50) confidence = 90;
        else if (score > -200) confidence = 75;
        else if (score > -500) confidence = 55;
        else confidence = 35;

        // Tránh trùng lặp
        const isExist = results.find(r => r.medicine._id === bestMatch._id);
        if (!isExist) {
          results.push({
            originalText: drugName,
            medicine: bestMatch,
            confidence,
            quantity: aiItem.quantity || 1,
            dosage: aiItem.dosage || '',
            frequency: aiItem.frequency || '',
            duration: aiItem.duration || '',
            unit: aiItem.unit || 'viên',
          });
        }
      } else {
        // Thuốc AI đọc được nhưng không tìm thấy trong DB
        results.push({
          originalText: drugName,
          medicine: { _id: null, name: `⚠ Không tìm thấy: ${drugName}`, isExternal: true },
          confidence: 0,
          quantity: aiItem.quantity || 1,
          dosage: aiItem.dosage || '',
          frequency: aiItem.frequency || '',
          duration: aiItem.duration || '',
          unit: aiItem.unit || 'viên',
        });
      }
    });

    return results;
  };

  const confirmResults = () => {
    const validItems = scannedItems.filter(item => item.medicine && item.medicine._id);
    
    if (validItems.length === 0) {
      message.warning('Không có thuốc nào khớp trong kho. Vui lòng thêm thủ công.');
      return;
    }

    onScanComplete({
      prescriptionInfo: prescriptionInfo || {},
      matchedMedicines: validItems,
      imageBase64: previewImage,
    });
    
    setShowResults(false);
    setPreviewImage(null);
    setPrescriptionInfo(null);
  };

  return (
    <div className="mb-6">
      {!isScanning && !showResults && (
        <Dragger 
          accept="image/*" 
          beforeUpload={handleUpload}
          showUploadList={false}
          className="bg-blue-50/50 hover:bg-blue-50 border-blue-200"
        >
          <p className="ant-upload-drag-icon">
            <ThunderboltOutlined className="text-blue-500 text-4xl" />
          </p>
          <p className="ant-upload-text font-semibold text-blue-700">Scan Đơn Thuốc Bằng AI Gemini</p>
          <p className="ant-upload-hint text-slate-500">
            Kéo thả hoặc click để chọn ảnh đơn thuốc (Hỗ trợ JPG, PNG)
          </p>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            ✨ Powered by Google Gemini — Nhận diện cả chữ viết tay
          </div>
          <div className="mt-4">
             <Button icon={<CameraOutlined />}>Chọn ảnh từ thiết bị</Button>
          </div>
        </Dragger>
      )}

      {isScanning && (
        <div className="text-center p-8 bg-gradient-to-b from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <ThunderboltOutlined className="text-5xl text-blue-500 mb-4" style={{ animation: 'pulse 1.5s infinite' }} />
          <h3 className="font-bold text-lg text-slate-800">AI Gemini Đang Phân Tích</h3>
          <p className="text-slate-500 mb-6">{statusText}</p>
          <Progress 
            percent={progress} 
            status="active" 
            strokeColor={{ from: '#3b82f6', to: '#8b5cf6' }} 
            strokeWidth={10}
          />
          {previewImage && (
             <div className="mt-6 flex justify-center">
                <img src={previewImage} alt="Scanning" className="h-32 object-contain opacity-50 rounded-lg shadow-inner" />
             </div>
          )}
        </div>
      )}

      <Modal
        title={
          <div className="flex items-center gap-2">
            <ThunderboltOutlined className="text-blue-500" />
            <span className="font-bold">Kết Quả AI Gemini Vision</span>
          </div>
        }
        open={showResults}
        onCancel={() => { setShowResults(false); setPreviewImage(null); setPrescriptionInfo(null); }}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => { setShowResults(false); setPreviewImage(null); }}>Hủy bỏ</Button>,
          <Button key="submit" type="primary" className="bg-blue-600" onClick={confirmResults} icon={<CheckCircleOutlined />}>
            Xác Nhận & Đưa Vào Giỏ Hàng
          </Button>,
        ]}
      >
        {/* Thông tin đơn thuốc */}
        {prescriptionInfo && (prescriptionInfo.patientName || prescriptionInfo.doctorName || prescriptionInfo.diagnosis) && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">📋 Thông tin Đơn thuốc (AI nhận diện)</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {prescriptionInfo.patientName && (
                <div><span className="text-slate-500">Bệnh nhân:</span> <strong className="text-slate-800">{prescriptionInfo.patientName}</strong></div>
              )}
              {prescriptionInfo.doctorName && (
                <div><span className="text-slate-500">Bác sĩ:</span> <strong className="text-slate-800">{prescriptionInfo.doctorName}</strong></div>
              )}
              {prescriptionInfo.diagnosis && (
                <div><span className="text-slate-500">Chẩn đoán:</span> <strong className="text-orange-600">{prescriptionInfo.diagnosis}</strong></div>
              )}
              {prescriptionInfo.clinicName && (
                <div><span className="text-slate-500">Phòng khám:</span> <strong className="text-slate-800">{prescriptionInfo.clinicName}</strong></div>
              )}
            </div>
          </div>
        )}

        <Alert 
          type="warning" 
          showIcon 
          icon={<AlertOutlined />}
          message="Vui lòng kiểm tra lại kết quả nhận dạng so với ảnh gốc. AI có thể nhận sai thuốc tương tự." 
          className="mb-4"
        />
        
        <div className="flex gap-4">
          <div className="w-1/3">
            {previewImage && (
              <img src={previewImage} alt="Original" className="w-full rounded-lg border border-slate-200 shadow-sm" />
            )}
          </div>
          <div className="w-2/3">
            <Table
              dataSource={scannedItems}
              rowKey={(r, i) => i}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'AI Đọc Được',
                  dataIndex: 'originalText',
                  key: 'originalText',
                  width: 160,
                  render: (text) => <span className="text-xs text-slate-500 italic">"{text}"</span>
                },
                {
                  title: 'Khớp Trong Kho',
                  dataIndex: 'medicine',
                  key: 'medicine',
                  render: (med) => (
                    <div>
                      <strong className={med?.isExternal ? 'text-red-500' : 'text-blue-700'}>{med?.name}</strong>
                    </div>
                  )
                },
                {
                  title: 'Độ khớp',
                  dataIndex: 'confidence',
                  key: 'confidence',
                  width: 80,
                  align: 'center',
                  render: (val) => (
                    <Tag color={val > 85 ? 'success' : val > 50 ? 'warning' : 'error'}>
                      {val}%
                    </Tag>
                  )
                },
                {
                  title: 'SL',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 50,
                  align: 'center',
                  render: (qty) => <strong className="text-slate-700">{qty}</strong>
                },
                {
                  title: 'Liều dùng',
                  dataIndex: 'dosage',
                  key: 'dosage',
                  width: 180,
                  render: (text) => text ? <span className="text-xs text-orange-600 font-medium">{text}</span> : <span className="text-slate-300">—</span>
                },
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OCRScanner;
