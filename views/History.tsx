import React, { useState, useEffect } from 'react';
import { ServiceRecord, Vehicle, MaintenanceConfig } from '../types';
import { formatAppDate } from '../utils';
import { MapPin, Pencil, Trash2, AlertTriangle, Loader2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useTranslation } from '../services/i18n';
import { useTheme } from '../services/theme';
import { MAINTENANCE_DEFINITIONS } from '../constants';
import * as DB from '../services/db';
import { auth } from '../services/firebase';
import EditHistoryModal from '../components/EditHistoryModal';

interface Props {
  history: ServiceRecord[];
  vehicles: Vehicle[];
  configs: MaintenanceConfig[];
  onRefresh: () => void;
}

const History: React.FC<Props> = ({ history, vehicles, configs, onRefresh }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New State for Interaction Mode
  const [interactionMode, setInteractionMode] = useState<'view' | 'edit' | 'delete'>('view');

  // Chart Stability State
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
      // Ensure component is fully mounted before rendering chart
      setIsMounted(true);
  }, []);

  // Helper to get category translation
  const getCategoryName = (configId: string) => {
    const cat = configs.find(c => c.id === configId)?.category || 'Other';
    return t(cat);
  };
  
  // Helper to get vehicle name
  const getVehicleName = (vid: string) => {
    const v = vehicles.find(veh => veh.id === vid);
    return v ? `${v.make} ${v.model}` : t('unknown_car');
  };

  // Helper for colors
  const getCategoryColor = (categoryId: string) => {
      if (categoryId === 'modification') return '#ec4899'; // Pink-500 for Mods
      
      const def = MAINTENANCE_DEFINITIONS.find(d => d.category === categoryId);
      const section = def ? def.section : 'other';

      switch(section) {
          case 'engine': return '#f59e0b'; // Amber-500
          case 'safety': return '#ef4444'; // Red-500
          case 'visibility': return '#0ea5e9'; // Sky-500
          case 'transmission': return '#8b5cf6'; // Violet-500
          case 'electrical': return '#eab308'; // Yellow-500
          case 'legal': return '#64748b'; // Slate-500
          default: return '#94a3b8'; // Slate-400
      }
  };

  // Actions
  const handleUpdateRecord = async (recordId: string, data: Partial<ServiceRecord>) => {
      const userId = auth.currentUser?.uid;
      if(!userId) return;

      await DB.updateServiceRecord(userId, recordId, data);
      onRefresh();
      setInteractionMode('view'); // Exit edit mode after save
  };

  const handleDeleteRecord = async () => {
      const userId = auth.currentUser?.uid;
      if(!userId || !deletingRecordId) return;

      setIsProcessing(true);
      try {
          await DB.deleteServiceRecord(userId, deletingRecordId);
          setDeletingRecordId(null);
          onRefresh();
          // Keep delete mode active to allow multiple deletions? 
          // Or exit? Let's exit to be safe.
          setInteractionMode('view'); 
      } catch (e) {
          console.error(e);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleCardClick = (record: ServiceRecord) => {
      if (interactionMode === 'view') return;
      
      if (interactionMode === 'edit') {
          setEditingRecord(record);
      } else if (interactionMode === 'delete') {
          setDeletingRecordId(record.id);
      }
  };


  // Truncate helper for Axis labels
  const truncate = (str: string, max: number) => {
      return str.length > max ? str.substring(0, max) + '...' : str;
  };

  // Prepare Chart Data (Expenses by Category ID first to handle mapping correctly)
  const rawChartData = history.reduce((acc, curr) => {
    const config = configs.find(c => c.id === curr.maintenanceConfigId);
    const cat = config?.category || 'other';
    acc[cat] = (acc[cat] || 0) + curr.cost;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(rawChartData)
    .map(([cat, cost]) => {
        const fullName = cat === 'modification' ? t('modification_plural') : t(cat);
        return { 
            name: truncate(fullName, 24), // Increased limit for longer Spanish names
            fullName: fullName, // Full name for Tooltip
            cost,
            fill: getCategoryColor(cat)
        };
    })
    .sort((a, b) => b.cost - a.cost); // Sort by highest cost first

  const totalSpent = history.reduce((sum, item) => sum + item.cost, 0);

  // Dynamic Height calculation: 60px per bar + padding, or minimum 300px
  const dynamicHeight = Math.max(300, chartData.length * 60);

  // Helper to find vehicle mileage for validation
  const getEditingVehicleMileage = () => {
      if(!editingRecord) return 0;
      const v = vehicles.find(veh => veh.id === editingRecord.vehicleId);
      return v ? v.currentMileage : 999999; // Fallback if car deleted (unlikely due to cascading delete)
  };

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-soft border-l-8 border-indigo-500">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('total_expenses')}</h2>
        <div className="text-4xl font-bold text-slate-900 dark:text-white flex items-start gap-1">
            <span className="text-lg text-slate-400 mt-1">$</span>
            {totalSpent.toLocaleString()}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-soft overflow-hidden">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('cost_breakdown')}</h3>
             
             {/* 
                Robust Chart Container 
                - Uses isMounted to prevent render before DOM is ready
                - Fixed min-height via Tailwind
                - Unique ID for reference
             */}
             <div 
                id="history-chart-wrapper" 
                className="w-full min-h-[300px] relative" 
                style={{ height: dynamicHeight }}
             >
                {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <BarChart 
                            layout="vertical" 
                            data={chartData} 
                            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={120} // Increased width for longer labels
                                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />
                            <Tooltip 
                                cursor={{fill: theme === 'dark' ? '#334155' : '#f8fafc', radius: 4}}
                                contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                    color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                                }}
                                itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                                formatter={(value: number) => [`$${value}`, t('cost')]}
                                labelFormatter={(label, payload) => {
                                    if (payload && payload.length > 0) {
                                        return payload[0].payload.fullName;
                                    }
                                    return label;
                                }}
                            />
                            <Bar dataKey="cost" radius={[0, 6, 6, 0]} barSize={24}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                                <LabelList 
                                    dataKey="cost" 
                                    position="right" 
                                    fontSize={11} 
                                    formatter={(val: number) => `$${val}`} 
                                    fill="#64748b" 
                                    fontWeight="bold" 
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin" />
                    </div>
                )}
             </div>
          </div>
      )}

      {/* Timeline List */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('timeline')}</h3>
            
            {/* Header Controls */}
            <div className="flex gap-2">
                {interactionMode === 'view' ? (
                    <>
                        <button 
                            onClick={() => setInteractionMode('edit')}
                            className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                            title={t('edit_record')}
                        >
                            <Pencil size={16} />
                        </button>
                        <button 
                            onClick={() => setInteractionMode('delete')}
                            className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                            title={t('delete')}
                        >
                            <Trash2 size={16} />
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                        <span className={`text-xs font-bold ${interactionMode === 'edit' ? 'text-indigo-500' : 'text-rose-500'}`}>
                            {interactionMode === 'edit' ? t('select_to_edit') : t('select_to_delete')}
                        </span>
                        <button 
                            onClick={() => setInteractionMode('view')}
                            className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                        >
                            <X size={14} strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-0 relative">
             {/* Vertical Line for Timeline */}
            <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-700 z-0"></div>

            {history.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-medium">{t('no_history')}</div>
            )}
            
            {history.map((record, idx) => {
                const config = configs.find(c => c.id === record.maintenanceConfigId);
                const categoryColor = getCategoryColor(config?.category || 'other');
                const isInteractable = interactionMode !== 'view';
                
                return (
                    <div key={record.id} className="relative z-10 pl-16 py-3">
                        <div className="absolute left-3 top-5 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center">
                            <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: categoryColor }}
                            />
                        </div>
                        
                        <div 
                            onClick={() => handleCardClick(record)}
                            className={`
                                p-5 rounded-3xl shadow-soft transition-all relative overflow-hidden
                                ${isInteractable ? 'cursor-pointer hover:scale-[0.98] active:scale-[0.97]' : ''}
                                ${interactionMode === 'edit' ? 'hover:ring-2 hover:ring-indigo-500' : ''}
                                ${interactionMode === 'delete' ? 'hover:ring-2 hover:ring-rose-500' : ''}
                            `}
                            style={{ backgroundColor: `${categoryColor}1A` }} // 1A = approx 10% opacity hex
                        >
                             {/* Mode Indicator Overlay */}
                             {interactionMode === 'edit' && (
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-900/40 p-2 rounded-full text-indigo-500 animate-in zoom-in">
                                     <Pencil size={20} />
                                 </div>
                             )}
                             {interactionMode === 'delete' && (
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-900/40 p-2 rounded-full text-rose-500 animate-in zoom-in">
                                     <Trash2 size={20} />
                                 </div>
                             )}

                            <div className="flex justify-between items-start mb-2 pr-2">
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                                        {getCategoryName(record.maintenanceConfigId)}
                                    </h4>
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 opacity-80">
                                        {getVehicleName(record.vehicleId)}
                                    </p>
                                </div>
                                <span className={`font-mono font-bold px-2 py-1 rounded-lg ${isInteractable ? 'opacity-20' : 'text-rose-600 dark:text-rose-400 bg-white/50 dark:bg-black/10'}`}>
                                    -${record.cost}
                                </span>
                            </div>
                            
                            <div className={`flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300 mt-2 ${isInteractable ? 'opacity-50' : ''}`}>
                                <span>{formatAppDate(record.date)}</span>
                                <span>•</span>
                                <span>{record.mileage.toLocaleString()} km</span>
                            </div>
                            
                            <div className={`flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 ${isInteractable ? 'opacity-50' : ''}`}>
                                <MapPin size={12} /> {record.shopName}
                            </div>

                            {record.notes && !isInteractable && (
                                <div className="mt-3 bg-white/50 dark:bg-black/10 p-3 rounded-xl text-sm text-slate-700 dark:text-slate-200 italic">
                                    "{record.notes}"
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
          <EditHistoryModal 
            isOpen={!!editingRecord}
            onClose={() => setEditingRecord(null)}
            record={editingRecord}
            onSave={handleUpdateRecord}
            currentVehicleMileage={getEditingVehicleMileage()}
          />
      )}

      {/* Delete Confirmation */}
      {deletingRecordId && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-full text-rose-500 shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('delete')}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('delete_record_confirm')}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setDeletingRecordId(null)}
                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        onClick={handleDeleteRecord}
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 flex justify-center items-center gap-2"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : t('delete')}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default History;