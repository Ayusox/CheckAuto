import React, { useState, useRef, useEffect } from 'react';
import { Vehicle } from '../types';
import { X, Camera, Loader2, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../services/i18n';
import { compressImage } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSave: (vehicle: Vehicle) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const EditVehicleModal: React.FC<Props> = ({ isOpen, onClose, vehicle, onSave, onDelete }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Vehicle>(vehicle);
  const [newImage, setNewImage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setFormData(vehicle);
        setNewImage(undefined);
        setShowDeleteConfirm(false);
    }
  }, [isOpen, vehicle]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const base64 = await compressImage(file);
              setNewImage(base64);
          } catch (err) {
              console.error("Error processing image", err);
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        const updatedVehicle = { ...formData };
        if (newImage) {
            updatedVehicle.image = newImage;
        }
        await onSave(updatedVehicle);
        onClose();
    } catch (e) {
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
      setIsSubmitting(true);
      try {
          await onDelete(vehicle.id);
          onClose();
      } catch (e) {
          console.error(e);
          setIsSubmitting(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-slate-50 dark:bg-slate-900 animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-6 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-between z-10">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('edit_vehicle')}</h2>
                <p className="text-sm text-slate-400">{vehicle.make} {vehicle.model}</p>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                <X size={24} className="text-slate-600 dark:text-slate-300" />
            </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
             <form onSubmit={handleSubmit} className="space-y-6">
                 
                 {/* Image Picker */}
                 <div className="flex justify-center mb-6">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 rounded-3xl bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-500 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors overflow-hidden relative shadow-inner"
                    >
                        {(newImage || formData.image) ? (
                            <img src={newImage || formData.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-slate-400 flex flex-col items-center gap-2">
                                <Camera size={24} />
                                <span className="text-xs font-bold">{t('change_photo')}</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageSelect} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        {/* Overlay text for existing image */}
                        {(newImage || formData.image) && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                        )}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide pl-1">{t('make')}</label>
                        <input 
                            required 
                            className="w-full p-4 bg-white dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-semibold" 
                            placeholder={t('placeholder_make')}
                            value={formData.make} 
                            onChange={e => setFormData({...formData, make: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide pl-1">{t('model')}</label>
                        <input 
                            required 
                            className="w-full p-4 bg-white dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-semibold" 
                            placeholder={t('placeholder_model')}
                            value={formData.model} 
                            onChange={e => setFormData({...formData, model: e.target.value})} 
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide pl-1">{t('year')}</label>
                        <input 
                            type="number" 
                            inputMode="numeric" 
                            required 
                            className="w-full p-4 bg-white dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-semibold" 
                            placeholder={t('placeholder_year')}
                            value={formData.year} 
                            onChange={e => setFormData({...formData, year: Number(e.target.value)})} 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide pl-1">{t('plate')}</label>
                        <input 
                            required 
                            className="w-full p-4 bg-white dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-semibold" 
                            placeholder={t('placeholder_plate')}
                            value={formData.plate} 
                            onChange={e => setFormData({...formData, plate: e.target.value})} 
                        />
                    </div>
                 </div>

                 <div className="pt-4 flex gap-3">
                     <button 
                        type="button" 
                        onClick={onClose} 
                        className="flex-1 py-4 text-slate-500 dark:text-slate-300 font-bold bg-slate-200 dark:bg-slate-700 rounded-2xl hover:bg-slate-300 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="flex-[2] py-4 text-white font-bold bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> {t('save')}</>}
                    </button>
                 </div>
              </form>

              {/* Danger Zone */}
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                  {!showDeleteConfirm ? (
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full py-4 text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
                      >
                          <Trash2 size={20} />
                          {t('delete_vehicle')}
                      </button>
                  ) : (
                      <div className="bg-rose-50 dark:bg-rose-500/10 p-5 rounded-2xl animate-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
                              <AlertTriangle size={24} />
                              <span className="font-bold">{t('delete_vehicle_confirm')}</span>
                          </div>
                          <div className="flex gap-3">
                              <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl shadow-sm"
                              >
                                  {t('cancel')}
                              </button>
                              <button 
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex justify-center items-center"
                              >
                                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : t('confirm')}
                              </button>
                          </div>
                      </div>
                  )}
              </div>
        </div>
    </div>
  );
};

export default EditVehicleModal;