import React, { useEffect, useState } from 'react';
import { X, Plus, Tag, DollarSign, Calendar, Sparkles, Package, Zap, Armchair, Trash2, CheckCircle, Gift, Wand2, Loader2, AlertTriangle, Car, Disc, Lightbulb, Cpu, Gauge, AlertCircle } from 'lucide-react';
import { useTranslation } from '../services/i18n';
import { Modification, ModificationCategory } from '../types';
import * as DB from '../services/db';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  vehicleId: string;
  vehicleName: string;
  onDataChange: () => void;
}

const ModificationsModal: React.FC<Props> = ({ isOpen, onClose, userId, vehicleId, vehicleName, onDataChange }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [viewMode, setViewMode] = useState<'installed' | 'wishlist'>('installed');
  const [mods, setMods] = useState<Modification[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ModificationCategory>('exterior');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');
  const [isWishlist, setIsWishlist] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // Modal Action States
  const [installingMod, setInstallingMod] = useState<Modification | null>(null);
  const [deletingMod, setDeletingMod] = useState<Modification | null>(null);
  
  // Install Form State
  const [installCost, setInstallCost] = useState('');
  const [installDate, setInstallDate] = useState('');
  const [installDateError, setInstallDateError] = useState<string | null>(null);

  // Load mods on open
  useEffect(() => {
      if (isOpen) {
          loadMods();
          setActiveTab('list');
          setViewMode('installed');
          
          // Set default date to today
          const today = new Date();
          const d = today.toISOString().split('T')[0];
          setDate(d);
          setInstallDate(d);
          setDateError(null);
          setInstallDateError(null);
      }
  }, [isOpen, vehicleId]);

  const loadMods = async () => {
      setLoading(true);
      try {
          const data = await DB.getModifications(userId, vehicleId);
          setMods(data);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const filteredMods = mods.filter(m => {
      if (viewMode === 'wishlist') return m.isWishlist === true;
      return !m.isWishlist;
  });

  const wishlistTotal = mods
    .filter(m => m.isWishlist)
    .reduce((sum, m) => sum + m.cost, 0);

  // --- Validation Logic ---
  useEffect(() => {
    if (date) {
        const selected = new Date(date);
        selected.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (selected > today && !isWishlist) {
            setDateError(t('error_future_date'));
        } else {
            setDateError(null);
        }
    }
  }, [date, isWishlist, t]);

  useEffect(() => {
    if (installDate) {
        const selected = new Date(installDate);
        selected.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (selected > today) {
            setInstallDateError(t('error_future_date'));
        } else {
            setInstallDateError(null);
        }
    }
  }, [installDate, t]);


  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !cost || !date || dateError) return;
      setSubmitting(true);

      try {
          await DB.addModification(userId, vehicleId, {
              name,
              category,
              cost: Number(cost),
              date: new Date(date).toISOString(), // Save as ISO
              isWishlist
          });
          
          // Sync with parent data (Expenses) only if installed
          if (!isWishlist) {
            onDataChange();
          }
          
          // Reset form
          setName('');
          setCost('');
          setCategory('exterior');
          setIsWishlist(false);
          
          // Reload List and go to correct view
          await loadMods();
          setActiveTab('list');
          setViewMode(isWishlist ? 'wishlist' : 'installed');
      } catch (e) {
          console.error(e);
      } finally {
          setSubmitting(false);
      }
  };

  const handleConfirmInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!installingMod || !installCost || !installDate || installDateError) return;
    
    setSubmitting(true);
    try {
        await DB.convertWishlistToInstalled(
            userId, 
            vehicleId, 
            installingMod.id, 
            Number(installCost), 
            new Date(installDate).toISOString()
        );
        onDataChange();
        await loadMods();
        setInstallingMod(null);
        setViewMode('installed');
    } catch (e) {
        console.error(e);
    } finally {
        setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
      if (!deletingMod) return;

      setSubmitting(true);
      try {
          await DB.deleteModification(userId, vehicleId, deletingMod.id, deletingMod.expenseId);
          
          // Sync with parent data (Expenses)
          onDataChange();
          
          await loadMods();
          setDeletingMod(null);
      } catch (e) {
          console.error(e);
      } finally {
          setSubmitting(false);
      }
  };

  const getCategoryIcon = (cat: ModificationCategory | string) => {
      switch(cat) {
          case 'exterior': return <Car size={18} className="text-indigo-500" />;
          case 'interior': return <Armchair size={18} className="text-violet-500" />;
          case 'performance': return <Gauge size={18} className="text-amber-500" />;
          case 'wheels': return <Disc size={18} className="text-slate-500" />;
          case 'lighting': return <Lightbulb size={18} className="text-yellow-500" />;
          case 'electronics': return <Cpu size={18} className="text-cyan-500" />;
          case 'aesthetic': return <Car size={18} className="text-indigo-500" />; // Fallback for old data
          default: return <Package size={18} className="text-slate-400" />;
      }
  };

  if (!isOpen) return null;

  const categories: ModificationCategory[] = ['exterior', 'interior', 'performance', 'wheels', 'lighting', 'electronics', 'other'];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-slate-900 animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-6 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-between z-10">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('mods_title')}</h2>
                <p className="text-sm text-slate-400">{vehicleName}</p>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                <X size={24} className="text-slate-600 dark:text-slate-300" />
            </button>
        </div>

        {/* View Switcher (Tabs) */}
        {activeTab === 'list' && (
             <div className="px-6 pt-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex font-bold text-sm">
                    <button 
                        onClick={() => setViewMode('installed')}
                        className={`flex-1 py-2.5 rounded-lg transition-all ${viewMode === 'installed' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}
                    >
                        {t('mod_installed')}
                    </button>
                    <button 
                        onClick={() => setViewMode('wishlist')}
                        className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'wishlist' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-400'}`}
                    >
                        <span>{t('mod_wishlist')}</span>
                        {wishlistTotal > 0 && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                    </button>
                </div>
            </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            
            {activeTab === 'list' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    
                    {/* Forecast Banner for Wishlist */}
                    {viewMode === 'wishlist' && wishlistTotal > 0 && (
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20">
                            <div className="flex items-center gap-2 mb-1 opacity-90">
                                <Sparkles size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">{t('total_forecast')}</span>
                            </div>
                            <div className="text-3xl font-bold font-mono">
                                ${wishlistTotal.toLocaleString()}
                            </div>
                        </div>
                    )}

                    {filteredMods.length === 0 && !loading && (
                        <div className="text-center py-10 opacity-60">
                            {viewMode === 'wishlist' ? (
                                <Gift size={48} className="mx-auto text-slate-300 mb-4" />
                            ) : (
                                <Tag size={48} className="mx-auto text-slate-300 mb-4" />
                            )}
                            <p className="text-slate-500 font-medium">{t('no_mods')}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {filteredMods.map(mod => (
                            <div 
                                key={mod.id} 
                                className={`
                                    p-5 rounded-2xl flex items-center justify-between group transition-all relative overflow-hidden
                                    ${mod.isWishlist 
                                        ? 'bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600' 
                                        : 'bg-white dark:bg-slate-800 shadow-soft hover:scale-[1.01]'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${mod.isWishlist ? 'bg-slate-200 dark:bg-slate-700 text-slate-400' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                                        {getCategoryIcon(mod.category)}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${mod.isWishlist ? 'text-slate-600 dark:text-slate-300' : 'text-slate-800 dark:text-white'}`}>{mod.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                            <span className="capitalize">{t(`mod_${mod.category}`)}</span>
                                            {!mod.isWishlist && (
                                                <>
                                                    <span>•</span>
                                                    <span>{new Date(mod.date).toLocaleDateString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`font-mono font-bold text-lg ${mod.isWishlist ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                        ${mod.cost.toLocaleString()}
                                    </div>
                                    
                                    {mod.isWishlist && (
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setInstallCost(mod.cost.toString());
                                                setInstallingMod(mod); 
                                                setInstallDate(new Date().toISOString().split('T')[0]); // Default to today
                                            }}
                                            className="px-3 py-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors flex items-center gap-1"
                                        >
                                            <Wand2 size={14} />
                                            <span className="hidden sm:inline">{t('mark_installed')}</span>
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setDeletingMod(mod); }}
                                        className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-full transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => {
                            setActiveTab('add');
                            setIsWishlist(viewMode === 'wishlist');
                            setDateError(null);
                        }}
                        className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-slate-200 dark:shadow-indigo-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        {t('add_mod')}
                    </button>
                </div>
            )}

            {activeTab === 'add' && (
                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl flex gap-3 text-indigo-800 dark:text-indigo-200 text-sm font-medium">
                        <Tag size={18} className="shrink-0 mt-0.5" />
                        <p>{t('mods_help')}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{t('mod_name')}</label>
                        <input
                            type="text"
                            required
                            placeholder={t('placeholder_mod_name')}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl font-bold text-slate-800 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{t('mod_category')}</label>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`p-4 rounded-2xl flex items-center gap-3 transition-all border-2 ${category === cat ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'border-transparent bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    {getCategoryIcon(cat)}
                                    <span className="font-bold text-sm truncate">{t(`mod_${cat}`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                {isWishlist ? t('projected_cost') : t('mod_price')}
                            </label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-4 top-4 text-slate-400" />
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={cost}
                                    onChange={e => setCost(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 p-4 pl-10 rounded-2xl font-bold text-slate-800 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{t('mod_date')}</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-4 top-4 text-slate-400" />
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 p-4 pl-10 rounded-2xl font-bold text-slate-800 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                />
                            </div>
                            {dateError && (
                                <div className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
                                    <AlertCircle size={12} />
                                    {dateError}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Wishlist Toggle */}
                    <div 
                        onClick={() => setIsWishlist(!isWishlist)}
                        className={`p-4 rounded-2xl cursor-pointer flex items-center justify-between border-2 transition-all ${isWishlist ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-transparent bg-white dark:bg-slate-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${isWishlist ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                <Wand2 size={18} />
                            </div>
                            <span className={`font-bold ${isWishlist ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300'}`}>{t('add_to_wishlist')}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isWishlist ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                            {isWishlist && <CheckCircle size={14} className="text-white" />}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                         <button 
                            type="button"
                            onClick={() => setActiveTab('list')}
                            className="flex-1 py-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
                        >
                            {t('cancel')}
                        </button>
                        <button 
                            type="submit"
                            disabled={submitting || !!dateError}
                            className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-[0.98] transition-all flex justify-center disabled:opacity-50"
                        >
                            {submitting ? t('processing') : t('save')}
                        </button>
                    </div>

                </form>
            )}

            {/* Install Confirmation Modal (Nested) */}
            {installingMod && (
                <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
                     <div className="bg-white dark:bg-slate-800 w-full rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('confirm_install_title')}</h3>
                                <p className="text-sm text-slate-500">{t('confirm_install_msg')}</p>
                            </div>
                            <button onClick={() => setInstallingMod(null)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl mb-6 flex items-center gap-3">
                             <div className="p-2 bg-white dark:bg-slate-600 rounded-lg shadow-sm">
                                {getCategoryIcon(installingMod.category)}
                             </div>
                             <span className="font-bold text-slate-800 dark:text-white">{installingMod.name}</span>
                        </div>

                        <form onSubmit={handleConfirmInstall} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase pl-1">{t('final_price')}</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="0"
                                        step="0.01"
                                        value={installCost}
                                        onChange={e => setInstallCost(e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-slate-900 p-3 rounded-xl font-bold" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase pl-1">{t('install_date')}</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={installDate}
                                        onChange={e => setInstallDate(e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-slate-900 p-3 rounded-xl font-bold" 
                                    />
                                    {installDateError && (
                                        <div className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
                                            <AlertCircle size={12} />
                                            {installDateError}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={!!installDateError} className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-50">
                                {t('confirm')}
                            </button>
                        </form>
                     </div>
                </div>
            )}

            {/* Delete Confirmation Modal (Nested) */}
            {deletingMod && (
                <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
                     <div className="bg-white dark:bg-slate-800 w-full rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('delete_mod_title')}</h3>
                            </div>
                            <button onClick={() => setDeletingMod(null)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>
                        
                        <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-xl mb-6 flex gap-3 items-start">
                             <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                             <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t('delete_mod_msg')}</p>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6 opacity-80 px-2">
                             <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                {getCategoryIcon(deletingMod.category)}
                             </div>
                             <span className="font-bold text-slate-900 dark:text-white">{deletingMod.name}</span>
                        </div>

                        <div className="flex gap-3">
                             <button 
                                onClick={() => setDeletingMod(null)} 
                                disabled={submitting}
                                className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                {t('cancel')}
                             </button>
                             <button 
                                onClick={handleConfirmDelete} 
                                disabled={submitting} 
                                className="flex-1 py-4 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 flex justify-center items-center gap-2 active:scale-95 transition-all"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                <span>{t('delete')}</span>
                             </button>
                        </div>
                     </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default ModificationsModal;