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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs no-print p-4">
      <div className="bg-[#E4E3E0] border-2 border-[#141414] max-w-sm w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#141414] pb-2">
          <div className="flex items-center gap-2 text-red-600">
            <RotateCcw size={16} />
            <span className="font-extrabold uppercase text-xs">RESET PREP PROGRESS</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-black font-bold cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <p className="leading-relaxed">
          Are you sure you want to completely reset your study checkbox progress and clear all response notes? This action cannot be undone.
        </p>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-[#141414] hover:bg-gray-100 transition font-bold cursor-pointer"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 transition font-bold cursor-pointer"
          >
            RESET ALL
          </button>
        </div>
      </div>
    </div>
  );
}
