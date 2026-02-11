import React, { useState, useRef } from 'react';
import { Character, ImageStyle, AspectRatio } from '../types';
import { User, Check, Palette, Smartphone, Monitor, Square, Columns, Wand2, Upload, X, ImageIcon } from 'lucide-react';

interface Props {
  characters: Character[];
  onConfirm: (updatedCharacters: Character[], style: ImageStyle, ratio: AspectRatio) => void;
  onBack: () => void;
}

export const CharacterEditor: React.FC<Props> = ({ characters, onConfirm, onBack }) => {
  const [editedCharacters, setEditedCharacters] = useState<Character[]>(characters);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('cinematic');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('16:9');
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleDescriptionChange = (id: string, newDesc: string) => {
    setEditedCharacters(prev => 
      prev.map(c => c.id === id ? { ...c, description: newDesc } : c)
    );
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setEditedCharacters(prev => 
        prev.map(c => c.id === id ? { ...c, image: base64 } : c)
      );
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (id: string) => {
    setEditedCharacters(prev => 
      prev.map(c => c.id === id ? { ...c, image: undefined } : c)
    );
  };

  const styles: {id: ImageStyle, label: string, desc: string}[] = [
    { id: 'cinematic', label: 'سينمائي', desc: 'واقعي، إضاءة درامية' },
    { id: 'cartoon', label: 'كرتون 2D', desc: 'أسلوب المسلسلات الحديثة' },
    { id: '3d-render', label: 'بيكسار 3D', desc: 'لطيف، حيوي، مبهج' },
    { id: 'classic-disney', label: 'ديزني كلاسيكي', desc: 'رسم يدوي، سحر قديم' },
    { id: 'anime', label: 'أنيمي', desc: 'أسلوب ياباني، ألوان زاهية' },
    { id: 'cyberpunk', label: 'سايبربانك', desc: 'نيون، مستقبلي، تقني' },
    { id: 'pixel-art', label: 'بكسل آرت', desc: 'ألعاب فيديو كلاسيكية' },
    { id: 'sketch', label: 'رسم يدوي', desc: 'رصاص، فحم، فني' },
    { id: 'watercolor', label: 'ألوان مائية', desc: 'ناعم، حالم، شفاف' },
    { id: 'claymation', label: 'صلصال', desc: 'شخصيات معجونة يدوياً' },
    { id: 'oil-painting', label: 'لوحة زيتية', desc: 'كلاسيكي، ملمس زيتي' },
  ];

  const ratios: {id: AspectRatio, label: string, icon: any}[] = [
    { id: '16:9', label: 'عرضي (يوتيوب)', icon: Monitor },
    { id: '9:16', label: 'طولي (ستوري)', icon: Smartphone },
    { id: '1:1', label: 'مربع (انستقرام)', icon: Square },
    { id: '4:3', label: 'كلاسيكي', icon: Columns },
    { id: '3:4', label: 'بورتريه', icon: User }, 
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Style & Ratio Selection */}
      <div className="bg-secondary-800/50 p-6 rounded-xl border border-secondary-700 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Palette size={20} className="text-primary-400"/>
              اختر أسلوب الرسم
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {styles.map((s) => (
                  <button
                      key={s.id}
                      onClick={() => setSelectedStyle(s.id)}
                      className={`p-3 rounded-lg border text-right transition-all
                          ${selectedStyle === s.id 
                              ? 'bg-primary-900/50 border-primary-500 ring-1 ring-primary-500' 
                              : 'bg-secondary-800 border-secondary-700 hover:bg-secondary-700'
                          }
                      `}
                  >
                      <div className="flex items-center justify-between mb-1">
                        <div className={`font-bold text-xs ${selectedStyle === s.id ? 'text-primary-400' : 'text-gray-200'}`}>
                            {s.label}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 leading-tight">{s.desc}</div>
                  </button>
              ))}
          </div>
        </div>

        <div className="h-px bg-secondary-700 w-full"></div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Monitor size={20} className="text-primary-400"/>
              اختر أبعاد الصورة
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {ratios.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                      key={r.id}
                      onClick={() => setSelectedRatio(r.id)}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all h-24
                          ${selectedRatio === r.id 
                              ? 'bg-primary-900/50 border-primary-500 ring-1 ring-primary-500' 
                              : 'bg-secondary-800 border-secondary-700 hover:bg-secondary-700'
                          }
                      `}
                  >
                      <Icon size={24} className={selectedRatio === r.id ? 'text-primary-400' : 'text-gray-400'} />
                      <div className={`text-sm font-bold ${selectedRatio === r.id ? 'text-primary-400' : 'text-gray-200'}`}>
                          {r.id}
                      </div>
                      <div className="text-xs text-gray-500">{r.label}</div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">تخصيص الشخصيات</h2>
          <p className="text-gray-400 mt-1">يمكنك رفع صورة مرجعية لكل شخصية لضمان ثبات شكلها في جميع المشاهد.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {editedCharacters.map((char) => (
            <div key={char.id} className="bg-secondary-800 p-5 rounded-2xl border border-secondary-700 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-700 flex items-center justify-center text-primary-400">
                    <User size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{char.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                {/* Image Upload Area */}
                <div className="relative group">
                  {char.image ? (
                    <div className="relative w-[120px] h-[120px] rounded-xl overflow-hidden border-2 border-primary-500 shadow-lg">
                      <img src={char.image} className="w-full h-full object-cover" alt={char.name} />
                      <button 
                        onClick={() => removeImage(char.id)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => fileInputRefs.current[char.id]?.click()}
                      className="w-[120px] h-[120px] rounded-xl border-2 border-dashed border-secondary-600 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-secondary-700 transition-all text-gray-500 hover:text-primary-400"
                    >
                      <Upload size={24} />
                      <span className="text-[10px] font-bold">رفع صورة</span>
                    </button>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={el => { fileInputRefs.current[char.id] = el; }}
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(char.id, e.target.files[0])}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-medium">الوصف البصري</label>
                  <textarea
                    value={char.description}
                    onChange={(e) => handleDescriptionChange(char.id, e.target.value)}
                    className="w-full h-[95px] bg-secondary-900 border border-secondary-600 rounded-lg p-2 text-xs text-gray-200 focus:border-primary-500 outline-none resize-none leading-relaxed"
                    placeholder="مثال: طفل ذو شعر أحمر يرتدي قميصاً أزرق..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-secondary-800">
        <button onClick={onBack} className="px-6 py-3 text-gray-400 hover:text-white font-medium">العودة وتعديل القصة</button>
        <button
          onClick={() => onConfirm(editedCharacters, selectedStyle, selectedRatio)}
          className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-all"
        >
          <Check size={20} />
          <span>بدء إنتاج القصة المصورة</span>
        </button>
      </div>
    </div>
  );
};