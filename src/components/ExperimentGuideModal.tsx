import React from "react";
import { X, BookOpen, Calculator, Target, Lightbulb } from "lucide-react";
import { ExperimentMeta } from "../types";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-sm text-white font-mono">
                Scientific Guide & Experimental Methodology
              </h2>
              <p className="text-[11px] text-slate-400">
                {experiment.title} • {experiment.discipline.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guide Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs leading-relaxed">
          {/* Overview */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-cyan-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" /> Conceptual Background
            </h3>
            <p className="text-slate-300 font-sans">{experiment.description}</p>
          </div>

          {/* Governing Equations */}
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-2">
            <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> Governing Mathematical Models
            </h3>
            <div className="space-y-2 font-mono text-[11px] text-slate-300">
              {(experiment.equations || experiment.principles?.map((p, i) => ({ name: `Scientific Principle ${i + 1}`, latex: p, description: "" })) || []).map((eq, idx) => (
                <div key={idx} className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <div className="font-bold text-white mb-0.5">{eq.name}</div>
                  <div className="text-cyan-300 text-xs bg-slate-950 p-1.5 rounded font-mono my-1">
                    {eq.latex}
                  </div>
                  {eq.description && <div className="text-[10px] text-slate-400">{eq.description}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Experimental Objectives & Suggested Protocol */}
          <div className="space-y-2">
            <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Laboratory Investigation Protocol
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-sans pl-1">
              <li>
                <strong>Baseline Calibration:</strong> Observe the initial unperturbed system parameters and verify telemetry sensors.
              </li>
              <li>
                <strong>Controlled Parameter Sweep:</strong> Systematically alter one independent variable at a time (e.g. angle, concentration, temperature) while holding all other factors constant.
              </li>
              <li>
                <strong>Telemetry Logging:</strong> Use the "Log Current Point" or "Commit Trial to Notebook" controls to record empirical datasets.
              </li>
              <li>
                <strong>Mathematical & Sensitivity Analysis:</strong> Analyze the real-time Recharts plots (first-derivative peaks, double-reciprocal transforms, energy partitions) and run the AI Lab Scientist to compare experimental findings against theoretical predictions.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
