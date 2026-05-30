import React, { forwardRef } from 'react';
import dayjs from 'dayjs';
import { QRCode } from 'antd';

// Mẫu hóa đơn in nhiệt khổ 80mm (~300px) - Đạt Chuẩn Hiện Đại
const ReceiptPrint = forwardRef(({ invoice, pharmacyInfo }, ref) => {
  if (!invoice) return null;

  return (
    <div ref={ref} className="bg-white text-black p-4 w-[300px] mx-auto text-[12px] font-sans leading-tight">
      {/* Header Nhà Thuốc */}
      <div className="text-center mb-4">
        <h2 className="font-bold text-xl mb-1 text-slate-800 uppercase tracking-wide">{pharmacyInfo?.name || 'Nhà Thuốc Sức Khỏe Vàng'}</h2>
        <p className="text-[11px] mb-0.5 font-medium">{pharmacyInfo?.address || '123 Nguyễn Văn Linh, Đà Nẵng'}</p>
        <p className="text-[11px] font-medium">SĐT: {pharmacyInfo?.phone || '0905.123.456'}</p>
      </div>

      <div className="text-center font-bold text-lg mb-2 border-b-2 border-dashed border-slate-800 pb-2 uppercase">
        Hóa Đơn Bán Lẻ
      </div>

      {/* Thông tin chung */}
      <div className="mb-3 space-y-1 text-[11px] font-medium text-slate-800 border-b border-dashed border-slate-300 pb-2">
        <div className="flex justify-between">
          <span>Số HĐ:</span>
          <span className="font-bold">{invoice.code}</span>
        </div>
        <div className="flex justify-between">
          <span>Ngày in:</span>
          <span>{dayjs(invoice.createdAt || new Date()).format('DD/MM/YYYY HH:mm')}</span>
        </div>
        <div className="flex justify-between">
          <span>Thu ngân:</span>
          <span>{invoice.staff || 'Phạm Khương Duy'}</span>
        </div>
        {invoice.customer && (
          <div className="flex justify-between">
            <span>Khách hàng:</span>
            <span className="font-bold">{typeof invoice.customer === 'object' ? invoice.customer.name : invoice.customer}</span>
          </div>
        )}
      </div>

      {/* Chi tiết mặt hàng */}
      <table className="w-full text-left mb-2">
        <thead>
          <tr className="border-b-2 border-slate-800">
            <th className="py-1 w-1/2 font-bold text-[11px]">Tên hàng</th>
            <th className="py-1 text-center w-1/6 font-bold text-[11px]">SL</th>
            <th className="py-1 text-right w-1/3 font-bold text-[11px]">TTiền</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, index) => (
            <tr key={index} className="border-b border-dashed border-slate-300 last:border-b-0">
              <td className="py-2 pr-1">
                <div className="font-bold text-[12px] w-full text-slate-900">{item.medicine?.name || item.name || 'Không rõ tên thuốc'}</div>
                {item.dosage && <div className="text-[10px] italic text-slate-600 mt-0.5 leading-tight">{item.dosage}</div>}
                <div className="text-[10px] text-slate-600 mt-0.5">{(item.unitPrice || item.medicine?.sellPrice || 0).toLocaleString()}đ</div>
              </td>
              <td className="py-2 text-center font-bold text-[12px]">{item.quantity}</td>
              <td className="py-2 text-right font-bold text-[12px]">
                {((item.unitPrice || item.medicine?.sellPrice || 0) * item.quantity).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tổng kết tiền */}
      <div className="space-y-1 mb-4 border-t-2 border-slate-800 pt-2">
        <div className="flex justify-between text-[11px] font-medium">
          <span>Cộng tiền hàng:</span>
          <span>{(invoice.subTotal || invoice.totalAmount || 0).toLocaleString()}đ</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-[11px] font-medium">
            <span>Chiết khấu:</span>
            <span>-{invoice.discount.toLocaleString()}đ</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-[15px] pt-1 mt-1 border-t border-dashed border-slate-400">
          <span>TỔNG THANH TOÁN:</span>
          <span>{(invoice.totalAmount || 0).toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between text-[11px] font-medium mt-1">
          <span>Khách đưa:</span>
          <span>{(invoice.amountPaid || invoice.totalAmount || 0).toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between text-[11px] font-medium">
          <span>Tiền thừa:</span>
          <span>{Math.max(0, (invoice.amountPaid || invoice.totalAmount || 0) - (invoice.totalAmount || 0)).toLocaleString()}đ</span>
        </div>
      </div>

      {/* QR Code tra cứu */}
      <div className="flex flex-col items-center justify-center border-t border-dashed border-slate-400 pt-4 mb-3">
        <QRCode 
          value={`${window.location.origin}/e-invoice/${invoice.code}`}
          size={80}
          bordered={false}
          color="#000000"
        />
        <div className="text-[9px] mt-1 text-center font-medium">Quét mã QR để xem hóa đơn điện tử</div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] italic pt-2">
        <p className="font-bold text-[11px] not-italic mb-0.5">Cảm ơn Quý Khách & Hẹn Gặp Lại!</p>
        <p>Hàng mua rồi miễn đổi trả sau 24h.</p>
        <p className="mt-1 text-[9px] text-slate-500">Phần mềm cung cấp bởi G5 Pharmacy</p>
      </div>
    </div>
  );
});

export default ReceiptPrint;
