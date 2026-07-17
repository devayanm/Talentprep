import React from "react";
import { Search, X, LayoutGrid, FileText } from "lucide-react";

interface NavigationTabsProps {
  rawMarkdown: string;
  activeTab: 'interactive' | 'markdown';
  setActiveTab: (tab: 'interactive' | 'markdown') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function NavigationTabs({
  rawMarkdown,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}: NavigationTabsProps) {
  if (!rawMarkdown) return null;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 text-white bg-slate-900/40 px-6 pb-4 border-b border-white/10 backdrop-blur-md">
      <div className="flex p-0.5 rounded-xl bg-black/40 border border-white/10 overflow-hidden text-xs font-mono self-start">
        <button
          onClick={() => setActiveTab('interactive')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer font-bold flex items-center gap-1.5 ${
            activeTab === 'interactive' 
              ? 'bg-gradient-to-r from-orange-500/90 to-pink-500/70 text-white shadow-[0_2px_10px_rgba(242,125,38,0.3)]' 
              : 'hover:bg-white/5 text-slate-300'
          }`}
        >
          <LayoutGrid size={13} />
          <span>Interactive Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('markdown')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer font-bold flex items-center gap-1.5 ${
            activeTab === 'markdown' 
              ? 'bg-gradient-to-r from-orange-500/90 to-pink-500/70 text-white shadow-[0_2px_10px_rgba(242,125,38,0.3)]' 
              : 'hover:bg-white/5 text-slate-300'
          }`}
        >
          <FileText size={13} />
          <span>Raw Markdown</span>
        </button>
      </div>

      {activeTab === 'interactive' && (
        <div className="relative flex-1 max-w-xs self-stretch sm:self-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input pl-9 pr-8 py-1.5 rounded-xl text-xs focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

