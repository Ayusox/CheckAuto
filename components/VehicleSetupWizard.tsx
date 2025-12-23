import React, { useState, useEffect } from 'react';
import { Vehicle, MaintenanceConfig } from '../types';
import { useTranslation } from '../services/i18n';
import * as DB from '../services/db';
import { ChevronRight, Check, Calendar, Droplets, Gauge, Settings2, Loader2, Info, CheckCircle2, Trophy, AlertCircle } from 'lucide-react';

interface Props {
  vehicle: Vehicle;
  onComplete: () => void;
  onCancel: () => void;
}

const VehicleSetupWizard: React.FC<Props> = ({ vehicle, onComplete, onCancel }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [configs, setConfigs] = useState<MaintenanceConfig[]>([]);
  const [saving, setSaving] = useState(false);

  // --- Step 1: Legal State ---
  const [itvDate, setItvDate] = useState<string>('');
  const [itvInterval, setItvInterval] = useState<number>(12); // Months
  const [taxDate, setTaxDate] = useState<string>('');

  // --- Step 2: Engine/Oil State ---
  const [oilKm, setOilKm] = useState<string>('');
  const [oilInterval, setOilInterval] = useState<number>(15000);
  const [oilDate, setOilDate] = useState<string>('');
  const [oilError, setOilError] = useState<string | null>(null);

  // --- Step 3: Other Preferences ---
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadConfigs();
  }, [vehicle]);

  useEffect(() => {
    // Pre-fill oil date with today if not set
    if (!oilDate) setOilDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Validation Effect for Step 2
  useEffect(() => {
    if (oilKm) {
        const lastKm = Number(oilKm);
        if (lastKm < 0) {
            setOilError(t('error_negative_mileage'));
        } else if (lastKm > vehicle.currentMileage) {
            // It is physically impossible for the last oil change to be higher than current odometer
            setOilError(t('error_mileage_limit'));
        } else {
            setOilError(null);
        }
    } else {
        setOilError(null);
    }
  }, [oilKm, vehicle.currentMileage, t]);

  const loadConfigs = async () => {
    setLoading(true);
    const data = await DB.getMaintenanceConfigs(vehicle.userId);
    const vConfigs = data.filter(c => c.vehicleId === vehicle.id);
    setConfigs(vConfigs);
    setLoading(false);
  };

  const getToday = () => new Date().toISOString().split('T')[0];

  const handleNext = () => {
      // Validation Block
      if (step === 2) {
          if (!oilKm) return; // Required
          if (oilError) return; // Block on logical error
          if (!oilDate) return; // Required date
      }
      if (step < 3) setStep(prev => (prev + 1) as 1 | 2 | 3);
  };

  const handleFinish = async () => {
      setSaving(true);
      try {
          const updates: MaintenanceConfig[] = [];
          
          // 1. Legal Updates
          const itvConfig = configs.find(c => c.category === 'inspection');
          if (itvConfig && itvDate) {
              const lastItv = new Date(itvDate);
              const nextItv = new Date(lastItv);
              nextItv.setMonth(nextItv.getMonth() + itvInterval);

              updates.push({
                  ...itvConfig,
                  isActive: true,
                  intervalMonths: itvInterval,
                  lastReplacedMileage: vehicle.currentMileage,
                  lastReplacedDate: nextItv.toISOString()
              });
          }

          const taxConfig = configs.find(c => c.category === 'road_tax');
          if (taxConfig && taxDate) {
              updates.push({
                  ...taxConfig,
                  isActive: true,
                  lastReplacedMileage: vehicle.currentMileage,
                  lastReplacedDate: new Date(taxDate).toISOString()
              });
          }

          // 2. Oil Updates
          const oilConfig = configs.find(c => c.category === 'engine_oil');
          const oilFilterConfig = configs.find(c => c.category === 'oil_filter');
          
          if (oilConfig && oilKm && oilDate) {
              const lastKm = Number(oilKm);
              // Use user provided date, default to Noon to be safe with timezones
              const dObj = new Date(oilDate);
              dObj.setHours(12,0,0,0); 
              const dIso = dObj.toISOString();

              const oilUpdate = {
                  ...oilConfig,
                  isActive: true,
                  intervalKm: oilInterval,
                  lastReplacedMileage: lastKm,
                  lastReplacedDate: dIso
              };
              updates.push(oilUpdate);

              if (oilFilterConfig) {
                  updates.push({
                      ...oilFilterConfig,
                      isActive: true,
                      intervalKm: oilInterval,
                      lastReplacedMileage: lastKm,
                      lastReplacedDate: dIso
                  });
              }
          }

          // 3. Other Preferences
          const handledCats = ['inspection', 'road_tax', 'engine_oil', 'oil_filter'];
          
          selectedCats.forEach(cat => {
              if (!handledCats.includes(cat)) {
                  const c = configs.find(cfg => cfg.category === cat);
                  if (c) {
                      updates.push({
                          ...c,
                          isActive: true,
                          // Leave as -1 / Review Needed so user inputs real data later
                      });
                  }
              }
          });

          if (updates.length > 0) {
              await DB.batchUpdateConfigs(vehicle.userId, updates);
          }
          
          setStep(4);

      } catch (e) {
          console.error(e);
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-900 flex flex-col animate-in fade-in duration-300">
      
      {/* Header - Added additive padding for safe area top */}
      {step < 4 && (
          <div className="px-6 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] bg-white dark:bg-slate-800 shadow-sm z-10">
            <div className="max-w-md mx-auto">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('wizard_title')}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('wizard_subtitle', { car: vehicle.model })}</p>
                <div className="flex gap-2 mt-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                </div>
            </div>
          </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-40 no-scrollbar">
        <div className="max-w-md mx-auto space-y-6 w-full">

            {/* STEP 1: LEGAL */}
            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-300">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-100">{t('step_legal')}</h3>
                            <p className="text-xs text-indigo-700 dark:text-indigo-300 opacity-80">{t('wizard_sub_legal')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* ITV Input: Added overflow-hidden and max-w-full to children */}
                        <div className="bg-white dark:bg-slate-800 p-4 xs:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">{t('label_itv_date')}</label>
                            <input 
                                type="date" 
                                className="w-full max-w-full box-border bg-slate-50 dark:bg-slate-700/50 border-none rounded-xl p-3 font-semibold dark:text-white appearance-none"
                                value={itvDate}
                                max={getToday()}
                                onChange={e => setItvDate(e.target.value)}
                            />
                            {itvDate && (
                                <div className="mt-4 animate-in fade-in">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('label_itv_interval')}</label>
                                    <div className="flex gap-2">
                                        {[12, 24, 48].map(m => (
                                            <button key={m} onClick={() => setItvInterval(m)} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${itvInterval === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600'}`}>
                                                {m === 12 ? t('option_1_year') : m === 24 ? t('option_2_years') : t('option_4_years')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tax Input */}
                        <div className="bg-white dark:bg-slate-800 p-4 xs:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">{t('label_tax_date')}</label>
                            <input 
                                type="date" 
                                className="w-full max-w-full box-border bg-slate-50 dark:bg-slate-700/50 border-none rounded-xl p-3 font-semibold dark:text-white appearance-none"
                                value={taxDate}
                                min={getToday()}
                                onChange={e => setTaxDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: ENGINE */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-300">
                            <Droplets size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-900 dark:text-emerald-100">{t('step_engine')}</h3>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 opacity-80">{t('wizard_sub_engine')}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 overflow-hidden">
                        
                        {/* KM Input */}
                        <div>
                             <div className="flex justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">{t('label_oil_km')} <span className="text-rose-500">*</span></label>
                                <span className="text-xs font-mono text-slate-400">Actual: {vehicle.currentMileage.toLocaleString()}</span>
                             </div>
                             <div className="relative">
                                <Gauge size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                <input 
                                    type="number" 
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder={vehicle.currentMileage.toString()}
                                    className="w-full max-w-full box-border bg-slate-50 dark:bg-slate-700/50 border-none rounded-xl p-3 pl-10 font-bold text-lg dark:text-white appearance-none"
                                    value={oilKm}
                                    onChange={e => setOilKm(e.target.value)}
                                />
                             </div>
                             {oilError && (
                                <div className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1">
                                    <AlertCircle size={12} /> {oilError}
                                </div>
                             )}
                        </div>

                        {/* Date Input */}
                        <div className="animate-in fade-in slide-in-from-top-1">
                             <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">{t('label_oil_date')} <span className="text-rose-500">*</span></label>
                             <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                <input 
                                    type="date" 
                                    className="w-full max-w-full box-border bg-slate-50 dark:bg-slate-700/50 border-none rounded-xl p-3 pl-10 font-bold text-lg dark:text-white appearance-none"
                                    value={oilDate}
                                    max={getToday()}
                                    onChange={e => setOilDate(e.target.value)}
                                />
                             </div>
                        </div>

                        {/* Interval Slider */}
                        {oilKm && (
                            <div className="animate-in fade-in slide-in-from-top-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">{t('label_oil_interval')}</label>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-xl overflow-hidden">
                                    <input 
                                        type="range"
                                        min="5000"
                                        max="30000"
                                        step="1000"
                                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 min-w-0"
                                        value={oilInterval}
                                        onChange={e => setOilInterval(Number(e.target.value))}
                                    />
                                    <span className="font-mono font-bold text-sm bg-white dark:bg-slate-600 px-2 py-1 rounded shadow-sm dark:text-white whitespace-nowrap">
                                        {oilInterval.toLocaleString()} km
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 3: PREFERENCES */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                    <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-300">
                            <Settings2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900 dark:text-amber-100">{t('step_prefs')}</h3>
                            <p className="text-xs text-amber-700 dark:text-amber-300 opacity-80">{t('wizard_sub_prefs')}</p>
                        </div>
                    </div>
                    
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 px-2">{t('msg_select_tracking')}</p>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'tires', label: 'tires' },
                            { id: 'brake_pads', label: 'brake_pads' },
                            { id: 'timing_belt', label: 'timing_belt' },
                            { id: 'insurance', label: 'insurance' },
                            { id: 'wipers', label: 'wipers' },
                            { id: 'cabin_filter', label: 'cabin_filter' },
                        ].map(item => {
                            const isSelected = selectedCats.has(item.id);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        const newSet = new Set(selectedCats);
                                        if (isSelected) newSet.delete(item.id);
                                        else newSet.add(item.id);
                                        setSelectedCats(newSet);
                                    }}
                                    className={`p-4 rounded-xl font-bold text-sm text-left transition-all border-2 ${
                                        isSelected 
                                        ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' 
                                        : 'bg-white dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400'
                                    }`}
                                >
                                    {t(item.label)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* STEP 4: SUCCESS */}
            {step === 4 && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center py-10">
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 size={48} className="text-emerald-500" strokeWidth={3} />
                    </div>
                    
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('wizard_success_title')}</h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                            {t('wizard_success_msg')}
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mx-auto max-w-xs border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-center mb-3 text-indigo-500">
                             <Trophy size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('developed_by_branding')}</p>
                    </div>
                </div>
            )}

        </div>
      </div>

      {/* Footer Controls - Fixed: Using calc to ADD safe area to standard padding */}
      <div className="px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50">
          <div className="max-w-md mx-auto flex gap-4">
              {step === 4 ? (
                  <button 
                      onClick={onComplete}
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
                  >
                      {t('close_wizard')}
                  </button>
              ) : (
                  <>
                    {step === 1 ? (
                        <button onClick={onCancel} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">
                            {t('skip')}
                        </button>
                    ) : (
                        <button onClick={() => setStep(prev => (prev - 1) as 1 | 2)} className="flex-1 py-4 font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 rounded-2xl">
                            {t('back')}
                        </button>
                    )}
                    
                    <button 
                            onClick={step === 3 ? handleFinish : handleNext}
                            disabled={saving || (step === 2 && (!oilKm || !!oilError || !oilDate))}
                            className={`flex-[2] py-4 font-bold rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 ${
                                (step === 2 && (!oilKm || !!oilError || !oilDate))
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95'
                            }`}
                    >
                        {saving ? <Loader2 className="animate-spin" /> : step === 3 ? <><Check size={20} />{t('finish')}</> : <>{t('next')}<ChevronRight size={20} /></>}
                    </button>
                  </>
              )}
          </div>
      </div>
    </div>
  );
};

export default VehicleSetupWizard;