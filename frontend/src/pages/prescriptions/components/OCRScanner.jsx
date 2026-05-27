import React, { useState } from 'react';
import { Upload, Button, Progress, Modal, Spin, Table, Tag, message } from 'antd';
import { InboxOutlined, ScanOutlined, CameraOutlined, CheckCircleOutlined, AlertOutlined } from '@ant-design/icons';
import Tesseract from 'tesseract.js';
import fuzzysort from 'fuzzysort';

const { Dragger } = Upload;

const OCRScanner = ({ onScanComplete, allMedicines }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  
  // Dành cho kết quả OCR
  const [showResults, setShowResults] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);

  // Xử lý khi upload file
  const handleUpload = async (file) => {
    // Hiển thị preview ảnh
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);

    setIsScanning(true);
    setProgress(0);
    setStatusText('Đang khởi tạo AI...');

    try {
      // Chạy Tesseract OCR (Tiếng Việt + Tiếng Anh)
      const result = await Tesseract.recognize(
        file,
        'vie+eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.floor(m.progress * 100));
              setStatusText(`Đang đọc văn bản... ${Math.floor(m.progress * 100)}%`);
            } else {
              setStatusText(m.status === 'loading tesseract core' ? 'Đang tải lõi AI...' : 'Đang xử lý ảnh...');
            }
          }
        }
      );

      setStatusText('Đang phân tích và đối chiếu dữ liệu...');
      
      // Xử lý text thô thành danh sách thuốc
      const extractedLines = result.data.text.split('\n').filter(line => line.trim().length > 3);
      const matchedMeds = processOCRText(extractedLines);
      
      setScannedItems(matchedMeds);
      setShowResults(true);

    } catch (error) {
      console.error('Lỗi OCR:', error);
      message.error('Nhận dạng thất bại, vui lòng thử lại bằng ảnh rõ nét hơn.');
    } finally {
      setIsScanning(false);
    }

    return false; // Chặn upload mặc định của antd
  };

  // Thuật toán đối chiếu (Fuzzy Matching)
  const processOCRText = (lines) => {
    const results = [];
    
    // Chuẩn bị data thuốc cho fuzzysort
    const targets = allMedicines.map(m => ({
      ...m,
      searchStr: `${m.name} ${m.ingredients} ${m.code}`
    }));

    lines.forEach((line) => {
      // Bỏ qua các dòng không giống tên thuốc (chẩn đoán, tên bác sĩ, ngày tháng)
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('chẩn đoán') || lowerLine.includes('bệnh nhân') || lowerLine.includes('ngày') || lowerLine.includes('bs')) {
        return;
      }

      // Fuzzy search dòng text này trong database thuốc
      const searchRes = fuzzysort.go(line, targets, {
        key: 'searchStr',
        threshold: -5000, // Độ mờ
        limit: 3 // Lấy 3 kết quả tốt nhất
      });

      if (searchRes.length > 0) {
        // Lấy thuốc khớp nhất
        const bestMatch = searchRes[0].obj;
        const score = searchRes[0].score;
        
        // Tính % độ tin cậy giả lập dựa trên score
        let confidence = 0;
        if (score > -10) confidence = 98;
        else if (score > -50) confidence = 85;
        else if (score > -200) confidence = 65;
        else confidence = 40;

        // Cố gắng tìm số lượng (những con số ở cuối hoặc đứng sau chữ x/SL)
        const qtyMatch = line.match(/(?:x|sl|số lượng)[:\s]*(\d+)/i) || line.match(/(\d+)[\s]*(?:viên|hộp|gói|chai)/i);
        const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;

        // Tránh trùng lặp kết quả (một số dòng bị đứt khúc)
        const isExist = results.find(r => r.medicine._id === bestMatch._id);
        if (!isExist && confidence >= 40) {
          results.push({
            originalText: line.trim(),
            medicine: bestMatch,
            confidence,
            quantity: qty,
            dosage: '', // Có thể trích xuất thêm hàm lượng sau
          });
        }
      }
    });

    return results;
  };

  const confirmResults = () => {
    // Chỉ lấy các item có thuốc (đã match)
    const validItems = scannedItems.filter(item => item.medicine);
    onScanComplete(validItems);
    setShowResults(false);
    setPreviewImage(null);
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
            <ScanOutlined className="text-blue-500 text-4xl" />
          </p>
          <p className="ant-upload-text font-semibold text-blue-700">Scan Đơn Thuốc Bằng AI</p>
          <p className="ant-upload-hint text-slate-500">
            Kéo thả hoặc click để chọn ảnh (Hỗ trợ JPG, PNG)
          </p>
          <div className="mt-4">
             <Button icon={<CameraOutlined />}>Sử dụng Camera</Button>
          </div>
        </Dragger>
      )}

      {isScanning && (
        <div className="text-center p-8 bg-slate-50 rounded-lg border border-slate-200">
          <ScanOutlined className="text-4xl text-blue-500 animate-bounce mb-4" />
          <h3 className="font-semibold text-lg text-slate-700">AI Đang Xử Lý Đơn Thuốc</h3>
          <p className="text-slate-500 mb-6">{statusText}</p>
          <Progress percent={progress} status="active" strokeColor="#3b82f6" />
          {previewImage && (
             <div className="mt-6 flex justify-center">
                <img src={previewImage} alt="Scanning" className="h-32 object-contain opacity-50 rounded shadow-inner" />
             </div>
          )}
        </div>
      )}

      <Modal
        title={
          <div className="flex items-center gap-2">
            <ScanOutlined className="text-blue-500" />
            <span>Kết Quả Đối Chiếu OCR</span>
          </div>
        }
        open={showResults}
        onCancel={() => { setShowResults(false); setPreviewImage(null); }}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => { setShowResults(false); setPreviewImage(null); }}>Hủy bỏ</Button>,
          <Button key="submit" type="primary" className="bg-blue-600" onClick={confirmResults} icon={<CheckCircleOutlined />}>
            Xác Nhận & Đưa Vào Đơn
          </Button>
        ]}
      >
        <div className="mb-4 text-slate-600 bg-amber-50 p-3 rounded text-sm border border-amber-200">
          <AlertOutlined className="text-amber-500 mr-2" />
          Vui lòng kiểm tra lại kết quả nhận dạng so với ảnh gốc. AI có thể nhầm lẫn chữ viết tay.
        </div>
        
        <div className="flex gap-4">
          <div className="w-1/3">
            {previewImage && (
              <img src={previewImage} alt="Original" className="w-full rounded border border-slate-200 shadow-sm" />
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
                  render: (text) => <span className="text-xs text-slate-500 italic">"{text}"</span>
                },
                {
                  title: 'Khớp Trong Database',
                  dataIndex: 'medicine',
                  key: 'medicine',
                  render: (med) => <strong className="text-blue-700">{med?.name}</strong>
                },
                {
                  title: 'Độ chính xác',
                  dataIndex: 'confidence',
                  key: 'confidence',
                  render: (val) => (
                    <Tag color={val > 90 ? 'success' : val > 60 ? 'warning' : 'error'}>
                      {val}%
                    </Tag>
                  )
                },
                {
                  title: 'SL',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  render: (qty) => <strong className="text-slate-700">{qty}</strong>
                }
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OCRScanner;
