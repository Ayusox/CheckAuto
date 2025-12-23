import React from 'react';
import Logo from './Logo';

interface FooterProps {
    colorClass?: string;
}

const Footer: React.FC<FooterProps> = ({ colorClass = "text-indigo-600" }) => {
  return (
    <div className="text-center py-8 flex flex-col items-center gap-3">
      {/* Logo Component (Grayscale) - Reduced Size */}
      <div className={`w-8 h-8 flex items-center justify-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 ${colorClass}`}>
           <Logo className="w-full h-full text-current" />
      </div>
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
        Desarrollado por Ayuso.dev
      </p>
    </div>
  );
};

export default Footer;