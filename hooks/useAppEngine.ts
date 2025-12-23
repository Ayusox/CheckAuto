import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import * as DB from '../services/db';
import { Vehicle, MaintenanceConfig, ServiceRecord, User } from '../types';
import { useTheme } from '../services/theme';
import { useTranslation } from '../services/i18n';

export const useAppEngine = () => {
  const { setLanguage } = useTranslation();
  const { setTheme } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [configs, setConfigs] = useState<MaintenanceConfig[]>([]);
  const [history, setHistory] = useState<ServiceRecord[]>([]);

  const loadUserData = async (userId: string, isSilent: boolean = false) => {
    if (!isSilent) setLoading(true);
    try {
        const [v, c, h, settings] = await Promise.all([
            DB.getVehicles(userId),
            DB.getMaintenanceConfigs(userId),
            DB.getHistory(userId),
            DB.getUserSettings(userId)
        ]);
        setVehicles(v);
        setConfigs(c);
        setHistory(h);

        if (settings) {
            if (settings.language) setLanguage(settings.language);
            if (settings.theme) setTheme(settings.theme);
            localStorage.setItem('notifications_enabled', String(settings.notifications));
        }
    } catch (e) {
        console.error("Error loading user data", e);
    } finally {
        if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const u: User = { 
                id: firebaseUser.uid, 
                username: firebaseUser.email || '', 
                password: '' 
            };
            setUser(u);
            await loadUserData(u.id);
        } else {
            setUser(null);
            setVehicles([]);
            setConfigs([]);
            setHistory([]);
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    vehicles,
    configs,
    history,
    loadUserData,
    logout: DB.logoutUser
  };
};
