import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, Camera, Loader2, AlertOctagon, Car } from 'lucide-react';
import { Vehicle, MaintenanceConfig, MaintenanceStatus } from '../types';
import { calculateHealthScore, calculateMaintenanceStatus, getScoreMeta, compressImage } from '../utils';
import { useTranslation } from '../services/i18n';

// Components
import HealthScoreInfoModal from '../components/HealthScoreInfoModal';
import VehicleCard from '../components/VehicleCard';
import VehicleSetupWizard from '../components/VehicleSetupWizard'; 
import Footer from '../components/Footer';

interface Props {
  vehicles: Vehicle[];
  configs: MaintenanceConfig[];
  onSelectVehicle: (id: string) => void;
  onAddVehicle: (v: Omit<Vehicle, 'id' | 'userId'>) => Promise<void>;
}

const Garage: React.FC<Props> = ({ vehicles, configs, onSelectVehicle, onAddVehicle }) => {
  // --- Hooks ---
  const { t } = useTranslation();
  
  // --- Local State ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Wizard & New Car State
  const [setupVehicleId, setSetupVehicleId] = useState<string | null>(null);
  const [waitingForWizard, setWaitingForWizard] = useState(false);
  
  // Use a flexible type for local form state to allow empty string for mileage
  const [newCar, setNewCar] = useState<{
    make: string;
    model: string;
    year: number;
    plate: string;
    currentMileage: string | number;
  }>({ 
    make: '', 
    model: '', 
    year: new Date().getFullYear(), 
    plate: '', 
    currentMileage: '' // Empty string so input placeholder shows instead of "0"
  });

  const [newCarImage, setNewCarImage] = useState<string | undefined>(undefined);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevVehiclesRef = useRef(vehicles);

  // --- Effects ---

  // Detect new vehicle addition to trigger wizard
  useEffect(() => {
    if (waitingForWizard) {
        const newOnes = vehicles.filter(v => !prevVehiclesRef.current.find(p => p.id === v.id));
        if (newOnes.length > 0) {
            setSetupVehicleId(newOnes[0].id);
            setWaitingForWizard(false);
        }
    }
    prevVehiclesRef.current = vehicles;
  }, [vehicles, waitingForWizard]);

  // --- Memos ---

  // Alert Logic: Show if any car has > 3 unknown items
  const showUnknownDataAlert = useMemo(() => {
    for (const v of vehicles) {
        const vConfigs = configs.filter(c => c.vehicleId === v.id && c.isActive);
        let unknownCount = 0;
        for (const c of vConfigs) {
            const status = calculateMaintenanceStatus(v, c).status;
            if (status === MaintenanceStatus.REVIEW_NEEDED) unknownCount++;
        }
        if (unknownCount > 3) return true;
    }
    return false;
  }, [vehicles, configs]);

  // Footer color based on lowest health score
  const lowestScoreMeta = useMemo(() => {
    if (vehicles.length === 0) return null;
    let minScore = 100;
    vehicles.forEach(v => {
        const s = calculateHealthScore(v, configs);
        if (s < minScore) minScore = s;
    });
    return getScoreMeta(minScore);
  }, [vehicles, configs]);

  // --- Handlers ---

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert empty string or string to number
    const mileageNum = newCar.currentMileage === '' ? 0 : Number(newCar.currentMileage);

    if (mileageNum < 0) return;
    
    setIsSubmitting(true);
    try {
        await onAddVehicle({ 
            make: newCar.make,
            model: newCar.model,
            year: newCar.year,
            plate: newCar.plate,
            currentMileage: mileageNum,
            image: newCarImage 
        });
        setShowAddForm(false);
        setWaitingForWizard(true);
        // Reset form
        setNewCar({ make: '', model: '', year: new Date().getFullYear(), plate: '', currentMileage: '' });
        setNewCarImage(undefined);
    } catch (error) {
        console.error("Failed to add vehicle", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const base64 = await compressImage(file);
              setNewCarImage(base64);
          } catch (err) {
              console.error("Error processing image", err);
          }
      }
  };

  // --- Render ---

  // 1. Wizard Render Override
  const setupVehicle = vehicles.find(v => v.id === setupVehicleId);
  if (setupVehicleId && setupVehicle) {
      return (
          <VehicleSetupWizard 
            vehicle={setupVehicle}
            onComplete={() => setSetupVehicleId(null)}
            onCancel={() => setSetupVehicleId(null)}
          />
      );
  }

  // 2. Add Form Render Override
  if (showAddForm) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-soft">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{t('add_vehicle')}</h2>
          
          <form onSubmit={handleAddSubmit} className="space-y-5">
             <div className="flex justify-center mb-6">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-3xl bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-500 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors overflow-hidden relative"
                >
                    {newCarImage ? (
                        <img src={newCarImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-slate-400 flex flex-col items-center gap-2">
                            <Camera size={24} />
                            <span className="text-xs font-bold">{t('add_photo')}</span>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide pl-1">{t('make')}</label>
                    <input required className="w-full p-4 bg-slate-100 dark:bg-slate-700/50 dark:text-white rounded-2xl border-none focus:ring-0 font-semibold" placeholder={t('placeholder_make')} value={newCar.make} onChange={e => setNewCar({...newCar, make: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide pl-1">{t('model')}</label>
                    <input required className="w-full p-4 bg-slate-100 dark:bg-slate-700/50 dark:text-white rounded-2xl border-none focus:ring-0 font-semibold" placeholder={t('placeholder_model')} value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide pl-1">{t('year')}</label>
                    <input type="number" inputMode="numeric" required className="w-full p-4 bg-slate-100 dark:bg-slate-700/50 dark:text-white rounded-2xl border-none focus:ring-0 font-semibold" placeholder={t('placeholder_year')} value={newCar.year} onChange={e => setNewCar({...newCar, year: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide pl-1">{t('plate')}</label>
                    <input required className="w-full p-4 bg-slate-100 dark:bg-slate-700/50 dark:text-white rounded-2xl border-none focus:ring-0 font-semibold" placeholder={t('placeholder_plate')} value={newCar.plate} onChange={e => setNewCar({...newCar, plate: e.target.value})} />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide pl-1">{t('current_mileage')} (km)</label>
                <input 
                    type="number" 
                    inputMode="numeric" 
                    min="0" 
                    required 
                    className="w-full p-4 bg-slate-100 dark:bg-slate-700/50 dark:text-white rounded-2xl border-none focus:ring-0 font-semibold" 
                    placeholder={t('placeholder_km')} 
                    value={newCar.currentMileage} 
                    onChange={e => setNewCar({...newCar, currentMileage: e.target.value})} 
                />
             </div>
             
             <div className="flex gap-4 pt-4">
                 <button type="button" disabled={isSubmitting} onClick={() => setShowAddForm(false)} className="flex-1 py-4 text-slate-500 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 rounded-2xl hover:bg-slate-200 transition-colors">{t('cancel')}</button>
                 <button type="submit" disabled={isSubmitting} className="flex-1 py-4 text-white font-bold bg-slate-900 dark:bg-indigo-600 rounded-2xl shadow-lg shadow-slate-200 dark:shadow-indigo-900/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : t('save')}
                 </button>
             </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. Empty State Render
  if (vehicles.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-soft">
                  <Car size={48} className="text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('empty_garage_title')}</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-8 leading-relaxed">
                  {t('empty_garage_desc')}
              </p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all hover:bg-indigo-700"
              >
                  <Plus size={20} />
                  {t('add_first_vehicle')}
              </button>
          </div>
      );
  }

  // 4. Main List Render
  return (
    <div className="space-y-6">
      {showUnknownDataAlert && (
          <div className="bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[2rem] p-6 shadow-soft animate-in slide-in-from-top-4 flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-500 shrink-0 shadow-sm">
                  <AlertOctagon size={28} strokeWidth={2} />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('alert_unknown_data_title')}</h3>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{t('alert_unknown_data_msg')}</p>
              </div>
          </div>
      )}

      {vehicles.map((v) => {
        const score = calculateHealthScore(v, configs);
        const activeConfigs = configs.filter(c => c.vehicleId === v.id && c.isActive);
        return (
            <VehicleCard 
                key={v.id}
                vehicle={v}
                healthScore={score}
                isSetup={activeConfigs.length > 0}
                onSelect={onSelectVehicle}
                onInfoClick={(e) => { e.stopPropagation(); setShowInfoModal(true); }}
            />
        );
      })}

      <button 
        onClick={() => setShowAddForm(true)}
        className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-[0.98]"
      >
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400"><Plus size={24} /></div>
        <span>{t('add_vehicle')}</span>
      </button>

      <HealthScoreInfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
      <Footer colorClass={lowestScoreMeta?.color} />
    </div>
  );
};

export default Garage;