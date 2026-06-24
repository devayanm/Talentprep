import React from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#141414] text-[#E4E3E0] border-2 border-[#E4E3E0] px-4 py-3 shadow-xl max-w-sm flex items-center justify-between gap-3 font-mono text-xs no-print">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-[#F27D26] rounded-full inline-block animate-pulse"></span>
        <span>{message}</span>
      </div>
      <button 
        onClick={onClose} 
        className="text-[#F27D26] hover:text-white font-bold ml-1 cursor-pointer"
        aria-label="Close Notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
