import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Result, Button, Divider, Alert } from 'antd';
import { 
  CheckCircleFilled, 
  PrinterOutlined,
  HomeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../api/api';

const EInvoicePage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/sales/public/${id}`);
        setInvoice(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải hóa đơn');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spin size="large" tip="Đang tải biên lai điện tử..." />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Result
          status="error"
          title="Hóa đơn không tồn tại"
          subTitle={error}
          extra={<Button onClick={() => window.location.href = '/'}>Về trang chủ</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-6 px-4 sm:py-10 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden relative">
        {/* Răng cưa bên trên */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-slate-100 flex justify-between px-1" style={{ backgroundImage: 'radial-gradient(circle at 10px 0, transparent 0, transparent 10px, white 10px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Phần header xanh lá cây */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 text-center pt-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircleFilled className="text-4xl text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold mb-1">Giao dịch thành công</h1>
          <p className="text-emerald-100 text-sm">Cảm ơn bạn đã mua sắm tại Nhà thuốc!</p>
          <div className="text-3xl font-black mt-4 drop-shadow-md">
            {invoice.totalAmount?.toLocaleString('vi-VN')} đ
          </div>
        </div>

        {/* Thân hóa đơn */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-dashed border-slate-200">
            <div>
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Nhà Thuốc</div>
              <div className="font-semibold text-slate-800">Sức Khỏe Vàng</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Mã Phiếu</div>
              <div className="font-mono font-semibold text-slate-800">{invoice.code}</div>
            </div>
          </div>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Ngày giao dịch</span>
              <span className="font-medium text-slate-800">{dayjs(invoice.createdAt).format('DD/MM/YYYY HH:mm')}</span>
            </div>
            {invoice.customer && (
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng</span>
                <span className="font-medium text-slate-800">{typeof invoice.customer === 'object' ? invoice.customer.name : invoice.customer}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Thu ngân</span>
              <span className="font-medium text-slate-800">{invoice.createdBy?.name || 'Thu ngân'}</span>
            </div>
          </div>

          <Divider dashed className="my-4 border-slate-300" />

          {/* Chi tiết mặt hàng */}
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-xs">Chi tiết sản phẩm</h3>
            <div className="space-y-4">
              {invoice.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <div className="flex-1 pr-4">
                    <div className="font-semibold text-slate-800 mb-0.5">{item.medicine?.name || item.name}</div>
                    
                    {/* Hướng dẫn sử dụng cực kỳ nổi bật */}
                    {item.dosage && (
                      <div className="bg-amber-50 text-amber-800 px-2.5 py-1.5 rounded-md text-xs border border-amber-200 mt-1.5 mb-1.5 flex items-start gap-1.5 shadow-sm">
                        <InfoCircleOutlined className="mt-0.5 text-amber-600" />
                        <span className="font-medium leading-tight">{item.dosage}</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-500 mt-1">
                      {(item.unitPrice || item.medicine?.sellPrice || 0).toLocaleString()}đ x {item.quantity}
                    </div>
                  </div>
                  <div className="font-bold text-slate-800">
                    {((item.unitPrice || item.medicine?.sellPrice || 0) * item.quantity).toLocaleString()}đ
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider dashed className="my-4 border-slate-300" />

          {/* Tổng tiền */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Tạm tính</span>
              <span className="font-medium text-slate-800">{invoice.subTotal?.toLocaleString('vi-VN')}đ</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Giảm giá</span>
                <span className="font-medium">-{invoice.discount?.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-dashed border-slate-200 mt-2">
              <span className="text-slate-500 font-bold uppercase text-xs mt-0.5">Khách phải trả</span>
              <span className="font-black text-lg text-emerald-600">{invoice.totalAmount?.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
          <Button 
            type="primary" 
            block 
            size="large"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 shadow-md"
          >
            Lưu / In PDF
          </Button>
          <Button 
            block 
            size="large"
            icon={<HomeOutlined />}
            onClick={() => window.location.href = '/'}
          >
            Đóng
          </Button>
        </div>

        {/* Răng cưa bên dưới */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-slate-100 flex justify-between px-1" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, white 0, white 10px, transparent 10px)', backgroundSize: '20px 20px', backgroundPosition: '0 -10px' }}></div>
      </div>
      
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .max-w-md, .max-w-md * {
            visibility: visible;
          }
          .max-w-md {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
            box-shadow: none !important;
          }
          .bg-slate-50 { display: none; }
        }
      `}</style>
    </div>
  );
};

export default EInvoicePage;
