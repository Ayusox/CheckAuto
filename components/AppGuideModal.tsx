import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Car, Activity, Wrench, BarChart3, HelpCircle } from 'lucide-react';
import { useTranslation } from '../services/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AppGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Car size={48} className="text-indigo-500" />,
      title: t('guide_step1_title'),
      desc: t('guide_step1_desc')
    },
    {
      icon: <Activity size={48} className="text-emerald-500" />,
      title: t('guide_step2_title'),
      desc: t('guide_step2_desc')
    },
    {
      icon: <Wrench size={48} className="text-amber-500" />,
      title: t('guide_step3_title'),
      desc: t('guide_step3_desc')
    },
    {
      icon: <BarChart3 size={48} className="text-violet-500" />,
      title: t('guide_step4_title'),
      desc: t('guide_step4_desc')
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleClose = () => {
      onClose();
      setTimeout(() => setStep(0), 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-700">
        
        <button onClick={handleClose} className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors z-10">
          <X size={20} className="text-slate-500 dark:text-slate-300" />
        </button>

        <div className="mt-6 mb-8 p-8 bg-slate-50 dark:bg-slate-700/30 rounded-full shadow-inner ring-1 ring-slate-100 dark:ring-slate-700 relative">
            <div className="absolute inset-0 bg-white/50 dark:bg-white/5 rounded-full blur-xl"></div>
            <div className="relative transform transition-all duration-500 hover:scale-110">
                {steps[step].icon}
            </div>
        </div>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 min-h-[3rem] flex items-center justify-center leading-tight">
            {steps[step].title}
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 min-h-[5rem]">
            {steps[step].desc}
        </p>

        {/* Indicators */}
        <div className="flex gap-2 mb-8">
            {steps.map((_, i) => (
                <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-slate-700'}`} 
                />
            ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3 w-full">
            {step > 0 && (
                <button 
                    onClick={handlePrev}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                    {t('previous')}
                </button>
            )}
            <button 
                onClick={handleNext}
                className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-indigo-700"
            >
                {step === steps.length - 1 ? t('finish') : t('next')}
                {step < steps.length - 1 && <ChevronRight size={20} />}
            </button>
        </div>

      </div>
    </div>
  );
};

export default AppGuideModal;