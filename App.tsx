
import React, { useState, useEffect, useCallback } from 'react';
import { AppData, Topic, ViewMode, DayData, Slot } from './types';
import Sidebar from './components/Sidebar';
import TopicManager from './components/TopicManager';
import DrawingRoom from './components/DrawingRoom';

const createEmptySlot = (id: number): Slot => ({
  id,
  name: `저장소 ${id + 1}`,
  topics: [],
  lastDrawnId: null
});

const INITIAL_DATA: AppData = {
  1: { id: 1, activeSlotId: 0, slots: Array.from({ length: 5 }, (_, i) => createEmptySlot(i)) },
  2: { id: 2, activeSlotId: 0, slots: Array.from({ length: 5 }, (_, i) => createEmptySlot(i)) },
  3: { id: 3, activeSlotId: 0, slots: Array.from({ length: 5 }, (_, i) => createEmptySlot(i)) }
};

const App: React.FC = () => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MANAGE);
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('debate_draw_data_v3');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("데이터 로드 실패");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('debate_draw_data_v3', JSON.stringify(data));
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

  const setActiveSlotId = (slotId: number) => {
    setData(prev => ({
      ...prev,
      [activeDay]: { ...prev[activeDay], activeSlotId: slotId }
    }));
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
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar 
        activeDay={activeDay} 
        setActiveDay={setActiveDay} 
        dayLabels={dayLabels}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-indigo-500 uppercase tracking-widest">{dayLabels[activeDay]}</span>
              <h1 className="text-3xl font-black text-slate-800">토론 면접 시스템</h1>
            </div>
            
            <div className="flex bg-slate-200 p-1 rounded-2xl w-fit">
              <button 
                onClick={() => setViewMode(ViewMode.MANAGE)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === ViewMode.MANAGE ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className="fas fa-edit mr-2"></i>주제 관리
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.DRAW)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === ViewMode.DRAW ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className="fas fa-random mr-2"></i>무작위 추첨
              </button>
            </div>
          </header>

          <div className="flex flex-wrap gap-2 mb-6">
            {activeDayData.slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setActiveSlotId(slot.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                  activeDayData.activeSlotId === slot.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                }`}
              >
                {slot.name}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-6 md:p-10 min-h-[650px] transition-all duration-300 border border-slate-100 relative">
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
