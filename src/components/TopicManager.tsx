import React, { useState } from 'react';
import { Topic, Slot } from '../types';
import { suggestDebateTopics } from '../services/geminiService';
import Modal from './Modal';
import { Database, Pen, Wand2, Plus, Trash2, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface TopicManagerProps {
  activeSlot: Slot;
  setSlotData: (updates: Partial<Slot>) => void;
}

const TopicManager: React.FC<TopicManagerProps> = ({ activeSlot, setSlotData }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isListVisible, setIsListVisible] = useState(false);
  const [tempName, setTempName] = useState(activeSlot.name);
  
  // Local Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; topicId: string | null }>({
    isOpen: false,
    topicId: null
  });

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
    setSlotData({ topics: [newTopic, ...topics] });
    setIsListVisible(true);
  };

  const updateTopic = (id: string, field: keyof Topic, value: any) => {
    setSlotData({ 
      topics: topics.map(t => t.id === id ? { ...t, [field]: value } : t) 
    });
  };

  const removeTopic = (id: string) => {
    setDeleteModal({ isOpen: true, topicId: id });
  };

  const confirmDelete = () => {
    if (deleteModal.topicId) {
      setSlotData({ 
        topics: topics.filter(t => t.id !== deleteModal.topicId) 
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
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 md:mb-8 p-4 md:p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 w-full">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
          {isEditingName ? (
            <div className="flex gap-2 items-center flex-1">
              <input 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={saveSlotName}
                onKeyDown={(e) => e.key === 'Enter' && saveSlotName()}
                autoFocus
                className="bg-white border-2 border-indigo-400 px-4 py-2 rounded-xl font-bold text-slate-800 focus:outline-none w-full max-w-[200px] md:max-w-xs"
              />
              <button onClick={saveSlotName} className="text-indigo-600 font-black text-sm px-2 hover:text-indigo-800 cursor-pointer">저장</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-hidden">
              <h2 className="text-lg md:text-xl font-black text-slate-800 truncate">{activeSlot.name}</h2>
              <button 
                onClick={() => { setTempName(activeSlot.name); setIsEditingName(true); }}
                className="text-slate-400 hover:text-indigo-500 transition-colors p-1 cursor-pointer"
              >
                <Pen className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleAiSuggest}
            disabled={isAiLoading}
            className="flex-1 md:flex-none px-3 md:px-4 py-3 text-[10px] md:text-xs font-black text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {isAiLoading ? <span className="animate-spin">◌</span> : <Wand2 className="w-3 h-3 md:w-4 md:h-4" />}
            AI 추천
          </button>
          <button 
            onClick={addTopic}
            className="flex-1 md:flex-none px-4 md:px-5 py-3 text-[10px] md:text-xs font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" /> 주제 추가
          </button>
        </div>
      </div>

      {!isListVisible ? (
        <div className="flex flex-col items-center justify-center py-20 md:py-28 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-slate-200 mb-6 md:mb-8 shadow-inner border border-slate-50">
            <ShieldCheck className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-3 tracking-tight">주제 목록 보안 모드</h3>
          <p className="text-slate-400 font-bold mb-8 md:mb-10 leading-relaxed text-sm md:text-base">
            현재 <span className="text-indigo-600 font-black">{topics.length}개</span>의 토론 주제가 등록되어 있습니다.<br/>
            {usedCount > 0 ? (
              <span className="text-red-500 font-black">그 중 {usedCount}개의 주제는 이미 추첨되었습니다.</span>
            ) : (
              <span>아직 추첨된 주제가 없습니다.</span>
            )}
          </p>
          <button 
            onClick={() => setIsListVisible(true)}
            className="px-8 py-4 md:px-10 md:py-5 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-indigo-600 hover:scale-105 transition-all shadow-xl shadow-slate-200 flex items-center gap-3 text-sm md:text-base cursor-pointer"
          >
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
            목록 보기 / 편집하기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs md:text-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>새 주제는 목록의 맨 위에 추가됩니다.</span>
            </div>
            <button 
              onClick={() => setIsListVisible(false)}
              className="px-3 py-2 md:px-4 md:py-2 bg-slate-100 rounded-xl text-[10px] md:text-xs font-black text-slate-600 hover:bg-slate-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <EyeOff className="w-3 h-3 md:w-4 md:h-4" /> 목록 숨기기
            </button>
          </div>

          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div 
                key={topic.id} 
                className={`p-4 md:p-6 rounded-[1.5rem] border-2 transition-all ${
                  topic.isUsed 
                  ? 'bg-red-50 border-red-300 shadow-md ring-4 ring-red-500/5' 
                  : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-start gap-3 md:gap-5 mb-4">
                  <span className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl font-black text-xs md:text-sm shadow-sm ${
                    topic.isUsed ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {topics.length - index}
                  </span>
                  <div className="flex-1">
                    <input
                      value={topic.title}
                      onChange={(e) => updateTopic(topic.id, 'title', e.target.value)}
                      placeholder="토론 주제를 입력하세요..."
                      className={`w-full text-base md:text-xl font-black bg-transparent focus:outline-none placeholder:text-slate-200 mb-1 ${
                        topic.isUsed ? 'text-red-700 font-black' : 'text-slate-800'
                      }`}
                    />
                    {topic.isUsed && (
                      <div className="flex items-center gap-2 text-red-600 font-black text-[10px] md:text-[11px] mt-1 uppercase">
                        <AlertCircle className="w-3 h-3" />
                        이미 사용된 주제
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => removeTopic(topic.id)}
                    className={`p-2 transition-colors cursor-pointer ${topic.isUsed ? 'text-red-300 hover:text-red-700' : 'text-slate-200 hover:text-red-500'}`}
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 ml-0 md:ml-14">
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-[9px] md:text-[10px] font-black uppercase ${topic.isUsed ? 'text-red-400' : 'text-indigo-400'}`}>찬성</span>
                    <input
                      value={topic.sideA}
                      onChange={(e) => updateTopic(topic.id, 'sideA', e.target.value)}
                      placeholder="찬성 측 입장..."
                      className={`w-full pl-12 md:pl-14 pr-4 py-2.5 md:py-3 border rounded-2xl text-xs md:text-sm font-bold focus:bg-white focus:outline-none transition-all ${
                        topic.isUsed 
                        ? 'bg-white border-red-200 text-red-800 focus:ring-4 focus:ring-red-500/10' 
                        : 'bg-slate-50 border-slate-100 text-slate-800 focus:ring-4 focus:ring-indigo-500/10'
                      }`}
                    />
                  </div>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-[9px] md:text-[10px] font-black uppercase ${topic.isUsed ? 'text-red-400' : 'text-red-500/40'}`}>반대</span>
                    <input
                      value={topic.sideB}
                      onChange={(e) => updateTopic(topic.id, 'sideB', e.target.value)}
                      placeholder="반대 측 입장..."
                      className={`w-full pl-12 md:pl-14 pr-4 py-2.5 md:py-3 border rounded-2xl text-xs md:text-sm font-bold focus:bg-white focus:outline-none transition-all ${
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

      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, topicId: null })}
        onConfirm={confirmDelete}
        title="주제 삭제"
        message="이 주제를 정말 삭제하시겠습니까? 삭제된 주제는 복구할 수 없습니다."
        type="danger"
      />
    </div>
  );
};


export default TopicManager;
