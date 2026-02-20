
import React, { useState, useEffect } from 'react';
import { Topic } from '../types';

interface DrawingRoomProps {
  slotName: string;
  topics: Topic[];
  lastDrawnId?: string | null;
  onMarkUsed: (id: string) => void;
  onUndo: () => void;
  onReset: () => void;
}

const DrawingRoom: React.FC<DrawingRoomProps> = ({ slotName, topics, lastDrawnId, onMarkUsed, onUndo, onReset }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<Topic | null>(null);
  const [shuffleText, setShuffleText] = useState("");
  
  const availableTopics = topics.filter(t => !t.isUsed);
  const usedCount = topics.filter(t => t.isUsed).length;

  // 결과 창이 열려있는 상태에서 lastDrawnId가 사라지면(Undo 시) 결과창 닫기
  useEffect(() => {
    if (!lastDrawnId && result) {
      setResult(null);
    }
  }, [lastDrawnId, result]);

  const handleDraw = () => {
    if (availableTopics.length === 0) return;

    setIsDrawing(true);
    setResult(null);

    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableTopics.length);
      setShuffleText(availableTopics[randomIndex].title);
      count++;
      if (count > 25) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * availableTopics.length);
        const finalTopic = availableTopics[finalIndex];
        setResult(finalTopic);
        onMarkUsed(finalTopic.id);
        setIsDrawing(false);
      }
    }, 70);
  };

  const handleUndo = () => {
    if (!lastDrawnId) return;
    if (window.confirm('방금 뽑은 주제를 취소하고 다시 추첨함으로 되돌릴까요?')) {
      onUndo();
    }
  };

  const confirmReset = () => {
    const message = `[경고] 모든 추첨 기록을 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 주제가 다시 추첨 대상이 됩니다.\n정말 초기화하시겠습니까?`;
    if (window.confirm(message)) {
      onReset();
      setResult(null);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      {/* 상태 헤더 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">전체 주제</p>
          <p className="text-2xl font-black text-slate-800">{topics.length}개</p>
        </div>
        <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 flex flex-col justify-center">
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">남은 주제</p>
          <p className="text-2xl font-black text-indigo-600">{availableTopics.length}개</p>
        </div>
        <div className="bg-red-50/30 p-5 rounded-2xl border border-red-100 flex flex-col justify-center">
          <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">사용 완료</p>
          <p className="text-2xl font-black text-red-600">{usedCount}개</p>
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={confirmReset}
            className="w-full flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border-2 border-dashed border-red-200 text-red-400 hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all font-black text-xs"
          >
            <i className="fas fa-rotate-left"></i> 기록 초기화
          </button>
          {usedCount > 0 && (
            <button 
              onClick={handleUndo}
              className="w-full flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all font-black text-xs"
            >
              <i className="fas fa-undo"></i> 이전 행동 되감기
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8">
        {result ? (
          <div className="w-full max-w-3xl animate-scaleIn text-center">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm font-black rounded-full mb-6 shadow-xl shadow-indigo-200 animate-bounce">
                <i className="fas fa-check-circle"></i> 이번 토론 주제
              </span>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4 px-4">
                {result.title}
              </h3>
              <p className="text-slate-400 font-bold">저장소: {slotName}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative px-4">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-2xl shadow-2xl z-20 border-8 border-white">
                VS
              </div>
              
              <div className="bg-white p-10 rounded-[2.5rem] border-b-8 border-indigo-500 shadow-2xl shadow-indigo-500/10 transition-transform hover:-translate-y-2">
                <p className="text-xs font-black text-indigo-500 mb-4 uppercase tracking-[0.2em]">입장 A (찬성)</p>
                <p className="text-2xl font-black text-slate-800 leading-snug">{result.sideA || "내용 없음"}</p>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border-b-8 border-red-500 shadow-2xl shadow-red-500/10 transition-transform hover:-translate-y-2">
                <p className="text-xs font-black text-red-500 mb-4 uppercase tracking-[0.2em]">입장 B (반대)</p>
                <p className="text-2xl font-black text-slate-800 leading-snug">{result.sideB || "내용 없음"}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
               <button 
                onClick={handleDraw}
                disabled={isDrawing || availableTopics.length === 0}
                className="flex-1 max-w-md py-6 rounded-[2rem] bg-slate-900 text-white font-black text-2xl shadow-2xl shadow-slate-300 hover:bg-indigo-600 hover:scale-[1.05] active:scale-[0.98] transition-all disabled:opacity-30 disabled:scale-100"
              >
                다음 주제 뽑기
              </button>
              <button 
                onClick={handleUndo}
                className="px-8 py-6 rounded-[2rem] bg-slate-100 text-slate-500 font-black text-xl hover:bg-slate-200 transition-all"
              >
                잘못 뽑았어요
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center w-full max-w-md">
            <div className="w-72 h-72 bg-slate-50 rounded-[3.5rem] flex items-center justify-center mb-10 mx-auto border-4 border-dashed border-slate-200 relative overflow-hidden group">
              {isDrawing ? (
                <div className="flex flex-col items-center gap-6 px-8 text-center animate-pulse">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <p className="text-sm font-black text-indigo-600 line-clamp-2 leading-relaxed">
                    {shuffleText}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 transition-transform group-hover:scale-110 duration-500">
                  <i className="fas fa-shuffle text-7xl text-slate-200"></i>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Random Debate Picker</span>
                </div>
              )}
            </div>
            
            <h3 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">
              {isDrawing ? "고르는 중..." : "주제 추첨"}
            </h3>
            <p className="text-slate-400 mb-12 font-bold leading-relaxed px-4">
              {availableTopics.length === 0 
                ? "추첨 가능한 모든 주제를 사용했습니다." 
                : `'${slotName}' 저장소에서 주제를 무작위로 추첨합니다.`}
            </p>

            <button 
              onClick={handleDraw}
              disabled={isDrawing || availableTopics.length === 0}
              className={`group relative w-full py-7 rounded-[2rem] font-black text-2xl tracking-tight shadow-2xl transition-all duration-300 
                ${availableTopics.length === 0 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95'}`}
            >
              <span className="flex items-center justify-center gap-4">
                <i className={`fas fa-play transition-transform duration-500 ${isDrawing ? 'rotate-90' : 'group-hover:translate-x-1'}`}></i>
                {isDrawing ? "뽑는 중..." : "추첨 시작"}
              </span>
            </button>
            
            {availableTopics.length === 0 && topics.length > 0 && (
              <div className="mt-8 p-4 bg-indigo-50 rounded-2xl text-indigo-600 font-black text-sm animate-pulse border border-indigo-100">
                <i className="fas fa-info-circle mr-2"></i>
                우측 상단의 '기록 초기화' 버튼을 눌러주세요.
              </div>
            )}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scaleIn { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
};

export default DrawingRoom;
