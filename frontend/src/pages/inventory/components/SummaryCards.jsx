import React from 'react';
import { Card, Row, Col } from 'antd';
import { AlertCircle, Clock, Info } from 'lucide-react';

const SummaryCards = ({ emergencyCount, warningCount, trackingCount }) => {
  const cards = [
    {
      title: 'Khẩn cấp (≤ 7 ngày)',
      value: emergencyCount,
      description: 'Cần xử lý ngay',
      icon: AlertCircle,
      color: 'var(--color-debt)',
      bgColor: 'var(--color-debt-bg)',
    },
    {
      title: 'Cảnh báo (8–30 ngày)',
      value: warningCount,
      description: 'Ưu tiên bán trước',
      icon: Clock,
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-bg)',
    },
    {
      title: 'Theo dõi (> 30 ngày)',
      value: trackingCount,
      description: 'Theo dõi định kỳ',
      icon: Info,
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
    },
  ];

  return (
    <Row gutter={[16, 16]} className="mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Col xs={24} md={8} key={index}>
            <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <Icon size={24} style={{ color: card.color }} />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[var(--font-size-kpi)] font-bold text-[var(--color-text-primary)]">
                      {card.value}
                    </span>
                    <span className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)] font-medium">lô</span>
                  </div>
                  <div className="text-[var(--color-text-secondary)] text-[var(--font-size-xs)] uppercase tracking-wider font-bold mt-0.5">
                    {card.title}
                  </div>
                  <div className="text-[var(--color-text-muted)] text-[var(--font-size-xs)] mt-1">
                    {card.description}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default SummaryCards;
