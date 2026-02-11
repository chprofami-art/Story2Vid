import React, { useState } from 'react';
import { Sparkles, AlertCircle, Layers } from 'lucide-react';

interface Props {
  onAnalyze: (text: string, sceneCount: number) => void;
  isAnalyzing: boolean;
}

export const StoryInput: React.FC<Props> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');
  const [sceneCount, setSceneCount] = useState(5);

  const handleAnalyze = () => {
    if (text.trim().length < 20 || sceneCount < 1) return;
    onAnalyze(text, sceneCount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">احكِ قصتك</h2>
        <p className="text-gray-400">اكتب قصتك بالأسفل وسيقوم الذكاء الاصطناعي بتحليل الشخصيات والمشاهد.</p>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="كان يا ما كان في قديم الزمان..."
          className="w-full h-64 bg-secondary-800 border-2 border-secondary-700 rounded-xl p-6 text-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-900 focus:outline-none transition-all resize-none leading-relaxed"
          disabled={isAnalyzing}
        />
        {text.length > 0 && text.length < 20 && (
          <div className="absolute bottom-4 right-4 text-amber-500 flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            <span>القصة قصيرة جداً، اكتب المزيد.</span>
          </div>
        )}
      </div>

      {/* Scene Count Selector - Updated to be limitless number input */}
      <div className="bg-secondary-800/50 p-8 rounded-2xl border border-secondary-700 max-w-sm mx-auto shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <label className="text-white font-bold flex items-center gap-2 text-lg">
            <Layers size={20} className="text-primary-400" />
            عدد المشاهد المطلوبة
          </label>
          
          <div className="relative w-full">
            <input 
              type="number" 
              min="1" 
              value={sceneCount}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSceneCount(isNaN(val) ? 0 : val);
              }}
              className="w-full bg-secondary-900 border-2 border-secondary-600 rounded-xl p-4 text-center text-4xl font-black text-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-900 outline-none transition-all shadow-inner"
              disabled={isAnalyzing}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold pointer-events-none">
              #
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">أدخل أي عدد تريده من المشاهد لتفصيل القصة.</p>
            {sceneCount > 20 && (
              <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <p className="text-[11px] text-amber-400 leading-relaxed font-medium">
                  ⚠️ تنبيه: اختيار عدد كبير من المشاهد قد يؤدي إلى تقسيم القصة لتفاصيل دقيقة جداً وزيادة وقت المعالجة.
                </p>
              </div>
            )}
            {sceneCount < 1 && (
              <p className="text-xs text-red-400 font-bold">يرجى إدخال عدد مشاهد صحيح (1 على الأقل).</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || text.length < 20 || sceneCount < 1}
          className={`
            flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold transition-all duration-300
            ${isAnalyzing || text.length < 20 || sceneCount < 1
              ? 'bg-secondary-700 text-gray-500 cursor-not-allowed' 
              : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg hover:shadow-primary-500/25 hover:scale-105'}
          `}
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>جاري التحليل...</span>
            </>
          ) : (
            <>
              <Sparkles size={24} />
              <span>تحليل القصة وإنتاج المشاهد</span>
            </>
          )}
        </button>
      </div>

      {/* Example Prompt */}
      {!text && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">أو جرب هذا المثال:</p>
          <button 
            onClick={() => {
              setText("في عام 3050، كان يعيش روبوت صغير يدعى 'زيكو' في مدينة مهجورة تملؤها النباتات العملاقة. زيكو كان يملك عيناً واحدة زرقاء مضيئة وجسداً صدئاً. في أحد الأيام، وجد زيكو زهرة متوهجة نادرة وسط الحطام. قرر حمايتها من الطيور الآلية المفترسة التي تحوم في السماء.");
              setSceneCount(5);
            }}
            className="text-xs text-primary-400 hover:text-primary-300 underline"
          >
            قصة الروبوت زيكو
          </button>
        </div>
      )}
    </div>
  );
};