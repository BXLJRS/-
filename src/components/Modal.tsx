import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'danger';
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = '확인',
  cancelText = '취소'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      default:
        return <Info className="w-6 h-6 text-indigo-500" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-red-200';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  type === 'danger' || type === 'warning' ? 'bg-red-50' : 
                  type === 'success' ? 'bg-emerald-50' : 'bg-indigo-50'
                }`}>
                  {getIcon()}
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
                <button 
                  onClick={onClose}
                  className="ml-auto p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  {cancelText}
                </button>
                {onConfirm && (
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all shadow-lg cursor-pointer ${getConfirmButtonClass()}`}
                  >
                    {confirmText}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
