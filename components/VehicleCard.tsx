import React from 'react';
import { Vehicle } from '../types';
import { ChevronRight, Gauge, Info, Star, Car, AlertCircle } from 'lucide-react';
import { useTranslation } from '../services/i18n';
import { getScoreMeta } from '../utils';

interface Props {
  vehicle: Vehicle;
  healthScore: number;
  isSetup?: boolean;
  onSelect: (id: string) => void;
  onInfoClick: (e: React.MouseEvent) => void;
}

const VehicleCard: React.FC<Props> = ({ vehicle, healthScore, isSetup = true, onSelect, onInfoClick }) => {
  const { t } = useTranslation();
  
  const getProgressColor = () => {
      if (healthScore >= 90) return 'bg-emerald-500';
      if (healthScore >= 70) return 'bg-indigo-500';
      if (healthScore >= 40) return 'bg-amber-500';
      return 'bg-rose-500';
  };

  const getBadgeStyle = () => {
      if (healthScore >= 90) return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
      if (healthScore >= 70) return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400';
      if (healthScore >= 40) return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
      return 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400';
  };

  return (
    <div 
        onClick={() => onSelect(vehicle.id)}
        className="group relative bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] shadow-soft hover:shadow-soft-hover transition-all duration-300 cursor-pointer w-full max-w-full box-border overflow-hidden"
    >
        <div className="flex gap-4 items-start w-full">
            {/* Image Section */}
            <div className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center shadow-inner relative">
                {vehicle.image ? (
                    <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover" />
                ) : (
                    <Car size={28} className="text-slate-300 dark:text-slate-500" />
                )}
                
                {healthScore >= 95 && isSetup && (
                    <div className="absolute top-0 right-0 p-1 bg-white/90 dark:bg-slate-800/90 rounded-bl-xl shadow-sm backdrop-blur-sm">
                        <Star size={14} className="text-yellow-400 fill-current" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[5rem] gap-2">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate w-full">
                            {vehicle.make} {vehicle.model}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
                            <span className="bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 truncate max-w-[80px]">{vehicle.plate}</span>
                            <span>•</span>
                            <span>{vehicle.year}</span>
                        </div>
                    </div>
                    
                    <div className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                        <ChevronRight size={20} strokeWidth={2.5} />
                    </div>
                </div>

                {/* Footer Info Row */}
                <div className="flex items-end justify-between gap-2">
                    
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 min-w-0">
                        <Gauge size={16} className="text-slate-400 shrink-0" />
                        <span className="text-sm font-bold font-mono tracking-tight truncate">{vehicle.currentMileage.toLocaleString()} km</span>
                    </div>

                    {!isSetup ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold animate-pulse shrink-0 whitespace-nowrap">
                            <AlertCircle size={14} />
                            <span>{t('setup_pending')}</span>
                        </div>
                    ) : (
                        <div 
                            onClick={(e) => { e.stopPropagation(); onInfoClick(e); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getBadgeStyle()} text-xs font-bold hover:opacity-80 transition-opacity shrink-0 whitespace-nowrap`}
                        >
                            <span>{Math.round(healthScore)}%</span>
                            <Info size={14} strokeWidth={2.5} />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {isSetup && (
            <div className="mt-4 w-full h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden relative">
                <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out absolute top-0 left-0 ${getProgressColor()}`} 
                    style={{ width: `${healthScore}%` }}
                />
            </div>
        )}
    </div>
  );
};

export default VehicleCard;