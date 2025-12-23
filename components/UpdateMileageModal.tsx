import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from '../services/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentMileage: number;
  onSave: (newMileage: number) => void;
  vehicleName: string;
}

const UpdateMileageModal: React.FC<Props> = ({ isOpen, onClose, currentMileage, onSave, vehicleName }) => {
  const { t } = useTranslation();
  const [val, setVal] = useState(currentMileage.toString());
  const [error, setError] = useState<string | null>(null);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
        setVal(currentMileage.toString());
        setError(null);
    }
  }, [isOpen, currentMileage]);

  // Real-time validation
  useEffect(() => {
    const num = Number(val);
    if (val === '') {
        setError(null);
    } else if (num < 0) {
        setError(t('error_negative_mileage'));
    } else if (num < currentMileage) {
        setError(t('error_mileage_lower_than_current'));
    } else {
        setError(null);
    }
  }, [val, currentMileage, t]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;
    onSave(parseInt(val, 10));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500">
        <div className="flex justify-between items-start mb-6">
          <div>
               <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('update_odometer')}</h3>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{vehicleName}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-300" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 text-center shadow-inner">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('update_reading')}</label>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full text-4xl font-black text-center text-slate-800 dark:text-white bg-transparent border-none focus:ring-0 outline-none p-0"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-2xl flex gap-3 items-center animate-in slide-in-from-top-1">
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-tight">{error}</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={!!error || val === ''}
            className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all ${
                (!!error || val === '')
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-900/30 active:scale-[0.98]'
            }`}
          >
            <Check size={20} strokeWidth={3} />
            {t('save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateMileageModal;