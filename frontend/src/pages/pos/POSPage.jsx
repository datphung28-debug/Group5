import React, { useState, useEffect, useMemo } from 'react';
import { Input, Button, Table, InputNumber, Select, Modal, Drawer, message, Tooltip, Tag } from 'antd';
import { 
  SearchOutlined, ScanOutlined, UserAddOutlined, 
  DeleteOutlined, ShoppingCartOutlined, LogoutOutlined, 
  CreditCardOutlined, BankOutlined, WalletOutlined,
  HistoryOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import { Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import OCRScanner from '../prescriptions/components/OCRScanner';
import PharmacyMap from '../prescriptions/components/PharmacyMap';
import { medicineAPI } from '../../api/api';
import { checkPrescriptionSafety } from '../../utils/drugSafety';

const POSPage = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(dayjs());
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  
  // States for OCR & Map
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [isMapDrawerOpen, setIsMapDrawerOpen] = useState(false);
  
  // Payment states
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerGiven, setCustomerGiven] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  // Search state
  const [searchText, setSearchText] = useState('');

  // Lấy dữ liệu thuốc
  useEffect(() => {
    fetchMedicines();
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await medicineAPI.getAll({ limit: 100 });
      const meds = res.data?.medicines || res.data?.data || res.data || [];
      setMedicines(Array.isArray(meds) ? meds : []);
    } catch (error) {
      console.error(error);
    }
  };

  // Tính toán tiền
  const subTotal = cart.reduce((sum, item) => sum + (item.medicine.sellPrice * item.quantity), 0);
  const total = Math.max(0, subTotal - discount);
  const change = Math.max(0, customerGiven - total);

  // Xử lý thêm thuốc vào giỏ
  const addToCart = (med, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.medicine._id === med._id);
      if (existing) {
        return prev.map(item => 
          item.medicine._id === med._id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [{ medicine: med, quantity: qty, days: 1 }, ...prev];
    });
    setSearchText('');
  };

  // Xử lý kết quả OCR Scan
  const handleOCRComplete = (scannedResults) => {
    scannedResults.forEach(res => {
      addToCart(res.medicine, res.quantity || 1);
    });
    setIsOCRModalOpen(false);
    message.success(`Đã thêm ${scannedResults.length} loại thuốc từ ảnh vào giỏ hàng!`);
    
    // Tự động mở sơ đồ kho để đi nhặt thuốc
    setTimeout(() => setIsMapDrawerOpen(true), 500);
  };

  // Lọc thuốc tìm kiếm
  const filteredMedicines = useMemo(() => {
    if (!searchText) return [];
    return medicines.filter(m => 
      m.name.toLowerCase().includes(searchText.toLowerCase()) || 
      (m.code && m.code.toLowerCase().includes(searchText.toLowerCase()))
    ).slice(0, 5);
  }, [searchText, medicines]);

  // Kiểm tra an toàn dược
  const safetyCheck = useMemo(() => checkPrescriptionSafety(cart), [cart]);

  // Cột bảng giỏ hàng
  const columns = [
    {
      title: 'STT',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên hàng',
      dataIndex: 'medicine',
      render: (med) => (
        <div>
          <div className="font-bold text-slate-700">{med.name}</div>
          <div className="text-xs text-slate-400">{med.code}</div>
        </div>
      ),
    },
    {
      title: 'ĐVT',
      width: 70,
      render: (_, record) => typeof record.medicine.unit === 'object' ? record.medicine.unit?.name : record.medicine.unit,
    },
    {
      title: 'SL',
      width: 100,
      render: (_, record) => (
        <InputNumber 
          min={1} 
          value={record.quantity} 
          onChange={(val) => {
            setCart(cart.map(i => i.medicine._id === record.medicine._id ? { ...i, quantity: val } : i));
          }}
        />
      ),
    },
    {
      title: 'Đơn giá',
      width: 100,
      align: 'right',
      render: (_, record) => <span className="font-medium text-slate-600">{record.medicine.sellPrice?.toLocaleString('vi-VN')}</span>,
    },
    {
      title: 'Thành tiền',
      width: 120,
      align: 'right',
      render: (_, record) => <span className="font-bold text-blue-600">{(record.medicine.sellPrice * record.quantity).toLocaleString('vi-VN')}</span>,
    },
    {
      title: '',
      width: 50,
      render: (_, record) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setCart(cart.filter(i => i.medicine._id !== record.medicine._id))} />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      {/* HEADER TONE ĐỒNG BỘ SIDEBAR */}
      <header className="h-14 text-white flex justify-between items-center px-4 flex-shrink-0 shadow-md z-10" style={{ backgroundColor: 'var(--color-sidebar-bg)' }}>
        <div className="flex items-center gap-3">
          <Pill size={24} className="text-blue-300" />
          <span className="text-lg font-bold tracking-wide">Nhà Thuốc Sức Khỏe Vàng</span>
          <span className="text-xl font-mono ml-4 text-blue-100">{time.format('HH:mm:ss')}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right leading-tight">
            <div className="text-xs text-blue-200">Thu ngân</div>
            <div className="font-semibold text-sm">Phạm Khương Duy</div>
          </div>
          <div className="text-right leading-tight border-l border-white/20 pl-4">
            <div className="text-xs text-blue-200">Doanh thu ca</div>
            <div className="font-bold text-sm">864k</div>
          </div>
          <div className="text-right leading-tight border-l border-white/20 pl-4">
            <div className="text-xs text-blue-200">Hóa đơn</div>
            <div className="font-bold text-sm">3</div>
          </div>
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={() => navigate('/')}
            className="ml-2"
          >
            Thoát POS
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT DIVIDED INTO 3 COLUMNS */}
      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        
        {/* COLUMN 1: GIỎ HÀNG & TÌM KIẾM (Chiếm 55%) */}
        <div className="flex-[55] flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
          
          {/* Thanh tìm kiếm & Nút Scan */}
          <div className="p-3 border-b border-slate-100 bg-slate-50 flex gap-2">
            <div className="relative flex-1">
              <Input 
                size="large" 
                placeholder="Tên thuốc, mã SKU, barcode... [F2 focus]" 
                prefix={<SearchOutlined className="text-slate-400" />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="rounded-md"
              />
              {/* Dropdown kết quả tìm kiếm */}
              {filteredMedicines.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-md z-50">
                  {filteredMedicines.map(med => (
                    <div 
                      key={med._id} 
                      className="p-3 border-b last:border-b-0 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                      onClick={() => addToCart(med)}
                    >
                      <div>
                        <div className="font-bold text-slate-700">{med.name}</div>
                        <div className="text-xs text-slate-500">Tồn: {med.stock} • {med.code}</div>
                      </div>
                      <div className="font-bold text-blue-600">
                        {med.sellPrice?.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Tooltip title="Nhận dạng đơn thuốc từ ảnh (OCR)">
              <Button 
                size="large" 
                type="primary" 
                icon={<ScanOutlined />} 
                className="bg-blue-600 border-none px-6"
                onClick={() => setIsOCRModalOpen(true)}
              >
                Scan Đơn Khách
              </Button>
            </Tooltip>
          </div>

          {/* Vùng chứa giỏ hàng */}
          <div className="flex-1 overflow-auto bg-white p-2">
            {/* Cảnh báo an toàn dược (Sprint 3) */}
            {(safetyCheck.interactions.length > 0 || safetyCheck.dosageWarnings.length > 0) && (
              <div className="mb-3 px-2">
                {safetyCheck.interactions.map((warn, i) => (
                  <div key={`i-${i}`} className="bg-red-50 text-red-600 p-2 rounded text-xs border border-red-200 flex items-center gap-2 mb-1">
                    <span className="font-bold text-red-700">⚠️ KỴ THUỐC:</span>
                    {warn.drugPair.join(' + ')} - {warn.warning}
                  </div>
                ))}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingCartOutlined style={{ fontSize: 64, color: '#e2e8f0' }} className="mb-4" />
                <div className="text-lg font-medium text-slate-500">Giỏ hàng trống</div>
                <div className="text-sm">Tìm thuốc hoặc quét barcode / đơn OCR để thêm</div>
              </div>
            ) : (
              <Table 
                dataSource={cart} 
                columns={columns} 
                rowKey={(r) => r.medicine._id} 
                pagination={false}
                size="small"
                className="pos-table"
              />
            )}
          </div>

          {/* Nút Sơ đồ kho */}
          {cart.length > 0 && (
            <div className="p-3 border-t bg-slate-50 flex justify-between items-center">
              <span className="text-slate-500">
                Số lượng mặt hàng: <strong className="text-slate-700">{cart.length}</strong>
              </span>
              <Button 
                type="default" 
                icon={<EnvironmentOutlined />}
                className="border-blue-500 text-blue-700 font-medium hover:bg-blue-50"
                onClick={() => setIsMapDrawerOpen(true)}
              >
                Mở Sơ Đồ Đi Nhặt Thuốc
              </Button>
            </div>
          )}
        </div>

        {/* COLUMN 2: THANH TOÁN (Chiếm 25%) */}
        <div className="flex-[25] flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* TỔNG TIỀN BIG BLOCK */}
          <div className="text-white p-6 text-center shadow-inner flex flex-col justify-center items-center" style={{ backgroundColor: 'var(--color-primary)' }}>
            <div className="text-blue-100 font-medium tracking-wider mb-1">TỔNG TIỀN CẦN TRẢ</div>
            <div className="text-5xl font-black drop-shadow-md">
              {total.toLocaleString('vi-VN')}<span className="text-3xl ml-1">đ</span>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-auto space-y-5">
            {/* Khách hàng */}
            <div>
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase flex justify-between">
                <span>Khách hàng</span>
                <a className="text-blue-600 font-medium">+ Thêm mới</a>
              </div>
              <Input placeholder="Tìm tên, SĐT khách hàng..." prefix={<UserAddOutlined className="text-slate-400" />} />
            </div>

            {/* Phương thức thanh toán */}
            <div>
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Phương thức</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cash', label: 'Tiền mặt', icon: <WalletOutlined /> },
                  { id: 'card', label: 'Thẻ/ATM', icon: <CreditCardOutlined /> },
                  { id: 'transfer', label: 'Chuyển khoản', icon: <BankOutlined /> },
                  { id: 'debt', label: 'Ghi nợ', icon: <HistoryOutlined /> },
                ].map(method => (
                  <div 
                    key={method.id}
                    className={`border rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      paymentMethod === method.id ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className={paymentMethod === method.id ? 'text-blue-600 text-xl' : 'text-slate-400 text-xl'}>{method.icon}</div>
                    <div className="text-xs mt-1">{method.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thu tiền */}
            {paymentMethod === 'cash' && (
              <div>
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Khách đưa</div>
                <InputNumber 
                  className="w-full text-lg mb-2" 
                  size="large"
                  value={customerGiven}
                  onChange={setCustomerGiven}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(\.*)/g, '').replace(/,/g, '')}
                />
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {[50000, 100000, 200000, 500000].map(amt => (
                    <Button key={amt} size="small" className="text-xs" onClick={() => setCustomerGiven(amt)}>
                      {amt / 1000}k
                    </Button>
                  ))}
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded border">
                  <span className="text-slate-600 font-medium">Tiền thối:</span>
                  <span className="font-bold text-lg text-emerald-600">{change.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            )}

            {/* Giảm giá */}
            <div>
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase">% Giảm giá</div>
              <InputNumber className="w-full" placeholder="0" min={0} value={discount} onChange={setDiscount} />
            </div>
          </div>

          {/* Nút Thanh toán */}
          <div className="p-3 border-t bg-slate-50">
            <Button 
              type="primary" 
              size="large" 
              block 
              className="bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold shadow-lg"
              disabled={cart.length === 0}
              onClick={() => {
                message.success("Thanh toán thành công!");
                setCart([]);
                setCustomerGiven(0);
              }}
            >
              THANH TOÁN [F4]
            </Button>
          </div>
        </div>

        {/* COLUMN 3: HÓA ĐƠN GẦN ĐÂY (Chiếm 20%) */}
        <div className="flex-[20] bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-3 border-b bg-white">
            <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <HistoryOutlined />
              Hóa đơn trong ca
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {[
              { id: 'INV-20260315-003', name: 'Khách lẻ', total: 460000, time: '10:42', status: 'TM' },
              { id: 'INV-20260315-002', name: 'Trần Thị Mai', total: 206000, time: '10:10', status: 'TM' },
              { id: 'INV-20260315-001', name: 'Khách lẻ', total: 198000, time: '08:51', status: 'TM' },
            ].map(inv => (
              <div key={inv.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm hover:border-blue-300 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-mono text-xs text-blue-700 font-bold">{inv.id}</div>
                  <Tag color="success" className="m-0 text-[10px]">{inv.status}</Tag>
                </div>
                <div className="text-xs text-slate-500 mb-1">{inv.name}</div>
                <div className="flex justify-between items-end">
                  <div className="text-[10px] text-slate-400">{inv.time}</div>
                  <div className="font-bold text-sm">{inv.total.toLocaleString('vi-VN')}k</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL OCR SCANNER */}
      <Modal
        title={null}
        open={isOCRModalOpen}
        onCancel={() => setIsOCRModalOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
        className="ocr-modal"
      >
        <div className="pt-6">
          <div className="mb-4 flex items-center gap-2">
            <ScanOutlined className="text-3xl text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-slate-800 m-0">Quét Đơn Thuốc Bằng AI</h2>
              <p className="text-slate-500 text-sm m-0">Hệ thống sẽ tự động đọc chữ trên ảnh đơn thuốc và tìm kiếm trong kho.</p>
            </div>
          </div>
          <OCRScanner onScanComplete={handleOCRComplete} allMedicines={medicines} />
        </div>
      </Modal>

      {/* DRAWER SƠ ĐỒ KHO */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <EnvironmentOutlined className="text-blue-600 text-xl" />
            <span>Bản Đồ Nhặt Thuốc Thông Minh</span>
          </div>
        }
        placement="right"
        width={1000}
        onClose={() => setIsMapDrawerOpen(false)}
        open={isMapDrawerOpen}
        extra={
          <Button type="primary" onClick={() => setIsMapDrawerOpen(false)} className="bg-blue-600">
            Đã nhặt xong
          </Button>
        }
      >
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4 text-amber-800 flex justify-between items-center">
          <div>
            <strong>Hướng dẫn:</strong> Đi theo lộ trình các ô sáng nhấp nháy trên bản đồ để lấy đủ {cart.length} món.
          </div>
        </div>
        <PharmacyMap 
          allMedicines={medicines} 
          highlightMedicines={cart}
          onCellClick={() => {}}
        />
      </Drawer>

      <style>{`
        .pos-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          padding: 8px 12px;
        }
      `}</style>
    </div>
  );
};

export default POSPage;
