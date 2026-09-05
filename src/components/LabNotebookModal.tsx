import React, { useState } from "react";
import { X, Plus, Download, Trash2, BookOpen, CheckCircle } from "lucide-react";
import { ExperimentMeta, LabTrial } from "../types";
import { exportTrialsToJSON } from "../utils/exportUtils";
import { useLabTheme } from "../context/ThemeContext";

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
  const { isLight } = useLabTheme();
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
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-colors ${
        isLight ? "bg-slate-900/30" : "bg-slate-950/80"
      }`}
    >
      <div
        className={`w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border transition-colors ${
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
                Digital Lab Notebook & Experimental Trials
              </h2>
              <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {experiment.title} ({experiment.discipline.toUpperCase()})
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

        {/* Notebook Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs font-mono">
          {/* Working Hypothesis */}
          <div
            className={`p-3.5 rounded-lg border transition-colors ${
              isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
            }`}
          >
            <label
              className={`block font-bold mb-1 uppercase tracking-wider text-[10px] ${
                isLight ? "text-slate-600" : "text-slate-400"
              }`}
            >
              Working Research Hypothesis
            </label>
            <textarea
              rows={2}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className={`w-full rounded-md p-2 focus:outline-none font-sans transition-colors ${
                isLight
                  ? "bg-white border border-slate-300 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  : "bg-slate-900 border border-slate-700/80 text-slate-200 focus:border-cyan-500"
              }`}
            />
          </div>

          {/* Record New Trial Section */}
          <div
            className={`p-3.5 rounded-lg border flex flex-col gap-2.5 transition-colors ${
              isLight ? "bg-blue-50/40 border-blue-100" : "bg-slate-800/40 border-slate-700/70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-bold text-[11px] uppercase tracking-wider ${
                  isLight ? "text-slate-800" : "text-white"
                }`}
              >
                Snapshot & Record Current Trial Data
              </span>
              {savedNotice && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" /> Trial Logged!
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="Observation notes (e.g., 'Trial 2: Phenolphthalein flash noticed at 24.8 mL, faint pink persistent')"
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              className={`w-full rounded-md px-3 py-1.5 text-xs focus:outline-none transition-colors ${
                isLight
                  ? "bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  : "bg-slate-900 border border-slate-700 text-white focus:border-cyan-500"
              }`}
            />
            <button
              onClick={handleRecord}
              className={`self-end px-3 py-1.5 font-bold rounded-md flex items-center gap-1.5 transition-all shadow-sm ${
                isLight
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-cyan-500 hover:bg-cyan-600 text-slate-950"
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Commit Trial to Notebook
            </button>
          </div>

          {/* Saved Trials History Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3
                className={`font-bold text-xs uppercase tracking-wider ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                Logged Experimental Trials ({trials.length})
              </h3>
              {trials.length > 0 && (
                <button
                  onClick={handleExportAll}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-colors border ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-emerald-700 border-slate-300"
                      : "bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700"
                  }`}
                >
                  <Download className="w-3 h-3" /> Export All Trials (JSON)
                </button>
              )}
            </div>

            {trials.length === 0 ? (
              <div
                className={`p-8 text-center rounded-lg border ${
                  isLight
                    ? "text-slate-400 bg-slate-50 border-slate-200"
                    : "text-slate-500 bg-slate-950/40 border-slate-800"
                }`}
              >
                No trials logged for this experiment yet. Click "Commit Trial to Notebook" above to record runs.
              </div>
            ) : (
              <div
                className={`overflow-x-auto rounded-lg border ${
                  isLight ? "border-slate-200" : "border-slate-800"
                }`}
              >
                <table className="w-full text-left text-[11px]">
                  <thead
                    className={`border-b ${
                      isLight
                        ? "bg-slate-100/90 text-slate-600 border-slate-200"
                        : "bg-slate-950/80 text-slate-400 border-slate-800"
                    }`}
                  >
                    <tr>
                      <th className="p-2.5">Trial</th>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Summary Metrics</th>
                      <th className="p-2.5">Observations / Notes</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/60"}`}>
                    {trials.map((trial) => (
                      <tr
                        key={trial.id}
                        className={`transition-colors ${
                          isLight ? "hover:bg-slate-50" : "hover:bg-slate-800/30"
                        }`}
                      >
                        <td
                          className={`p-2.5 font-bold ${
                            isLight ? "text-blue-600" : "text-cyan-400"
                          }`}
                        >
                          #{trial.trialNumber}
                        </td>
                        <td className={`p-2.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          {trial.timestamp}
                        </td>
                        <td className="p-2.5">
                          {Object.entries(trial.summaryMetrics).map(([k, v]) => (
                            <span
                              key={k}
                              className={`inline-block mr-2 px-1.5 py-0.5 rounded text-[10px] ${
                                isLight
                                  ? "bg-slate-100 border border-slate-200 text-slate-700"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {k}:{" "}
                              <strong className={isLight ? "text-slate-900" : "text-white"}>
                                {String(v)}
                              </strong>
                            </span>
                          ))}
                        </td>
                        <td
                          className={`p-2.5 font-sans max-w-xs truncate ${
                            isLight ? "text-slate-700" : "text-slate-300"
                          }`}
                        >
                          {trial.notes || "—"}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => onDeleteTrial(trial.id)}
                            className={`p-1 transition-colors ${
                              isLight
                                ? "text-slate-400 hover:text-red-600"
                                : "text-slate-500 hover:text-red-400"
                            }`}
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
