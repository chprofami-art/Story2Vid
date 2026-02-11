
import React, { useState } from 'react';
import { Subject, AcademicLevel, Language } from '../types';
import { translations } from '../translations';
import { GraduationCap, Book, Atom, History, HeartPulse, Brain, Zap } from 'lucide-react';

interface Props {
  language: Language;
  onAnalyze: (text: string, subject: Subject, level: AcademicLevel, count: number) => void;
  isLoading: boolean;
}

export const ConceptInput: React.FC<Props> = ({ language, onAnalyze, isLoading }) => {
  const t = translations[language];
  const [text, setText] = useState('');
  const [subject, setSubject] = useState<Subject>('science');
  const [level, setLevel] = useState<AcademicLevel>('secondary');
  const [count, setCount] = useState(4);

  const subjects: { id: Subject; label: string; icon: any }[] = [
    { id: 'science', label: t.science, icon: Atom },
    { id: 'history', label: t.history, icon: History },
    { id: 'medicine', label: t.medicine, icon: HeartPulse },
    { id: 'engineering', label: t.engineering, icon: Zap },
    { id: 'philosophy', label: t.philosophy, icon: Brain },
    { id: 'general', label: t.general, icon: Book },
  ];

  const levels: { id: AcademicLevel; label: string }[] = [
    { id: 'primary', label: t.levelPrimary },
    { id: 'secondary', label: t.levelSecondary },
    { id: 'university', label: t.levelUniversity },
    { id: 'expert', label: t.levelExpert },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">{t.inputHeader}</h2>
        <p className="text-gray-400 text-lg">{t.inputSubheader}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-secondary-800/50 p-6 rounded-2xl border border-secondary-700 shadow-inner">
             <label className="block text-sm font-bold text-primary-400 mb-4 uppercase">{t.step1}</label>
             <div className="grid grid-cols-2 gap-3">
               {subjects.map(s => {
                 const Icon = s.icon;
                 return (
                   <button
                    key={s.id}
                    onClick={() => setSubject(s.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${subject === s.id ? 'bg-primary-600 border-primary-500 text-white shadow-lg' : 'bg-secondary-900 border-secondary-700 text-gray-400 hover:bg-secondary-800'}`}
                   >
                     <Icon size={18} />
                     <span className="text-xs font-bold">{s.label}</span>
                   </button>
                 );
               })}
             </div>
          </div>

          <div className="bg-secondary-800/50 p-6 rounded-2xl border border-secondary-700">
             <label className="block text-sm font-bold text-primary-400 mb-4 uppercase">{t.step2}</label>
             <div className="flex flex-wrap gap-2">
               {levels.map(l => (
                 <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${level === l.id ? 'bg-white text-secondary-900 border-white' : 'border-secondary-600 text-gray-500 hover:border-gray-400'}`}
                 >
                   {l.label}
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="bg-secondary-800 p-6 rounded-2xl border border-secondary-700 flex flex-col gap-4 shadow-xl">
          <label className="block text-sm font-bold text-primary-400 uppercase">{t.step3}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.textareaPlaceholder}
            className="flex-1 bg-secondary-950 border border-secondary-700 rounded-xl p-4 text-white text-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{t.moduleCount}</span>
            <input 
              type="number" min="2" max="10" 
              value={count} 
              onChange={e => setCount(parseInt(e.target.value))}
              className="bg-secondary-900 border border-secondary-700 rounded-lg px-3 py-1 text-primary-400 font-bold w-16"
            />
          </div>
          <button
            onClick={() => onAnalyze(text, subject, level, count)}
            disabled={isLoading || text.length < 5}
            className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-lg shadow-primary-900/40 flex items-center justify-center gap-3 transition-all transform active:scale-95"
          >
            {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <GraduationCap size={24} />}
            {isLoading ? t.analyzing : t.analyzeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
