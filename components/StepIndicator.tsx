import React from 'react';
import { AppStep } from '../types';
import { BookOpen, Users, Image as ImageIcon } from 'lucide-react';

interface Props {
  currentStep: AppStep;
}

export const StepIndicator: React.FC<Props> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.INPUT_STORY, label: 'كتابة القصة', icon: BookOpen },
    { id: AppStep.REVIEW_CHARACTERS, label: 'تجهيز الشخصيات', icon: Users },
    { id: AppStep.GENERATE_SCENES, label: 'إنتاج المشاهد', icon: ImageIcon },
  ];

  const getStepStatus = (stepId: AppStep) => {
    const ids = steps.map(s => s.id);
    const currentIndex = ids.indexOf(currentStep);
    const stepIndex = ids.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary-800 -z-10 transform -translate-y-1/2"></div>
        
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          
          let circleClass = "bg-secondary-800 border-secondary-700 text-gray-500";
          if (status === 'completed') circleClass = "bg-green-600 border-green-600 text-white";
          if (status === 'current') circleClass = "bg-primary-600 border-primary-500 text-white ring-4 ring-primary-900";

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-secondary-900 px-2 z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${circleClass}`}>
                <Icon size={20} />
              </div>
              <span className={`text-sm font-medium ${status === 'current' ? 'text-primary-500' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};