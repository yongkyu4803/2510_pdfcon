'use client';

import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ConversionProgressProps {
  progress: number;
  status: string;
  currentStep?: string;
}

export function ConversionProgress({ progress, status, currentStep }: ConversionProgressProps) {
  const steps = [
    { label: '파일 검증', progress: 5 },
    { label: 'PDF 구조 분석', progress: 40 },
    { label: '데이터 정제', progress: 45 },
    { label: 'HTML 변환', progress: 90 },
    { label: '저장 및 완료', progress: 100 },
  ];

  const currentStepIndex = steps.findIndex((step) => progress <= step.progress);
  const activeStep = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{status}</span>
            <span className="text-gray-500">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = progress >= step.progress;
            const isActive = index === activeStep;

            return (
              <div key={step.label} className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    isCompleted
                      ? 'text-green-600 font-medium'
                      : isActive
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {currentStep && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">{currentStep}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
