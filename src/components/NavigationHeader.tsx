import React from "react";
import { DisciplineType, ExperimentId, ExperimentMeta } from "../types";
import { FlaskConical, Atom, Dna, BookOpen, Bot, Sun, Moon } from "lucide-react";
import { useLabTheme } from "../context/ThemeContext";

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
  const { theme, toggleTheme, isLight } = useLabTheme();

  const filteredExperiments = allExperiments.filter(
    (exp) => exp.discipline === currentDiscipline
  );

  return (
    <header
      className={`h-14 border-b px-4 flex items-center justify-between shrink-0 select-none z-20 transition-colors duration-200 ${
        isLight
          ? "bg-white/95 border-slate-200/90 text-slate-800 shadow-xs"
          : "bg-slate-950/95 border-slate-800 text-slate-100"
      }`}
    >
      {/* Brand & Discipline Tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs transition-colors ${
              isLight
                ? "bg-blue-600 text-white"
                : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
            }`}
          >
            <Atom className="w-5 h-5" />
          </div>
          <div>
            <h1
              className={`font-bold text-sm tracking-tight flex items-center gap-1.5 font-mono ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              OmniLab
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold tracking-wide ${
                  isLight
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                    : "bg-slate-900 text-cyan-300 border border-slate-700"
                }`}
              >
                STUDIO v2.5
              </span>
            </h1>
            <p
              className={`text-[11px] font-sans -mt-0.5 ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Interactive Scientific Laboratory
            </p>
          </div>
        </div>

        {/* Discipline Navigation Pills */}
        <div
          className={`hidden sm:flex items-center p-1 rounded-xl gap-1 transition-colors ${
            isLight
              ? "bg-slate-100/90 border border-slate-200/80"
              : "bg-slate-900 border border-slate-800"
          }`}
        >
          <button
            onClick={() => onSelectDiscipline("chemistry")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              currentDiscipline === "chemistry"
                ? isLight
                  ? "bg-white text-blue-700 font-semibold shadow-xs border border-slate-200/80"
                  : "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
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
                ? isLight
                  ? "bg-white text-indigo-700 font-semibold shadow-xs border border-slate-200/80"
                  : "bg-indigo-500 text-white font-bold shadow-sm"
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
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
                ? isLight
                  ? "bg-white text-emerald-700 font-semibold shadow-xs border border-slate-200/80"
                  : "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
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
          <label
            className={`hidden md:inline text-[11px] uppercase tracking-wider font-mono ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Experiment:
          </label>
          <select
            value={currentExperiment.id}
            onChange={(e) => onSelectExperiment(e.target.value as ExperimentId)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none transition-colors ${
              isLight
                ? "bg-white border border-slate-300 text-slate-800 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                : "bg-slate-900 border border-slate-700/80 text-white focus:border-cyan-500"
            }`}
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
            <span
              className={`text-[11px] uppercase tracking-wider font-mono ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Preset:
            </span>
            <select
              onChange={(e) => onApplyPreset(e.target.value)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none max-w-[220px] truncate transition-colors ${
                isLight
                  ? "bg-slate-50 border border-slate-300 text-blue-700 focus:border-blue-500"
                  : "bg-slate-900/90 border border-slate-700/70 text-cyan-300 focus:border-cyan-500"
              }`}
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

        {/* Optical Ergonomics Theme Switcher */}
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
          <button
            onClick={toggleTheme}
            title={isLight ? "Switch to Soft Slate Dark Mode" : "Switch to Modern Cleanroom Light Mode"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700"
            }`}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline text-[11px]">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Light</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenGuide}
            title="Scientific Principles & Mathematical Equations"
            className={`p-1.5 rounded-lg transition-colors border ${
              isLight
                ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNotebook}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
              isLight
                ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs"
                : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/70"
            }`}
          >
            Notebook & Trials
          </button>

          <button
            onClick={onOpenAI}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isLight
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold"
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Scientist
          </button>
        </div>
      </div>
    </header>
  );
};
