import React, { forwardRef } from 'react';
import dayjs from 'dayjs';

// Mẫu hóa đơn in nhiệt khổ 80mm (~300px)
const ReceiptPrint = forwardRef(({ invoice, pharmacyInfo }, ref) => {
  if (!invoice) return null;

  return (
    <div ref={ref} className="bg-white text-black p-4 w-[300px] mx-auto text-[12px] font-sans leading-tight">
      {/* Header Nhà Thuốc */}
      <div className="text-center mb-4">
        <h2 className="font-bold text-lg mb-1">{pharmacyInfo?.name || 'Nhà Thuốc Sức Khỏe Vàng'}</h2>
        <p className="text-[11px] mb-0.5">{pharmacyInfo?.address || '123 Nguyễn Văn Linh, Đà Nẵng'}</p>
        <p className="text-[11px]">SĐT: {pharmacyInfo?.phone || '0905.123.456'}</p>
      </div>

      <div className="text-center font-bold text-base mb-3 border-b border-dashed border-black pb-2">
        HÓA ĐƠN BÁN LẺ
      </div>

      {/* Thông tin chung */}
      <div className="mb-3 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Số HĐ:</span>
          <span className="font-semibold">{invoice.code}</span>
        </div>
        <div className="flex justify-between">
          <span>Ngày:</span>
          <span>{dayjs(invoice.createdAt || new Date()).format('DD/MM/YYYY HH:mm')}</span>
        </div>
        <div className="flex justify-between">
          <span>Thu ngân:</span>
          <span>{invoice.staff || 'Phạm Khương Duy'}</span>
        </div>
        {invoice.customer && (
          <div className="flex justify-between">
            <span>Khách hàng:</span>
            <span>{typeof invoice.customer === 'object' ? invoice.customer.name : invoice.customer}</span>
          </div>
        )}
      </div>

      {/* Chi tiết mặt hàng */}
      <table className="w-full text-left mb-3">
        <thead>
          <tr className="border-b border-dashed border-black">
            <th className="py-1 w-1/2">Tên hàng</th>
            <th className="py-1 text-center w-1/6">SL</th>
            <th className="py-1 text-right w-1/3">TTiền</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, index) => (
            <tr key={index} className="border-b border-dashed border-gray-300 last:border-black">
              <td className="py-1.5 pr-1">
                <div className="font-semibold truncate w-full">{item.medicine?.name || item.name}</div>
                <div className="text-[10px] text-gray-500">{(item.unitPrice || item.medicine?.sellPrice || 0).toLocaleString()}đ</div>
              </td>
              <td className="py-1.5 text-center font-medium">{item.quantity}</td>
              <td className="py-1.5 text-right font-bold">
                {((item.unitPrice || item.medicine?.sellPrice || 0) * item.quantity).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tổng kết tiền */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-[11px]">
          <span>Tổng tiền hàng:</span>
          <span>{(invoice.subTotal || invoice.totalAmount || 0).toLocaleString()}đ</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-[11px]">
            <span>Giảm giá:</span>
            <span>-{invoice.discount.toLocaleString()}đ</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm border-t border-dashed border-black pt-1 mt-1">
          <span>TỔNG CỘNG:</span>
          <span>{(invoice.totalAmount || 0).toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between text-[11px] mt-1">
          <span>Khách đưa:</span>
          <span>{(invoice.amountPaid || invoice.totalAmount || 0).toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span>Tiền thừa:</span>
          <span>{Math.max(0, (invoice.amountPaid || invoice.totalAmount || 0) - (invoice.totalAmount || 0)).toLocaleString()}đ</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] italic border-t border-dashed border-black pt-3">
        <p>Cảm ơn quý khách và hẹn gặp lại!</p>
        <p>Hàng mua rồi miễn đổi trả.</p>
      </div>
    </div>
  );
});

export default ReceiptPrint;
