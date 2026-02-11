
import React, { useEffect, useState } from 'react';
import { ConceptModule, Character, ImageStyle, AspectRatio, Language } from '../types';
import { translations } from '../translations';
import { generateModuleVisual, generateModuleAudio, editModuleVisual, generateModuleVideo } from '../services/geminiService';
import { Volume2, ChevronLeft, ChevronRight, Info, Download, Edit, Film, Check, X, Send } from 'lucide-react';

interface Props {
  language: Language;
  modules: ConceptModule[];
  characters: Character[];
  style: ImageStyle;
  onUpdate: (id: string, updates: Partial<ConceptModule>) => void;
  onReset: () => void;
}

export const ModuleRenderer: React.FC<Props> = ({ language, modules, characters, style, onUpdate, onReset }) => {
  const t = translations[language];
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Interaction States
  const [editMode, setEditMode] = useState<boolean>(false);
  const [animateMode, setAnimateMode] = useState<boolean>(false);
  const [promptInput, setPromptInput] = useState<string>('');
  const [isProcessingEffect, setIsProcessingEffect] = useState<boolean>(false);

  const currentModule = modules[activeIndex];
  const isRtl = language === 'ar';

  useEffect(() => {
    if (currentModule && currentModule.status === 'pending') {
      loadModuleAssets(currentModule);
    }
    // Reset interaction states when changing modules
    setEditMode(false);
    setAnimateMode(false);
    setPromptInput('');
    setIsProcessingEffect(false);
  }, [activeIndex]);

  const loadModuleAssets = async (module: ConceptModule) => {
    onUpdate(module.id, { status: 'generating' });
    try {
      const [img, audio] = await Promise.all([
        generateModuleVisual(module, characters, style, '16:9'),
        generateModuleAudio(module.technicalExplanation, language)
      ]);
      onUpdate(module.id, { status: 'completed', imageUrl: img, audioUrl: audio });
    } catch (e) {
      onUpdate(module.id, { status: 'failed' });
    }
  };

  const handleDownload = () => {
    if (currentModule.imageUrl) {
      const link = document.createElement('a');
      link.href = currentModule.imageUrl;
      link.download = `Eydah_Module_${currentModule.order}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEditVisual = async () => {
    if (!promptInput.trim() || !currentModule.imageUrl) return;
    setIsProcessingEffect(true);
    try {
      const newImage = await editModuleVisual(currentModule.imageUrl, promptInput);
      onUpdate(currentModule.id, { imageUrl: newImage });
      setEditMode(false);
      setPromptInput('');
    } catch (e) {
      alert("Failed to edit image");
    } finally {
      setIsProcessingEffect(false);
    }
  };

  const handleAnimateVisual = async () => {
    if (!promptInput.trim() || !currentModule.imageUrl) return;
    
    // Check for Veo key requirement
    if (!(window as any).aistudio?.hasSelectedApiKey()) {
      await (window as any).aistudio?.openSelectKey();
    }

    setIsProcessingEffect(true);
    try {
      const videoUrl = await generateModuleVideo(currentModule.imageUrl, promptInput);
      onUpdate(currentModule.id, { videoUrl: videoUrl });
      setAnimateMode(false);
      setPromptInput('');
    } catch (e) {
      alert(t.videoError);
    } finally {
      setIsProcessingEffect(false);
    }
  };

  const playAudio = () => {
    if (currentModule.audioUrl) {
      const audio = new Audio(currentModule.audioUrl);
      audio.play();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className={`flex justify-between items-center ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
        <button onClick={onReset} className="text-xs text-gray-500 hover:text-white uppercase font-bold tracking-widest">{t.resetBtn}</button>
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-sm">{activeIndex + 1}</div>
          {currentModule.title}
        </h2>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 bg-secondary-900 border border-secondary-800 rounded-[2.5rem] overflow-hidden shadow-2xl ${isRtl ? '' : 'lg:grid-cols-[400px_1fr]'}`}>
        
        {/* Detail Panel */}
        <div className={`p-8 flex flex-col border-secondary-800 ${isRtl ? 'border-r' : 'border-l'} ${isRtl ? 'order-2' : 'order-1'}`}>
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary-500 uppercase">{t.detailLabel}</label>
              <p className="text-gray-200 leading-relaxed text-lg font-medium">{currentModule.technicalExplanation}</p>
            </div>

            {currentModule.audioUrl && (
              <button 
                onClick={playAudio}
                className="w-full flex items-center justify-center gap-3 py-4 bg-secondary-800 hover:bg-secondary-700 text-white rounded-2xl border border-secondary-700 transition-all active:scale-95"
              >
                <Volume2 className="text-primary-500" />
                {t.listenBtn}
              </button>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button 
              disabled={activeIndex === (isRtl ? 0 : modules.length - 1)}
              onClick={() => setActiveIndex(i => isRtl ? i - 1 : i + 1)}
              className="p-4 rounded-full bg-secondary-800 disabled:opacity-20 text-white"
            >
              {isRtl ? <ChevronRight /> : <ChevronLeft />}
            </button>
            <div className="flex gap-2">
              {modules.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-8 bg-primary-500' : 'w-2 bg-secondary-700'}`} />
              ))}
            </div>
            <button 
              disabled={activeIndex === (isRtl ? modules.length - 1 : 0)}
              onClick={() => setActiveIndex(i => isRtl ? i + 1 : i - 1)}
              className="p-4 rounded-full bg-secondary-800 disabled:opacity-20 text-white"
            >
              {isRtl ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>
        </div>

        {/* Media Panel */}
        <div className={`relative flex flex-col group ${isRtl ? 'order-1' : 'order-2'}`}>
           <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
             
            {/* Loading Overlay */}
            {(currentModule.status === 'generating' || isProcessingEffect) && (
                <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-primary-400 font-bold animate-pulse text-center px-4">
                    {isProcessingEffect ? (animateMode ? t.generatingVideo : t.generating) : t.generating}
                </p>
                </div>
            )}

            {currentModule.videoUrl ? (
                <video 
                  src={currentModule.videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-cover" 
                />
            ) : currentModule.imageUrl ? (
                <>
                <img src={currentModule.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                {!isProcessingEffect && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex items-end">
                      <p className="text-white text-sm italic opacity-80">{currentModule.visualMetaphor}</p>
                    </div>
                )}
                </>
            ) : (
                <div className="text-gray-700 flex flex-col items-center gap-2">
                <Info size={40} />
                <span>{t.failedLoad}</span>
                </div>
            )}
           </div>

           {/* Toolbar */}
           {currentModule.imageUrl && currentModule.status === 'completed' && !currentModule.videoUrl && (
             <div className="bg-secondary-800 p-4 border-t border-secondary-700 flex flex-col gap-3">
               {/* Modes Input Area */}
               {(editMode || animateMode) && (
                 <div className="flex gap-2 animate-fade-in mb-2">
                    <input 
                      type="text" 
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder={editMode ? t.editPromptPlaceholder : t.animatePromptPlaceholder}
                      className="flex-1 bg-secondary-900 border border-secondary-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 outline-none"
                    />
                    <button 
                      onClick={editMode ? handleEditVisual : handleAnimateVisual}
                      disabled={isProcessingEffect || !promptInput}
                      className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-lg disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                    <button 
                       onClick={() => { setEditMode(false); setAnimateMode(false); setPromptInput(''); }}
                       className="bg-secondary-700 hover:bg-secondary-600 text-gray-300 p-2 rounded-lg"
                    >
                        <X size={18} />
                    </button>
                 </div>
               )}

               {/* Action Buttons */}
               {!editMode && !animateMode && (
                 <div className="flex items-center justify-center gap-4">
                    <button 
                      onClick={() => { setAnimateMode(true); setPromptInput(currentModule.visualMetaphor); }}
                      className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-secondary-700/50 hover:bg-primary-600/20 px-4 py-2 rounded-full transition-all border border-transparent hover:border-primary-500/50"
                    >
                        <Film size={16} className="text-purple-400" />
                        {t.animateImage}
                    </button>
                    
                    <button 
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-secondary-700/50 hover:bg-primary-600/20 px-4 py-2 rounded-full transition-all border border-transparent hover:border-primary-500/50"
                    >
                        <Edit size={16} className="text-blue-400" />
                        {t.editImage}
                    </button>

                    <div className="w-px h-4 bg-secondary-700"></div>

                    <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-secondary-700/50 hover:bg-secondary-600 px-4 py-2 rounded-full transition-all"
                    >
                        <Download size={16} />
                        {t.downloadImage}
                    </button>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
