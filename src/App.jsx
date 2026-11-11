import React, { useState, useEffect } from 'react';
import initialData from './data.json';

export default function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('wysheng_vocab_data');
    return saved ? JSON.parse(saved) : initialData;
  });

  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem('wysheng_completed_sentences');
    return saved ? JSON.parse(saved) : {};
  });

  const [unit, setUnit] = useState(53);
  const [lesson, setLesson] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [hideKorean, setHideKorean] = useState(false);

  const key = `U${unit}-L${lesson}-E${episode}`;
  const currentSentences = data[key] || [];

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [unit, lesson, episode]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const toggleComplete = (idx) => {
    const itemKey = `${key}-${idx}`;
    const updated = { ...completed, [itemKey]: !completed[itemKey] };
    setCompleted(updated);
    localStorage.setItem('wysheng_completed_sentences', JSON.stringify(updated));
  };

  const currentItem = currentSentences[currentIndex];
  const isCurrentDone = completed[`${key}-${currentIndex}`];

  // 계산: 전체 유닛/레슨 대비 완료율
  const totalInEp = currentSentences.length;
  const doneInEp = currentSentences.filter((_, i) => completed[`${key}-${i}`]).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
              English Master: Sentence Tutor
            </h1>
            <p className="text-xs text-slate-400">Unit 53-72 핵심 문장 & 표현 통암기</p>
          </div>
          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                viewMode === 'card' ? 'bg-teal-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              카드 모드
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                viewMode === 'list' ? 'bg-teal-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              목록 모드
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-6">
        {/* Navigation Selector */}
        <section className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-lg backdrop-blur">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">UNIT</label>
              <select
                value={unit}
                onChange={(e) => setUnit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {Array.from({ length: 20 }, (_, i) => 53 + i).map((u) => (
                  <option key={u} value={u}>Unit {u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">LESSON</label>
              <select
                value={lesson}
                onChange={(e) => setLesson(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {[1, 2, 3].map((l) => (
                  <option key={l} value={l}>Lesson {l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">EPISODE</label>
              <select
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {[1, 2, 3].map((ep) => (
                  <option key={ep} value={ep}>Episode {ep}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
            <span>진도: <strong className="text-teal-400">{doneInEp}</strong> / {totalInEp} 문장 완료</span>
            <div className="w-32 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-teal-400 h-full transition-all duration-300"
                style={{ width: `${totalInEp ? (doneInEp / totalInEp) * 100 : 0}%` }}
              />
            </div>
          </div>
        </section>

        {/* Content Area */}
        {currentSentences.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
            <p className="text-slate-400 text-base">해당 에피소드에 등록된 문장이 없습니다.</p>
          </div>
        ) : viewMode === 'card' ? (
          /* CARD MODE */
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full max-w-xl min-h-[300px] bg-slate-800/90 border border-slate-700 hover:border-teal-500/50 rounded-3xl p-8 cursor-pointer shadow-2xl flex flex-col justify-between transition-all duration-300 select-none group"
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                <span className="bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
                  {currentIndex + 1} / {totalInEp}
                </span>
                <span className="text-slate-500 group-hover:text-teal-400 transition">
                  {isFlipped ? '앞면(영어) 보기 ↻' : '뒷면(해석) 보기 ↻'}
                </span>
              </div>

              <div className="my-auto py-6 text-center">
                {!isFlipped ? (
                  <div>
                    <p className="text-2xl md:text-3xl font-semibold leading-relaxed text-slate-50 tracking-wide">
                      {currentItem.en}
                    </p>
                    {currentItem.target && (
                      <span className="inline-block mt-4 px-3 py-1 bg-teal-500/10 text-teal-300 text-xs font-semibold rounded-full border border-teal-500/30">
                        핵심 표현: {currentItem.target}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-teal-300">
                      {currentItem.ko}
                    </p>
                    {currentItem.note && (
                      <p className="mt-3 text-sm text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        💡 {currentItem.note}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentItem.en);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-teal-400 rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  🔊 발음 듣기
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(currentIndex);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    isCurrentDone
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {isCurrentDone ? '✓ 암기 완료됨' : '○ 미완료'}
                </button>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 w-full max-w-xl">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-xl font-semibold text-sm transition border border-slate-700"
              >
                ◀ 이전 문장
              </button>
              <button
                disabled={currentIndex === totalInEp - 1}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex((prev) => Math.min(totalInEp - 1, prev + 1));
                }}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 disabled:opacity-30 disabled:pointer-events-none rounded-xl font-bold text-sm transition shadow-lg shadow-teal-500/10"
              >
                다음 문장 ▶
              </button>
            </div>
          </div>
        ) : (
          /* LIST MODE */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">총 {totalInEp}개 핵심 문장</span>
              <button
                onClick={() => setHideKorean(!hideKorean)}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 transition"
              >
                {hideKorean ? '👁️ 해석 보이기' : '🙈 해석 가리기 (자가테스트)'}
              </button>
            </div>
            <div className="grid gap-3">
              {currentSentences.map((item, idx) => {
                const done = completed[`${key}-${idx}`];
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition flex items-start gap-3 ${
                      done
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                        : 'bg-slate-800/70 border-slate-700 text-slate-100'
                    }`}
                  >
                    <button
                      onClick={() => toggleComplete(idx)}
                      className={`mt-1 w-5 h-5 rounded flex items-center justify-center text-xs font-bold border transition ${
                        done
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-600 hover:border-teal-400'
                      }`}
                    >
                      {done ? '✓' : ''}
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-base font-semibold ${done ? 'line-through text-slate-500' : ''}`}>
                          {item.en}
                        </p>
                        <button
                          onClick={() => speak(item.en)}
                          className="text-slate-400 hover:text-teal-300 p-1 transition"
                          title="발음 듣기"
                        >
                          🔊
                        </button>
                      </div>
                      {!hideKorean && (
                        <p className="text-sm text-teal-300/90 font-medium">{item.ko}</p>
                      )}
                      {item.note && !hideKorean && (
                        <p className="text-xs text-slate-400">{item.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
