
import React from 'react';

interface SidebarProps {
  activeDay: number;
  setActiveDay: (day: number) => void;
  dayLabels: Record<number, string>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeDay, setActiveDay, dayLabels }) => {
  return (
    <aside className="w-full md:w-72 bg-slate-900 text-white md:min-h-screen flex flex-col border-r border-slate-800">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fas fa-gavel text-xl"></i>
          </div>
          <div>
            <span className="font-black text-2xl tracking-tight block">Debate Pro</span>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">토론 추첨 시스템</span>
          </div>
        </div>

        <nav className="space-y-3">
          {[1, 2, 3].map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`w-full flex flex-col items-start gap-1 px-5 py-4 rounded-2xl transition-all duration-300 ${
                activeDay === day 
                ? 'bg-slate-800 text-white shadow-xl shadow-black/20 ring-1 ring-slate-700' 
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`w-2 h-2 rounded-full ${activeDay === day ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'}`} />
                <span className="font-bold text-sm opacity-60 uppercase">{day}일차</span>
                {activeDay === day && <i className="fas fa-chevron-right ml-auto text-[10px] opacity-40"></i>}
              </div>
              <span className="font-bold text-lg ml-5">{dayLabels[day]}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-slate-800/50 hidden md:block">
        <div className="bg-slate-800/30 p-5 rounded-3xl border border-slate-800/50">
          <p className="text-[10px] text-indigo-400 mb-2 uppercase font-black tracking-widest">도움말</p>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            각 일차별로 5개의 독립된 저장소를 사용할 수 있습니다. 주제를 입력하고 무작위로 추첨해 보세요.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
