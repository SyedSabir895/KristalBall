import { ChevronRight } from 'lucide-react';
import { formatNumber } from '../utils/format';

const TONES = {
  army: 'bg-army-100 text-army-700',
  blue: 'bg-sky-100 text-sky-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  stone: 'bg-stone-100 text-stone-700',
};

// Dashboard metric tile. With onClick it becomes a button (Net Movement → popup).
export default function StatCard({ label, value, icon: Icon, tone = 'stone', hint, onClick, loading }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`card group flex w-full flex-col gap-3 p-4 text-left transition ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:border-army-300 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-stone-500 uppercase">{label}</span>
        {Icon && (
          <span className={`rounded-lg p-2 ${TONES[tone]}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className={`text-2xl font-semibold text-stone-900 tabular-nums transition-opacity ${loading ? 'opacity-40' : ''}`}>
        {formatNumber(value)}
      </div>
      {(hint || onClick) && (
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>{hint}</span>
          {onClick && (
            <span className="flex items-center gap-0.5 font-medium text-army-700 group-hover:underline">
              Details <ChevronRight size={14} />
            </span>
          )}
        </div>
      )}
    </Tag>
  );
}
