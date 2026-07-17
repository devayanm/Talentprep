import React from "react";
import { RotateCcw, X } from "lucide-react";

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetModal({ isOpen, onClose, onConfirm }: ResetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md no-print p-4">
      <div className="glass-panel border border-white/15 max-w-sm w-full p-6 shadow-2xl space-y-4 font-mono text-xs bg-slate-900/90 text-white rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-pink-500">
            <RotateCcw size={16} />
            <span className="font-sans font-black uppercase text-xs tracking-wide">RESET PREP PROGRESS</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 hover:bg-white/5 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        <p className="leading-relaxed text-slate-300 font-sans">
          Are you sure you want to completely reset your study checkbox progress and clear all response notes? This action cannot be undone.
        </p>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl transition font-bold cursor-pointer text-[10px]"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-95 text-white rounded-xl transition font-bold cursor-pointer text-[10px] shadow-[0_2px_10px_rgba(244,63,94,0.3)]"
          >
            RESET ALL
          </button>
        </div>
      </div>
    </div>
  );
}

