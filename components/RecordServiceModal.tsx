import React, { useState, useEffect } from 'react';
import { MaintenanceItemWithStatus } from '../types';
import { X, DollarSign, MapPin, Gauge, FileText, AlertCircle, Calendar, Check } from 'lucide-react';
import { useTranslation } from '../services/i18n';
import { isExpirationBased } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: MaintenanceItemWithStatus | null;
  currentVehicleMileage: number;
  onSave: (data: { mileage: number; cost: number; shop: string; notes: string; date: string }) => void;
}

const RecordServiceModal: React.FC<Props> = ({ isOpen, onClose, item, currentVehicleMileage, onSave }) => {
  const { t } = useTranslation();
  const [mileage, setMileage] = useState(currentVehicleMileage);
  const [cost, setCost] = useState('');
  const [shop, setShop] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isExpirationItem = item ? isExpirationBased(item.category) : false;

  const getLocalDateString = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isOpen) {
        setMileage(currentVehicleMileage);
        setCost('');
        setShop('');
        setNotes('');
        setError(null);

        const today = new Date();
        if (isExpirationItem) {
            today.setFullYear(today.getFullYear() + 1);
            setDate(getLocalDateString(today));
        } else {
            setDate(getLocalDateString(today));
        }
    }
  }, [isOpen, currentVehicleMileage, isExpirationItem]);

  useEffect(() => {
      if (!isOpen) return;

      const numMileage = Number(mileage);
      const numCost = Number(cost);

      if (!isExpirationItem) {
          if (numMileage < 0) {
              setError(t('error_negative_mileage'));
              return;
          }
          if (numMileage > currentVehicleMileage) {
              setError(t('error_mileage_limit'));
              return;
          }
      }

      if (numCost < 0) {
          setError(t('error_negative_cost'));
          return;
      }

      if (date) {
        const [y, m, d] = date.split('-').map(Number);
        const inputDate = new Date(y, m - 1, d);
        inputDate.setHours(0,0,0,0);
        
        const today = new Date();
        today.setHours(0,0,0,0);

        if (!isExpirationItem && inputDate > today) {
            setError(t('error_future_date'));
            return;
        }
      }

      setError(null);
  }, [mileage, cost, date, currentVehicleMileage, t, isOpen, isExpirationItem]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;

    const [y, m, d] = date.split('-').map(Number);
    const validDate = new Date(y, m - 1, d, 12, 0, 0);

    onSave({
      mileage: isExpirationItem ? currentVehicleMileage : Number(mileage),
      cost: Number(cost),
      shop,
      notes,
      date: validDate.toISOString()
    });
    onClose();
  };

  return (
    // Outer container: Fixed, inset-0, z-index high. 
    // Key change: 'overflow-y-auto' allows the entire modal to scroll if keyboard pushes content up.
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Inner container: Flex allows centering/bottom alignment, but min-h-full ensures it grows nicely */}
      <div className="min-h-full flex items-end sm:items-center justify-center p-4">
        
        {/* Modal Card */}
        <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-6 xs:p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500 relative">
            
            <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{isExpirationItem ? t('confirm_renewal') : t('record_service')}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{isExpirationItem ? t('renewing') : t('replacing')}</span>
                    <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide truncate max-w-[150px]">{t(item.category)}</span>
                </div>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shrink-0">
                <X size={20} className="text-slate-500 dark:text-slate-300" />
            </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 pl-1">
                    <Calendar size={14} /> {isExpirationItem ? t('new_expiration_date') : t('service_date')}
                </label>
                <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={!isExpirationItem ? getLocalDateString(new Date()) : undefined}
                className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 text-slate-900 dark:text-white font-bold border-none focus:ring-0 focus:bg-white dark:focus:bg-slate-700 transition-colors shadow-inner"
                />
            </div>

            {!isExpirationItem && (
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 pl-1">
                        <Gauge size={14} /> {t('current_mileage')}
                    </label>
                    <input
                    type="number"
                    required
                    min="0"
                    inputMode="numeric"
                    value={mileage}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 text-slate-900 dark:text-white font-bold border-none focus:ring-0 focus:bg-white dark:focus:bg-slate-700 transition-colors shadow-inner"
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 pl-1">
                        <DollarSign size={14} /> {t('total_cost')}
                    </label>
                    <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    required
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 text-slate-900 dark:text-white font-bold border-none focus:ring-0 focus:bg-white dark:focus:bg-slate-700 transition-colors shadow-inner"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 pl-1">
                        <MapPin size={14} /> {t('shop')}
                    </label>
                    <input
                    type="text"
                    required
                    placeholder={t('placeholder_shop')}
                    value={shop}
                    onChange={(e) => setShop(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 text-slate-900 dark:text-white font-bold border-none focus:ring-0 focus:bg-white dark:focus:bg-slate-700 transition-colors shadow-inner"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 pl-1">
                    <FileText size={14} /> {t('notes')}
                </label>
                <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 text-slate-900 dark:text-white text-sm font-medium border-none focus:ring-0 focus:bg-white dark:focus:bg-slate-700 transition-colors shadow-inner resize-none"
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
                disabled={!!error}
                className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all mt-4 flex items-center justify-center gap-2 ${
                    !!error
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-slate-900 dark:bg-indigo-600 text-white shadow-slate-200 dark:shadow-indigo-900/30 active:scale-[0.98]'
                }`}
            >
                <Check size={20} strokeWidth={3} />
                {isExpirationItem ? t('confirm_renewal') : t('confirm_replacement')}
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default RecordServiceModal;