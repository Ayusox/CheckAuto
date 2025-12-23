import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from './services/i18n';
import { useAppEngine } from './hooks/useAppEngine';
import { useMaintenanceAlerts } from './hooks/useMaintenanceAlerts';
import * as DB from './services/db';
import { Vehicle, ServiceRecord } from './types';

// Components
import Layout from './components/Layout';
import Logo from './components/Logo';
import Garage from './views/Garage';
import VehicleDetail from './views/VehicleDetail';
import History from './views/History';
import Settings from './views/Settings';
import Auth from './views/Auth';

const App: React.FC = () => {
  // --- Hooks ---
  const { t } = useTranslation();
  const { user, loading, vehicles, configs, history, loadUserData, logout } = useAppEngine();
  const { clearNotificationsHistory } = useMaintenanceAlerts(user, vehicles, configs);
  
  // --- Local State ---
  const [activeTab, setActiveTab] = useState<'garage' | 'history' | 'settings'>('garage');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // --- Handlers ---
  const handleLogin = () => {
    // handled by useAppEngine effect
  };

  const handleLogout = () => {
    logout();
    setSelectedVehicleId(null);
    clearNotificationsHistory();
  };

  const handleRefresh = async () => {
    if (user) await loadUserData(user.id, true);
  };

  const handleAddVehicle = async (v: Omit<Vehicle, 'id' | 'userId'>) => {
    if (!user) return;
    await DB.addVehicle(v, user.id);
    await loadUserData(user.id, true);
  };

  const handleUpdateVehicle = async (v: Vehicle) => {
    if (!user) return;
    await DB.updateVehicle(user.id, v);
    await loadUserData(user.id, true);
  };

  const handleUpdateMileage = async (id: string, km: number) => {
    if (!user) return;
    await DB.updateVehicleMileage(user.id, id, km);
    await loadUserData(user.id, true);
  };

  const handleRecordService = async (record: Omit<ServiceRecord, 'id'>) => {
    if (!user) return;
    await DB.addServiceRecord(user.id, record);
    await loadUserData(user.id, true);
  };

  const handleTabChange = (tab: 'garage' | 'history' | 'settings') => {
    setActiveTab(tab);
    setSelectedVehicleId(null);
  };

  const getTitle = () => {
    if (selectedVehicleId) return t('details');
    switch(activeTab) {
      case 'garage': return t('my_garage');
      case 'history': return t('expense_history');
      case 'settings': return t('settings');
      default: return t('app_name');
    }
  };

  // --- Render ---
  
  if (loading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
         <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
         
         <div className="flex flex-col items-center gap-6 relative z-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-40 h-40 bg-white/10 backdrop-blur-sm rounded-[3.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] border-4 border-white/10 p-8">
                <Logo className="w-full h-full text-white drop-shadow-lg" />
            </div>
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('app_name')}</h1>
                <div className="flex items-center gap-2 text-slate-400 justify-center">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-sm font-medium tracking-wide uppercase">{t('loading')}</span>
                </div>
            </div>
         </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (selectedVehicleId) {
      const v = vehicles.find(veh => veh.id === selectedVehicleId);
      if (!v) { 
        setSelectedVehicleId(null); 
        return null; 
      }
      return (
        <VehicleDetail 
          vehicle={v}
          configs={configs.filter(c => c.vehicleId === v.id)}
          onBack={() => setSelectedVehicleId(null)}
          onUpdateMileage={handleUpdateMileage}
          onUpdateVehicle={handleUpdateVehicle}
          onRecordService={handleRecordService}
          onRefresh={handleRefresh}
        />
      );
    }

    switch (activeTab) {
      case 'garage':
        return (
          <Garage 
            vehicles={vehicles}
            configs={configs}
            onSelectVehicle={setSelectedVehicleId}
            onAddVehicle={handleAddVehicle}
          />
        );
      case 'history':
        return (
          <History 
            history={history}
            vehicles={vehicles}
            configs={configs}
            onRefresh={handleRefresh}
          />
        );
      case 'settings':
        return <Settings onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      title={getTitle()}
      onLogout={handleLogout}
      showSettingsIcon={activeTab === 'garage'}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
