import React from "react";
import { DisciplineType, ExperimentId, ExperimentMeta } from "../types";
import { FlaskConical, Atom, Dna, BookOpen, Bot, Sparkles } from "lucide-react";

interface NavigationHeaderProps {
  currentDiscipline: DisciplineType;
  onSelectDiscipline: (discipline: DisciplineType) => void;
  currentExperiment: ExperimentMeta;
  allExperiments: ExperimentMeta[];
  onSelectExperiment: (id: ExperimentId) => void;
  onApplyPreset: (presetId: string) => void;
  onOpenNotebook: () => void;
  onOpenAI: () => void;
  onOpenGuide: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentDiscipline,
  onSelectDiscipline,
  currentExperiment,
  allExperiments,
  onSelectExperiment,
  onApplyPreset,
  onOpenNotebook,
  onOpenAI,
  onOpenGuide,
}) => {
  const filteredExperiments = allExperiments.filter(
    (exp) => exp.discipline === currentDiscipline
  );

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none z-20">
      {/* Brand & Discipline Tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Atom className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 font-mono">
              OmniLab <span className="text-[10px] px-1.5 py-0.2 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded">3D v2.5</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-sans -mt-0.5">Interactive Science Laboratory</p>
          </div>
        </div>

        {/* Discipline Navigation Pills */}
        <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1">
          <button
            onClick={() => onSelectDiscipline("chemistry")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              currentDiscipline === "chemistry"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Chemistry
          </button>
          <button
            onClick={() => onSelectDiscipline("physics")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              currentDiscipline === "physics"
                ? "bg-indigo-500 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            Physics
          </button>
          <button
            onClick={() => onSelectDiscipline("biology")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              currentDiscipline === "biology"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            Biology
          </button>
        </div>
      </div>

      {/* Experiment Selector & Preset Configuration */}
      <div className="flex items-center gap-3">
        {/* Experiment Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label className="hidden md:inline text-[11px] text-slate-400 uppercase tracking-wider font-mono">
            Experiment:
          </label>
          <select
            value={currentExperiment.id}
            onChange={(e) => onSelectExperiment(e.target.value as ExperimentId)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-cyan-500"
          >
            {filteredExperiments.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.title}
              </option>
            ))}
          </select>
        </div>

        {/* Presets Selector */}
        {currentExperiment.presets.length > 0 && (
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Preset:</span>
            <select
              onChange={(e) => onApplyPreset(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 max-w-[220px] truncate"
            >
              <option value="">Choose standard scenario...</option>
              {currentExperiment.presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Utilities & AI Assistant Buttons */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
          <button
            onClick={onOpenGuide}
            title="Scientific Principles & Objectives"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors border border-slate-800"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNotebook}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/70 rounded-lg text-xs font-mono transition-colors"
          >
            Notebook & Trials
          </button>

          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-cyan-500/10"
          >
            <Bot className="w-4 h-4" />
            AI Scientist
          </button>
        </div>
      </div>
    </header>
  );
};
