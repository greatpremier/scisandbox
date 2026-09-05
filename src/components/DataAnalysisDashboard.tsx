import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import { ExperimentId, SimulationDataPoint } from "../types";
import { Download, Activity, Gauge, BarChart2, ChevronDown, ChevronUp, Database } from "lucide-react";
import { exportDataToCSV } from "../utils/exportUtils";

interface DataAnalysisDashboardProps {
  experimentId: ExperimentId;
  dataPoints: SimulationDataPoint[];
  liveMetrics: {
    label1: string;
    value1: string | number;
    unit1: string;
    label2: string;
    value2: string | number;
    unit2: string;
    label3: string;
    value3: string | number;
    unit3: string;
    label4: string;
    value4: string | number;
    unit4: string;
  };
  onClearData: () => void;
  onSnapshot: () => void;
}

export const DataAnalysisDashboard: React.FC<DataAnalysisDashboardProps> = ({
  experimentId,
  dataPoints,
  liveMetrics,
  onClearData,
  onSnapshot,
}) => {
  const [activeTab, setActiveTab] = useState<"primary_chart" | "secondary_chart" | "data_table">("primary_chart");
  const [isMinimized, setIsMinimized] = useState(false);

  const handleExportCSV = () => {
    exportDataToCSV(dataPoints, `OmniLab_${experimentId}_data_${Date.now()}`);
  };

  return (
    <div
      className={`bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-200 transition-all duration-300 flex flex-col ${
        isMinimized ? "h-12" : "h-72"
      }`}
    >
      {/* Top Header & Sensor Gauges Ribbon */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-semibold text-xs tracking-wider uppercase font-mono text-white">
              Real-Time Telemetry & Analysis
            </span>
          </div>

          {/* Quick Tab Switcher */}
          {!isMinimized && (
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
              <button
                onClick={() => setActiveTab("primary_chart")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === "primary_chart"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Primary Curve
              </button>
              <button
                onClick={() => setActiveTab("secondary_chart")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === "secondary_chart"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {experimentId === "titration"
                  ? "1st Derivative (dpH/dV)"
                  : experimentId === "projectile"
                  ? "Energy Conservation"
                  : experimentId === "enzyme_kinetics"
                  ? "Lineweaver-Burk Plot"
                  : "Rate Kinetics"}
              </button>
              <button
                onClick={() => setActiveTab("data_table")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === "data_table"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Raw Table ({dataPoints.length})
              </button>
            </div>
          )}
        </div>

        {/* Live Gauges in Ribbon */}
        <div className="flex items-center gap-5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] uppercase">{liveMetrics.label1}:</span>
            <span className="text-cyan-400 font-bold text-sm">
              {liveMetrics.value1} <span className="text-[10px] text-slate-400 font-normal">{liveMetrics.unit1}</span>
            </span>
          </div>
          <div className="w-[1px] h-4 bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] uppercase">{liveMetrics.label2}:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {liveMetrics.value2} <span className="text-[10px] text-slate-400 font-normal">{liveMetrics.unit2}</span>
            </span>
          </div>
          <div className="w-[1px] h-4 bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] uppercase">{liveMetrics.label3}:</span>
            <span className="text-amber-400 font-bold text-sm">
              {liveMetrics.value3} <span className="text-[10px] text-slate-400 font-normal">{liveMetrics.unit3}</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 pl-2">
            <button
              onClick={onSnapshot}
              title="Log Current Data Point"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportCSV}
              disabled={dataPoints.length === 0}
              title="Export CSV Dataset"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded transition-colors disabled:opacity-30"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart/Table Body */}
      {!isMinimized && (
        <div className="flex-1 p-3 min-h-0 overflow-hidden">
          {dataPoints.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
              <BarChart2 className="w-8 h-8 mb-1.5 text-slate-600" />
              <span>No simulation telemetry points logged yet.</span>
              <span className="text-[11px] text-slate-600">Start the experiment or dispense reagents to begin real-time data streaming.</span>
            </div>
          ) : (
            <>
              {/* PRIMARY CHART TAB */}
              {activeTab === "primary_chart" && (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {experimentId === "titration" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          dataKey="addedTitrantVolume"
                          stroke="#94a3b8"
                          fontSize={11}
                          tickFormatter={(v) => `${v} mL`}
                        />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 14]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px" }}
                        />
                        <ReferenceLine y={7.0} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "pH 7.0 Neutral", fill: "#22c55e", fontSize: 10 }} />
                        <Line
                          type="monotone"
                          dataKey="pH"
                          stroke="#38bdf8"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : experimentId === "reaction_kinetics" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}s`} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="gasVolumeML"
                          name="H₂ Volume (mL)"
                          stroke="#38bdf8"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : experimentId === "projectile" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="x" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}m`} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}m`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="y"
                          name="Trajectory Height (m)"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : experimentId === "optics_prism" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="wavelength" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}nm`} />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={["auto", "auto"]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="refractiveIndex"
                          name="Refractive Index n(λ)"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : experimentId === "enzyme_kinetics" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="substrateConc" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}mM`} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="velocity"
                          name="Velocity V (μmol/min)"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : (
                      // Bacterial Growth
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="timeHours" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}h`} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="opticalDensityOD600"
                          name="OD₆₀₀"
                          stroke="#38bdf8"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}

              {/* SECONDARY CHART TAB */}
              {activeTab === "secondary_chart" && (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {experimentId === "titration" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="addedTitrantVolume" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v} mL`} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="dpH_dV"
                          name="1st Derivative dpH/dV"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : experimentId === "projectile" ? (
                      <AreaChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="timeElapsed" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}s`} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}J`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="kineticEnergy"
                          name="Kinetic Energy (J)"
                          stroke="#38bdf8"
                          fill="#38bdf8"
                          fillOpacity={0.2}
                          isAnimationActive={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="potentialEnergy"
                          name="Potential Energy (J)"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.2}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    ) : experimentId === "enzyme_kinetics" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="invSubstrate" stroke="#94a3b8" fontSize={11} name="1/[S]" />
                        <YAxis dataKey="invVelocity" stroke="#94a3b8" fontSize={11} name="1/V" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px" }}
                        />
                        <Line
                          type="linear"
                          dataKey="invVelocity"
                          name="Double Reciprocal (1/V)"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : (
                      // Rate vs Time
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="instantaneousRateML_s"
                          name="Rate (mL/s)"
                          stroke="#ec4899"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}

              {/* RAW DATA TABLE TAB */}
              {activeTab === "data_table" && (
                <div className="w-full h-full overflow-auto font-mono text-[11px]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 bg-slate-950/40 text-left">
                        <th className="p-1.5">#</th>
                        {Object.keys(dataPoints[0] || {}).map((k) => (
                          <th key={k} className="p-1.5">
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataPoints.slice(-25).map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                          <td className="p-1.5 text-slate-500">{idx + 1}</td>
                          {Object.keys(row).map((k) => (
                            <td key={k} className="p-1.5 text-slate-300">
                              {typeof row[k] === "number" ? (row[k] as number).toFixed(2) : String(row[k])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
