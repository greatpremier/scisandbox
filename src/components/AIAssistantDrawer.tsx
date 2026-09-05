import React, { useState } from "react";
import { Bot, Sparkles, FileText, HelpCircle, X, Copy, Check, Loader2 } from "lucide-react";
import { ExperimentMeta, LabTrial, SimulationDataPoint } from "../types";

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  experiment: ExperimentMeta;
  parameters: Record<string, any>;
  measurements: Record<string, any>;
  dataPoints: SimulationDataPoint[];
  trials: LabTrial[];
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  experiment,
  parameters,
  measurements,
  dataPoints,
  trials,
}) => {
  const [activeMode, setActiveMode] = useState<"analysis" | "report" | "q_and_a">("analysis");
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseContent, setResponseContent] = useState<string>("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRequestAnalysis = async (type: string, customText?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/lab-ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discipline: experiment.discipline,
          experimentTitle: experiment.title,
          parameters,
          measurements,
          dataPoints,
          analysisType: type,
          userPrompt: customText || userPrompt,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setResponseContent(data.analysis);
      } else {
        setResponseContent(data.error || "Unable to generate AI analysis.");
      }
    } catch (err: any) {
      setResponseContent(`Analysis connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lab-ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discipline: experiment.discipline,
          experimentTitle: experiment.title,
          parameters,
          measurements,
          trials,
        }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setResponseContent(data.report);
      } else {
        setResponseContent(data.error || "Unable to generate formal report.");
      }
    } catch (err: any) {
      setResponseContent(`Report drafting error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(responseContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col text-slate-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-lg text-slate-950">
            <Bot className="w-5 h-5 font-bold" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-mono flex items-center gap-1.5">
              AI Lab Research Scientist
            </h3>
            <p className="text-[11px] text-slate-400">Gemini-Powered STEM Analysis & Reporting</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Buttons Bar */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/30 grid grid-cols-3 gap-2 text-xs">
        <button
          onClick={() => {
            setActiveMode("analysis");
            handleRequestAnalysis("Data & Hypothesis Analysis", "Provide a comprehensive scientific evaluation of the current live data stream, empirical laws, and kinetic/kinematic trends.");
          }}
          className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 border transition-all ${
            activeMode === "analysis"
              ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
              : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Analyze Data
        </button>

        <button
          onClick={() => {
            setActiveMode("report");
            handleGenerateReport();
          }}
          className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 border transition-all ${
            activeMode === "report"
              ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
              : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Formal Report
        </button>

        <button
          onClick={() => setActiveMode("q_and_a")}
          className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 border transition-all ${
            activeMode === "q_and_a"
              ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
              : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Ask Scientist
        </button>
      </div>

      {/* Custom Inquiry Box for Q&A */}
      {activeMode === "q_and_a" && (
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/40 flex flex-col gap-2">
          <input
            type="text"
            placeholder="E.g., Why did the pH curve shoot up so sharply at equivalence?"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && userPrompt.trim()) {
                handleRequestAnalysis("Custom Researcher Query", userPrompt);
              }
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleRequestAnalysis("Custom Researcher Query", userPrompt)}
            disabled={!userPrompt.trim() || loading}
            className="self-end px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-md transition-all"
          >
            Submit Question
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
            <p className="font-mono text-xs">Synthesizing mathematical models & analyzing trials...</p>
          </div>
        ) : responseContent ? (
          <div className="relative">
            <div className="absolute top-0 right-0">
              <button
                onClick={handleCopy}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap pt-6 text-slate-300">
              {responseContent}
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center px-6">
            <Bot className="w-10 h-10 mb-2 text-slate-600" />
            <p className="font-semibold text-slate-400">Ready for Scientific Analysis</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Select one of the actions above to evaluate current telemetry data, detect anomalies, or format a complete university-grade lab report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
