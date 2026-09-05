import React from "react";
import { X, BookOpen, Calculator, Target, Lightbulb } from "lucide-react";
import { ExperimentMeta } from "../types";
import { useLabTheme } from "../context/ThemeContext";

interface ExperimentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiment: ExperimentMeta;
}

export const ExperimentGuideModal: React.FC<ExperimentGuideModalProps> = ({
  isOpen,
  onClose,
  experiment,
}) => {
  const { isLight } = useLabTheme();
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-colors ${
        isLight ? "bg-slate-900/30" : "bg-slate-950/80"
      }`}
    >
      <div
        className={`w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border transition-colors ${
          isLight
            ? "bg-white border-slate-200/90 text-slate-800"
            : "bg-slate-900 border-slate-700/80 text-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between transition-colors ${
            isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-950/50"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className={`w-5 h-5 ${isLight ? "text-blue-600" : "text-cyan-400"}`} />
            <div>
              <h2 className={`font-bold text-sm font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
                Scientific Guide & Experimental Methodology
              </h2>
              <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {experiment.title} • {experiment.discipline.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight
                ? "hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                : "hover:bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guide Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs leading-relaxed">
          {/* Overview */}
          <div className="space-y-1.5">
            <h3
              className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-blue-700" : "text-cyan-400"
              }`}
            >
              <Lightbulb className="w-4 h-4" /> Conceptual Background
            </h3>
            <p className={`font-sans leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
              {experiment.description}
            </p>
          </div>

          {/* Governing Equations */}
          <div
            className={`p-4 rounded-lg border space-y-2.5 transition-colors ${
              isLight ? "bg-slate-50/80 border-slate-200" : "bg-slate-950/60 border-slate-800"
            }`}
          >
            <h3
              className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-amber-700" : "text-amber-400"
              }`}
            >
              <Calculator className="w-4 h-4" /> Governing Mathematical Models
            </h3>
            <div className="space-y-2 font-mono text-[11px]">
              {(
                experiment.equations ||
                experiment.principles?.map((p, i) => ({
                  name: `Scientific Principle ${i + 1}`,
                  latex: p,
                  description: "",
                })) ||
                []
              ).map((eq, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded border transition-colors ${
                    isLight
                      ? "bg-white border-slate-200/90 shadow-2xs"
                      : "bg-slate-900/80 border-slate-800"
                  }`}
                >
                  <div className={`font-bold mb-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                    {eq.name}
                  </div>
                  <div
                    className={`text-xs p-2 rounded font-mono my-1 font-semibold ${
                      isLight
                        ? "bg-blue-50/70 border border-blue-100 text-blue-900"
                        : "bg-slate-950 text-cyan-300"
                    }`}
                  >
                    {eq.latex}
                  </div>
                  {eq.description && (
                    <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      {eq.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Experimental Objectives & Suggested Protocol */}
          <div className="space-y-2">
            <h3
              className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-emerald-700" : "text-emerald-400"
              }`}
            >
              <Target className="w-4 h-4" /> Laboratory Investigation Protocol
            </h3>
            <ol
              className={`list-decimal list-inside space-y-2 font-sans pl-1 ${
                isLight ? "text-slate-700" : "text-slate-300"
              }`}
            >
              <li>
                <strong className={isLight ? "text-slate-900" : "text-white"}>
                  Baseline Calibration:
                </strong>{" "}
                Observe the initial unperturbed system parameters and verify telemetry sensors.
              </li>
              <li>
                <strong className={isLight ? "text-slate-900" : "text-white"}>
                  Controlled Parameter Sweep:
                </strong>{" "}
                Systematically alter one independent variable at a time (e.g. angle, concentration, temperature) while holding all other factors constant.
              </li>
              <li>
                <strong className={isLight ? "text-slate-900" : "text-white"}>
                  Telemetry Logging:
                </strong>{" "}
                Use the "Log Current Point" or "Commit Trial to Notebook" controls to record empirical datasets.
              </li>
              <li>
                <strong className={isLight ? "text-slate-900" : "text-white"}>
                  Mathematical & Sensitivity Analysis:
                </strong>{" "}
                Analyze the real-time plots (first-derivative peaks, double-reciprocal transforms, energy partitions) and run the AI Lab Scientist to compare experimental findings against theoretical predictions.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
