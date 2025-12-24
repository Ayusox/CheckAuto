import React, { useMemo, useState } from 'react';
import { 
  ArrowLeft, Edit2, Gauge, Layers, ShieldCheck, Eye, Activity, Zap, 
  MoreHorizontal, ChevronRight, AlertCircle, CheckCircle, Sliders, 
  FileText, Pencil, HelpCircle 
} from 'lucide-react';
import { Vehicle, MaintenanceConfig, MaintenanceItemWithStatus, ServiceRecord, MaintenanceStatus } from '../types';
import { calculateMaintenanceStatus } from '../utils';
import { useTranslation } from '../services/i18n';
import { MAINTENANCE_DEFINITIONS, SectionType, SECTION_METADATA } from '../constants';
import * as DB from '../services/db';

// Components
import MaintenanceItemCard from '../components/MaintenanceItemCard';
import UpdateMileageModal from '../components/UpdateMileageModal';
import RecordServiceModal from '../components/RecordServiceModal';
import EditMaintenanceModal from '../components/EditMaintenanceModal';
import MaintenanceConfigModal from '../components/MaintenanceConfigModal';
import ModificationsModal from '../components/ModificationsModal';
import EditVehicleModal from '../components/EditVehicleModal';

interface Props {
  vehicle: Vehicle;
  configs: MaintenanceConfig[];
  onBack: () => void;
  onUpdateMileage: (id: string, km: number) => void;
  onUpdateVehicle: (v: Vehicle) => Promise<void>;
  onRecordService: (record: Omit<ServiceRecord, 'id'>) => void;
  onRefresh: () => void;
}

const VehicleDetail: React.FC<Props> = ({ 
  vehicle, configs, onBack, onUpdateMileage, onUpdateVehicle, onRecordService, onRefresh 
}) => {
  // --- Hooks ---
  const { t } = useTranslation();
  
  // --- State ---
  const [showMileageModal, setShowMileageModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showModsModal, setShowModsModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [selectedItemForService, setSelectedItemForService] = useState<MaintenanceItemWithStatus | null>(null);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<MaintenanceItemWithStatus | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<SectionType | null>(null);

  // --- Memos ---

  const activeConfigs = useMemo(() => configs.filter(c => c.isActive), [configs]);

  const maintenanceStatusItems = useMemo(() => {
    return activeConfigs.map(config => calculateMaintenanceStatus(vehicle, config))
      .sort((a, b) => b.progress - a.progress); 
  }, [vehicle, activeConfigs]);

  const groupedItems = useMemo(() => {
    const groups: Record<SectionType, MaintenanceItemWithStatus[]> = {
        legal: [], engine: [], safety: [], visibility: [], transmission: [], electrical: [], other: []
    };
    maintenanceStatusItems.forEach(item => {
        const def = MAINTENANCE_DEFINITIONS.find(d => d.category === item.category);
        const section = def ? def.section : 'other';
        if (groups[section]) groups[section].push(item);
        else groups['other'].push(item);
    });
    return groups;
  }, [maintenanceStatusItems]);

  // --- Constants ---
  const sections: { id: SectionType, icon: React.ReactNode, label: string }[] = [
      { id: 'legal', icon: <FileText size={20} />, label: 'section_legal' },
      { id: 'engine', icon: <Layers size={20} />, label: 'section_engine' },
      { id: 'safety', icon: <ShieldCheck size={20} />, label: 'section_safety' },
      { id: 'visibility', icon: <Eye size={20} />, label: 'section_visibility' },
      { id: 'transmission', icon: <Activity size={20} />, label: 'section_transmission' },
      { id: 'electrical', icon: <Zap size={20} />, label: 'section_electrical' },
      { id: 'other', icon: <MoreHorizontal size={20} />, label: 'section_other' },
  ];

  // --- Helpers ---

  const getSectionHealth = (items: MaintenanceItemWithStatus[]) => {
    if (items.some(i => i.status === MaintenanceStatus.OVERDUE)) return 'OVERDUE';
    if (items.some(i => i.status === MaintenanceStatus.WARNING)) return 'WARNING';
    if (items.some(i => i.status === MaintenanceStatus.REVIEW_NEEDED)) return 'REVIEW_NEEDED';
    return 'OK';
  };

  // --- Handlers ---

  const handleEditConfig = async (id: string, mileage: number, date: string) => {
    const config = configs.find(c => c.id === id);
    if (config) {
        try {
            const newConfig = { ...config, lastReplacedMileage: mileage, lastReplacedDate: date };
            await DB.updateMaintenanceConfig(vehicle.userId, newConfig);
            onUpdateMileage(vehicle.id, vehicle.currentMileage); // Trigger refresh
        } catch (error) {
            console.error("Failed to update config", error);
        }
    }
  };

  const handleToggleConfig = async (config: MaintenanceConfig, newValue: boolean) => {
    try {
        const newConfig = { ...config, isActive: newValue };
        await DB.updateMaintenanceConfig(vehicle.userId, newConfig);
        onUpdateMileage(vehicle.id, vehicle.currentMileage); // Trigger refresh
        
        if (newValue === true) {
            // Prompt for history if enabling
            const itemWithStatus = calculateMaintenanceStatus(vehicle, newConfig);
            setSelectedItemForEdit(itemWithStatus);
        }
    } catch (error) {
        console.error("Failed to toggle config", error);
    }
  };

  const handleUpdateInterval = async (config: MaintenanceConfig, newIntervalKm: number) => {
      try {
          const newConfig = { ...config, intervalKm: newIntervalKm };
          await DB.updateMaintenanceConfig(vehicle.userId, newConfig);
          onUpdateMileage(vehicle.id, vehicle.currentMileage); // Trigger refresh
      } catch (error) {
          console.error("Failed to update interval", error);
      }
  };

  const handleDeleteVehicle = async (id: string) => {
      try {
          await DB.deleteVehicle(vehicle.userId, id);
          onBack();
          onRefresh();
      } catch (error) {
          console.error("Failed to delete vehicle", error);
      }
  };

  // --- Renderers ---

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 w-full max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* 
        FIXED HEADER: 
        Aligned to standard flex layout (Back | Info ...... Actions)
        using left-0 right-0 mx-auto to ensure proper centering of the bar itself.
      */}
      <header className="glass fixed top-0 left-0 right-0 mx-auto w-full max-w-md z-30 transition-all border-b border-slate-100/50 dark:border-slate-800/50">
        <div className="pt-[env(safe-area-inset-top)] w-full">
            <div className="h-16 px-6 flex items-center justify-between">
                
                {/* LEFT: Back Button & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button 
                        onClick={activeSectionId ? () => setActiveSectionId(null) : onBack} 
                        className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="min-w-0 flex-1">
                        {activeSectionId ? (
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                                    {sections.find(s => s.id === activeSectionId)?.icon}
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                    {t(sections.find(s => s.id === activeSectionId)?.label || '')}
                                </h2>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                                        {vehicle.make} {vehicle.model}
                                    </h2>
                                    <button onClick={() => setShowEditVehicleModal(true)} className="shrink-0 p-1 rounded-full text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                                        <Pencil size={14} />
                                    </button>
                                </div>
                                <p className="text-xs font-semibold text-slate-400 truncate leading-none mt-0.5">{vehicle.plate}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Actions */}
                {!activeSectionId && (
                     <div className="flex items-center gap-2 shrink-0 pl-2">
                        <button 
                            onClick={() => setShowModsModal(true)}
                            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors font-bold text-xs"
                        >
                            {t('mods_short')}
                        </button>
                        <button 
                            onClick={() => setShowConfigModal(true)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Sliders size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
      </header>

      {/* Main Content Area with Safe Padding */}
      <main 
          className="flex-1 w-full overflow-y-auto overflow-x-hidden px-6 pb-6 no-scrollbar"
          style={{
              paddingTop: 'calc(4rem + env(safe-area-inset-top) + 1.5rem)', 
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)'
          }}
      >
          {activeSectionId ? (
              /* Section Details */
              <div className="space-y-4 animate-in slide-in-from-right-10 duration-300">
                    {groupedItems[activeSectionId].map(item => (
                        <MaintenanceItemCard 
                            key={item.id} 
                            item={item} 
                            onFix={(i) => setSelectedItemForService(i)} 
                            onEdit={(i) => setSelectedItemForEdit(i)}
                        />
                    ))}
              </div>
          ) : (
              /* Dashboard */
              <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                    {/* Mileage Card */}
                    <div 
                        onClick={() => setShowMileageModal(true)}
                        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 shadow-glow text-white cursor-pointer active:scale-[0.98] transition-all group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-100 mb-2">
                                    <Gauge size={18} />
                                    <span className="text-xs font-bold uppercase tracking-widest">{t('odometer')}</span>
                                </div>
                                <div className="text-4xl font-mono font-bold tracking-tight">
                                    {vehicle.currentMileage.toLocaleString()} <span className="text-lg opacity-70">km</span>
                                </div>
                            </div>
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                <Edit2 size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Sections Grid */}
                    <div className="grid grid-cols-1 gap-4 pt-2">
                        {sections.map(section => {
                            const items = groupedItems[section.id];
                            if (items.length === 0) return null;

                            const status = getSectionHealth(items);
                            const issueCount = items.filter(i => i.status !== MaintenanceStatus.OK).length;
                            const isLegal = section.id === 'legal';

                            let borderColor = "border-transparent";
                            let shadowClass = "shadow-soft";
                            let iconBg = isLegal ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600" : "bg-slate-100 dark:bg-slate-700/50 text-indigo-600 dark:text-indigo-400";
                            
                            if (status === 'OVERDUE') {
                                borderColor = "border-rose-500/20";
                                shadowClass = "shadow-soft shadow-rose-500/10";
                                iconBg = "bg-rose-50 dark:bg-rose-500/10 text-rose-500";
                            } else if (status === 'WARNING') {
                                borderColor = "border-amber-500/20";
                            } else if (status === 'REVIEW_NEEDED') {
                                borderColor = "border-slate-200 dark:border-slate-700";
                                iconBg = "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
                            }

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSectionId(section.id)}
                                    className={`bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] ${shadowClass} hover:shadow-lg transition-all active:scale-[0.99] border ${borderColor} flex items-center justify-between group`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${iconBg}`}>{section.icon}</div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t(section.label)}</h3>
                                            <p className="text-xs font-medium text-slate-400 mt-1">{items.length} {t('items_suffix')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {issueCount > 0 ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50">
                                                {status === 'REVIEW_NEEDED' ? (
                                                    <HelpCircle size={14} className="text-slate-400" />
                                                ) : (
                                                    <AlertCircle size={14} className={status === 'OVERDUE' ? 'text-rose-500' : 'text-amber-500'} />
                                                )}
                                                <span className={`text-xs font-bold ${
                                                    status === 'OVERDUE' ? 'text-rose-600 dark:text-rose-400' : 
                                                    status === 'WARNING' ? 'text-amber-600 dark:text-amber-400' :
                                                    'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    {issueCount}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
                                                <CheckCircle size={16} />
                                            </div>
                                        )}
                                        <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                </button>
                            );
                        })}
                        
                        {activeConfigs.length === 0 && (
                            <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-slate-400 mb-4">{t('config_help')}</p>
                                <button onClick={() => setShowConfigModal(true)} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">
                                    {t('configure_maintenance')}
                                </button>
                            </div>
                        )}
                    </div>
              </div>
          )}
      </main>

      {/* Modals */}
      <UpdateMileageModal
        isOpen={showMileageModal}
        onClose={() => setShowMileageModal(false)}
        currentMileage={vehicle.currentMileage}
        onSave={(km) => onUpdateMileage(vehicle.id, km)}
        vehicleName={`${vehicle.make} ${vehicle.model}`}
      />
      <RecordServiceModal
        isOpen={!!selectedItemForService}
        onClose={() => setSelectedItemForService(null)}
        item={selectedItemForService}
        currentVehicleMileage={vehicle.currentMileage}
        onSave={(data) => {
            if (selectedItemForService) {
                onRecordService({
                    vehicleId: vehicle.id,
                    maintenanceConfigId: selectedItemForService.id,
                    date: data.date,
                    mileage: data.mileage,
                    cost: data.cost,
                    shopName: data.shop,
                    notes: data.notes
                });
            }
        }}
      />
      <EditMaintenanceModal 
        isOpen={!!selectedItemForEdit}
        onClose={() => setSelectedItemForEdit(null)}
        item={selectedItemForEdit}
        currentVehicleMileage={vehicle.currentMileage}
        onSave={handleEditConfig}
      />
      <MaintenanceConfigModal 
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        configs={configs}
        onToggle={handleToggleConfig}
        onUpdateInterval={handleUpdateInterval}
      />
      <ModificationsModal
        isOpen={showModsModal}
        onClose={() => setShowModsModal(false)}
        userId={vehicle.userId}
        vehicleId={vehicle.id}
        vehicleName={`${vehicle.make} ${vehicle.model}`}
        onDataChange={onRefresh}
      />
      <EditVehicleModal
        isOpen={showEditVehicleModal}
        onClose={() => setShowEditVehicleModal(false)}
        vehicle={vehicle}
        onSave={onUpdateVehicle}
        onDelete={handleDeleteVehicle}
      />
    </div>
  );
};

export default VehicleDetail;