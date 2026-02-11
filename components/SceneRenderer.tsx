import React, { useEffect, useRef, useState } from 'react';
import { Scene, Character, ImageStyle, AspectRatio } from '../types';
import { generateSceneImage, generateSceneVideo } from '../services/geminiService';
import { RefreshCw, Download, Check, Film, MessageCircle, Wand2, Copy, Terminal, PlusCircle, Save } from 'lucide-react';

interface Props {
  scenes: Scene[];
  characters: Character[];
  style: ImageStyle;
  aspectRatio: AspectRatio;
  onUpdateScene: (id: string, updates: Partial<Scene>) => void;
  onRestart: () => void;
  onContinue: () => void;
}

export const SceneRenderer: React.FC<Props> = ({ 
  scenes, 
  characters, 
  style,
  aspectRatio,
  onUpdateScene,
  onRestart,
  onContinue
}) => {
  const processingRef = useRef<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const pendingScenes = scenes.filter(s => s.imageStatus === 'pending');
    if (pendingScenes.length > 0) {
      const nextScene = pendingScenes[0];
      if (processingRef.current.has(nextScene.id)) return;
      processScene(nextScene);
    }
  }, [scenes]);

  const processScene = async (scene: Scene) => {
    processingRef.current.add(scene.id);
    onUpdateScene(scene.id, { imageStatus: 'generating' });
    try {
      const { imageUrl, prompt } = await generateSceneImage(scene, characters, style, aspectRatio);
      onUpdateScene(scene.id, { 
        imageStatus: 'completed', 
        imageUrl: imageUrl,
        promptUsed: prompt
      });
    } catch (error) {
      onUpdateScene(scene.id, { imageStatus: 'failed' });
    } finally {
      processingRef.current.delete(scene.id);
    }
  };

  const handleAnimate = async (scene: Scene) => {
    if (!scene.imageUrl) return;
    
    if (!(window as any).aistudio?.hasSelectedApiKey()) {
      await (window as any).aistudio?.openSelectKey();
    }

    onUpdateScene(scene.id, { videoStatus: 'generating' });
    try {
      const videoUrl = await generateSceneVideo(scene, scene.imageUrl, scene.promptUsed);
      onUpdateScene(scene.id, { videoStatus: 'completed', videoUrl });
    } catch (error) {
      console.error(error);
      onUpdateScene(scene.id, { videoStatus: 'failed' });
      alert("فشل إنشاء الفيديو. تأكد من تفعيل مفتاح API المدفوع لنموذج Veo.");
    }
  };

  const downloadImage = (url: string, sceneNum: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `Story_Scene_${sceneNum}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getAspectRatioClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case '1:1': return 'aspect-square';
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': return 'aspect-[3/4]';
      default: return 'aspect-video';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-8 bg-secondary-900/50 p-4 rounded-xl border border-secondary-800 backdrop-blur-md sticky top-24 z-40">
        <div>
          <h2 className="text-2xl font-bold text-white">معرض القصة المصورة</h2>
          <p className="text-sm text-gray-400">الإجمالي: {scenes.length} مشهداً</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRestart} className="text-xs font-bold text-gray-400 hover:text-white transition-all">
             بدء من جديد
          </button>
          <div className="h-4 w-px bg-secondary-700 mx-2"></div>
          <button onClick={onContinue} className="text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 border border-primary-500 px-6 py-2 rounded-full transition-all flex items-center gap-2 shadow-lg shadow-primary-900/20">
            <PlusCircle size={16} /> أكمل القصة (جزء جديد)
          </button>
        </div>
      </div>

      <div className="space-y-16">
        {scenes.map((scene) => (
          <div key={scene.id} className="group bg-secondary-800/40 rounded-[2rem] overflow-hidden border border-secondary-700/50 shadow-2xl transition-all duration-500 hover:shadow-primary-500/10">
            <div className={`grid gap-0 ${aspectRatio === '9:16' || aspectRatio === '3:4' ? 'md:grid-cols-[450px_1fr]' : 'md:grid-cols-2'}`}>
              
              <div className="flex flex-col bg-secondary-900/50 border-l border-secondary-700/30">
                <div className={`relative ${getAspectRatioClass(aspectRatio)} bg-secondary-900 flex items-center justify-center group/img w-full overflow-hidden`}>
                  
                  {scene.videoStatus === 'completed' && scene.videoUrl ? (
                    <video src={scene.videoUrl} controls autoPlay loop className="w-full h-full object-cover shadow-inner" />
                  ) : scene.imageStatus === 'completed' && scene.imageUrl ? (
                    <img src={scene.imageUrl} alt={`Scene ${scene.number}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" />
                  ) : scene.imageStatus === 'generating' ? (
                     <div className="text-primary-400 flex flex-col items-center gap-4 p-8 text-center">
                      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg font-bold text-white">جاري الرسم...</span>
                    </div>
                  ) : (
                    <div className="text-gray-500">في الانتظار...</div>
                  )}

                  {scene.videoStatus === 'generating' && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-20">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-purple-500/20"></div>
                      <h4 className="text-white font-bold text-lg mb-2">جاري التحريك...</h4>
                    </div>
                  )}

                  {/* Quick Action Overlay on Hover */}
                  {scene.imageStatus === 'completed' && scene.videoStatus !== 'generating' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-center pb-8 gap-3 z-10">
                      <button 
                        onClick={() => handleAnimate(scene)}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm transition-all transform hover:scale-110"
                      >
                        <Film size={18} /> تحريك (Veo AI)
                      </button>
                      <button 
                        onClick={() => downloadImage(scene.imageUrl!, scene.number)}
                        className="px-6 py-2.5 bg-white text-secondary-900 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm transition-all transform hover:scale-110"
                      >
                        <Download size={18} /> تحميل الصورة
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Download Button Below Image - Highlighted */}
                {scene.imageStatus === 'completed' && (
                  <div className="p-4 flex justify-center bg-secondary-900/60 border-b border-secondary-800">
                    <button 
                      onClick={() => downloadImage(scene.imageUrl!, scene.number)}
                      className="w-full flex items-center justify-center gap-3 text-sm font-black text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 transition-all py-3 px-6 rounded-xl shadow-lg"
                    >
                      <Download size={20} /> حفظ المشهد {scene.number} على جهازك
                    </button>
                  </div>
                )}

                {scene.promptUsed && (
                  <div className="p-4 bg-secondary-900/80 border-t border-secondary-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Terminal size={12} className="text-primary-500" />
                        البرومت (AI Prompt)
                      </label>
                      <button 
                        onClick={() => copyToClipboard(scene.promptUsed!, scene.id)}
                        className="p-1 hover:bg-secondary-800 rounded transition-colors text-gray-500"
                      >
                        {copiedId === scene.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <textarea 
                      value={scene.promptUsed}
                      onChange={(e) => onUpdateScene(scene.id, { promptUsed: e.target.value })}
                      className="w-full bg-secondary-950/50 text-[11px] text-primary-400 font-mono p-2.5 rounded-lg border border-secondary-800 focus:border-primary-500/50 outline-none resize-none h-20 leading-relaxed scrollbar-hide"
                    />
                  </div>
                )}
              </div>

              <div className="p-10 flex flex-col bg-secondary-800/20 backdrop-blur-sm relative">
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <span className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-black text-xl shadow-xl">
                      {scene.number}
                    </span>
                    <h3 className="text-3xl font-black text-white leading-tight">المشهد {scene.number}</h3>
                  </div>
                </div>
                
                <div className="relative mb-10 pl-6 border-r-2 border-primary-500/30">
                  <p className="text-xl text-gray-100 leading-[1.8] font-medium">
                    {scene.description}
                  </p>
                </div>

                {scene.dialogue && (
                  <div className="mb-10 group/dialogue">
                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-secondary-800/80 to-secondary-900/80 border border-primary-500/20 shadow-xl overflow-hidden">
                      <p className="text-2xl text-white font-bold italic leading-relaxed relative z-10">
                        "{scene.dialogue}"
                      </p>
                    </div>
                  </div>
                )}

                {scene.charactersInvolved.length > 0 && (
                  <div className="mt-auto">
                    <h4 className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">الشخصيات الحاضرة</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {scene.charactersInvolved.map(charId => {
                        const char = characters.find(c => c.id === charId);
                        return char ? (
                          <div key={charId} className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-secondary-900/60 border border-secondary-700/50 text-gray-200 text-xs font-bold transition-colors">
                            <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                            {char.name}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Big Continue Button at the bottom */}
        <div className="pt-10 flex justify-center">
          <button 
            onClick={onContinue}
            className="group relative flex flex-col items-center gap-4 p-8 rounded-[3rem] bg-secondary-800/50 border-2 border-dashed border-secondary-700 hover:border-primary-500 hover:bg-secondary-800 transition-all duration-500"
          >
            <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
              <PlusCircle size={32} />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-white mb-1">إضافة الجزء التالي</h3>
              <p className="text-gray-500 text-sm">سيتم الحفاظ على الشخصيات والأسلوب تلقائياً</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};