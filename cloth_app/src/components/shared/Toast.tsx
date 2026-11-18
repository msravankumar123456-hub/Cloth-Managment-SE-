import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, showToast } = useApp();

  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-[#FF7135] shrink-0" />,
    info: <Info className="w-4 h-4 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#17181C]/95 border border-white/10 shadow-2xl backdrop-blur-xl text-sm text-[#F5F5F5] min-w-[280px] max-w-md">
        {iconMap[toast.type]}
        <span className="flex-1 font-medium text-xs sm:text-sm">{toast.message}</span>
        <button 
          onClick={() => showToast('', 'info')}
          className="text-muted hover:text-white transition-colors"
          aria-label="Close toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
