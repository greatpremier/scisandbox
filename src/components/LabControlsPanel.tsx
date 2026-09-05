import React from "react";
import { ExperimentId } from "../types";
import { Play, Pause, RotateCcw, Droplets, Zap, Sparkles } from "lucide-react";
import { useLabTheme } from "../context/ThemeContext";

interface LabControlsPanelProps {
  experimentId: ExperimentId;
  parameters: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  // Specific action triggers
  onSingleDrop?: () => void;
  onBurstDispense?: (volumeML: number) => void;
  onFireProjectile?: () => void;
  onTriggerReaction?: () => void;
}

export const LabControlsPanel: React.FC<LabControlsPanelProps> = ({
  experimentId,
  parameters,
  onParamChange,
  isRunning,
  onToggleRun,
  onReset,
  onSingleDrop,
  onBurstDispense,
  onFireProjectile,
}) => {
  const { isLight } = useLabTheme();

  return (
    <div
      className={`flex flex-col h-full w-80 shrink-0 select-none overflow-y-auto border-r transition-colors duration-200 ${
        isLight
          ? "bg-white border-slate-200/90 text-slate-800 shadow-xs"
          : "bg-slate-900/95 backdrop-blur-md border-slate-800 text-slate-200"
      }`}
    >
      {/* Header bar */}
      <div
        className={`p-4 border-b flex items-center justify-between transition-colors ${
          isLight ? "bg-slate-50/70 border-slate-200/90" : "bg-slate-950/50 border-slate-800"
        }`}
      >
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${isLight ? "text-blue-600" : "text-cyan-400"}`} />
          <h3
            className={`font-semibold text-xs tracking-wider uppercase font-mono ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            Control Station
          </h3>
        </div>
        <button
          onClick={onReset}
          title="Reset apparatus to initial baseline parameters"
          className={`p-1.5 rounded-lg text-xs transition-colors border ${
            isLight
              ? "bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200"
              : "hover:bg-slate-800 text-slate-400 hover:text-white border-transparent"
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Action Button Bar */}
      <div
        className={`p-4 border-b transition-colors ${
          isLight ? "bg-slate-50/40 border-slate-200/90" : "bg-slate-950/40 border-slate-800/80"
        }`}
      >
        {experimentId === "titration" && (
          <div className="flex flex-col gap-2">
            <button
              onClick={onToggleRun}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] ${
                isRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                  : isLight
                  ? "bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  : "bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" /> Stop Continuous Flow
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Continuous Titrant Flow
                </>
              )}
            </button>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={onSingleDrop}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border flex items-center justify-center gap-1 transition-colors ${
                  isLight
                    ? "bg-white hover:bg-slate-100 text-blue-700 border-slate-200/90 shadow-xs"
                    : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700/60"
                }`}
              >
                <Droplets className="w-3.5 h-3.5" /> +0.05 mL
              </button>
              <button
                onClick={() => onBurstDispense?.(1.0)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border transition-colors ${
                  isLight
                    ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90 shadow-xs"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60"
                }`}
              >
                +1.0 mL
              </button>
              <button
                onClick={() => onBurstDispense?.(5.0)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border transition-colors ${
                  isLight
                    ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90 shadow-xs"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60"
                }`}
              >
                +5.0 mL
              </button>
            </div>
          </div>
        )}

        {experimentId === "projectile" && (
          <div className="flex flex-col gap-2">
            <button
              onClick={onFireProjectile}
              className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] ${
                isLight
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20"
              }`}
            >
              <Sparkles className="w-4 h-4" /> FIRE BALLISTIC CANNON
            </button>
          </div>
        )}

        {(experimentId === "reaction_kinetics" ||
          experimentId === "optics_prism" ||
          experimentId === "enzyme_kinetics" ||
          experimentId === "bacterial_growth") && (
          <button
            onClick={onToggleRun}
            className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                : isLight
                ? "bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                : "bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pause Simulation
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Run Simulation
              </>
            )}
          </button>
        )}
      </div>

      {/* Experiment-Specific Parameter Sliders & Toggles */}
      <div className="p-4 space-y-4 text-xs">
        {/* ================= TITRATION CONTROLS ================= */}
        {experimentId === "titration" && (
          <>
            <div className="space-y-1.5">
              <label className={`block font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Acid Reagent Sample
              </label>
              <select
                value={parameters.acidType || "HCl"}
                onChange={(e) => onParamChange("acidType", e.target.value)}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition-colors ${
                  isLight
                    ? "bg-white border border-slate-300 text-slate-800 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    : "bg-slate-800/90 border border-slate-700 text-white focus:border-cyan-500"
                }`}
              >
                <option value="HCl">Hydrochloric Acid (HCl) - Strong Acid</option>
                <option value="CH3COOH">Acetic Acid (CH₃COOH) - Weak Buffer</option>
                <option value="Unknown">Unknown Sample (Challenge Mode)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={`block font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Color Indicator Dye
              </label>
              <select
                value={parameters.indicator || "phenolphthalein"}
                onChange={(e) => onParamChange("indicator", e.target.value)}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition-colors ${
                  isLight
                    ? "bg-white border border-slate-300 text-slate-800 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    : "bg-slate-800/90 border border-slate-700 text-white focus:border-cyan-500"
                }`}
              >
                <option value="phenolphthalein">Phenolphthalein (Clear → Bright Pink @ pH 8.3)</option>
                <option value="bromothymol_blue">Bromothymol Blue (Yellow → Green → Blue @ pH 7.0)</option>
                <option value="methyl_orange">Methyl Orange (Red → Orange → Yellow @ pH 3.8)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Acid Conc</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-blue-50 text-blue-700 border border-blue-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.acidConcentration} M
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.01"
                value={parameters.acidConcentration || 0.1}
                onChange={(e) => onParamChange("acidConcentration", parseFloat(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-blue-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Titrant NaOH Conc</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-blue-50 text-blue-700 border border-blue-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.baseConcentration} M
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.01"
                value={parameters.baseConcentration || 0.1}
                onChange={(e) => onParamChange("baseConcentration", parseFloat(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-blue-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Magnetic Stirrer</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-blue-50 text-blue-700 border border-blue-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.stirringSpeed || 400} RPM
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={parameters.stirringSpeed ?? 400}
                onChange={(e) => onParamChange("stirringSpeed", parseInt(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-blue-600" : "accent-cyan-400"}`}
              />
            </div>
          </>
        )}

        {/* ================= REACTION KINETICS CONTROLS ================= */}
        {experimentId === "reaction_kinetics" && (
          <>
            <div className="space-y-1.5">
              <label className={`block font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Zinc Morphology
              </label>
              <select
                value={parameters.zincMorphology || "granules"}
                onChange={(e) => onParamChange("zincMorphology", e.target.value)}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition-colors ${
                  isLight
                    ? "bg-white border border-slate-300 text-slate-800 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    : "bg-slate-800/90 border border-slate-700 text-white focus:border-cyan-500"
                }`}
              >
                <option value="powder">Fine Zinc Powder (Max Surface Area)</option>
                <option value="granules">Zinc Granules (Standard Area)</option>
                <option value="strip">Solid Zinc Strip (Low Surface Area)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Zinc Mass</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-blue-50 text-blue-700 border border-blue-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.zincMass || 1.5} g
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={parameters.zincMass || 1.5}
                onChange={(e) => onParamChange("zincMass", parseFloat(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-blue-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>HCl Acid Conc</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-blue-50 text-blue-700 border border-blue-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.acidConcentration || 1.0} M
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={parameters.acidConcentration || 1.0}
                onChange={(e) => onParamChange("acidConcentration", parseFloat(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-blue-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Temperature</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-blue-50 text-blue-700 border border-blue-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.temperature || 25}°C
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="65"
                step="1"
                value={parameters.temperature || 25}
                onChange={(e) => onParamChange("temperature", parseInt(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-blue-600" : "accent-cyan-400"}`}
              />
            </div>

            <div
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                isLight ? "bg-slate-50 border-slate-200/90" : "bg-slate-800/60 border-slate-700/60"
              }`}
            >
              <span className={`font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>Add Cu²⁺ Catalyst</span>
              <input
                type="checkbox"
                checked={!!parameters.catalystAdded}
                onChange={(e) => onParamChange("catalystAdded", e.target.checked)}
                className={`w-4 h-4 rounded cursor-pointer ${isLight ? "accent-blue-600" : "accent-cyan-400"}`}
              />
            </div>
          </>
        )}

        {/* ================= PROJECTILE MOTION CONTROLS ================= */}
        {experimentId === "projectile" && (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Launch Angle</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.launchAngle || 45}°
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                step="1"
                value={parameters.launchAngle || 45}
                onChange={(e) => onParamChange("launchAngle", parseInt(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-indigo-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Muzzle Velocity</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.muzzleVelocity || 30} m/s
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={parameters.muzzleVelocity || 30}
                onChange={(e) => onParamChange("muzzleVelocity", parseInt(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-indigo-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`block font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Gravitational Field
              </label>
              <select
                value={parameters.gravity || 9.81}
                onChange={(e) => onParamChange("gravity", parseFloat(e.target.value))}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition-colors ${
                  isLight
                    ? "bg-white border border-slate-300 text-slate-800 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    : "bg-slate-800/90 border border-slate-700 text-white focus:border-cyan-500"
                }`}
              >
                <option value="9.81">Earth (1.00 g = 9.81 m/s²)</option>
                <option value="1.62">Moon (0.16 g = 1.62 m/s²)</option>
                <option value="3.71">Mars (0.38 g = 3.71 m/s²)</option>
                <option value="24.79">Jupiter (2.53 g = 24.79 m/s²)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Target Distance</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" : "bg-slate-900 text-emerald-400 border border-slate-700"
                  }`}
                >
                  {parameters.targetDistance || 75} m
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="115"
                step="5"
                value={parameters.targetDistance || 75}
                onChange={(e) => onParamChange("targetDistance", parseInt(e.target.value))}
                className="w-full cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Air Drag Coeff (Cd)</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-slate-100 text-slate-700 border border-slate-200" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.dragCoefficient ?? 0.47}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={parameters.dragCoefficient ?? 0.47}
                onChange={(e) => onParamChange("dragCoefficient", parseFloat(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-indigo-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Crosswind Velocity</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-slate-100 text-slate-700 border border-slate-200" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.windSpeed || 0} m/s
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={parameters.windSpeed || 0}
                onChange={(e) => onParamChange("windSpeed", parseInt(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-indigo-600" : "accent-cyan-400"}`}
              />
            </div>
          </>
        )}

        {/* ================= OPTICS PRISM CONTROLS ================= */}
        {experimentId === "optics_prism" && (
          <>
            <div className="space-y-1.5">
              <label className={`block font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Light Source Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onParamChange("lightMode", "white")}
                  className={`py-1.5 px-3 rounded-lg font-medium text-xs border transition-all ${
                    parameters.lightMode === "white"
                      ? isLight
                        ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-xs"
                        : "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                      : isLight
                      ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  White Light Fan
                </button>
                <button
                  onClick={() => onParamChange("lightMode", "monochromatic")}
                  className={`py-1.5 px-3 rounded-lg font-medium text-xs border transition-all ${
                    parameters.lightMode === "monochromatic"
                      ? isLight
                        ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-xs"
                        : "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                      : isLight
                      ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  Laser Beam
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Incident Angle (θ₁)</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-blue-50 text-blue-700 border border-blue-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.incidentAngle || 45}°
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="75"
                step="1"
                value={parameters.incidentAngle || 45}
                onChange={(e) => onParamChange("incidentAngle", parseInt(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-blue-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`block font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Prism Material (Sellmeier)
              </label>
              <select
                value={parameters.prismMaterial || "flint_glass"}
                onChange={(e) => onParamChange("prismMaterial", e.target.value)}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition-colors ${
                  isLight
                    ? "bg-white border border-slate-300 text-slate-800 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    : "bg-slate-800/90 border border-slate-700 text-white focus:border-cyan-500"
                }`}
              >
                <option value="flint_glass">Dense Flint Glass (n ≈ 1.62 - High Dispersion)</option>
                <option value="crown_glass">Crown Glass (n ≈ 1.52 - Standard)</option>
                <option value="diamond">Diamond (n ≈ 2.42 - Intense TIR)</option>
                <option value="acrylic">Acrylic Plexiglass (n ≈ 1.49)</option>
                <option value="water">Liquid Water Prism (n ≈ 1.33)</option>
              </select>
            </div>

            {parameters.lightMode === "monochromatic" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Wavelength (λ)</span>
                  <span
                    className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                      isLight ? "bg-blue-50 text-blue-700 border border-blue-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                    }`}
                  >
                    {parameters.wavelength || 532} nm
                  </span>
                </div>
                <input
                  type="range"
                  min="380"
                  max="750"
                  step="5"
                  value={parameters.wavelength || 532}
                  onChange={(e) => onParamChange("wavelength", parseInt(e.target.value))}
                  className={`w-full cursor-pointer ${isLight ? "accent-blue-600" : "accent-cyan-400"}`}
                />
              </div>
            )}
          </>
        )}

        {/* ================= ENZYME KINETICS CONTROLS ================= */}
        {experimentId === "enzyme_kinetics" && (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Substrate Conc [S]</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.substrateConcentration || 15} mM
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={parameters.substrateConcentration || 15}
                onChange={(e) => onParamChange("substrateConcentration", parseInt(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-emerald-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Enzyme Conc [E₀]</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.enzymeConcentration || 2.0} nM
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={parameters.enzymeConcentration || 2.0}
                onChange={(e) => onParamChange("enzymeConcentration", parseFloat(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-emerald-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Incubation Temp</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.temperature || 37}°C
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="1"
                value={parameters.temperature || 37}
                onChange={(e) => onParamChange("temperature", parseInt(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-emerald-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Solution pH</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.pH || 7.0}
                </span>
              </div>
              <input
                type="range"
                min="3.0"
                max="11.0"
                step="0.2"
                value={parameters.pH || 7.0}
                onChange={(e) => onParamChange("pH", parseFloat(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-emerald-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`block font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Inhibitor Molecule
              </label>
              <select
                value={parameters.inhibitorType || "none"}
                onChange={(e) => onParamChange("inhibitorType", e.target.value)}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition-colors ${
                  isLight
                    ? "bg-white border border-slate-300 text-slate-800 shadow-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    : "bg-slate-800/90 border border-slate-700 text-white focus:border-cyan-500"
                }`}
              >
                <option value="none">None (Standard Uninhibited)</option>
                <option value="competitive">Competitive Inhibitor (Increases Apparent Km)</option>
                <option value="non_competitive">Non-Competitive Inhibitor (Decreases Vmax)</option>
              </select>
            </div>

            {parameters.inhibitorType !== "none" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Inhibitor Conc [I]</span>
                  <span
                    className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                      isLight ? "bg-amber-50 text-amber-700 border border-amber-200/80" : "bg-slate-900 text-amber-400 border border-slate-700"
                    }`}
                  >
                    {parameters.inhibitorConcentration || 5.0} mM
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={parameters.inhibitorConcentration || 5.0}
                  onChange={(e) => onParamChange("inhibitorConcentration", parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-amber-500"
                />
              </div>
            )}
          </>
        )}

        {/* ================= BACTERIAL GROWTH CONTROLS ================= */}
        {experimentId === "bacterial_growth" && (
          <>
            <div className="space-y-1.5">
              <label className={`block font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Antibiotic Diffusion Disc
              </label>
              <select
                value={parameters.antibioticType || "none"}
                onChange={(e) => onParamChange("antibioticType", e.target.value)}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition-colors ${
                  isLight
                    ? "bg-white border border-slate-300 text-slate-800 shadow-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    : "bg-slate-800/90 border border-slate-700 text-white focus:border-cyan-500"
                }`}
              >
                <option value="none">No Antibiotic (Control Lawn)</option>
                <option value="ampicillin">Ampicillin (Cell Wall Inhibitor)</option>
                <option value="kanamycin">Kanamycin (Ribosomal 30S Inhibitor)</option>
              </select>
            </div>

            {parameters.antibioticType !== "none" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Disc Potency / Dose</span>
                  <span
                    className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                      isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                    }`}
                  >
                    {parameters.antibioticDose || 20} μg
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  step="2"
                  value={parameters.antibioticDose || 20}
                  onChange={(e) => onParamChange("antibioticDose", parseInt(e.target.value))}
                  className={`w-full cursor-pointer ${isLight ? "accent-emerald-600" : "accent-cyan-400"}`}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Incubation Temp</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.temperature || 37}°C
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="1"
                value={parameters.temperature || 37}
                onChange={(e) => onParamChange("temperature", parseInt(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-emerald-600" : "accent-cyan-400"}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-600 font-medium" : "text-slate-300"}>Agar Nutrient Density</span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" : "bg-slate-900 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {parameters.nutrientLevel || 100}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={parameters.nutrientLevel || 100}
                onChange={(e) => onParamChange("nutrientLevel", parseInt(e.target.value))}
                className={`w-full cursor-pointer ${isLight ? "accent-emerald-600" : "accent-cyan-400"}`}
              />
            </div>

            <div
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                isLight ? "bg-slate-50 border-slate-200/90" : "bg-slate-800/60 border-slate-700/60"
              }`}
            >
              <span className={`font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                GFP Reporter Fluorescence
              </span>
              <input
                type="checkbox"
                checked={!!parameters.gfpFluorescence}
                onChange={(e) => onParamChange("gfpFluorescence", e.target.checked)}
                className={`w-4 h-4 rounded cursor-pointer ${isLight ? "accent-emerald-600" : "accent-emerald-400"}`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
