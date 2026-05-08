import React, { useMemo } from 'react';
import { Tooltip, Badge } from 'antd';
import { Package } from 'lucide-react';

// Cấu hình bản đồ nhà thuốc
const PHARMACY_LAYOUT = [
  {
    zone: 'A',
    label: 'Khu A — Kháng sinh',
    color: '#3b82f6', // blue
    lightColor: '#f8fafc',
    borderColor: '#93c5fd',
    shelves: 3,
    cols: 4,
  },
  {
    zone: 'B',
    label: 'Khu B — Giảm đau & Hô hấp',
    color: '#10b981', // green
    lightColor: '#f0fdf4',
    borderColor: '#6ee7b7',
    shelves: 2,
    cols: 4,
  },
  {
    zone: 'C',
    label: 'Khu C — Tiêu hóa & Da liễu',
    color: '#f59e0b', // yellow
    lightColor: '#fffbeb',
    borderColor: '#fcd34d',
    shelves: 3,
    cols: 4,
  },
  {
    zone: 'D',
    label: 'Khu D — Vitamin & Khoáng chất',
    color: '#8b5cf6', // purple
    lightColor: '#faf5ff',
    borderColor: '#c4b5fd',
    shelves: 2,
    cols: 4,
  },
  {
    zone: 'E',
    label: 'Khu E — Tim mạch & Thần kinh',
    color: '#ef4444', // red
    lightColor: '#fef2f2',
    borderColor: '#fca5a5',
    shelves: 2,
    cols: 4,
  },
];

/**
 * PharmacyMap — Sơ đồ tủ thuốc interactive
 * @param {Array} highlightMedicines - Mảng thuốc cần highlight [{medicine, quantity, location}]
 * @param {Array} allMedicines - Toàn bộ danh sách thuốc (để build map)
 * @param {Function} onCellClick - Callback khi click vào ô
 */
const PharmacyMap = ({ highlightMedicines = [], allMedicines = [], onCellClick }) => {
  // Build lookup: "zone-shelf-row-col" → medicine info
  const medicineMap = useMemo(() => {
    const map = {};
    allMedicines.forEach(m => {
      if (m.location?.zone) {
        const key = `${m.location.zone}-${m.location.shelf}-${m.location.row}-${m.location.column}`;
        map[key] = m;
      }
    });
    return map;
  }, [allMedicines]);

  // Set các thuốc cần highlight
  const highlightSet = useMemo(() => {
    const set = new Set();
    highlightMedicines.forEach(item => {
      const loc = item.medicine?.location || item.location;
      if (loc?.zone) {
        set.add(`${loc.zone}-${loc.shelf}-${loc.row}-${loc.column}`);
      }
    });
    return set;
  }, [highlightMedicines]);

  const getStockStatus = (medicine) => {
    if (!medicine) return null;
    if (medicine.stock === 0) return 'out';
    const daysToExpiry = medicine.expiryDate
      ? Math.ceil((new Date(medicine.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      : Infinity;
    if (daysToExpiry <= 30) return 'expiring';
    if (medicine.stock < medicine.minStock) return 'low';
    return 'ok';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-slate-100 bg-slate-50 p-3 rounded-lg">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Chú thích:</span>
        {[
          { color: '#3b82f6', bg: '#dbeafe', label: 'Cần lấy' },
          { color: '#ef4444', bg: '#fee2e2', label: 'Hết hàng' },
          { color: '#f59e0b', bg: '#fef3c7', label: 'Sắp hết HSD' },
          { color: '#f97316', bg: '#ffedd5', label: 'Tồn ít' },
          { color: '#94a3b8', bg: '#f1f5f9', label: 'Bình thường' },
        ].map(({ color, bg, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: bg, border: `1.5px solid ${color}` }} />
            <span className="text-xs font-medium text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PHARMACY_LAYOUT.map((zone) => (
          <ZoneBlock
            key={zone.zone}
            zone={zone}
            medicineMap={medicineMap}
            highlightSet={highlightSet}
            highlightMedicines={highlightMedicines}
            getStockStatus={getStockStatus}
            onCellClick={onCellClick}
          />
        ))}

        {/* Tủ lạnh đặc biệt */}
        <div
          className="rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center gap-2"
          style={{ borderColor: '#93c5fd', backgroundColor: '#eff6ff', minHeight: '160px' }}
        >
          <div className="w-12 h-12 bg-blue-400 rounded-lg shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2)] flex items-center justify-center text-xl text-white mb-1">
            ❄️
          </div>
          <div className="text-center">
            <div className="text-base font-bold text-blue-800">Tủ lạnh</div>
            <div className="text-xs font-medium text-blue-500 mb-1">2°C – 8°C</div>
            <div className="text-xs text-slate-500">Insulin, Vaccine, Thuốc sinh học</div>
          </div>
        </div>
      </div>

      {/* Quầy thu ngân */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-700 text-xs font-black p-2 rounded">
            ATM
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">Quầy thu ngân</div>
            <div className="text-xs text-slate-400">Cửa ra vào →</div>
          </div>
        </div>
        {highlightMedicines.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <Package size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              {highlightMedicines.length} thuốc cần lấy
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ZoneBlock = ({ zone, medicineMap, highlightSet, highlightMedicines, getStockStatus, onCellClick }) => {
  return (
    <div
      className="rounded-xl border-2 p-4 bg-white"
      style={{ borderColor: zone.borderColor }}
    >
      {/* Zone Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold uppercase tracking-wide" style={{ color: zone.color }}>
          {zone.label}
        </div>
        <div
          className="flex items-center justify-center w-6 h-6 text-xs font-black text-white rounded-full shadow-sm"
          style={{ backgroundColor: zone.color }}
        >
          {zone.zone}
        </div>
      </div>

      {/* Shelves */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: zone.shelves }, (_, shelfIdx) => (
          <div key={shelfIdx}>
            <div className="text-[10px] text-slate-400 mb-1.5 font-medium uppercase tracking-wider">Kệ {shelfIdx + 1}</div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${zone.cols}, 1fr)` }}>
              {Array.from({ length: zone.cols }, (_, colIdx) => {
                const key = `${zone.zone}-${shelfIdx + 1}-1-${colIdx + 1}`;
                const medicine = medicineMap[key];
                const isHighlighted = highlightSet.has(key);
                const stockStatus = getStockStatus(medicine);
                const highlightItem = isHighlighted
                  ? highlightMedicines.find(h => {
                      const loc = h.medicine?.location || h.location;
                      return loc && `${loc.zone}-${loc.shelf}-${loc.row}-${loc.column}` === key;
                    })
                  : null;

                return (
                  <ShelfCell
                    key={key}
                    cellKey={key}
                    medicine={medicine}
                    isHighlighted={isHighlighted}
                    stockStatus={stockStatus}
                    highlightItem={highlightItem}
                    zoneColor={zone.color}
                    onClick={() => onCellClick && onCellClick(medicine, key)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ShelfCell = ({ cellKey, medicine, isHighlighted, stockStatus, highlightItem, zoneColor, onClick }) => {
  const getStyle = () => {
    if (isHighlighted) return {
      backgroundColor: '#dbeafe',
      borderColor: '#3b82f6',
      border: '2px solid',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
    };
    if (!medicine) return {
      backgroundColor: '#ffffff',
      borderColor: '#cbd5e1',
      border: '1px dashed',
    };
    if (stockStatus === 'out')      return { backgroundColor: '#fee2e2', borderColor: '#ef4444', border: '1px solid' };
    if (stockStatus === 'expiring') return { backgroundColor: '#fef3c7', borderColor: '#f59e0b', border: '1px solid' };
    if (stockStatus === 'low')      return { backgroundColor: '#ffedd5', borderColor: '#f97316', border: '1px solid' };
    return { backgroundColor: '#ffffff', borderColor: '#cbd5e1', border: '1px dashed' };
  };

  const shortLabel = cellKey.split('-').slice(1).join('-');
  const tooltipContent = medicine ? (
    <div className="text-xs space-y-1">
      <div className="font-bold">{medicine.name}</div>
      <div>Mã: {medicine.code}</div>
      <div>Tồn kho: <strong>{medicine.stock}</strong></div>
      <div>HSD: {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString('vi-VN') : '---'}</div>
      <div>Giá bán: {(medicine.sellPrice || 0).toLocaleString('vi-VN')}đ</div>
      {isHighlighted && highlightItem && (
        <div className="text-blue-300 font-bold">→ Cần lấy: {highlightItem.quantity} {typeof medicine.unit === 'object' ? medicine.unit?.name : medicine.unit}</div>
      )}
    </div>
  ) : 'Ô trống';

  return (
    <Tooltip title={tooltipContent} placement="top" color="#1e293b">
      <div
        className="rounded-md cursor-pointer transition-all duration-200 flex flex-col items-center justify-center hover:scale-105"
        style={{ ...getStyle(), minHeight: '46px', padding: '4px' }}
        onClick={onClick}
      >
        {isHighlighted && <div className="text-yellow-400 text-xs mb-0.5">⭐</div>}
        <div className={`text-[9px] font-medium leading-tight text-center ${isHighlighted ? 'text-blue-700' : 'text-slate-400'}`}>
          {shortLabel}
        </div>
        {isHighlighted && (
          <div className="text-[8px] font-bold text-blue-600 mt-0.5">
            x{highlightItem?.quantity}
          </div>
        )}
      </div>
    </Tooltip>
  );
};

export default PharmacyMap;
