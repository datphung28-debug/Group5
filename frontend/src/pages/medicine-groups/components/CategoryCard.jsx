import { Button, Tooltip } from 'antd';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Thermometer,
  Heart,
  Apple,
  Wind,
  Hand,
  Brain,
  Sun,
  Eye as EyeIcon,
  Activity,
  Shield,
  HelpCircle,
} from 'lucide-react';

// Map icon string from data model → lucide component
const ICON_MAP = {
  pill: Pill,
  thermometer: Thermometer,
  heart: Heart,
  apple: Apple,
  wind: Wind,
  hand: Hand,
  brain: Brain,
  sun: Sun,
  eye: EyeIcon,
  activity: Activity,
  shield: Shield,
};

// Rotate through a palette of semantic colors so cards feel distinct
const COLOR_PALETTE = [
  { color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  { color: 'var(--color-profit)', bg: 'var(--color-profit-bg)' },
  { color: 'var(--color-inventory)', bg: 'var(--color-inventory-bg)' },
  { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  { color: 'var(--color-debt)', bg: 'var(--color-debt-bg)' },
];

export default function CategoryCard({ category, index, onEdit, onDelete }) {
  const navigate = useNavigate();
  const Icon = ICON_MAP[category.icon] || HelpCircle;
  const palette = COLOR_PALETTE[index % COLOR_PALETTE.length];
  const isEmpty = category.status === 'empty';

  return (
    <div
      className={`
        group bg-[var(--color-bg-surface)] border rounded-[var(--radius-lg)]
        transition-all duration-200
        hover:shadow-[var(--shadow-dropdown)] hover:-translate-y-0.5
        ${isEmpty
          ? 'border-[var(--color-border)] opacity-75 hover:opacity-100'
          : 'border-[var(--color-border-light)] hover:border-[var(--color-primary-border)]'
        }
      `}
    >
      {/* Top Info */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: palette.bg, color: palette.color }}
          >
            <Icon size={20} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[var(--font-size-md)] font-semibold text-[var(--color-text-primary)] m-0 leading-snug truncate">
                {category.name}
              </h3>
              {category.code && (
                <span
                  className="text-[var(--font-size-xs)] font-bold px-1.5 py-0.5 rounded-[var(--radius-sm)] flex-shrink-0 uppercase"
                  style={{ backgroundColor: palette.bg, color: palette.color }}
                >
                  {category.code}
                </span>
              )}
            </div>
            <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] m-0 leading-snug line-clamp-2">
              {category.description || 'Chưa có mô tả'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-5 py-3 border-t border-[var(--color-border-light)] flex items-center justify-between">
        <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
          <span className="font-semibold text-[var(--color-text-primary)]">
            {category.medicineCount}
          </span>{' '}
          loại thuốc
        </span>
        <span
          className="text-[var(--font-size-xs)] font-medium px-2 py-0.5 rounded-full"
          style={
            isEmpty
              ? {
                  backgroundColor: 'var(--color-bg-subtle)',
                  color: 'var(--color-text-muted)',
                }
              : {
                  backgroundColor: 'var(--color-profit-bg)',
                  color: 'var(--color-profit)',
                }
          }
        >
          {isEmpty ? 'Trống' : 'Đang dùng'}
        </span>
      </div>

      {/* Actions Row */}
      <div className="px-5 py-3 border-t border-[var(--color-border-light)] flex items-center gap-2">
        <Button
          type="default"
          size="small"
          icon={<Eye size={14} />}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-[var(--radius-sm)] text-[var(--font-size-sm)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
          onClick={() => navigate(`/medicines?group=${category.id}`)}
        >
          Xem thuốc
        </Button>

        <Tooltip title="Sửa">
          <Button
            type="default"
            size="small"
            icon={<Pencil size={14} />}
            className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
            onClick={() => onEdit(category)}
          />
        </Tooltip>

        <Tooltip title={isEmpty ? 'Xóa nhóm' : 'Không thể xóa — còn thuốc'}>
          <Button
            type="default"
            size="small"
            danger={isEmpty}
            disabled={!isEmpty}
            icon={<Trash2 size={14} />}
            className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)]"
            onClick={() => onDelete(category)}
          />
        </Tooltip>
      </div>
    </div>
  );
}
