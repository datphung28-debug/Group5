import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Tạo PDF phiếu cấp phát thuốc theo chuẩn GPP
 * @param {Object} prescription - Thông tin đơn thuốc
 */
export const generatePrescriptionPDF = (prescription) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const primary   = [37, 99, 235];   // blue-600
  const secondary = [71, 85, 105];   // slate-500
  const light     = [248, 250, 252]; // slate-50
  const border    = [226, 232, 240]; // slate-200

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  // ── HEADER ─────────────────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageW, 32, 'F');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('NHA THUOC GPP', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('DIA CHI: 123 Le Loi, Quan 1, TP.HCM', margin, 19);
  doc.text('SDT: 028.1234.5678 | Email: info@gpppharmacy.vn', margin, 25);

  // Số phiếu + ngày ở góc phải
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const code = prescription.code || `RX${Date.now()}`;
  doc.text(`So phieu: ${code}`, pageW - margin, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Ngay: ${new Date().toLocaleDateString('vi-VN')}`, pageW - margin, 19, { align: 'right' });
  doc.text(`Duoc si: ${prescription.pharmacist || 'DS. Nguyen Thi Minh'}`, pageW - margin, 25, { align: 'right' });

  // ── TIÊU ĐỀ ────────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primary);
  doc.text('PHIEU CAP PHAT THUOC', pageW / 2, 42, { align: 'center' });

  // Gạch dưới tiêu đề
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.5);
  doc.line(margin, 45, pageW - margin, 45);

  // ── THÔNG TIN BỆNH NHÂN ────────────────────────────────
  let y = 52;
  doc.setFillColor(...light);
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y - 4, pageW - margin * 2, 38, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondary);
  doc.text('THONG TIN BENH NHAN', margin + 4, y + 1);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  const col1 = margin + 4;
  const col2 = pageW / 2 + 4;
  y += 7;

  const field = (label, value, x, yPos) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...secondary);
    doc.text(label + ':', x, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value || '---', x + 28, yPos);
  };

  field('Ho ten',     prescription.patientName || 'Khach le',          col1, y);
  field('Gioi tinh',  prescription.patientGender === 'female' ? 'Nu' : 'Nam', col2, y);
  y += 7;
  field('SDT',        prescription.patientPhone || '---',              col1, y);
  field('Nam sinh',   prescription.patientDob ? new Date(prescription.patientDob).getFullYear().toString() : '---', col2, y);
  y += 7;
  field('Chan doan',  prescription.diagnosis || '---',                 col1, y);
  y += 7;
  field('Bac si ke',  prescription.doctorName || '---',                col1, y);
  field('Co so y te', prescription.hospitalName || '---',              col2, y);

  // ── BẢNG THUỐC ─────────────────────────────────────────
  y += 16;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primary);
  doc.text('CHI TIET DON THUOC', margin, y);

  const items = prescription.items || [];
  const tableRows = items.map((item, idx) => [
    String(idx + 1),
    item.medicineName || '---',
    item.dosage || '---',
    `${item.frequency || 1} lan/ngay`,
    `${item.days || 1} ngay`,
    `${item.quantity || 0}`,
    `${((item.unitPrice || 0) * (item.quantity || 0)).toLocaleString('vi-VN')}d`,
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [['#', 'Ten thuoc', 'Ham luong', 'Lieu dung', 'So ngay', 'SL', 'Thanh tien']],
    body: tableRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
    headStyles: {
      fillColor: primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 45 },
      2: { cellWidth: 22 },
      3: { cellWidth: 25 },
      4: { cellWidth: 18 },
      5: { halign: 'center', cellWidth: 12 },
      6: { halign: 'right', cellWidth: 28 },
    },
    alternateRowStyles: { fillColor: light },
    bodyStyles: { textColor: [15, 23, 42] },
  });

  const finalY = doc.lastAutoTable.finalY + 6;

  // ── TỔNG TIỀN ──────────────────────────────────────────
  const subTotal = items.reduce((s, it) => s + (it.unitPrice || 0) * (it.quantity || 0), 0);
  const discount = prescription.discount || 0;
  const total    = subTotal - discount;

  const summaryX = pageW - margin - 65;
  doc.setFillColor(...light);
  doc.setDrawColor(...border);
  doc.roundedRect(summaryX - 4, finalY - 2, 69, discount > 0 ? 24 : 16, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(...secondary);
  doc.text('Tong cong:', summaryX, finalY + 4);
  doc.setTextColor(15, 23, 42);
  doc.text(`${subTotal.toLocaleString('vi-VN')}d`, pageW - margin, finalY + 4, { align: 'right' });

  if (discount > 0) {
    doc.setTextColor(...secondary);
    doc.text('Giam gia:', summaryX, finalY + 10);
    doc.setTextColor(220, 38, 38);
    doc.text(`-${discount.toLocaleString('vi-VN')}d`, pageW - margin, finalY + 10, { align: 'right' });
  }

  const totalY = finalY + (discount > 0 ? 18 : 10);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primary);
  doc.text('THANH TOAN:', summaryX, totalY);
  doc.text(`${total.toLocaleString('vi-VN')}d`, pageW - margin, totalY, { align: 'right' });

  // ── HƯỚNG DẪN SỬ DỤNG ─────────────────────────────────
  const noteY = finalY + 30;
  doc.setFillColor(254, 249, 195); // vàng nhạt
  doc.setDrawColor(234, 179, 8);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, noteY, pageW - margin * 2, 18, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(133, 77, 14);
  doc.text('LUU Y QUAN TRONG:', margin + 4, noteY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('• Uong thuoc dung lieu, dung gio, du ngay ke ca khi het trieu chung', margin + 4, noteY + 10);
  doc.text('• Bao cao bac si/duoc si neu co phan ung bat thuong khi dung thuoc', margin + 4, noteY + 15);

  // ── CHỮ KÝ ─────────────────────────────────────────────
  const sigY = noteY + 26;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondary);

  doc.text('KHACH HANG XAC NHAN', margin + 10, sigY);
  doc.text('DUOC SI CAP PHAT', pageW - margin - 35, sigY);

  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('(Ky va ghi ro ho ten)', margin + 8, sigY + 5);
  doc.text('(Ky va ghi ro ho ten)', pageW - margin - 37, sigY + 5);

  doc.setDrawColor(...border);
  doc.line(margin + 5, sigY + 18, margin + 55, sigY + 18);
  doc.line(pageW - margin - 55, sigY + 18, pageW - margin - 5, sigY + 18);

  // ── FOOTER ─────────────────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(0, 285, pageW, 12, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('GPP Pharmacy Management System | Cam on quy khach da tin tuong su dung dich vu cua chung toi', pageW / 2, 292, { align: 'center' });

  // Lưu file
  const fileName = `phieu-cap-phat-${code}-${new Date().getTime()}.pdf`;
  doc.save(fileName);
  return fileName;
};
