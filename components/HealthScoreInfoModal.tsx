import React from 'react';
import { X, Activity, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../services/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const HealthScoreInfoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Activity size={24} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('how_it_works')}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-300" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p className="leading-relaxed bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                {t('score_explanation')}
            </p>

            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <div>
                        <span className="font-bold text-slate-900 dark:text-white block">90-100% {t('score_excellent')}</span>
                        <span className="text-xs opacity-80">{t('desc_excellent')}</span>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                    <div>
                        <span className="font-bold text-slate-900 dark:text-white block">70-89% {t('score_good')}</span>
                        <span className="text-xs opacity-80">{t('desc_good')}</span>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0"></div>
                    <div>
                        <span className="font-bold text-slate-900 dark:text-white block">40-69% {t('score_moderate')}</span>
                        <span className="text-xs opacity-80">{t('desc_moderate')}</span>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-600 shrink-0 shadow-[0_0_8px_rgba(225,29,72,0.5)]"></div>
                    <div>
                        <span className="font-bold text-slate-900 dark:text-white block">&lt; 40% {t('score_critical')}</span>
                        <span className="text-xs opacity-80">{t('desc_critical')}</span>
                    </div>
                </div>
            </div>
            
            <div className="pt-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border-t border-slate-100 dark:border-slate-700 mt-2">
                 <ShieldCheck size={14} />
                 <span>&gt; 95% = {t('responsible_driver')} Badge</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HealthScoreInfoModal;