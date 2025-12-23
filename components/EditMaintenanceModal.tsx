import React, { useState, useEffect } from 'react';
import { MaintenanceItemWithStatus } from '../types';
import { X, Calendar, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from '../services/i18n';
import { isExpirationBased } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: MaintenanceItemWithStatus | null;
  currentVehicleMileage: number;
  onSave: (id: string, mileage: number, date: string) => void;
}

const EditMaintenanceModal: React.FC<Props> = ({ isOpen, onClose, item, currentVehicleMileage, onSave }) => {
  const { t } = useTranslation();
  
  const [mileage, setMileage] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isUnknown, setIsUnknown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if it's a date-only/legal item (Expiration Date) or Mechanical (Service Date)
  const isExpirationItem = item ? isExpirationBased(item.category) : false;

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (d: Date | string) => {
      const dateObj = typeof d === 'string' ? new Date(d) : d;
      if (isNaN(dateObj.getTime())) return '';
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isOpen && item) {
      if (item.lastReplacedMileage === -1) {
          setIsUnknown(true);
          setMileage(currentVehicleMileage.toString());
          setDate(getLocalDateString(new Date()));
      } else {
          setIsUnknown(false);
          setMileage(item.lastReplacedMileage.toString());
          setDate(getLocalDateString(item.lastReplacedDate));
      }
      setError(null);
    }
  }, [isOpen, item, currentVehicleMileage]);

  // Validation Logic
  useEffect(() => {
      if (!isOpen || !item || isUnknown) {
          setError(null);
          return;
      }

      const inputMileage = Number(mileage);
      
      // 1. Mileage Validation (Mechanical only)
      if (!isExpirationItem) {
          if (inputMileage < 0) {
              setError(t('error_negative_mileage'));
              return;
          }
          if (inputMileage > currentVehicleMileage) {
              setError(t('error_mileage_limit'));
              return;
          }
      }

      // 2. Date Validation
      if (!isExpirationItem && date) {
          // Mechanical: Last Replacement cannot be in future
          const [y, m, d] = date.split('-').map(Number);
          const inputDate = new Date(y, m - 1, d); 
          inputDate.setHours(0,0,0,0);

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (inputDate > today) {
              setError(t('error_future_date'));
              return;
          }
      }

      setError(null);
  }, [mileage, date, isExpirationItem, isOpen, isUnknown, currentVehicleMileage, t, item]);


  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return; // Prevent save if error

    if (isUnknown) {
        onSave(item.id, -1, new Date().toISOString());
    } else {
        // LOGIC FIX:
        // For Expiration items (Legal), if we know the date, we MUST save a positive mileage (current)
        // to break the "Review Needed" (-1) status lock. 
        const saveMileage = isExpirationItem ? currentVehicleMileage : Number(mileage);
        
        // Construct valid ISO string
        const [y, m, d] = date.split('-').map(Number);
        const dateToSave = new Date(y, m - 1, d, 12, 0, 0); 
        
        onSave(item.id, saveMileage, dateToSave.toISOString());
    }
    onClose();
  };

  const usage = isUnknown ? 0 : currentVehicleMileage - Number(mileage);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500">
        <div className="flex justify-between items-start mb-6">
          <div>
               <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('adjust_history')}</h3>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{t(item.category)}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-300" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl cursor-pointer" onClick={() => setIsUnknown(!isUnknown)}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isUnknown ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-500'}`}>
                  {isUnknown && <Check size={14} className="text-white" />}
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('i_dont_know')}</span>
          </div>

          {!isUnknown && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                {!isExpirationItem && (
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('last_replaced_km')}</label>
                        <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 text-slate-900 dark:text-white font-bold border-none focus:ring-0 shadow-inner"
                        />
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium px-1">
                            {t('usage_info', { km: usage > 0 ? usage.toLocaleString() : 0 })}
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {isExpirationItem ? t('expiration_date') : t('last_replaced_date')}
                    </label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-4 text-slate-400" />
                        <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 pl-12 text-slate-900 dark:text-white font-bold border-none focus:ring-0 shadow-inner"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-2xl flex gap-3 items-center animate-in slide-in-from-top-1">
                        <AlertCircle size={18} className="text-rose-500 shrink-0" />
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-tight">{error}</span>
                    </div>
                )}
              </div>
          )}
          
          <button
            type="submit"
            disabled={!!error && !isUnknown}
            className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all ${
                (!!error && !isUnknown)
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

export default EditMaintenanceModal;