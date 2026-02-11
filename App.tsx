
import React, { useState } from 'react';
import { AppStep, ConceptAnalysis, Subject, AcademicLevel, ConceptModule, Language } from './types';
import { analyzeConcept } from './services/geminiService';
import { ConceptInput } from './components/ConceptInput';
import { ModuleRenderer } from './components/ModuleRenderer';
import { translations } from './translations';
import { Globe } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [step, setStep] = useState<AppStep>(AppStep.INPUT_CONCEPT);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ConceptAnalysis | null>(null);

  const t = translations[lang];

  const handleAnalyze = async (text: string, subject: Subject, level: AcademicLevel, count: number) => {
    setLoading(true);
    try {
      const result = await analyzeConcept(text, subject, level, count, lang);
      setData(result);
      setStep(AppStep.RENDER_VISUALS);
    } catch (e) {
      alert(t.errorAnalysis);
    } finally {
      setLoading(false);
    }
  };

  const updateModule = (id: string, updates: Partial<ConceptModule>) => {
    if (!data) return;
    setData({
      ...data,
      modules: data.modules.map(m => m.id === id ? { ...m, ...updates } : m)
    });
  };

  const isRtl = lang === 'ar';

  return (
    <div 
      className={`min-h-screen bg-[#0b0f1a] text-white font-sans overflow-x-hidden selection:bg-primary-500 selection:text-white transition-all`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-600/20 rounded-full blur-[150px]"></div>
      </div>

      <header className="relative z-10 py-6 px-8 border-b border-secondary-800/50 bg-secondary-900/30 backdrop-blur-xl flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-teal-400 flex items-center justify-center shadow-lg shadow-primary-900/20">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">{t.appTitle}</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.appSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-secondary-800/50 p-1.5 rounded-full border border-secondary-700">
           <Globe size={16} className="text-primary-400 ml-2" />
           <div className="flex gap-1">
             {(['ar', 'en', 'fr'] as Language[]).map((l) => (
               <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === l ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
               >
                 {l.toUpperCase()}
               </button>
             ))}
           </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12">
        {step === AppStep.INPUT_CONCEPT && (
          <ConceptInput language={lang} onAnalyze={handleAnalyze} isLoading={loading} />
        )}

        {step === AppStep.RENDER_VISUALS && data && (
          <ModuleRenderer 
            language={lang}
            modules={data.modules} 
            characters={data.characters} 
            style="scientific-diagram"
            onUpdate={updateModule}
            onReset={() => setStep(AppStep.INPUT_CONCEPT)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
