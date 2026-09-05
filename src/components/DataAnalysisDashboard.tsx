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
import { useLabTheme } from "../context/ThemeContext";

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
  const { isLight } = useLabTheme();
  const [activeTab, setActiveTab] = useState<"primary_chart" | "secondary_chart" | "data_table">("primary_chart");
  const [isMinimized, setIsMinimized] = useState(false);

  const handleExportCSV = () => {
    exportDataToCSV(dataPoints, `OmniLab_${experimentId}_data_${Date.now()}`);
  };

  const gridStroke = isLight ? "#e2e8f0" : "#334155";
  const axisStroke = isLight ? "#64748b" : "#94a3b8";
  const primaryStroke = isLight ? "#2563eb" : "#38bdf8";
  const emeraldStroke = isLight ? "#059669" : "#10b981";
  const amberStroke = isLight ? "#d97706" : "#f59e0b";
  const pinkStroke = isLight ? "#db2777" : "#ec4899";

  const tooltipStyle = isLight
    ? {
        backgroundColor: "#ffffff",
        borderColor: "#cbd5e1",
        color: "#0f172a",
        fontSize: "11px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }
    : {
        backgroundColor: "#0f172a",
        borderColor: "#334155",
        color: "#f8fafc",
        fontSize: "11px",
      };

  return (
    <div
      className={`backdrop-blur-md transition-all duration-300 flex flex-col ${
        isLight
          ? "bg-white/95 border-t border-slate-200/90 text-slate-800 shadow-lg"
          : "bg-slate-900/95 border-t border-slate-800 text-slate-200"
      } ${isMinimized ? "h-12" : "h-72"}`}
    >
      {/* Top Header & Sensor Gauges Ribbon */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b shrink-0 transition-colors ${
          isLight
            ? "bg-slate-50/90 border-slate-200/90"
            : "bg-slate-950/60 border-slate-800"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity
              className={`w-4 h-4 animate-pulse ${
                isLight ? "text-blue-600" : "text-cyan-400"
              }`}
            />
            <span
              className={`font-semibold text-xs tracking-wider uppercase font-mono ${
                isLight ? "text-slate-800" : "text-white"
              }`}
            >
              Real-Time Telemetry & Analysis
            </span>
          </div>

          {/* Quick Tab Switcher */}
          {!isMinimized && (
            <div
              className={`flex items-center p-0.5 rounded-lg border text-xs transition-colors ${
                isLight
                  ? "bg-slate-200/70 border-slate-300/80"
                  : "bg-slate-800/80 border-slate-700/60"
              }`}
            >
              <button
                onClick={() => setActiveTab("primary_chart")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === "primary_chart"
                    ? isLight
                      ? "bg-white text-blue-700 font-bold shadow-xs border border-slate-200"
                      : "bg-cyan-500 text-slate-950 font-bold"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Primary Curve
              </button>
              <button
                onClick={() => setActiveTab("secondary_chart")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === "secondary_chart"
                    ? isLight
                      ? "bg-white text-blue-700 font-bold shadow-xs border border-slate-200"
                      : "bg-cyan-500 text-slate-950 font-bold"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
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
                    ? isLight
                      ? "bg-white text-blue-700 font-bold shadow-xs border border-slate-200"
                      : "bg-cyan-500 text-slate-950 font-bold"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
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
            <span
              className={`text-[11px] uppercase ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {liveMetrics.label1}:
            </span>
            <span
              className={`font-bold text-sm ${
                isLight ? "text-blue-600" : "text-cyan-400"
              }`}
            >
              {liveMetrics.value1}{" "}
              <span
                className={`text-[10px] font-normal ${
                  isLight ? "text-slate-400" : "text-slate-400"
                }`}
              >
                {liveMetrics.unit1}
              </span>
            </span>
          </div>
          <div className={`w-[1px] h-4 ${isLight ? "bg-slate-300" : "bg-slate-700"}`} />
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] uppercase ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {liveMetrics.label2}:
            </span>
            <span
              className={`font-bold text-sm ${
                isLight ? "text-emerald-600" : "text-emerald-400"
              }`}
            >
              {liveMetrics.value2}{" "}
              <span
                className={`text-[10px] font-normal ${
                  isLight ? "text-slate-400" : "text-slate-400"
                }`}
              >
                {liveMetrics.unit2}
              </span>
            </span>
          </div>
          <div className={`w-[1px] h-4 ${isLight ? "bg-slate-300" : "bg-slate-700"}`} />
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] uppercase ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {liveMetrics.label3}:
            </span>
            <span
              className={`font-bold text-sm ${
                isLight ? "text-amber-600" : "text-amber-400"
              }`}
            >
              {liveMetrics.value3}{" "}
              <span
                className={`text-[10px] font-normal ${
                  isLight ? "text-slate-400" : "text-slate-400"
                }`}
              >
                {liveMetrics.unit3}
              </span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 pl-2">
            <button
              onClick={onSnapshot}
              title="Log Current Data Point"
              className={`p-1.5 rounded transition-colors ${
                isLight
                  ? "hover:bg-slate-200 text-slate-600 hover:text-blue-600"
                  : "hover:bg-slate-800 text-slate-300 hover:text-cyan-400"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportCSV}
              disabled={dataPoints.length === 0}
              title="Export CSV Dataset"
              className={`p-1.5 rounded transition-colors disabled:opacity-30 ${
                isLight
                  ? "hover:bg-slate-200 text-slate-600 hover:text-emerald-600"
                  : "hover:bg-slate-800 text-slate-300 hover:text-emerald-400"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className={`p-1.5 rounded transition-colors ${
                isLight
                  ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                  : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
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
            <div
              className={`w-full h-full flex flex-col items-center justify-center text-xs font-mono ${
                isLight ? "text-slate-400" : "text-slate-500"
              }`}
            >
              <BarChart2 className={`w-8 h-8 mb-1.5 ${isLight ? "text-slate-300" : "text-slate-600"}`} />
              <span className={isLight ? "text-slate-600 font-medium" : ""}>
                No simulation telemetry points logged yet.
              </span>
              <span className={`text-[11px] ${isLight ? "text-slate-400" : "text-slate-600"}`}>
                Start the experiment or dispense reagents to begin real-time data streaming.
              </span>
            </div>
          ) : (
            <>
              {/* PRIMARY CHART TAB */}
              {activeTab === "primary_chart" && (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {experimentId === "titration" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis
                          dataKey="addedTitrantVolume"
                          stroke={axisStroke}
                          fontSize={11}
                          tickFormatter={(v) => `${v} mL`}
                        />
                        <YAxis stroke={axisStroke} fontSize={11} domain={[0, 14]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <ReferenceLine
                          y={7.0}
                          stroke={emeraldStroke}
                          strokeDasharray="3 3"
                          label={{ value: "pH 7.0 Neutral", fill: emeraldStroke, fontSize: 10 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="pH"
                          stroke={primaryStroke}
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : experimentId === "reaction_kinetics" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="time" stroke={axisStroke} fontSize={11} tickFormatter={(v) => `${v}s`} />
                        <YAxis stroke={axisStroke} fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="monotone"
                          dataKey="gasVolumeML"
                          name="H₂ Volume (mL)"
                          stroke={primaryStroke}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : experimentId === "projectile" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="x" stroke={axisStroke} fontSize={11} tickFormatter={(v) => `${v}m`} />
                        <YAxis stroke={axisStroke} fontSize={11} tickFormatter={(v) => `${v}m`} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="monotone"
                          dataKey="y"
                          name="Trajectory Height (m)"
                          stroke={emeraldStroke}
                          strokeWidth={2.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : experimentId === "optics_prism" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="wavelength" stroke={axisStroke} fontSize={11} tickFormatter={(v) => `${v}nm`} />
                        <YAxis stroke={axisStroke} fontSize={11} domain={["auto", "auto"]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="monotone"
                          dataKey="refractiveIndex"
                          name="Refractive Index n(λ)"
                          stroke={amberStroke}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : experimentId === "enzyme_kinetics" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="substrateConc" stroke={axisStroke} fontSize={11} tickFormatter={(v) => `${v}mM`} />
                        <YAxis stroke={axisStroke} fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="monotone"
                          dataKey="velocity"
                          name="Velocity V (μmol/min)"
                          stroke={emeraldStroke}
                          strokeWidth={2.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : (
                      // Bacterial Growth
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="timeHours" stroke={axisStroke} fontSize={11} tickFormatter={(v) => `${v}h`} />
                        <YAxis stroke={axisStroke} fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="monotone"
                          dataKey="opticalDensityOD600"
                          name="OD₆₀₀"
                          stroke={primaryStroke}
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
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="addedTitrantVolume" stroke={axisStroke} fontSize={11} tickFormatter={(v) => `${v} mL`} />
                        <YAxis stroke={axisStroke} fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="monotone"
                          dataKey="dpH_dV"
                          name="1st Derivative dpH/dV"
                          stroke={amberStroke}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : experimentId === "projectile" ? (
                      <AreaChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="timeElapsed" stroke={axisStroke} fontSize={11} tickFormatter={(v) => `${v}s`} />
                        <YAxis stroke={axisStroke} fontSize={11} tickFormatter={(v) => `${v}J`} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area
                          type="monotone"
                          dataKey="kineticEnergy"
                          name="Kinetic Energy (J)"
                          stroke={primaryStroke}
                          fill={primaryStroke}
                          fillOpacity={0.2}
                          isAnimationActive={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="potentialEnergy"
                          name="Potential Energy (J)"
                          stroke={emeraldStroke}
                          fill={emeraldStroke}
                          fillOpacity={0.2}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    ) : experimentId === "enzyme_kinetics" ? (
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="invSubstrate" stroke={axisStroke} fontSize={11} name="1/[S]" />
                        <YAxis dataKey="invVelocity" stroke={axisStroke} fontSize={11} name="1/V" />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="linear"
                          dataKey="invVelocity"
                          name="Double Reciprocal (1/V)"
                          stroke={amberStroke}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : (
                      // Rate vs Time
                      <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="time" stroke={axisStroke} fontSize={11} />
                        <YAxis stroke={axisStroke} fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="monotone"
                          dataKey="instantaneousRateML_s"
                          name="Rate (mL/s)"
                          stroke={pinkStroke}
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
                      <tr
                        className={`border-b text-left ${
                          isLight
                            ? "border-slate-200 text-slate-600 bg-slate-100/90"
                            : "border-slate-700 text-slate-400 bg-slate-950/40"
                        }`}
                      >
                        <th className="p-1.5 font-semibold">#</th>
                        {Object.keys(dataPoints[0] || {}).map((k) => (
                          <th key={k} className="p-1.5 font-semibold">
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataPoints.slice(-25).map((row, idx) => (
                        <tr
                          key={idx}
                          className={`border-b transition-colors ${
                            isLight
                              ? "border-slate-100 hover:bg-slate-50"
                              : "border-slate-800/60 hover:bg-slate-800/40"
                          }`}
                        >
                          <td className={`p-1.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                            {idx + 1}
                          </td>
                          {Object.keys(row).map((k) => (
                            <td
                              key={k}
                              className={`p-1.5 ${
                                isLight ? "text-slate-700 font-medium" : "text-slate-300"
                              }`}
                            >
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
