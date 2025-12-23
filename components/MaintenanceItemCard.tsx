import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Calendar, HelpCircle, MoreVertical, Edit3 } from 'lucide-react';
import { MaintenanceItemWithStatus, MaintenanceStatus } from '../types';
import { useTranslation } from '../services/i18n';
import { formatAppDate, isExpirationBased } from '../utils';

interface Props {
  item: MaintenanceItemWithStatus;
  onFix: (item: MaintenanceItemWithStatus) => void;
  onEdit?: (item: MaintenanceItemWithStatus) => void;
}

const MaintenanceItemCard: React.FC<Props> = ({ item, onFix, onEdit }) => {
  const { t } = useTranslation();
  const isOverdue = item.status === MaintenanceStatus.OVERDUE;
  const isWarning = item.status === MaintenanceStatus.WARNING;
  const isUnknown = item.status === MaintenanceStatus.REVIEW_NEEDED;
  
  // Use centralized logic to determine if it's a "Legal/Expiration" item or a "Service" item
  const isExpirationItem = isExpirationBased(item.category);

  let statusColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";
  let progressBarColor = "bg-emerald-500";
  let statusText = t('ok');

  if (isOverdue) {
    statusColor = "text-rose-500 bg-rose-50 dark:bg-rose-500/10";
    progressBarColor = "bg-rose-500";
    statusText = t('overdue');
  } else if (isWarning) {
    statusColor = "text-amber-500 bg-amber-50 dark:bg-amber-500/10";
    progressBarColor = "bg-amber-500";
    statusText = t('due_soon');
  } else if (isUnknown) {
    statusColor = "text-slate-500 bg-slate-100 dark:bg-slate-700";
    progressBarColor = "bg-slate-300 dark:bg-slate-600";
    statusText = t('review_needed');
  }

  // Calculate percentage for progress bar (clamped 0-100)
  const percent = Math.min(100, Math.max(0, item.progress));

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-soft hover:shadow-soft-hover transition-all relative group">
      
      <div className="flex justify-between items-start mb-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">{t(item.category)}</h4>
                {isOverdue && <AlertTriangle size={16} className="text-rose-500" />}
                {isUnknown && <HelpCircle size={16} className="text-slate-400" />}
           </div>
           <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${statusColor}`}>
              {statusText}
           </span>
        </div>
        
        <div className="flex items-center gap-2">
            {onEdit && (
                <button 
                    onClick={() => onEdit(item)}
                    className="p-2 text-slate-300 hover:text-indigo-600 dark:text-slate-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <Edit3 size={18} />
                </button>
            )}
            <button 
                onClick={() => onFix(item)}
                className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl shadow-lg shadow-slate-200 dark:shadow-none active:scale-95 transition-all"
            >
                {isExpirationItem ? t('renew') : t('replace')}
            </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${progressBarColor}`} 
            style={{ width: isUnknown ? '0%' : `${percent}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {isUnknown ? (
                <span className="text-slate-400 italic">{t('i_dont_know')}</span>
            ) : isExpirationItem ? (
                // EXPIRATION ITEM STATS (Time Remaining to Date)
                <div className="flex items-center justify-between w-full">
                    <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                        {item.daysRemaining < 0 ? `${Math.abs(item.daysRemaining)} ${t('late')}` : `${item.daysRemaining} ${t('days')} ${t('left')}`}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                        <Calendar size={12} className="text-indigo-500" />
                        {t('expires_on', { date: formatAppDate(item.lastReplacedDate) })}
                    </span>
                </div>
            ) : (
                // MECHANICAL ITEM STATS (Usage Remaining)
                <>
                    {/* Show KM Remaining if interval > 0 */}
                    {item.intervalKm > 0 ? (
                         <span className={item.status === MaintenanceStatus.OVERDUE ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                            {item.kmRemaining < 0 ? `+${Math.abs(item.kmRemaining).toLocaleString()} km` : `${item.kmRemaining.toLocaleString()} km`} {t('left')}
                        </span>
                    ) : (
                        <span></span> // Spacer
                    )}
                   
                   {/* Show Time Remaining if intervalMonths > 0 */}
                   {item.intervalMonths > 0 ? (
                        <span className={item.status === MaintenanceStatus.OVERDUE ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                            {item.daysRemaining < 0 ? `${Math.abs(item.daysRemaining)} ${t('days')}` : `${item.daysRemaining} ${t('days')}`} {t('left')}
                        </span>
                   ) : (
                        // If no time interval (e.g. DPF), show nothing here
                        <span></span> 
                   )}
                </>
            )}
        </div>
        
        {!isUnknown && !isExpirationItem && (
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-3 border-t border-slate-50 dark:border-slate-700/50 mt-2 font-mono">
                <Clock size={12} />
                {t('last')} {formatAppDate(item.lastReplacedDate)}
            </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceItemCard;