import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Input, Button, Table, InputNumber, Modal, Drawer, message, Tooltip, Tag, Checkbox, Form, Select } from 'antd';
import { 
  SearchOutlined, ScanOutlined, UserAddOutlined, 
  DeleteOutlined, ShoppingCartOutlined, LogoutOutlined, 
  CreditCardOutlined, BankOutlined, WalletOutlined,
  HistoryOutlined, EnvironmentOutlined, PlusOutlined,
  PrinterOutlined, FileSearchOutlined
} from '@ant-design/icons';
import { Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import useAuthStore from '../../stores/useAuthStore';

import OCRScanner from '../prescriptions/components/OCRScanner';
import PharmacyMap from '../prescriptions/components/PharmacyMap';
import ReceiptPrint from './components/ReceiptPrint';
import { medicineAPI, saleAPI, customerAPI, prescriptionAPI } from '../../api/api';
import { checkPrescriptionSafety } from '../../utils/drugSafety';

const POSPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const searchRef = useRef(null);
  const [time, setTime] = useState(dayjs());
  const [medicines, setMedicines] = useState([]);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1: TREO ĐƠN — Quản lý nhiều đơn hàng cùng lúc
  // ═══════════════════════════════════════════════════════════════════
  const [orders, setOrders] = useState([
    { id: 1, name: 'Đơn 1', cart: [], discount: 0, customerGiven: null, paymentMethod: 'cash', customer: null }
  ]);
  const [activeOrderIdx, setActiveOrderIdx] = useState(0);
  const activeOrder = orders[activeOrderIdx] || orders[0];

  // Hàm cập nhật đơn hàng đang active
  const updateActiveOrder = (updates) => {
    setOrders(prev => prev.map((o, i) => i === activeOrderIdx ? { ...o, ...updates } : o));
  };

  // States cho OCR & Map
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [isMapDrawerOpen, setIsMapDrawerOpen] = useState(false);

  // Search state
  const [searchText, setSearchText] = useState('');

  // Phase 2: Hóa đơn trong ca (live data)
  const [todayInvoices, setTodayInvoices] = useState([]);
  const [autoPrint, setAutoPrint] = useState(true);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState(null);

  // States cho Khách hàng
  const [customers, setCustomers] = useState([]);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customerForm] = Form.useForm();
  
  // State lịch sử mua hàng của khách hàng
  const [isCustomerHistoryOpen, setIsCustomerHistoryOpen] = useState(false);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchCustomerHistory = async (customerId) => {
    if (!customerId) return;
    setIsHistoryLoading(true);
    setIsCustomerHistoryOpen(true);
    try {
      const res = await saleAPI.getAll({ customer: customerId, limit: 100 });
      setCustomerHistory(res.data?.sales || res.data?.data || res.data || []);
    } catch {
      message.error('Không thể tải lịch sử hóa đơn của khách hàng này');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll({ limit: 500 });
      const data = res.data?.customers || res.data || [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Không thể tải khách hàng:', error);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await medicineAPI.getAll({ limit: 5000 });
      const meds = res.data?.medicines || res.data?.data || res.data || [];
      setMedicines(Array.isArray(meds) ? meds : []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTodayInvoices = async () => {
    try {
      const today = dayjs().startOf('day').toISOString();
      const res = await saleAPI.getAll({ startDate: today, limit: 50 });
      const sales = res.data?.sales || res.data || [];
      setTodayInvoices(Array.isArray(sales) ? sales : []);
    } catch (error) {
      console.error('Không thể tải hóa đơn:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // TÍNH TOÁN TIỀN (có Giảm giá từng dòng + Giảm giá đơn)
  // ═══════════════════════════════════════════════════════════════════
  const cart = activeOrder?.cart || [];
  const subTotal = cart.reduce((sum, item) => {
    return sum + (item.medicine.sellPrice * item.quantity * (1 - (item.discount || 0) / 100));
  }, 0);
  const orderDiscount = activeOrder?.discount || 0;
  const total = Math.max(0, subTotal - orderDiscount);
  const customerGiven = activeOrder?.customerGiven;
  const change = Math.max(0, (customerGiven || 0) - total);
  const paymentMethod = activeOrder?.paymentMethod || 'cash';

  // Doanh thu ca (Phase 2)
  const totalRevenue = todayInvoices.reduce((sum, inv) => {
    if (inv.status !== 'cancelled') return sum + (inv.totalAmount || 0);
    return sum;
  }, 0);

  // ═══════════════════════════════════════════════════════════════════
  // TREO ĐƠN: Thêm / Xóa Tab
  // ═══════════════════════════════════════════════════════════════════
  const addNewOrder = () => {
    const newId = Date.now();
    const newOrders = [...orders, { id: newId, name: `Đơn ${orders.length + 1}`, cart: [], discount: 0, customerGiven: null, paymentMethod: 'cash', customer: null }];
    setOrders(newOrders);
    setActiveOrderIdx(newOrders.length - 1);
  };

  const removeOrder = (idx, e) => {
    e.stopPropagation();
    if (orders.length === 1) {
      message.warning('Không thể xóa đơn hàng cuối cùng!');
      return;
    }
    const newOrders = orders.filter((_, i) => i !== idx);
    setOrders(newOrders);
    if (activeOrderIdx >= idx && activeOrderIdx > 0) {
      setActiveOrderIdx(prev => prev - 1);
    } else if (activeOrderIdx >= newOrders.length) {
      setActiveOrderIdx(newOrders.length - 1);
    }
  };

  // Thêm thuốc vào giỏ
  const addToCart = (med, qty = 1) => {
    const currentCart = activeOrder.cart;
    const existing = currentCart.find(item => item.medicine._id === med._id);
    if (existing) {
      updateActiveOrder({
        cart: currentCart.map(item =>
          item.medicine._id === med._id ? { ...item, quantity: item.quantity + qty } : item
        )
      });
    } else {
      updateActiveOrder({
        cart: [{ medicine: med, quantity: qty, discount: 0 }, ...currentCart]
      });
    }
    setSearchText('');
    searchRef.current?.focus();
  };

  // OCR Scan
  const handleOCRComplete = async ({ prescriptionInfo, matchedMedicines, imageBase64 }) => {
    try {
      // Tìm khách hàng có sẵn dựa trên tên bệnh nhân
      let matchedCustomer = null;
      if (prescriptionInfo.patientName) {
        matchedCustomer = customers.find(c => 
           c.name.toLowerCase().includes(prescriptionInfo.patientName.toLowerCase()) || 
           prescriptionInfo.patientName.toLowerCase().includes(c.name.toLowerCase())
        );
      }

      const customerId = matchedCustomer ? matchedCustomer._id : (activeOrder.customer || undefined);

      const res = await prescriptionAPI.create({
         ...prescriptionInfo,
         patientName: prescriptionInfo.patientName || 'Khách vãng lai',
         customer: customerId,
         imageUrl: imageBase64,
         items: matchedMedicines.filter(m => !m.medicine.isExternal).map(m => ({
            medicine: m.medicine._id,
            quantity: m.quantity || 1,
            dosage: m.dosage || 'Theo chỉ định',
            frequency: 'Theo chỉ định'
         }))
      });
      const newPrescriptionId = res.data._id;
      
      const currentCart = [...activeOrder.cart];
      matchedMedicines.forEach(res => {
        const existingIdx = currentCart.findIndex(item => item.medicine._id === res.medicine._id);
        if (existingIdx >= 0) {
           currentCart[existingIdx].quantity += (res.quantity || 1);
        } else {
           currentCart.unshift({ medicine: res.medicine, quantity: res.quantity || 1, discount: 0 });
        }
      });
      
      updateActiveOrder({ 
        cart: currentCart, 
        prescription: newPrescriptionId,
        customer: customerId 
      });
      setIsOCRModalOpen(false);
      
      if (matchedCustomer) {
        message.success(`Đã tự động chọn khách hàng: ${matchedCustomer.name}`);
      }
      message.success(`Đã lưu đơn thuốc và đưa ${matchedMedicines.length} loại thuốc vào giỏ hàng!`);
    } catch(err) {
      console.error(err);
      message.error('Lỗi khi lưu thông tin đơn thuốc');
    }
  };

  // Lọc tìm kiếm
  const filteredMedicines = useMemo(() => {
    if (!searchText) return [];
    return medicines.filter(m =>
      m.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (m.code && m.code.toLowerCase().includes(searchText.toLowerCase()))
    ).slice(0, 8);
  }, [searchText, medicines]);

  // Kiểm tra an toàn dược
  const safetyCheck = useMemo(() => checkPrescriptionSafety(cart), [cart]);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2: THANH TOÁN THẬT — Gọi POST /api/sales
  // ═══════════════════════════════════════════════════════════════════
  const handleCheckout = async () => {
    if (cart.length === 0) {
      message.warning('Giỏ hàng trống!');
      return;
    }
    
    // Kiểm tra xem giỏ hàng có chứa thuốc ngoài danh mục (isExternal) không
    const hasExternalMedicines = cart.some(item => item.medicine.isExternal);
    if (hasExternalMedicines) {
      message.error('Giỏ hàng chứa thuốc không nằm trong danh mục hệ thống. Vui lòng xóa các thuốc này (màu đỏ) trước khi thanh toán!');
      return;
    }

    try {
      const payload = {
        items: cart.map(item => ({
          medicine: item.medicine._id,
          quantity: item.quantity,
          discount: item.discount || 0,
        })),
        customer: activeOrder.customer || undefined,
        prescription: activeOrder.prescription || undefined,
        discount: orderDiscount,
        paymentMethod: paymentMethod,
        amountPaid: paymentMethod === 'cash' ? (customerGiven || 0) : total,
      };
      const res = await saleAPI.create(payload);
      message.success(`✅ Thanh toán thành công! Mã HĐ: ${res.data?.code || 'OK'}`);

      // Reset đơn hiện tại
      updateActiveOrder({ cart: [], discount: 0, customerGiven: null, prescription: null, customer: null });

      // Refresh data
      fetchTodayInvoices();
      fetchMedicines();
      
      // Auto print preview
      if (autoPrint) {
        setSelectedInvoiceToPrint(res.data);
        setIsReceiptModalOpen(true);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Lỗi khi thanh toán!';
      message.error(errMsg);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1: PHÍM TẮT TOÀN CỤC
  // F2 = focus search, F9 = thanh toán, F10 = toggle in, ESC = clear
  // ═══════════════════════════════════════════════════════════════════
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'F9') {
        e.preventDefault();
        handleCheckout();
      }
      if (e.key === 'F10') {
        e.preventDefault();
        setAutoPrint(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchText('');
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCheckout]);

  // Clock & Data fetching
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMedicines();
    fetchTodayInvoices();
    fetchCustomers();
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateCustomer = async () => {
    try {
      const values = await customerForm.validateFields();
      const res = await customerAPI.create(values);
      message.success('Thêm khách hàng thành công!');
      setIsAddCustomerOpen(false);
      customerForm.resetFields();
      
      const newCustomer = res.data;
      setCustomers(prev => [...prev, newCustomer]);
      updateActiveOrder({ customer: newCustomer._id });
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (!error.errorFields) {
         message.error('Lỗi khi thêm khách hàng');
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1: CỘT BẢNG GIỎ HÀNG (Nâng cấp: Batch/Exp, Rx, Discount)
  // ═══════════════════════════════════════════════════════════════════
  const columns = [
    {
      title: 'STT',
      width: 42,
      align: 'center',
      render: (_, __, index) => <span className="text-slate-400 text-xs">{index + 1}</span>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'medicine',
      render: (med) => {
        // Phase 3: Cảnh báo cận date (< 90 ngày)
        const daysLeft = med.expiryDate ? dayjs(med.expiryDate).diff(dayjs(), 'day') : 999;
        const isExpiringSoon = daysLeft <= 90 && daysLeft > 0;
        const isExpired = daysLeft <= 0 && med.expiryDate;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 text-[13px]">{med.name}</span>
              {med.requiresPrescription && (
                <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none shrink-0">Rx</span>
              )}
            </div>
            {med.isExternal ? (
              <div className="text-[11px] mt-0.5 font-bold text-red-500 bg-red-50 px-1 py-0.5 rounded w-max border border-red-200">
                Chưa có tại cửa hàng
              </div>
            ) : (
              <div className="text-[11px] mt-0.5 font-mono flex items-center gap-1.5">
                <span className="text-slate-400">Batch: {med.code || '—'}</span>
                <span className="text-slate-300">·</span>
                <span className={isExpired ? 'text-red-600 font-bold' : isExpiringSoon ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                  {isExpired ? '❌ HẾT HẠN' : isExpiringSoon ? `⚠ Exp: ${dayjs(med.expiryDate).format('MM/YYYY')}` : `Exp: ${med.expiryDate ? dayjs(med.expiryDate).format('MM/YYYY') : '—'}`}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'ĐVT',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <span className="text-slate-500 text-xs">
          {typeof record.medicine.unit === 'object' ? record.medicine.unit?.name : record.medicine.unit}
        </span>
      ),
    },
    {
      title: 'Đơn giá',
      width: 90,
      align: 'right',
      render: (_, record) => (
        <span className="font-medium text-slate-600 text-sm">{record.medicine.sellPrice?.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      title: 'SL',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.medicine.stock || 9999}
          value={record.quantity}
          size="small"
          className="w-16"
          onChange={(val) => {
            if (val) updateActiveOrder({ cart: cart.map(i => i.medicine._id === record.medicine._id ? { ...i, quantity: val } : i) });
          }}
        />
      ),
    },
    {
      title: 'Giảm (%)',
      width: 75,
      align: 'center',
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discount || 0}
          size="small"
          className="w-14"
          onChange={(val) => {
            updateActiveOrder({ cart: cart.map(i => i.medicine._id === record.medicine._id ? { ...i, discount: val || 0 } : i) });
          }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      width: 105,
      align: 'right',
      render: (_, record) => {
        const itemTotal = record.medicine.sellPrice * record.quantity * (1 - (record.discount || 0) / 100);
        return <span className="font-bold text-blue-600 text-sm">{itemTotal.toLocaleString('vi-VN')}</span>;
      },
    },
    {
      title: '',
      width: 42,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={() => updateActiveOrder({ cart: cart.filter(i => i.medicine._id !== record.medicine._id) })}
        />
      ),
    },
  ];

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">

        {/* HEADER */}
        <header className="h-14 text-white flex justify-between items-center px-5 flex-shrink-0 shadow-md z-10" style={{ backgroundColor: 'var(--color-sidebar-bg)' }}>
          <div className="flex items-center gap-3">
            <Pill size={22} className="text-blue-400" />
            <span className="text-lg font-bold tracking-wide">Nhà Thuốc Sức Khỏe Vàng</span>
            <div className="bg-slate-800/60 px-3 py-1 rounded-full ml-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-lg font-mono text-slate-200 font-medium">{time.format('HH:mm:ss')}</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right leading-tight">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Thu ngân</div>
              <div className="font-semibold text-sm">{user?.name || 'Thu ngân'}</div>
            </div>
            <div className="text-right leading-tight border-l border-slate-700 pl-5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Doanh thu ca</div>
              <div className="font-bold text-sm text-emerald-400">{totalRevenue > 0 ? `${(totalRevenue / 1000).toFixed(0)}k` : '0'}</div>
            </div>
            <div className="text-right leading-tight border-l border-slate-700 pl-5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Hóa đơn</div>
              <div className="font-bold text-sm">{todayInvoices.filter(i => i.status !== 'cancelled').length}</div>
            </div>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={() => navigate('/')} className="ml-3 font-semibold shadow-lg">
              Thoát POS
            </Button>
          </div>
        </header>

        {/* BODY: 3 cột */}
        <div className="flex flex-1 overflow-hidden p-2 gap-2">

          {/* ═══ CỘT 1: GIỎ HÀNG (65%) ═══ */}
          <div className="flex-[65] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

            {/* ═══ KHU VỰC TÌM KIẾM ═══ */}
            <div className="border-b border-slate-200 bg-white">
              <div className="px-3 pt-3 pb-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 text-blue-600 font-medium">
                 <FileSearchOutlined />
                 <span>Bán thuốc từ dữ liệu kho</span>
              </div>

              <div className="p-3 flex gap-2 bg-slate-50">
                  <div className="relative flex-1">
                    <Input
                      ref={searchRef}
                      size="large"
                      placeholder="Tên thuốc, mã SKU, barcode... [F2]"
                      prefix={<SearchOutlined className="text-slate-400" />}
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      className="rounded-lg"
                      allowClear
                    />
                    {filteredMedicines.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-2xl rounded-lg z-50 overflow-hidden">
                        {filteredMedicines.map(med => (
                          <div
                            key={med._id}
                            className="px-4 py-3 border-b last:border-b-0 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                            onClick={() => addToCart(med)}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800">{med.name}</span>
                                {med.requiresPrescription && (
                                  <span className="bg-red-600 text-white text-[8px] font-black px-1 py-0.5 rounded leading-none">Rx</span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Tồn: <span className={med.stock > 0 ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>{med.stock}</span> · {med.code}
                                {med.expiryDate && <span className="ml-2 text-slate-400">· Exp: {dayjs(med.expiryDate).format('MM/YYYY')}</span>}
                              </div>
                            </div>
                            <div className="font-bold text-blue-600 text-sm">{med.sellPrice?.toLocaleString('vi-VN')}đ</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Tooltip title="Quét đơn thuốc bằng AI (OCR)">
                    <Button size="large" type="primary" icon={<ScanOutlined />} className="bg-blue-600 border-none px-5 rounded-lg font-medium shadow-md" onClick={() => setIsOCRModalOpen(true)}>
                      Scan Đơn Khách
                    </Button>
                  </Tooltip>
              </div>
              {/* ═══ PHASE 1: TAB TREO ĐƠN ═══ */}
              <div className="flex items-end px-3 gap-1 -mb-[1px]">
                {orders.map((order, idx) => (
                  <div
                    key={order.id}
                    onClick={() => setActiveOrderIdx(idx)}
                    className={`px-4 py-1.5 rounded-t-lg cursor-pointer text-sm font-medium flex items-center gap-2 transition-colors border border-b-0 ${
                      idx === activeOrderIdx
                        ? 'bg-white text-blue-700 border-blue-200 shadow-sm'
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {order.name}
                    {order.cart.length > 0 && (
                      <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 rounded-full">{order.cart.length}</span>
                    )}
                    {orders.length > 1 && (
                      <span className="text-slate-400 hover:text-red-500 ml-0.5 text-base leading-none" onClick={(e) => removeOrder(idx, e)}>×</span>
                    )}
                  </div>
                ))}
                <div
                  onClick={addNewOrder}
                  className="px-3 py-1.5 rounded-t-lg cursor-pointer bg-slate-100 border border-b-0 border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Thêm đơn mới (Treo đơn)"
                >
                  <PlusOutlined className="text-xs" />
                </div>
              </div>
            </div>

            {/* Bảng giỏ hàng */}
            <div className="flex-1 overflow-auto pos-scrollbar">
              {/* Cảnh báo kỵ thuốc */}
              {(safetyCheck.interactions.length > 0 || safetyCheck.dosageWarnings.length > 0) && (
                <div className="m-3">
                  {safetyCheck.interactions.map((warn, i) => (
                    <div key={`i-${i}`} className="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs border border-red-200 flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-red-700">⚠️ KỴ THUỐC:</span>
                      {warn.drugPair.join(' + ')} — {warn.warning}
                    </div>
                  ))}
                  {safetyCheck.dosageWarnings.map((warn, i) => (
                    <div key={`d-${i}`} className="bg-amber-50 text-amber-700 p-2.5 rounded-lg text-xs border border-amber-200 flex items-center gap-2 mb-1.5">
                      <span className="font-bold">⚠️ LIỀU DÙNG:</span>
                      {warn.medicine}: {warn.qtyPerDay} {warn.warning}
                    </div>
                  ))}
                </div>
              )}

              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                  <ShoppingCartOutlined style={{ fontSize: 56, color: '#e2e8f0' }} className="mb-3" />
                  <div className="text-base font-medium text-slate-500">Giỏ hàng trống</div>
                  <div className="text-sm mt-1">
                    Gõ <kbd className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-xs font-mono mx-1">F2</kbd> để tìm thuốc hoặc quét đơn OCR
                  </div>
                </div>
              ) : (
                <Table
                  dataSource={cart}
                  columns={columns}
                  rowKey={(r) => r.medicine._id}
                  pagination={false}
                  size="small"
                  className="pos-table"
                  rowClassName={(record) => {
                    if (!record.medicine.expiryDate) return '';
                    const daysLeft = dayjs(record.medicine.expiryDate).diff(dayjs(), 'day');
                    if (daysLeft <= 0) return 'pos-row-expired';
                    if (daysLeft <= 90) return 'pos-row-expiring';
                    return '';
                  }}
                />
              )}
            </div>

            {/* Footer giỏ hàng */}
            {cart.length > 0 && (
              <div className="p-3 border-t bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 text-sm">
                  Mặt hàng: <strong className="text-slate-700">{cart.length}</strong> ·
                  Tổng SL: <strong className="text-slate-700">{cart.reduce((s, i) => s + i.quantity, 0)}</strong>
                </span>
                <Button type="default" icon={<EnvironmentOutlined />} className="border-blue-400 text-blue-600 font-medium hover:bg-blue-50 rounded-lg" onClick={() => setIsMapDrawerOpen(true)}>
                  Sơ Đồ Nhặt Thuốc
                </Button>
              </div>
            )}
          </div>

          {/* ═══ CỘT 2: THANH TOÁN (35%) ═══ */}
          <div className="flex-[35] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tổng tiền */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.12)_0%,transparent_60%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="text-blue-200 font-medium tracking-wider mb-1 text-xs uppercase">Tổng tiền cần trả</div>
                <div className="text-4xl font-black drop-shadow-md">
                  {total.toLocaleString('vi-VN')}<span className="text-2xl ml-1">đ</span>
                </div>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto pos-scrollbar space-y-4">
              {/* Khách hàng */}
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1.5 uppercase flex justify-between items-center">
                  <span>Khách hàng</span>
                  <div className="flex gap-3">
                    {activeOrder.customer && (
                      <a className="text-emerald-600 font-medium cursor-pointer hover:underline flex items-center gap-1" onClick={() => fetchCustomerHistory(activeOrder.customer)}>
                        <HistoryOutlined /> Xem lịch sử
                      </a>
                    )}
                    <a className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setIsAddCustomerOpen(true)}>+ Thêm mới</a>
                  </div>
                </div>
                <Select 
                  showSearch
                  allowClear
                  placeholder="Tìm tên, SĐT khách hàng..." 
                  className="w-full"
                  size="large"
                  value={activeOrder.customer}
                  onChange={(val) => updateActiveOrder({ customer: val })}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={customers.map(c => ({
                    value: c._id,
                    label: `${c.name} - ${c.phone}`
                  }))}
                />
              </div>

              {/* Phương thức thanh toán */}
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Phương thức</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cash', label: 'Tiền mặt', icon: <WalletOutlined /> },
                    { id: 'card', label: 'Thẻ/ATM', icon: <CreditCardOutlined /> },
                    { id: 'transfer', label: 'Chuyển khoản', icon: <BankOutlined /> },
                    { id: 'debt', label: 'Ghi nợ', icon: <HistoryOutlined /> },
                  ].map(method => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-2.5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                      }`}
                      onClick={() => updateActiveOrder({ paymentMethod: method.id })}
                    >
                      <div className={`text-xl mb-0.5 ${paymentMethod === method.id ? 'text-blue-600' : 'text-slate-400'}`}>{method.icon}</div>
                      <div className="text-xs">{method.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Khách đưa (chỉ khi Tiền mặt) */}
              {paymentMethod === 'cash' && (
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Khách đưa</div>
                  <InputNumber
                    className="w-full text-lg mb-2 rounded-lg"
                    size="large"
                    value={customerGiven}
                    onChange={(val) => updateActiveOrder({ customerGiven: val })}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value ? value.toString().replace(/\$\s?|(\.*)/g, '').replace(/,/g, '') : ''}
                    addonAfter="đ"
                    placeholder="Nhập số tiền..."
                  />
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {[50000, 100000, 200000, 500000].map(amt => (
                      <Button key={amt} size="small" className="text-xs rounded-lg border-slate-200" onClick={() => updateActiveOrder({ customerGiven: amt })}>
                        {amt / 1000}k
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                    <span className="text-slate-600 font-medium text-sm">Tiền thừa:</span>
                    <span className="font-black text-lg text-emerald-600">{change.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              )}

              {/* Giảm giá đơn */}
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Giảm giá đơn (VNĐ)</div>
                <InputNumber
                  className="w-full rounded-lg"
                  placeholder="0"
                  min={0}
                  value={orderDiscount}
                  onChange={(val) => updateActiveOrder({ discount: val || 0 })}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/,/g, '')}
                />
              </div>
            </div>

            {/* Footer thanh toán */}
            <div className="p-3 border-t bg-slate-50">
              <div className="mb-2.5 pl-1">
                <Checkbox checked={autoPrint} onChange={(e) => setAutoPrint(e.target.checked)} className="text-sm text-slate-600">
                  In hóa đơn tự động <kbd className="bg-slate-200 text-[10px] px-1.5 py-0.5 rounded ml-1 text-slate-500 font-mono">F10</kbd>
                </Checkbox>
              </div>
              <Button
                type="primary"
                size="large"
                block
                className="bg-blue-600 hover:bg-blue-700 h-14 text-lg font-black shadow-lg rounded-xl border-none tracking-wide"
                disabled={cart.length === 0}
                onClick={handleCheckout}
              >
                THANH TOÁN <kbd className="bg-white/20 px-2 py-0.5 rounded ml-2 text-sm font-mono">F9</kbd>
              </Button>
            </div>
          </div>

          {/* ═══ CỘT 3: HÓA ĐƠN TRONG CA (Phase 2 — Live) ═══ */}
          <div className="w-56 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col flex-shrink-0">
            <div className="p-3 border-b bg-slate-50">
              <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <HistoryOutlined /> Hóa đơn trong ca
              </div>
            </div>
            <div className="flex-1 overflow-auto pos-scrollbar p-2 space-y-1.5">
              {todayInvoices.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-8">Chưa có hóa đơn nào</div>
              ) : (
                todayInvoices.map(inv => (
                  <div 
                    key={inv._id} 
                    className={`p-2.5 rounded-lg border shadow-sm cursor-pointer transition-colors ${
                      inv.status === 'cancelled' ? 'bg-red-50 border-red-200 opacity-60' : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                    onClick={() => {
                      setSelectedInvoiceToPrint(inv);
                      setIsReceiptModalOpen(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-mono text-[10px] text-blue-700 font-bold">{inv.code}</div>
                      <Tag color={inv.status === 'cancelled' ? 'error' : 'success'} className="m-0 text-[9px] leading-none px-1.5">
                        {inv.status === 'cancelled' ? 'HỦY' : inv.paymentMethod === 'cash' ? 'TM' : 'CK'}
                      </Tag>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <div className="text-[10px] text-slate-400">{dayjs(inv.createdAt).format('HH:mm')}</div>
                      <div className="font-bold text-sm text-slate-800">{(inv.totalAmount || 0).toLocaleString('vi-VN')}đ</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      {/* ═══ MODAL OCR SCANNER ═══ */}
      <Modal title={null} open={isOCRModalOpen} onCancel={() => setIsOCRModalOpen(false)} footer={null} width={900} destroyOnClose>
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

      {/* ═══ DRAWER SƠ ĐỒ KHO ═══ */}
      <Drawer
        title={<div className="flex items-center gap-2"><EnvironmentOutlined className="text-blue-600 text-xl" /><span>Bản Đồ Nhặt Thuốc Thông Minh</span></div>}
        placement="right"
        width={1000}
        onClose={() => setIsMapDrawerOpen(false)}
        open={isMapDrawerOpen}
        extra={<Button type="primary" onClick={() => setIsMapDrawerOpen(false)} className="bg-blue-600">Đã nhặt xong</Button>}
      >
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4 text-amber-800">
          <strong>Hướng dẫn:</strong> Đi theo lộ trình các ô sáng nhấp nháy trên bản đồ để lấy đủ {cart.length} món.
        </div>
        <PharmacyMap allMedicines={medicines} highlightMedicines={cart} onCellClick={() => {}} />
      </Drawer>

      {/* ═══ MODAL XEM TRƯỚC HÓA ĐƠN IN ═══ */}
      <Modal 
        title={<div className="flex items-center gap-2"><PrinterOutlined /><span>Bản xem trước Hóa đơn In nhiệt (80mm)</span></div>}
        open={isReceiptModalOpen} 
        onCancel={() => setIsReceiptModalOpen(false)} 
        footer={[
          <Button key="close" onClick={() => setIsReceiptModalOpen(false)}>Đóng</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => {
             message.success('Đã gửi lệnh in đến máy in nhiệt!');
             setIsReceiptModalOpen(false);
          }}>In ngay</Button>
        ]}
        width={360}
        styles={{ body: { background: '#f1f5f9', padding: '20px 0', display: 'flex', justifyContent: 'center' } }}
      >
        <div className="shadow-lg drop-shadow-xl print-container" style={{ transform: 'scale(1.05)' }}>
           <ReceiptPrint invoice={selectedInvoiceToPrint} />
        </div>
      </Modal>

      {/* ═══ MODAL THÊM KHÁCH HÀNG ═══ */}
      <Modal
        title="Thêm Khách Hàng Mới"
        open={isAddCustomerOpen}
        onCancel={() => {
          setIsAddCustomerOpen(false);
          customerForm.resetFields();
        }}
        onOk={handleCreateCustomer}
        okText="Lưu Khách Hàng"
        cancelText="Hủy"
      >
        <Form form={customerForm} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Tên khách hàng" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính">
            <Select placeholder="Chọn giới tính">
              <Select.Option value="male">Nam</Select.Option>
              <Select.Option value="female">Nữ</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ═══ MODAL LỊCH SỬ MUA HÀNG KHÁCH HÀNG ═══ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <HistoryOutlined className="text-blue-600 text-xl" />
            <span>Lịch sử mua hàng của khách</span>
          </div>
        }
        open={isCustomerHistoryOpen}
        onCancel={() => setIsCustomerHistoryOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Table 
          dataSource={customerHistory} 
          rowKey="_id"
          loading={isHistoryLoading}
          pagination={{ pageSize: 5 }}
          className="mt-4"
          columns={[
            { title: 'Mã HĐ', dataIndex: 'code', key: 'code', render: (text) => <span className="font-mono text-blue-600 font-bold">{text}</span> },
            { title: 'Ngày mua', dataIndex: 'createdAt', key: 'createdAt', render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm') },
            { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (amt) => <span className="font-bold text-emerald-600">{(amt || 0).toLocaleString('vi-VN')}đ</span> },
            { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'cancelled' ? 'error' : 'success'}>{status === 'cancelled' ? 'HỦY' : 'HOÀN THÀNH'}</Tag> },
            { 
              title: 'Thao tác', 
              key: 'action', 
              align: 'center',
              render: (_, record) => (
                <Button 
                  size="small" 
                  type="primary"
                  ghost
                  icon={<PrinterOutlined />} 
                  onClick={() => { 
                    setSelectedInvoiceToPrint(record); 
                    setIsReceiptModalOpen(true); 
                  }}
                >
                  Xem / In
                </Button>
              ) 
            }
          ]}
        />
      </Modal>

      {/* ═══ CSS NỘI TUYẾN ═══ */}
      <style>{`
        /* Header bảng giỏ hàng — nền Dark Navy */
        .pos-table .ant-table-thead > tr > th {
          background: #0f172a;
          color: #e2e8f0;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          padding: 10px 8px;
          border-right: 1px solid rgba(255,255,255,0.08);
          text-align: center;
        }
        .pos-table .ant-table-thead > tr > th:last-child { border-right: none; }

        /* Rows */
        .pos-table .ant-table-tbody > tr > td {
          padding: 10px 8px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        .pos-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }

        /* Phase 3: Hàng cận date — nền vàng nhạt */
        .pos-table .ant-table-tbody > tr.pos-row-expiring > td {
          background-color: #fffbeb !important;
        }
        .pos-table .ant-table-tbody > tr.pos-row-expiring:hover > td {
          background-color: #fef3c7 !important;
        }

        /* Hàng hết hạn — nền đỏ nhạt */
        .pos-table .ant-table-tbody > tr.pos-row-expired > td {
          background-color: #fef2f2 !important;
        }
        .pos-table .ant-table-tbody > tr.pos-row-expired:hover > td {
          background-color: #fee2e2 !important;
        }

        /* Custom Scrollbar */
        .pos-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .pos-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .pos-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .pos-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default POSPage;
