import React, { useState } from "react";
import { X, Plus, Download, Trash2, BookOpen, CheckCircle } from "lucide-react";
import { ExperimentMeta, LabTrial } from "../types";
import { exportTrialsToJSON } from "../utils/exportUtils";

interface LabNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiment: ExperimentMeta;
  trials: LabTrial[];
  onSaveCurrentTrial: (notes: string) => void;
  onDeleteTrial: (id: string) => void;
}

export const LabNotebookModal: React.FC<LabNotebookModalProps> = ({
  isOpen,
  onClose,
  experiment,
  trials,
  onSaveCurrentTrial,
  onDeleteTrial,
}) => {
  const [currentNotes, setCurrentNotes] = useState("");
  const [hypothesis, setHypothesis] = useState(
    "As we systematically vary the controlled parameters, we predict quantitative adherence to governing empirical laws with identifiable sensitivity limits."
  );
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleRecord = () => {
    onSaveCurrentTrial(currentNotes);
    setCurrentNotes("");
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportAll = () => {
    exportTrialsToJSON(trials, `OmniLab_Notebook_Trials_${Date.now()}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-sm text-white font-mono">
                Digital Lab Notebook & Experimental Trials
              </h2>
              <p className="text-[11px] text-slate-400">
                {experiment.title} ({experiment.discipline.toUpperCase()})
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

        {/* Notebook Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs font-mono">
          {/* Working Hypothesis */}
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Working Research Hypothesis
            </label>
            <textarea
              rows={2}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-md p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Record New Trial Section */}
          <div className="bg-slate-800/40 p-3.5 rounded-lg border border-slate-700/70 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                Snapshot & Record Current Trial Data
              </span>
              {savedNotice && (
                <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" /> Trial Logged!
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="Observation notes (e.g., 'Trial 2: Phenolphthalein flash noticed at 24.8 mL, faint pink persistent')"
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleRecord}
              className="self-end px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-md flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Commit Trial to Notebook
            </button>
          </div>

          {/* Saved Trials History Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                Logged Experimental Trials ({trials.length})
              </h3>
              {trials.length > 0 && (
                <button
                  onClick={handleExportAll}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-md text-[11px] transition-colors"
                >
                  <Download className="w-3 h-3" /> Export All Trials (JSON)
                </button>
              )}
            </div>

            {trials.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800">
                No trials logged for this experiment yet. Click "Commit Trial to Notebook" above to record runs.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Trial</th>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Summary Metrics</th>
                      <th className="p-2.5">Observations / Notes</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {trials.map((trial) => (
                      <tr key={trial.id} className="hover:bg-slate-800/30">
                        <td className="p-2.5 font-bold text-cyan-400">#{trial.trialNumber}</td>
                        <td className="p-2.5 text-slate-400">{trial.timestamp}</td>
                        <td className="p-2.5">
                          {Object.entries(trial.summaryMetrics).map(([k, v]) => (
                            <span key={k} className="inline-block mr-2 px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">
                              {k}: <strong className="text-white">{String(v)}</strong>
                            </span>
                          ))}
                        </td>
                        <td className="p-2.5 text-slate-300 font-sans max-w-xs truncate">
                          {trial.notes || "—"}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => onDeleteTrial(trial.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
