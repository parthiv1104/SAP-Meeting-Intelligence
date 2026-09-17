import { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, AudioWaveform, FileSearch, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AiProcessingLoader({
  title = 'AI Processing Engine Active',
  initialMessage = 'Uploading media & preparing audio stream...',
  steps = [
    { label: 'Secure Media Ingestion & Upload', icon: AudioWaveform, duration: 2000 },
    { label: 'Audio Normalization & Whisper AI Transcription', icon: BrainCircuit, duration: 4000 },
    { label: 'OpenAI Domain & Architectural Gap Analysis', icon: FileSearch, duration: 6000 },
    { label: 'Synthesizing Decisions, Gaps & Requirements', icon: Sparkles, duration: 8000 },
  ],
  className = '',
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Step progression
    const intervals = [
      setTimeout(() => { setCurrentStep(1); setProgress(45); }, 2200),
      setTimeout(() => { setCurrentStep(2); setProgress(75); }, 6500),
      setTimeout(() => { setCurrentStep(3); setProgress(92); }, 11000),
    ];

    // Smooth subtle progress pulse
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + 1;
      });
    }, 400);

    return () => {
      intervals.forEach(clearTimeout);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-brand-200/80 bg-gradient-to-b from-brand-50/60 via-white to-brand-50/30 p-5 shadow-lg shadow-brand-500/5 ${className}`}>
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-brand-400/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Stylish Glowing Multi-Ring Orbital Loader */}
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
          {/* Outer glowing pulsing aura */}
          <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping opacity-60" />
          
          {/* Outer gradient rotating track */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-600 border-r-indigo-400 animate-spin" style={{ animationDuration: '1.4s' }} />
          
          {/* Inner counter-rotating ring */}
          <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-purple-600 border-l-brand-400 animate-spin" style={{ animationDuration: '2.2s', animationDirection: 'reverse' }} />
          
          {/* Center core pulse */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-brand-700 to-indigo-500 text-white shadow-md shadow-brand-600/30">
            <Sparkles size={18} className="animate-pulse" />
          </div>
        </div>

        {/* Title and Active Status */}
        <h4 className="text-sm font-bold text-ink-900 flex items-center gap-1.5">
          <span>{title}</span>
        </h4>
        <p className="mt-0.5 text-xs font-semibold text-brand-700 animate-pulse">
          {steps[currentStep]?.label || initialMessage}
        </p>

        {/* Progress bar */}
        <div className="w-full mt-3.5">
          <div className="flex justify-between items-center text-[10px] text-ink-400 mb-1 font-medium">
            <span>Enterprise AI Pipeline</span>
            <span className="font-mono text-brand-700 font-semibold">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100 relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step-by-step pipeline preview */}
        <div className="mt-4 w-full grid grid-cols-1 gap-1.5 text-left border-t border-ink-100/80 pt-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  isCurrent
                    ? 'bg-brand-100/70 text-brand-900 font-semibold'
                    : isDone
                    ? 'text-emerald-700'
                    : 'text-ink-400 opacity-60'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Icon size={13} className="text-brand-600 animate-spin shrink-0" style={{ animationDuration: '3s' }} />
                ) : (
                  <Icon size={13} className="shrink-0 opacity-50" />
                )}
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
