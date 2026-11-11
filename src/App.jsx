import React, { useState, useEffect } from 'react';
import vocabData from './data.json';
import { ChevronLeft, ChevronRight, RotateCcw, List, Layers, CheckCircle2 } from 'lucide-react';

export default function App() {
  const units = Object.keys(vocabData).sort((a, b) => parseInt(a) - parseInt(b));
  
  const [unit, setUnit] = useState(units[0] || "");
  const lessons = unit && vocabData[unit] ? Object.keys(vocabData[unit]).sort() : [];
  
  const [lesson, setLesson] = useState(lessons[0] || "");
  const episodes = unit && lesson && vocabData[unit][lesson] ? Object.keys(vocabData[unit][lesson]).sort() : [];
  
  const [episode, setEpisode] = useState(episodes[0] || "");

  const [viewMode, setViewMode] = useState('flashcard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [memorized, setMemorized] = useState(new Set());

  const words = (unit && lesson && episode && vocabData[unit]?.[lesson]?.[episode]) ? vocabData[unit][lesson][episode] : [];

  // Reset when selection changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMemorized(new Set());
  }, [unit, lesson, episode]);
  
  // Auto-select first available option when parent changes
  useEffect(() => {
    if (unit && vocabData[unit]) {
       const availableLessons = Object.keys(vocabData[unit]).sort();
       if (!availableLessons.includes(lesson)) setLesson(availableLessons[0]);
    }
  }, [unit]);

  useEffect(() => {
    if (unit && lesson && vocabData[unit]?.[lesson]) {
       const availableEpisodes = Object.keys(vocabData[unit][lesson]).sort();
       if (!availableEpisodes.includes(episode)) setEpisode(availableEpisodes[0]);
    }
  }, [unit, lesson]);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => Math.min(prev + 1, words.length - 1)), 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => Math.max(prev - 1, 0)), 150);
  };
  
  const toggleMemorized = (index) => {
    setMemorized(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-indigo-600">Vocab Master</h1>
          
          <div className="flex gap-2">
            <select 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {units.map(u => <option key={u} value={u}>Unit {u}</option>)}
            </select>
            
            <select 
              value={lesson} 
              onChange={(e) => setLesson(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {lessons.map(l => <option key={l} value={l}>Lesson {l}</option>)}
            </select>

            <select 
              value={episode} 
              onChange={(e) => setEpisode(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {episodes.map(e => <option key={e} value={e}>Episode {e}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 flex flex-col">
        <div className="flex justify-end gap-2 mb-6">
          <button 
            onClick={() => setViewMode('flashcard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'flashcard' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
          >
            <Layers size={18} /> Cards
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
          >
            <List size={18} /> List
          </button>
        </div>

        {words.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            No words found for this selection.
          </div>
        ) : (
          <>
            {viewMode === 'flashcard' && (
              <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
                
                <div className="mb-4 text-sm font-medium text-gray-500">
                  {currentIndex + 1} / {words.length}
                </div>

                <div 
                  className="w-full aspect-[4/3] perspective-1000 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-8 text-center hover:shadow-2xl transition-shadow">
                      <h2 className="text-4xl font-bold text-gray-800 mb-4">{words[currentIndex]?.word}</h2>
                      <p className="text-sm text-gray-400 mt-8 flex items-center gap-2"><RotateCcw size={14}/> Click to flip</p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden bg-indigo-50 rounded-2xl shadow-xl border border-indigo-100 flex flex-col items-center justify-center p-8 text-center rotate-y-180">
                      <h2 className="text-3xl font-semibold text-indigo-700">{words[currentIndex]?.meaning}</h2>
                    </div>

                  </div>
                </div>

                <div className="flex items-center gap-6 mt-10">
                  <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0}
                    className="p-3 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={24} className="text-gray-700"/>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMemorized(currentIndex);
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow transition-colors ${memorized.has(currentIndex) ? 'bg-green-100 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <CheckCircle2 size={20} className={memorized.has(currentIndex) ? 'text-green-600' : 'text-gray-400'} />
                    {memorized.has(currentIndex) ? 'Memorized' : 'Mark as known'}
                  </button>

                  <button 
                    onClick={handleNext} 
                    disabled={currentIndex === words.length - 1}
                    className="p-3 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={24} className="text-gray-700"/>
                  </button>
                </div>
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 divide-y">
                  {words.map((w, i) => (
                    <div key={i} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50 transition-colors ${memorized.has(i) ? 'bg-green-50/30' : ''}`}>
                      <div className="flex-1 text-lg font-semibold text-gray-800">{w.word}</div>
                      <div className="flex-1 text-gray-600">{w.meaning}</div>
                      <button 
                        onClick={() => toggleMemorized(i)}
                        className={`p-2 rounded-full transition-colors ${memorized.has(i) ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                      >
                        <CheckCircle2 size={22} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
