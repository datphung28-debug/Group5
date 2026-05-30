import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Input, Button, Table, InputNumber, Modal, Drawer, message, Tooltip, Tag, Checkbox, Form, Select, Alert, Tabs, QRCode } from 'antd';
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
import AddCustomerModal from './components/AddCustomerModal';
import CustomerHistoryModal from './components/CustomerHistoryModal';
import { medicineAPI, saleAPI, customerAPI, prescriptionAPI } from '../../api/api';
import { checkPrescriptionSafety } from '../../utils/drugSafety';
import { buildSalePayload, getCartStockIssue, getCashPaymentIssue } from './posSaleUtils';

// ═══════════════════════════════════════════════════════════════════
// BỘ ĐỆM CACHE NGOẠI TUYẾN & TỐI ƯU HÓA TẢI DỮ LIỆU
// ═══════════════════════════════════════════════════════════════════
let medicinesCache = null;
let customersCache = null;
let prescriptionsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

const POSPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const searchRef = useRef(null);
  const [time, setTime] = useState(dayjs());
  const [medicines, setMedicines] = useState([]);
  const [medicineError, setMedicineError] = useState('');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1: TREO ĐƠN — Quản lý nhiều đơn hàng cùng lúc
  // ═══════════════════════════════════════════════════════════════════
  const [orders, setOrders] = useState([
    { id: 1, name: 'Đơn 1', cart: [], discount: 0, customerGiven: null, paymentMethod: 'cash', customer: null }
  ]);
  const [activeOrderIdx, setActiveOrderIdx] = useState(0);
  const activeOrder = orders[activeOrderIdx] || orders[0];

  // Hàm cập nhật đơn hàng đang active
  const updateActiveOrder = useCallback((updates) => {
    setOrders(prev => prev.map((o, i) => i === activeOrderIdx ? { ...o, ...updates } : o));
  }, [activeOrderIdx]);

  // States cho OCR & Map
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [isMapDrawerOpen, setIsMapDrawerOpen] = useState(false);

  // Search state & Debounce
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 200);

    return () => clearTimeout(handler);
  }, [searchText]);

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

  const fetchCustomerHistory = useCallback(async (customerId) => {
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
  }, []);

  const fetchCustomers = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && customersCache && (now - cacheTimestamp < CACHE_DURATION)) {
      setCustomers(customersCache);
      return;
    }
    try {
      const res = await customerAPI.getAll({ limit: 500 });
      const data = res.data?.customers || res.data || [];
      const customersArray = Array.isArray(data) ? data : [];
      setCustomers(customersArray);
      customersCache = customersArray;
      cacheTimestamp = now;
    } catch (error) {
      console.error('Không thể tải khách hàng:', error);
    }
  }, []);

  const [prescriptions, setPrescriptions] = useState([]);

  const fetchPrescriptions = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && prescriptionsCache && (now - cacheTimestamp < CACHE_DURATION)) {
      setPrescriptions(prescriptionsCache);
      return;
    }
    try {
      const res = await prescriptionAPI.getAll({ limit: 500, status: 'pending' });
      const data = res.data?.prescriptions || res.data || [];
      const prescriptionsArray = Array.isArray(data) ? data : [];
      setPrescriptions(prescriptionsArray);
      prescriptionsCache = prescriptionsArray;
      cacheTimestamp = now;
    } catch (error) {
      console.error('Không thể tải đơn thuốc:', error);
    }
  }, []);

  const fetchMedicines = useCallback(async (forceRefresh = false) => {
    setMedicineError('');
    const now = Date.now();
    if (!forceRefresh && medicinesCache && (now - cacheTimestamp < CACHE_DURATION)) {
      setMedicines(medicinesCache);
      return;
    }
    try {
      const res = await medicineAPI.getAll({ limit: 5000 });
      const meds = res.data?.medicines || res.data?.data || res.data || [];
      const medsArray = Array.isArray(meds) ? meds : [];
      setMedicines(medsArray);
      medicinesCache = medsArray;
      cacheTimestamp = now;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể tải danh sách thuốc';
      setMedicineError(errorMessage);
      setMedicines([]);
      message.error(errorMessage);
    }
  }, []);

  const fetchTodayInvoices = useCallback(async () => {
    try {
      const today = dayjs().startOf('day').toISOString();
      const res = await saleAPI.getAll({ startDate: today, limit: 50 });
      const sales = res.data?.sales || res.data || [];
      setTodayInvoices(Array.isArray(sales) ? sales : []);
    } catch (error) {
      console.error('Không thể tải hóa đơn:', error);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // TÍNH TOÁN TIỀN (có Giảm giá từng dòng + Giảm giá đơn)
  // ═══════════════════════════════════════════════════════════════════
  const cart = useMemo(() => activeOrder?.cart || [], [activeOrder]);
  const subTotal = useMemo(() => cart.reduce((sum, item) => {
    return sum + (item.medicine.sellPrice * item.quantity * (1 - (item.discount || 0) / 100));
  }, 0), [cart]);
  const orderDiscount = activeOrder?.discount || 0;
  const total = Math.max(0, subTotal - orderDiscount);
  const customerGiven = activeOrder?.customerGiven;
  const change = Math.max(0, (customerGiven || 0) - total);
  const paymentMethod = activeOrder?.paymentMethod || 'cash';

  // Doanh thu ca (Phase 2)
  const totalRevenue = useMemo(() => todayInvoices.reduce((sum, inv) => {
    if (inv.status !== 'cancelled') return sum + (inv.totalAmount || 0);
    return sum;
  }, 0), [todayInvoices]);

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
    const currentQuantity = existing?.quantity || 0;
    const nextQuantity = currentQuantity + qty;

    if (Number(med.stock || 0) <= 0) {
      message.error(`Thuốc "${med.name}" đã hết hàng`);
      return;
    }
    if (nextQuantity > Number(med.stock || 0)) {
      message.error(`Thuốc "${med.name}" không đủ tồn kho. Còn lại: ${med.stock}`);
      return;
    }

    if (existing) {
      updateActiveOrder({
        cart: currentCart.map(item =>
          item.medicine._id === med._id ? { ...item, quantity: nextQuantity } : item
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
      } else if (prescriptionInfo.patientName && prescriptionInfo.patientName !== 'Khách vãng lai') {
        // Tự động nhảy tên bệnh nhân vào form thêm khách hàng mới
        customerForm.setFieldsValue({ name: prescriptionInfo.patientName });
        setIsAddCustomerOpen(true);
        message.info(`Vui lòng nhập thêm SĐT để lưu khách hàng: ${prescriptionInfo.patientName}`);
      } else {
        message.success(`Đã lưu đơn thuốc và đưa ${matchedMedicines.length} loại thuốc vào giỏ hàng!`);
      }
    } catch(err) {
      console.error(err);
      message.error('Lỗi khi lưu thông tin đơn thuốc');
    }
  };

  // Lọc tìm kiếm
  const filteredMedicines = useMemo(() => {
    if (!debouncedSearchText) return [];
    return medicines.filter(m =>
      m.name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
      (m.code && m.code.toLowerCase().includes(debouncedSearchText.toLowerCase()))
    ).slice(0, 8);
  }, [debouncedSearchText, medicines]);

  // Kiểm tra an toàn dược
  const safetyCheck = useMemo(() => checkPrescriptionSafety(cart), [cart]);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2: THANH TOÁN THẬT — Gọi POST /api/sales
  // ═══════════════════════════════════════════════════════════════════
  const handleCheckout = useCallback(async () => {
    if (checkoutSubmitting) return;

    if (cart.length === 0) {
      message.warning('Giỏ hàng trống!');
      return;
    }

    const stockIssue = getCartStockIssue(cart);
    if (stockIssue) {
      message.error(stockIssue);
      return;
    }

    const cashIssue = getCashPaymentIssue({ paymentMethod, amountPaid: customerGiven, total });
    if (cashIssue) {
      message.error(cashIssue);
      return;
    }

    const proceedCheckout = async () => {
      setCheckoutSubmitting(true);
      const payload = buildSalePayload({
        cart,
        customer: activeOrder.customer,
        prescription: activeOrder.prescription,
        discount: orderDiscount,
        paymentMethod,
        amountPaid: paymentMethod === 'cash' ? customerGiven : total,
      });

      const isOffline = !navigator.onLine;

      if (isOffline) {
        // Lưu tạm offline
        const offlineCode = `HD-OFF-${Date.now()}`;
        const offlineInvoice = {
          _id: offlineCode,
          code: offlineCode,
          customer: activeOrder.customer,
          prescription: activeOrder.prescription,
          items: cart.map(item => ({
            medicine: item.medicine,
            quantity: item.quantity,
            unitPrice: item.medicine.sellPrice,
            discount: item.discount,
            total: item.medicine.sellPrice * item.quantity * (1 - (item.discount || 0) / 100),
            dosage: item.dosage,
          })),
          subTotal,
          discount: orderDiscount,
          totalAmount: total,
          paymentMethod,
          amountPaid: paymentMethod === 'cash' ? customerGiven : total,
          changeAmount: paymentMethod === 'cash' ? Math.max(0, customerGiven - total) : 0,
          createdAt: new Date().toISOString(),
          isOffline: true,
        };

        const offlineQueue = JSON.parse(localStorage.getItem('offline_sales') || '[]');
        offlineQueue.push(payload);
        localStorage.setItem('offline_sales', JSON.stringify(offlineQueue));

        message.warning(`⚠️ Ngoại tuyến: Đã lưu tạm hóa đơn ${offlineCode}! Sẽ đồng bộ tự động khi có mạng.`);

        // Enrich dữ liệu local
        const invoiceData = { ...offlineInvoice };
        if (invoiceData.customer && typeof invoiceData.customer === 'string') {
          const c = customers.find(x => x._id === invoiceData.customer);
          if (c) invoiceData.customer = c;
        }

        // Cập nhật tồn kho local tạm thời
        setMedicines(prev => prev.map(m => {
          const item = cart.find(ci => ci.medicine._id === m._id);
          if (item) {
            return { ...m, stock: Math.max(0, m.stock - item.quantity) };
          }
          return m;
        }));

        // Reset đơn hàng hiện tại
        updateActiveOrder({ cart: [], discount: 0, customerGiven: null, prescription: null, customer: null });

        if (autoPrint) {
          setSelectedInvoiceToPrint(invoiceData);
          setIsReceiptModalOpen(true);
        }
        setCheckoutSubmitting(false);
        return;
      }

      // Xử lý online
      try {
        const res = await saleAPI.create(payload);
        message.success(`✅ Thanh toán thành công! Mã HĐ: ${res.data?.code || 'OK'}`);

        // Enrich dữ liệu hóa đơn (do API create không populate)
        const invoiceData = { ...res.data };
        if (invoiceData.customer && typeof invoiceData.customer === 'string') {
          const c = customers.find(x => x._id === invoiceData.customer);
          if (c) invoiceData.customer = c;
        }
        if (invoiceData.items && Array.isArray(invoiceData.items)) {
          invoiceData.items = invoiceData.items.map((item, idx) => {
             const cartItem = cart[idx];
             if (cartItem && cartItem.medicine) {
               return { ...item, medicine: cartItem.medicine };
             }
             return item;
          });
        }

        // Reset đơn hiện tại
        updateActiveOrder({ cart: [], discount: 0, customerGiven: null, prescription: null, customer: null });

        // Refresh data
        fetchTodayInvoices();
        fetchMedicines(true); // Force refresh medicines stock from backend
        fetchPrescriptions(true);
        
        // Auto print preview
        if (autoPrint) {
          setSelectedInvoiceToPrint(invoiceData);
          setIsReceiptModalOpen(true);
        }
      } catch (error) {
        if (!error.response) {
          // Lỗi mạng đột ngột
          const offlineCode = `HD-OFF-${Date.now()}`;
          const offlineInvoice = {
            _id: offlineCode,
            code: offlineCode,
            customer: activeOrder.customer,
            prescription: activeOrder.prescription,
            items: cart.map(item => ({
              medicine: item.medicine,
              quantity: item.quantity,
              unitPrice: item.medicine.sellPrice,
              discount: item.discount,
              total: item.medicine.sellPrice * item.quantity * (1 - (item.discount || 0) / 100),
              dosage: item.dosage,
            })),
            subTotal,
            discount: orderDiscount,
            totalAmount: total,
            paymentMethod,
            amountPaid: paymentMethod === 'cash' ? customerGiven : total,
            changeAmount: paymentMethod === 'cash' ? Math.max(0, customerGiven - total) : 0,
            createdAt: new Date().toISOString(),
            isOffline: true,
          };

          const offlineQueue = JSON.parse(localStorage.getItem('offline_sales') || '[]');
          offlineQueue.push(payload);
          localStorage.setItem('offline_sales', JSON.stringify(offlineQueue));

          message.warning(`⚠️ Mất kết nối: Đã lưu tạm hóa đơn ngoại tuyến ${offlineCode}!`);

          const invoiceData = { ...offlineInvoice };
          if (invoiceData.customer && typeof invoiceData.customer === 'string') {
            const c = customers.find(x => x._id === invoiceData.customer);
            if (c) invoiceData.customer = c;
          }

          setMedicines(prev => prev.map(m => {
            const item = cart.find(ci => ci.medicine._id === m._id);
            if (item) {
              return { ...m, stock: Math.max(0, m.stock - item.quantity) };
            }
            return m;
          }));

          updateActiveOrder({ cart: [], discount: 0, customerGiven: null, prescription: null, customer: null });

          if (autoPrint) {
            setSelectedInvoiceToPrint(invoiceData);
            setIsReceiptModalOpen(true);
          }
        } else {
          const errMsg = error.response?.data?.message || 'Lỗi khi thanh toán!';
          message.error(errMsg);
        }
      } finally {
        setCheckoutSubmitting(false);
      }
    };

    const hasRxMedicine = cart.some(item => item.medicine.requiresPrescription);
    if (hasRxMedicine && !activeOrder.prescription) {
      Modal.confirm({
        title: 'Cảnh báo thuốc cần đơn (Rx)',
        content: 'Giỏ hàng có chứa thuốc cần kê đơn nhưng bạn chưa liên kết đơn thuốc. Bạn có chắc chắn muốn tiếp tục thanh toán không?',
        okText: 'Vẫn thanh toán',
        okType: 'danger',
        cancelText: 'Hủy, chọn đơn',
        okButtonProps: { className: 'bg-red-600 border-none' },
        onOk: () => proceedCheckout(),
      });
      return;
    }

    await proceedCheckout();
  }, [activeOrder.customer, activeOrder.prescription, autoPrint, cart, checkoutSubmitting, customerGiven, customers, fetchMedicines, fetchTodayInvoices, fetchPrescriptions, orderDiscount, paymentMethod, total, updateActiveOrder]);

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
    fetchPrescriptions();
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, [fetchCustomers, fetchMedicines, fetchTodayInvoices, fetchPrescriptions]);

  // Tự động đồng bộ hóa đơn offline khi có mạng trở lại
  useEffect(() => {
    const syncOfflineSales = async () => {
      if (!navigator.onLine) return;
      const offlineQueue = JSON.parse(localStorage.getItem('offline_sales') || '[]');
      if (offlineQueue.length === 0) return;

      message.loading({ content: 'Đang đồng bộ hóa đơn ngoại tuyến...', key: 'sync_sales' });
      const remainingQueue = [];
      let successCount = 0;

      for (const payload of offlineQueue) {
        try {
          await saleAPI.create(payload);
          successCount++;
        } catch (err) {
          console.error('Lỗi đồng bộ hóa đơn offline:', err);
          remainingQueue.push(payload);
        }
      }

      localStorage.setItem('offline_sales', JSON.stringify(remainingQueue));
      
      if (successCount > 0) {
        message.success({ content: `✅ Đã đồng bộ thành công ${successCount} hóa đơn ngoại tuyến!`, key: 'sync_sales', duration: 4 });
        fetchTodayInvoices();
        fetchMedicines(true); // Force refresh medicines stock from backend
      } else {
        message.destroy('sync_sales');
      }
    };

    window.addEventListener('online', syncOfflineSales);
    syncOfflineSales();

    return () => {
      window.removeEventListener('online', syncOfflineSales);
    };
  }, [fetchTodayInvoices, fetchMedicines]);

  const handleCreateCustomer = async () => {
    try {
      const values = await customerForm.validateFields();
      const res = await customerAPI.create(values);
      message.success('Thêm khách hàng thành công!');
      setIsAddCustomerOpen(false);
      customerForm.resetFields();
      
      const newCustomer = res.data;
      setCustomers(prev => {
        const updated = [...prev, newCustomer];
        customersCache = updated;
        return updated;
      });
      updateActiveOrder({ customer: newCustomer._id });
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (!error.errorFields) {
         message.error('Lỗi khi thêm khách hàng');
      }
    }
  };

  const handleSearchNationalPrescription = async (code) => {
    if (!code || code.trim() === '') {
      message.warning('Vui lòng nhập mã đơn thuốc quốc gia');
      return;
    }
    
    message.loading({ content: 'Đang kết nối Cổng đơn thuốc Quốc gia...', key: 'national_rx' });
    try {
      const res = await prescriptionAPI.getNational(code);
      const nationalRx = res.data;
      if (!nationalRx) {
        throw new Error('Không tìm thấy đơn thuốc trên hệ thống Quốc gia');
      }

      // Tạo đơn thuốc cục bộ từ đơn quốc gia giả định
      const payload = {
        patientName: nationalRx.patientName,
        age: nationalRx.age,
        gender: nationalRx.gender,
        weight: nationalRx.weight,
        diagnosis: nationalRx.diagnosis,
        doctorName: nationalRx.doctorName,
        hospitalName: nationalRx.hospitalName,
        items: nationalRx.items.map(item => ({
          medicine: item.medicine._id,
          quantity: item.quantity,
          dosage: item.dosage,
        })),
        status: 'pending',
      };

      const createRes = await prescriptionAPI.create(payload);
      const newLocalRx = createRes.data;

      // Cập nhật state local
      setPrescriptions(prev => {
        const updated = [newLocalRx, ...prev];
        prescriptionsCache = updated;
        return updated;
      });

      // Tự động gán vào đơn hàng đang active
      updateActiveOrder({ prescription: newLocalRx._id });

      // Hỏi dược sĩ xem có muốn tự động điền các thuốc từ đơn này vào giỏ hàng không!
      Modal.confirm({
        title: 'Tải đơn thuốc thành công!',
        content: `Đã kết nối Cổng quốc gia. Bạn có muốn tự động thêm ${nationalRx.items.length} mặt hàng từ đơn thuốc của bệnh nhân "${nationalRx.patientName}" vào giỏ hàng không?`,
        okText: 'Thêm vào giỏ',
        cancelText: 'Chỉ liên kết đơn',
        onOk: () => {
          // Thêm các sản phẩm vào giỏ hàng
          const newCart = [...cart];
          nationalRx.items.forEach(item => {
            const existingIdx = newCart.findIndex(ci => ci.medicine._id === item.medicine._id);
            if (existingIdx > -1) {
              newCart[existingIdx].quantity += item.quantity;
            } else {
              newCart.push({
                medicine: item.medicine,
                quantity: item.quantity,
                discount: 0,
                dosage: item.dosage,
              });
            }
          });
          updateActiveOrder({ cart: newCart });
          message.success('Đã thêm các thuốc từ đơn vào giỏ hàng!');
        }
      });

      message.success({ content: '✅ Tải đơn thuốc Quốc gia thành công!', key: 'national_rx', duration: 3 });
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Không thể kết nối Cổng Đơn thuốc Quốc gia';
      message.error({ content: errMsg, key: 'national_rx', duration: 3 });
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
      render: (med, record) => {
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
            <Input
              size="small"
              placeholder="HDSD (VD: Sáng 1 viên, tối 1 viên)"
              value={record.dosage || ''}
              onChange={(e) => updateActiveOrder({ cart: cart.map(i => i.medicine._id === record.medicine._id ? { ...i, dosage: e.target.value } : i) })}
              className="mt-1 text-[11px]"
              style={{ width: '100%', maxWidth: '250px' }}
            />
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
                    {medicineError && (
                      <Alert
                        type="error"
                        message={medicineError}
                        showIcon
                        action={
                          <Button size="small" onClick={fetchMedicines}>
                            Thử lại
                          </Button>
                        }
                        className="mb-2"
                      />
                    )}
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

              {/* Đơn thuốc (Rx) */}
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1.5 uppercase flex justify-between items-center font-bold">
                  <span>Liên kết đơn thuốc</span>
                  {cart.some(item => item.medicine.requiresPrescription) && (
                    <Tag color="red" className="m-0 font-bold uppercase text-[9px] animate-pulse">Cần đơn thuốc (Rx)</Tag>
                  )}
                </div>

                {/* Tra cứu đơn thuốc quốc gia */}
                <div className="flex gap-2 mb-2">
                  <Input.Search
                    placeholder="Mã đơn thuốc Quốc gia..."
                    size="middle"
                    enterButton="Tra cứu đơn"
                    className="w-full"
                    onSearch={handleSearchNationalPrescription}
                  />
                </div>

                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn đơn thuốc liên kết..."
                  className="w-full"
                  size="large"
                  value={activeOrder.prescription}
                  onChange={(val) => updateActiveOrder({ prescription: val })}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={prescriptions.map(p => ({
                    value: p._id,
                    label: `${p.code} - ${p.patientName} (${p.diagnosis || 'Không rõ bệnh'})`
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
                loading={checkoutSubmitting}
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
                      // Ánh xạ lại tên thuốc từ danh sách medicines đã tải sẵn
                      const enrichedInvoice = {
                        ...inv,
                        items: inv.items?.map(item => {
                          const medId = typeof item.medicine === 'object' ? item.medicine?._id : item.medicine;
                          const medObj = medicines.find(m => m._id === medId);
                          return {
                            ...item,
                            medicine: medObj || item.medicine
                          };
                        }) || []
                      };
                      setSelectedInvoiceToPrint(enrichedInvoice);
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

      <Modal 
        title={null}
        open={isReceiptModalOpen} 
        onCancel={() => setIsReceiptModalOpen(false)} 
        footer={null}
        width={400}
        styles={{ body: { padding: '0px', overflow: 'hidden', borderRadius: '8px' } }}
      >
        <Tabs
          defaultActiveKey="qr"
          centered
          className="pos-receipt-tabs"
          items={[
            {
              key: 'qr',
              label: <span className="font-bold px-2">Hóa Đơn Điện Tử (QR)</span>,
              children: (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 min-h-[450px]">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Hóa Đơn Điện Tử</h3>
                  <p className="text-slate-500 text-sm mb-6 text-center">Khách hàng có thể quét mã QR này bằng Zalo/Camera để xem và lưu hóa đơn.</p>
                  
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
                    {selectedInvoiceToPrint?._id && (
                      <QRCode 
                        value={`${window.location.origin}/e-invoice/${selectedInvoiceToPrint._id}`}
                        size={200}
                        color="#0f172a"
                        bordered={false}
                      />
                    )}
                  </div>
                  
                  <Button type="primary" block size="large" onClick={() => setIsReceiptModalOpen(false)} className="bg-blue-600 font-semibold shadow-md">
                    Hoàn tất giao dịch
                  </Button>
                  
                  <Button type="link" block className="mt-2 text-slate-500" onClick={() => window.open(`/e-invoice/${selectedInvoiceToPrint?._id}`, '_blank')}>
                    Xem thử biên lai
                  </Button>
                </div>
              )
            },
            {
              key: 'print',
              label: <span className="font-bold px-2">In Biên Lai Giấy</span>,
              children: (
                <div className="bg-[#f1f5f9] p-5 flex flex-col items-center">
                  <div className="shadow-lg drop-shadow-xl print-container print-receipt-area mb-6" style={{ transform: 'scale(1.05)' }}>
                     <ReceiptPrint invoice={selectedInvoiceToPrint} />
                  </div>
                  <div className="flex gap-3 w-full">
                    <Button block size="large" onClick={() => setIsReceiptModalOpen(false)}>Đóng</Button>
                    <Button type="primary" block size="large" icon={<PrinterOutlined />} className="bg-slate-800" onClick={() => {
                       const printElement = document.querySelector('.print-receipt-area').cloneNode(true);
                       const printContainer = document.createElement('div');
                       printContainer.id = 'global-print-container';
                       printContainer.appendChild(printElement);
                       document.body.appendChild(printContainer);
                       
                       window.print();
                       
                       document.body.removeChild(printContainer);
                       setIsReceiptModalOpen(false);
                    }}>In ngay</Button>
                  </div>
                </div>
              )
            }
          ]}
        />
      </Modal>

      {/* ═══ MODAL THÊM KHÁCH HÀNG ═══ */}
      <AddCustomerModal 
        open={isAddCustomerOpen}
        onCancel={() => setIsAddCustomerOpen(false)}
        onOk={handleCreateCustomer}
        form={customerForm}
      />

      {/* ═══ MODAL LỊCH SỬ MUA HÀNG KHÁCH HÀNG ═══ */}
      <CustomerHistoryModal 
        open={isCustomerHistoryOpen}
        onCancel={() => setIsCustomerHistoryOpen(false)}
        customerHistory={customerHistory}
        isHistoryLoading={isHistoryLoading}
      />

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

        /* Print Settings for 80mm Receipt */
        @media print {
          #root, .ant-modal-root {
            display: none !important;
          }
          #global-print-container {
            display: flex !important;
            justify-content: center !important;
            width: 100%;
            padding: 0;
            margin: 0;
          }
        }
        @page {
          size: 80mm auto;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default POSPage;
