import React from 'react';
import { Empty, Tag } from 'antd';
import { SHIFT_META, STATUS_META, WEEK_DAYS } from '../scheduleData';

const ShiftCard = ({ shift, onSelect }) => {
  const shiftMeta = SHIFT_META[shift.shiftType];
  const statusMeta = STATUS_META[shift.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(shift)}
      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-white p-3 text-left transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-[var(--color-primary-hover)] relative overflow-hidden"
      style={{ borderLeft: `4px solid ${shiftMeta.color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-[var(--color-text-primary)] text-[13px]">{shift.staffName}</div>
          <div className="mt-0.5 text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{shift.role} · {shift.area}</div>
        </div>
        <span className="h-2 w-2 shrink-0 rounded-full mt-1" style={{ backgroundColor: statusMeta.color }} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <Tag className="m-0 rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ color: shiftMeta.color, borderColor: shiftMeta.border, backgroundColor: shiftMeta.bg }}>
          {shiftMeta.label}
        </Tag>
        <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{shiftMeta.time}</span>
      </div>
    </button>
  );
};

const ScheduleBoard = ({ shifts, onSelect, weekDays = WEEK_DAYS }) => {
  const grouped = weekDays.map((day) => ({
    ...day,
    shifts: shifts.filter((shift) => shift.day === day.key),
  }));

  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
      <div className="grid min-w-[980px] grid-cols-7 overflow-x-auto">
        {grouped.map((day) => (
          <div key={day.key} className="min-h-[300px] border-r border-[var(--color-border-light)] last:border-r-0">
            <div className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] px-4 py-3">
              <div className="font-semibold text-[var(--color-text-primary)]">{day.label}</div>
              <div className="text-[12px] text-[var(--color-text-muted)]">{day.date}</div>
            </div>
            <div className="space-y-3 p-3">
              {day.shifts.length === 0 ? (
                <div className="flex min-h-[180px] items-center justify-center">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Trống ca" />
                </div>
              ) : (
                day.shifts.map((shift) => <ShiftCard key={shift.id} shift={shift} onSelect={onSelect} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleBoard;
