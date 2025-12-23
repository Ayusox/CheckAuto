import React, { useState, useEffect } from 'react';
import { Globe, Bell, Info, Moon, Sun, Save, Check, Loader2, LogOut, HelpCircle } from 'lucide-react';
import { useTranslation } from '../services/i18n';
import { useTheme } from '../services/theme';
import Footer from '../components/Footer';
import * as DB from '../services/db';
import { auth } from '../services/firebase';
import AppGuideModal from '../components/AppGuideModal';

interface Props {
    onLogout: () => void;
}

const Settings: React.FC<Props> = ({ onLogout }) => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('notifications_enabled');
    if (stored !== null) {
      setNotificationsEnabled(stored === 'true');
    }
  }, []);

  const toggleNotifications = () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    localStorage.setItem('notifications_enabled', String(newVal));
  };

  const handleLanguageChange = (lang: 'es' | 'en') => {
      setLanguage(lang);
  };

  const handleManualSave = async () => {
      if (!auth.currentUser) return;
      
      setIsSaving(true);
      setSaveSuccess(false);

      try {
          await DB.updateUserSettings(auth.currentUser.uid, {
              language: language,
              theme: theme,
              notifications: notificationsEnabled
          });
          
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
      } catch (e) {
          console.error("Failed to save settings", e);
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Help Section */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
          {t('help')}
        </h3>
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-soft">
             <button 
                onClick={() => setShowGuide(true)}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
             >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <HelpCircle size={22} />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white text-lg">{t('open_guide')}</span>
                </div>
            </button>
        </div>
      </div>

      {/* General Section */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
          {t('general')}
        </h3>
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-soft divide-y divide-slate-50 dark:divide-slate-700/50">
          
          {/* Language Selector */}
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <Globe size={22} />
              </div>
              <span className="font-bold text-slate-800 dark:text-white text-lg">{t('language')}</span>
            </div>
            
            <div className="flex bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1.5">
              <button 
                onClick={() => handleLanguageChange('es')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${language === 'es' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-400'}`}
              >
                ES
              </button>
              <button 
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${language === 'en' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-400'}`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="p-5 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-2xl text-slate-600 dark:text-slate-300">
                    {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
                </div>
                <span className="font-bold text-slate-800 dark:text-white text-lg">{t('dark_mode')}</span>
             </div>
             
             <button 
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Notifications Section */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
          {t('notifications')}
        </h3>
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-soft">
          
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
                <Bell size={22} />
              </div>
              <span className="font-bold text-slate-800 dark:text-white text-lg">{t('enable_notifications')}</span>
            </div>
            
            <button 
              onClick={toggleNotifications}
              className={`w-14 h-8 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Info Section */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
          {t('info')}
        </h3>
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-soft">
          
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-2xl text-slate-600 dark:text-slate-300">
                <Info size={22} />
              </div>
              <span className="font-bold text-slate-800 dark:text-white text-lg">{t('version')}</span>
            </div>
            <span className="text-slate-400 dark:text-slate-500 font-mono text-sm font-semibold">v1.4.0</span>
          </div>

        </div>
      </div>
      
      {/* Save Button */}
      <button 
        onClick={handleManualSave}
        disabled={isSaving}
        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all ${
            saveSuccess 
            ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
            : 'bg-slate-900 dark:bg-indigo-600 text-white shadow-slate-200 dark:shadow-indigo-900/20'
        }`}
      >
        {isSaving ? (
            <>
                <Loader2 size={20} className="animate-spin" />
                <span>{t('processing')}</span>
            </>
        ) : saveSuccess ? (
            <>
                <Check size={20} />
                <span>{t('settings_saved')}</span>
            </>
        ) : (
            <>
                <Save size={20} />
                <span>{t('save_settings')}</span>
            </>
        )}
      </button>

      {/* Logout Button */}
      <button 
        onClick={onLogout}
        className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 active:scale-[0.98] transition-all hover:bg-rose-100 dark:hover:bg-rose-500/20"
      >
        <LogOut size={20} />
        <span>{t('logout')}</span>
      </button>

      {/* Footer */}
      <Footer />

      {/* User Guide Modal */}
      <AppGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

    </div>
  );
};

export default Settings;