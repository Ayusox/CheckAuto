import React, { useMemo, useState } from 'react';
import { MaintenanceConfig } from '../types';
import { X, Layers, ShieldCheck, Eye, Activity, Zap, MoreHorizontal, Info, Plus, Minus, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../services/i18n';
import { MAINTENANCE_DEFINITIONS, SECTION_METADATA, MAINTENANCE_LIMITS, DEFAULT_LIMITS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  configs: MaintenanceConfig[];
  onToggle: (config: MaintenanceConfig, newValue: boolean) => void;
  onUpdateInterval: (config: MaintenanceConfig, newInterval: number) => void;
}

const MaintenanceConfigModal: React.FC<Props> = ({ isOpen, onClose, configs, onToggle, onUpdateInterval }) => {
  const { t } = useTranslation();
  const [errorConfigId, setErrorConfigId] = useState<string | null>(null);

  const groupedConfigs = useMemo(() => {
      const groups: Record<string, MaintenanceConfig[]> = {};
      SECTION_METADATA.forEach(s => groups[s.id] = []);
      
      configs.forEach(config => {
          const def = MAINTENANCE_DEFINITIONS.find(d => d.category === config.category);
          const section = def ? def.section : 'other';
          if (groups[section]) {
              groups[section].push(config);
          } else {
              if(!groups['other']) groups['other'] = [];
              groups['other'].push(config);
          }
      });
      return groups;
  }, [configs]);

  const sectionIcons: Record<string, React.ReactNode> = {
    engine: <Layers size={18} />,
    safety: <ShieldCheck size={18} />,
    visibility: <Eye size={18} />,
    transmission: <Activity size={18} />,
    electrical: <Zap size={18} />,
    other: <MoreHorizontal size={18} />,
  };

  const handleIntervalChange = (config: MaintenanceConfig, change: number) => {
      // Get limits
      const limits = MAINTENANCE_LIMITS[config.category] || DEFAULT_LIMITS;
      const step = limits.step || 5000;
      const amount = change * step;
      
      const newInterval = config.intervalKm + amount;

      // Validation
      if (newInterval < limits.min || newInterval > limits.max) {
          setErrorConfigId(config.id);
          // Auto-hide error after 3 seconds
          setTimeout(() => setErrorConfigId(null), 4000);
          return;
      }

      setErrorConfigId(null);
      onUpdateInterval(config, newInterval);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-slate-900 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-6 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-between z-10">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('config_title')}</h2>
                <p className="text-sm text-slate-400">{t('configure_maintenance')}</p>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                <X size={24} className="text-slate-600 dark:text-slate-300" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
            
            {/* Help Box */}
            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl flex gap-3 text-indigo-800 dark:text-indigo-200 text-sm font-medium">
                <Info size={20} className="shrink-0 mt-0.5" />
                <p>{t('config_help')}</p>
            </div>

            {SECTION_METADATA.map(section => {
                const sectionConfigs = groupedConfigs[section.id];
                if (!sectionConfigs || sectionConfigs.length === 0) return null;

                return (
                    <div key={section.id} className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-xs font-bold px-2">
                             {sectionIcons[section.id]}
                             {t(section.label)}
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft overflow-hidden divide-y divide-slate-50 dark:divide-slate-700/50">
                            {sectionConfigs.map((config) => {
                                const limits = MAINTENANCE_LIMITS[config.category] || DEFAULT_LIMITS;
                                const isMechanical = config.intervalKm > 0;
                                const showIntervalControls = config.isActive && isMechanical;
                                const isError = errorConfigId === config.id;

                                return (
                                    <div key={config.id} className="p-5 transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-4">
                                                {/* Colored Dot Indicator */}
                                                <div className={`w-3 h-3 rounded-full ${config.isActive ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                
                                                <div>
                                                    <div className="font-bold text-slate-800 dark:text-white text-lg">
                                                        {t(config.category)}
                                                    </div>
                                                    <div className="text-xs font-semibold text-slate-400">
                                                        {config.isActive ? t('item_active') : t('item_inactive')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Toggle Switch */}
                                            <button 
                                                onClick={() => onToggle(config, !config.isActive)}
                                                className={`w-14 h-8 rounded-full transition-colors relative ${config.isActive ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                            >
                                                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${config.isActive ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                        
                                        {/* Interval Controls */}
                                        {showIntervalControls && (
                                            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50 animate-in slide-in-from-top-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                                        {t('interval_label')}
                                                    </span>
                                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-1">
                                                        <button 
                                                            onClick={() => handleIntervalChange(config, -1)}
                                                            className="p-2 bg-white dark:bg-slate-600 rounded-lg shadow-sm text-slate-600 dark:text-slate-200 active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-500"
                                                        >
                                                            <Minus size={16} strokeWidth={3} />
                                                        </button>
                                                        
                                                        <span className="font-mono font-bold text-slate-700 dark:text-white w-24 text-center">
                                                            {config.intervalKm.toLocaleString()} km
                                                        </span>
                                                        
                                                        <button 
                                                            onClick={() => handleIntervalChange(config, 1)}
                                                            className="p-2 bg-white dark:bg-slate-600 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-400 active:scale-95 transition-all hover:bg-indigo-50 dark:hover:bg-slate-500"
                                                        >
                                                            <Plus size={16} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Range Error Message */}
                                                {isError && (
                                                    <div className="mt-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold p-3 rounded-xl flex gap-2 animate-in fade-in slide-in-from-top-1">
                                                        <AlertTriangle size={16} className="shrink-0" />
                                                        <span>
                                                            {t('config_safety_msg', { min: limits.min.toLocaleString(), max: limits.max.toLocaleString() })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
            
            <div className="h-10"></div>
        </div>
    </div>
  );
};

export default MaintenanceConfigModal;