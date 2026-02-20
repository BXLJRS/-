
import React, { useState } from 'react';
import { Topic, Slot } from '../types';
import { suggestDebateTopics } from '../services/geminiService';

interface TopicManagerProps {
  activeSlot: Slot;
  setSlotData: (updates: Partial<Slot>) => void;
}

const TopicManager: React.FC<TopicManagerProps> = ({ activeSlot, setSlotData }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isListVisible, setIsListVisible] = useState(false);
  const [tempName, setTempName] = useState(activeSlot.name);

  const topics = activeSlot.topics;
  const usedCount = topics.filter(t => t.isUsed).length;

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const addTopic = () => {
    const newTopic: Topic = {
      id: generateId(),
      title: '',
      sideA: '',
      sideB: '',
      isUsed: false
    };
    // 새 주제를 배열의 맨 앞(Top)으로 추가하여 사용자가 바로 볼 수 있게 함
    setSlotData({ topics: [newTopic, ...topics] });
    setIsListVisible(true);
  };

  const updateTopic = (id: string, field: keyof Topic, value: any) => {
    setSlotData({ 
      topics: topics.map(t => t.id === id ? { ...t, [field]: value } : t) 
    });
  };

  const removeTopic = (id: string) => {
    if (window.confirm('이 주제를 정말 삭제하시겠습니까?')) {
      setSlotData({ 
        topics: topics.filter(t => t.id !== id) 
      });
    }
  };

  const handleAiSuggest = async () => {
    setIsAiLoading(true);
    try {
      const suggestions = await suggestDebateTopics("흥미로운 시사 토론 주제");
      const newTopics: Topic[] = suggestions.map((s: any) => ({
        id: generateId(),
        title: s.title,
        sideA: s.sideA,
        sideB: s.sideB,
        isUsed: false
      }));
      // 추천 주제도 상단에 추가
      setSlotData({ topics: [...newTopics, ...topics] });
      setIsListVisible(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  const saveSlotName = () => {
    setSlotData({ name: tempName });
    setIsEditingName(false);
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-8 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 w-full">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm flex-shrink-0">
            <i className="fas fa-database"></i>
          </div>
          {isEditingName ? (
            <div className="flex gap-2 items-center flex-1">
              <input 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={saveSlotName}
                onKeyDown={(e) => e.key === 'Enter' && saveSlotName()}
                autoFocus
                className="bg-white border-2 border-indigo-400 px-4 py-2 rounded-xl font-bold text-slate-800 focus:outline-none w-full max-w-xs"
              />
              <button onClick={saveSlotName} className="text-indigo-600 font-black text-sm px-2 hover:text-indigo-800">저장</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-800">{activeSlot.name}</h2>
              <button 
                onClick={() => { setTempName(activeSlot.name); setIsEditingName(true); }}
                className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
              >
                <i className="fas fa-pen text-xs"></i>
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={handleAiSuggest}
            disabled={isAiLoading}
            className="flex-1 md:flex-none px-4 py-3 text-xs font-black text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {isAiLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            AI 추천
          </button>
          <button 
            onClick={addTopic}
            className="flex-1 md:flex-none px-5 py-3 text-xs font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            <i className="fas fa-plus"></i> 주제 추가
          </button>
        </div>
      </div>

      {!isListVisible ? (
        <div className="flex flex-col items-center justify-center py-28 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 text-center animate-fadeIn">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-200 mb-8 shadow-inner border border-slate-50">
            <i className="fas fa-lock text-4xl"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">주제 목록 보안 모드</h3>
          <p className="text-slate-400 font-bold mb-10 leading-relaxed">
            현재 <span className="text-indigo-600 font-black">{topics.length}개</span>의 토론 주제가 등록되어 있습니다.<br/>
            {usedCount > 0 ? (
              <span className="text-red-500 font-black">그 중 {usedCount}개의 주제는 이미 추첨되었습니다.</span>
            ) : (
              <span>아직 추첨된 주제가 없습니다.</span>
            )}
          </p>
          <button 
            onClick={() => setIsListVisible(true)}
            className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-indigo-600 hover:scale-105 transition-all shadow-xl shadow-slate-200 flex items-center gap-3"
          >
            <i className="fas fa-eye"></i>
            목록 보기 / 편집하기
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
              <i className="fas fa-shield-halved text-indigo-400"></i>
              <span>새 주제는 목록의 맨 위에 추가됩니다.</span>
            </div>
            <button 
              onClick={() => setIsListVisible(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-200 flex items-center gap-2 transition-all"
            >
              <i className="fas fa-lock"></i> 목록 숨기기
            </button>
          </div>

          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div 
                key={topic.id} 
                className={`p-6 rounded-[1.5rem] border-2 transition-all ${
                  topic.isUsed 
                  ? 'bg-red-50 border-red-300 shadow-md ring-4 ring-red-500/5' 
                  : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-start gap-5 mb-4">
                  <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm shadow-sm ${
                    topic.isUsed ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {topics.length - index}
                  </span>
                  <div className="flex-1">
                    <input
                      value={topic.title}
                      onChange={(e) => updateTopic(topic.id, 'title', e.target.value)}
                      placeholder="토론 주제를 입력하세요..."
                      className={`w-full text-xl font-black bg-transparent focus:outline-none placeholder:text-slate-200 mb-1 ${
                        topic.isUsed ? 'text-red-700 font-black' : 'text-slate-800'
                      }`}
                    />
                    {topic.isUsed && (
                      <div className="flex items-center gap-2 text-red-600 font-black text-[11px] mt-1 uppercase">
                        <i className="fas fa-circle-exclamation"></i>
                        이미 사용된 주제 (추첨 제외)
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => removeTopic(topic.id)}
                    className={`p-2 transition-colors ${topic.isUsed ? 'text-red-300 hover:text-red-700' : 'text-slate-200 hover:text-red-500'}`}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase ${topic.isUsed ? 'text-red-400' : 'text-indigo-400'}`}>찬성</span>
                    <input
                      value={topic.sideA}
                      onChange={(e) => updateTopic(topic.id, 'sideA', e.target.value)}
                      placeholder="찬성 측 입장..."
                      className={`w-full pl-14 pr-4 py-3 border rounded-2xl text-sm font-bold focus:bg-white focus:outline-none transition-all ${
                        topic.isUsed 
                        ? 'bg-white border-red-200 text-red-800 focus:ring-4 focus:ring-red-500/10' 
                        : 'bg-slate-50 border-slate-100 text-slate-800 focus:ring-4 focus:ring-indigo-500/10'
                      }`}
                    />
                  </div>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase ${topic.isUsed ? 'text-red-400' : 'text-red-500/40'}`}>반대</span>
                    <input
                      value={topic.sideB}
                      onChange={(e) => updateTopic(topic.id, 'sideB', e.target.value)}
                      placeholder="반대 측 입장..."
                      className={`w-full pl-14 pr-4 py-3 border rounded-2xl text-sm font-bold focus:bg-white focus:outline-none transition-all ${
                        topic.isUsed 
                        ? 'bg-white border-red-200 text-red-800 focus:ring-4 focus:ring-red-500/10' 
                        : 'bg-slate-50 border-slate-100 text-slate-800 focus:ring-4 focus:ring-indigo-500/10'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
            {topics.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold">등록된 주제가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicManager;
