import React, { useState, useEffect } from 'react';
import { ServiceRecord } from '../types';
import { X, DollarSign, MapPin, Gauge, FileText, AlertCircle, Calendar, Check } from 'lucide-react';
import { useTranslation } from '../services/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: ServiceRecord;
  onSave: (recordId: string, data: Partial<ServiceRecord>) => Promise<void>;
  currentVehicleMileage: number;
}

const EditHistoryModal: React.FC<Props> = ({ isOpen, onClose, record, onSave, currentVehicleMileage }) => {
  const { t } = useTranslation();
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [shop, setShop] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (d: Date | string) => {
      const dateObj = typeof d === 'string' ? new Date(d) : d;
      if (isNaN(dateObj.getTime())) return '';
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  // Reset state when opening
  useEffect(() => {
    if (isOpen && record) {
        setMileage(record.mileage.toString());
        setCost(record.cost.toString());
        setShop(record.shopName || '');
        setNotes(record.notes || '');
        setDate(getLocalDateString(record.date));
        setError(null);
    }
  }, [isOpen, record]);

  // Validation Logic
  useEffect(() => {
      if (!isOpen) return;

      const numMileage = Number(mileage);
      const numCost = Number(cost);

      if (numMileage < 0) {
          setError(t('error_negative_mileage'));
          return;
      }
      
      // Ensure we don't accidentally set a service record higher than current odometer
      // unless it was already higher (edge case of bad data, but we force fix)
      if (numMileage > currentVehicleMileage) {
          setError(t('error_mileage_limit'));
          return;
      }

      if (numCost < 0) {
          setError(t('error_negative_cost'));
          return;
      }

      // Date Check (Future)
      if (date) {
        const [y, m, d] = date.split('-').map(Number);
        const inputDate = new Date(y, m - 1, d);
        inputDate.setHours(0,0,0,0);
        
        const today = new Date();
        today.setHours(0,0,0,0);

        if (inputDate > today) {
            setError(t('error_future_date'));
            return;
        }
      }

      setError(null);
  }, [mileage, cost, date, t, isOpen, currentVehicleMileage]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;

    setIsSubmitting(true);
    try {
        // Construct valid ISO string from date input
        const [y, m, d] = date.split('-').map(Number);
        // Use Noon to avoid timezone shifts
        const validDate = new Date(y, m - 1, d, 12, 0, 0);

        await onSave(record.id, {
          mileage: Number(mileage),
          cost: Number(cost),
          shopName: shop,
          notes: notes,
          date: validDate.toISOString()
        });
        onClose();
    } catch (e) {
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-start mb-6">
          <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{t('edit_record')}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 pl-1">
                <Calendar size={14} /> {t('service_date')}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={getLocalDateString(new Date())}
              className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 text-slate-900 dark:text-white font-bold border-none focus:ring-0 focus:bg-white dark:focus:bg-slate-700 transition-colors shadow-inner"
            />
          </div>

          {/* Mileage Input */}
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
                onChange={(e) => setMileage(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 text-slate-900 dark:text-white font-bold border-none focus:ring-0 focus:bg-white dark:focus:bg-slate-700 transition-colors shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Cost Input */}
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

            {/* Shop Input */}
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

           {/* Notes */}
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
            disabled={!!error || isSubmitting}
            className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all mt-4 flex items-center justify-center gap-2 ${
                (!!error || isSubmitting)
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-slate-900 dark:bg-indigo-600 text-white shadow-slate-200 dark:shadow-indigo-900/30 active:scale-[0.98]'
            }`}
          >
            <Check size={20} strokeWidth={3} />
            {t('update')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditHistoryModal;