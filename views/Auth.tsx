import React, { useState, useEffect } from 'react';
import { Lock, Mail, AlertCircle, ChevronRight, Eye, EyeOff, Check } from 'lucide-react';
import * as DB from '../services/db';
import { User } from '../types';
import { useTranslation } from '../services/i18n';
import Logo from '../components/Logo';

interface Props {
  onLogin: (user: User) => void;
}

// Helper to translate Firebase errors
const getFirebaseErrorMessage = (error: any): string => {
  const code = error?.code;
  
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo electrónico no tiene un formato válido.';
    case 'auth/user-not-found':
      return 'No existe ninguna cuenta con este correo.';
    case 'auth/wrong-password':
      return 'La contraseña es incorrecta.';
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado.';
    case 'auth/weak-password':
      return 'La contraseña es muy corta (mínimo 6 caracteres).';
    case 'auth/invalid-credential': 
      // Newer Firebase versions sometimes group errors under this code
      return 'El correo o la contraseña son incorrectos.';
    default:
      return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
  }
};

const Auth: React.FC<Props> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('checkauto_remember_email');
    if (savedEmail) {
      setUsername(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Save or Clear email based on "Remember Me"
    if (rememberMe) {
        localStorage.setItem('checkauto_remember_email', username);
    } else {
        localStorage.removeItem('checkauto_remember_email');
    }

    try {
      if (isRegistering) {
        const user = await DB.registerUser(username, password);
        onLogin(user);
      } else {
        const user = await DB.loginUser(username, password);
        onLogin(user);
      }
    } catch (err: any) {
      // Use the helper to set a friendly message
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-6 transform hover:scale-105 transition-transform duration-500 relative">
             {/* CheckAuto Logo Component - Reduced Size */}
             <div className="relative w-32 h-32 flex items-center justify-center">
                 <Logo className="w-full h-full text-indigo-600 dark:text-indigo-400 drop-shadow-2xl" />
             </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">{t('app_name')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('app_tagline')}</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-soft p-8 border border-white/20 dark:border-slate-700/50">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 text-center">
            {isRegistering ? t('create_account') : t('welcome_back')}
          </h2>

          {error && (
            <div className="mb-6 bg-rose-50 dark:bg-rose-500/10 p-4 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-medium animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-5 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  name="email"
                  id="email"
                  autoComplete="username"
                  required 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-700/50 border-none rounded-2xl py-4 pl-14 pr-4 text-slate-800 dark:text-white font-semibold placeholder:text-slate-400 focus:ring-0 focus:bg-white dark:focus:bg-slate-700 shadow-inner transition-all"
                  placeholder={t('username')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-5 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  id="password"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-700/50 border-none rounded-2xl py-4 pl-14 pr-12 text-slate-800 dark:text-white font-semibold placeholder:text-slate-400 focus:ring-0 focus:bg-white dark:focus:bg-slate-700 shadow-inner transition-all"
                  placeholder={t('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox (Only on Login) */}
            {!isRegistering && (
                <div 
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => setRememberMe(!rememberMe)}
                >
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600 bg-transparent'}`}>
                        {rememberMe && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                        {t('remember_me')}
                    </span>
                </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 dark:shadow-indigo-900/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
            >
              {loading ? t('processing') : (
                  <>
                    {isRegistering ? t('signup') : t('login')}
                    {!loading && <ChevronRight size={20} opacity={0.6} />}
                  </>
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isRegistering ? t('have_account') : t('no_account')}
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="ml-2 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              {isRegistering ? t('login') : t('signup')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;