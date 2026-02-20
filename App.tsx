
import React, { useState, useEffect } from 'react';
import { AppData, ViewMode, Slot } from './types';
import Sidebar from './components/Sidebar';
import TopicManager from './components/TopicManager';
import DrawingRoom from './components/DrawingRoom';

const createEmptySlot = (id: number, name?: string): Slot => ({
  id,
  name: name || `저장소 ${id + 1}`,
  topics: [],
  lastDrawnId: null
});

const INITIAL_DATA: AppData = {
  1: { id: 1, activeSlotId: 0, slots: [createEmptySlot(Date.now())] },
  2: { id: 2, activeSlotId: 0, slots: [createEmptySlot(Date.now() + 1)] },
  3: { id: 3, activeSlotId: 0, slots: [createEmptySlot(Date.now() + 2)] }
};

const App: React.FC = () => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MANAGE);
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('debate_draw_data_v3');
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch (e) {
      console.error("데이터 로드 실패 또는 localStorage 접근 거부", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('debate_draw_data_v3', JSON.stringify(data));
      } catch (e) {
        console.error("데이터 저장 실패", e);
      }
    }
  }, [data, isLoaded]);

  const activeDayData = data[activeDay];
  const activeSlot = activeDayData.slots[activeDayData.activeSlotId];

  const updateActiveSlot = (updates: Partial<Slot>) => {
    setData(prev => {
      const day = prev[activeDay];
      const newSlots = [...day.slots];
      newSlots[day.activeSlotId] = { ...newSlots[day.activeSlotId], ...updates };
      return {
        ...prev,
        [activeDay]: { ...day, slots: newSlots }
      };
    });
  };

  const setActiveSlotId = (index: number) => {
    setData(prev => ({
      ...prev,
      [activeDay]: { ...prev[activeDay], activeSlotId: index }
    }));
  };

  const addSlot = () => {
    setData(prev => {
      const day = prev[activeDay];
      const newSlot = createEmptySlot(Date.now(), `저장소 ${day.slots.length + 1}`);
      return {
        ...prev,
        [activeDay]: { 
          ...day, 
          slots: [...day.slots, newSlot],
          activeSlotId: day.slots.length
        }
      };
    });
  };

  const removeSlot = (index: number) => {
    if (activeDayData.slots.length <= 1) {
      alert("최소 하나의 저장소는 유지해야 합니다.");
      return;
    }
    if (!window.confirm(`'${activeDayData.slots[index].name}' 저장소를 삭제하시겠습니까?`)) return;

    setData(prev => {
      const day = prev[activeDay];
      const newSlots = day.slots.filter((_, i) => i !== index);
      let newActiveId = day.activeSlotId;
      if (newActiveId >= newSlots.length) {
        newActiveId = Math.max(0, newSlots.length - 1);
      }
      return {
        ...prev,
        [activeDay]: { 
          ...day, 
          slots: newSlots,
          activeSlotId: newActiveId
        }
      };
    });
  };

  const markTopicAsUsed = (topicId: string) => {
    const updatedTopics = activeSlot.topics.map(t => 
      t.id === topicId ? { ...t, isUsed: true } : t
    );
    updateActiveSlot({ 
      topics: updatedTopics,
      lastDrawnId: topicId 
    });
  };

  const undoLastDraw = () => {
    if (!activeSlot.lastDrawnId) return;
    const updatedTopics = activeSlot.topics.map(t => 
      t.id === activeSlot.lastDrawnId ? { ...t, isUsed: false } : t
    );
    updateActiveSlot({ 
      topics: updatedTopics,
      lastDrawnId: null 
    });
  };

  const resetDrawnTopics = () => {
    const updatedTopics = activeSlot.topics.map(t => ({ ...t, isUsed: false }));
    updateActiveSlot({ 
      topics: updatedTopics,
      lastDrawnId: null 
    });
  };

  if (!isLoaded) return null;

  const dayLabels: Record<number, string> = {
    1: '2/25(수) SEL',
    2: '2/26(목) SEL',
    3: '2/27(금) PUS'
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900">
      <Sidebar 
        activeDay={activeDay} 
        setActiveDay={setActiveDay} 
        dayLabels={dayLabels}
      />

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full mb-2 inline-block">{dayLabels[activeDay]}</span>
              <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">토론 면접 시스템</h1>
            </div>
            
            <div className="flex bg-slate-200 p-1 rounded-2xl w-full sm:w-fit shadow-inner">
              <button 
                onClick={() => setViewMode(ViewMode.MANAGE)}
                className={`flex-1 sm:flex-none px-4 md:px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === ViewMode.MANAGE ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className="fas fa-edit mr-2"></i>주제 관리
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.DRAW)}
                className={`flex-1 sm:flex-none px-4 md:px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === ViewMode.DRAW ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className="fas fa-random mr-2"></i>무작위 추첨
              </button>
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-2 mb-8">
            {activeDayData.slots.map((slot, index) => (
              <div key={slot.id} className="group relative">
                <button
                  onClick={() => setActiveSlotId(index)}
                  className={`px-4 md:px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border-2 flex items-center gap-2 ${
                    activeDayData.activeSlotId === index 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                  }`}
                >
                  {slot.name}
                </button>
                {activeDayData.slots.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeSlot(index); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addSlot}
              className="w-10 h-10 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 flex items-center justify-center transition-all bg-white/50"
              title="저장소 추가"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>

          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 p-5 md:p-10 min-h-[600px] transition-all duration-300 border border-slate-100 relative overflow-hidden">
            {viewMode === ViewMode.MANAGE ? (
              <TopicManager 
                activeSlot={activeSlot}
                setSlotData={updateActiveSlot}
              />
            ) : (
              <DrawingRoom 
                slotName={activeSlot.name}
                topics={activeSlot.topics}
                lastDrawnId={activeSlot.lastDrawnId}
                onMarkUsed={markTopicAsUsed}
                onUndo={undoLastDraw}
                onReset={resetDrawnTopics}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
