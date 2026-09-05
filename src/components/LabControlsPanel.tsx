import React from "react";
import { ExperimentId } from "../types";
import { Play, Pause, RotateCcw, Droplets, Zap, ShieldAlert, Sparkles } from "lucide-react";

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
  return (
    <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur-md border-r border-slate-800 text-slate-200 w-80 shrink-0 select-none overflow-y-auto">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-sm tracking-wide text-white uppercase font-mono">
            Control Station
          </h3>
        </div>
        <button
          onClick={onReset}
          title="Reset apparatus to initial state"
          className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Action Button Bar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        {experimentId === "titration" && (
          <div className="flex flex-col gap-2">
            <button
              onClick={onToggleRun}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
                  : "bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" /> Stop Continuous Burette
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
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-md text-xs font-mono font-medium border border-slate-700/60 flex items-center justify-center gap-1 transition-colors"
              >
                <Droplets className="w-3.5 h-3.5 text-cyan-400" /> +0.05 mL
              </button>
              <button
                onClick={() => onBurstDispense?.(1.0)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-mono font-medium border border-slate-700/60 transition-colors"
              >
                +1.0 mL
              </button>
              <button
                onClick={() => onBurstDispense?.(5.0)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-mono font-medium border border-slate-700/60 transition-colors"
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
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
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
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
                : "bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold"
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
      <div className="p-4 space-y-5 text-xs">
        {/* ================= TITRATION CONTROLS ================= */}
        {experimentId === "titration" && (
          <>
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Acid Reagent Sample</label>
              <select
                value={parameters.acidType || "HCl"}
                onChange={(e) => onParamChange("acidType", e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="HCl">Hydrochloric Acid (HCl) - Strong Acid</option>
                <option value="CH3COOH">Acetic Acid (CH₃COOH) - Weak Buffer</option>
                <option value="Unknown">Unknown Sample (Challenge Mode)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Color Indicator Dye</label>
              <select
                value={parameters.indicator || "phenolphthalein"}
                onChange={(e) => onParamChange("indicator", e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="phenolphthalein">Phenolphthalein (Clear → Bright Pink @ pH 8.3)</option>
                <option value="bromothymol_blue">Bromothymol Blue (Yellow → Green → Blue @ pH 7.0)</option>
                <option value="methyl_orange">Methyl Orange (Red → Orange → Yellow @ pH 3.8)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Acid Conc (M)</span>
                <span className="font-mono text-cyan-400">{parameters.acidConcentration} M</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.01"
                value={parameters.acidConcentration || 0.1}
                onChange={(e) => onParamChange("acidConcentration", parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Titrant NaOH Conc (M)</span>
                <span className="font-mono text-cyan-400">{parameters.baseConcentration} M</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.01"
                value={parameters.baseConcentration || 0.1}
                onChange={(e) => onParamChange("baseConcentration", parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Magnetic Stirrer Speed</span>
                <span className="font-mono text-cyan-400">{parameters.stirringSpeed || 400} RPM</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={parameters.stirringSpeed ?? 400}
                onChange={(e) => onParamChange("stirringSpeed", parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </>
        )}

        {/* ================= REACTION KINETICS CONTROLS ================= */}
        {experimentId === "reaction_kinetics" && (
          <>
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Zinc Surface Morphology</label>
              <select
                value={parameters.zincMorphology || "granules"}
                onChange={(e) => onParamChange("zincMorphology", e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="powder">Fine Zinc Powder (Max Surface Area)</option>
                <option value="granules">Zinc Granules (Standard Area)</option>
                <option value="strip">Solid Zinc Strip (Low Surface Area)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Zinc Mass</span>
                <span className="font-mono text-cyan-400">{parameters.zincMass || 1.5} g</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={parameters.zincMass || 1.5}
                onChange={(e) => onParamChange("zincMass", parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>HCl Acid Conc</span>
                <span className="font-mono text-cyan-400">{parameters.acidConcentration || 1.0} M</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={parameters.acidConcentration || 1.0}
                onChange={(e) => onParamChange("acidConcentration", parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Temperature (Arrhenius)</span>
                <span className="font-mono text-cyan-400">{parameters.temperature || 25}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="65"
                step="1"
                value={parameters.temperature || 25}
                onChange={(e) => onParamChange("temperature", parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <span className="text-slate-300 font-medium">Add Cu²⁺ Catalyst</span>
              <input
                type="checkbox"
                checked={!!parameters.catalystAdded}
                onChange={(e) => onParamChange("catalystAdded", e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </div>
          </>
        )}

        {/* ================= PROJECTILE MOTION CONTROLS ================= */}
        {experimentId === "projectile" && (
          <>
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Launch Elevation Angle</span>
                <span className="font-mono text-cyan-400">{parameters.launchAngle || 45}°</span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                step="1"
                value={parameters.launchAngle || 45}
                onChange={(e) => onParamChange("launchAngle", parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Muzzle Velocity (v₀)</span>
                <span className="font-mono text-cyan-400">{parameters.muzzleVelocity || 30} m/s</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={parameters.muzzleVelocity || 30}
                onChange={(e) => onParamChange("muzzleVelocity", parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Celestial Gravitational Field</label>
              <select
                value={parameters.gravity || 9.81}
                onChange={(e) => onParamChange("gravity", parseFloat(e.target.value))}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="9.81">Earth (1.00 g = 9.81 m/s²)</option>
                <option value="1.62">Moon (0.16 g = 1.62 m/s²)</option>
                <option value="3.71">Mars (0.38 g = 3.71 m/s²)</option>
                <option value="24.79">Jupiter (2.53 g = 24.79 m/s²)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Target Landing Distance</span>
                <span className="font-mono text-emerald-400">{parameters.targetDistance || 75} m</span>
              </div>
              <input
                type="range"
                min="30"
                max="115"
                step="5"
                value={parameters.targetDistance || 75}
                onChange={(e) => onParamChange("targetDistance", parseInt(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Air Drag Coefficient (Cd)</span>
                <span className="font-mono text-cyan-400">{parameters.dragCoefficient ?? 0.47}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={parameters.dragCoefficient ?? 0.47}
                onChange={(e) => onParamChange("dragCoefficient", parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Crosswind Velocity</span>
                <span className="font-mono text-cyan-400">{parameters.windSpeed || 0} m/s</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={parameters.windSpeed || 0}
                onChange={(e) => onParamChange("windSpeed", parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </>
        )}

        {/* ================= OPTICS PRISM CONTROLS ================= */}
        {experimentId === "optics_prism" && (
          <>
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Light Source Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onParamChange("lightMode", "white")}
                  className={`py-1.5 px-3 rounded-md font-medium text-xs border transition-all ${
                    parameters.lightMode === "white"
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  White Light Fan
                </button>
                <button
                  onClick={() => onParamChange("lightMode", "monochromatic")}
                  className={`py-1.5 px-3 rounded-md font-medium text-xs border transition-all ${
                    parameters.lightMode === "monochromatic"
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  Laser Beam
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Incident Angle (θ₁)</span>
                <span className="font-mono text-cyan-400">{parameters.incidentAngle || 45}°</span>
              </div>
              <input
                type="range"
                min="20"
                max="75"
                step="1"
                value={parameters.incidentAngle || 45}
                onChange={(e) => onParamChange("incidentAngle", parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Prism Material (Sellmeier)</label>
              <select
                value={parameters.prismMaterial || "flint_glass"}
                onChange={(e) => onParamChange("prismMaterial", e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="flint_glass">Dense Flint Glass (n ≈ 1.62 - High Dispersion)</option>
                <option value="crown_glass">Crown Glass (n ≈ 1.52 - Standard)</option>
                <option value="diamond">Diamond (n ≈ 2.42 - Intense TIR)</option>
                <option value="acrylic">Acrylic Plexiglass (n ≈ 1.49)</option>
                <option value="water">Liquid Water Prism (n ≈ 1.33)</option>
              </select>
            </div>

            {parameters.lightMode === "monochromatic" && (
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Wavelength (λ)</span>
                  <span className="font-mono text-cyan-400">{parameters.wavelength || 532} nm</span>
                </div>
                <input
                  type="range"
                  min="380"
                  max="750"
                  step="5"
                  value={parameters.wavelength || 532}
                  onChange={(e) => onParamChange("wavelength", parseInt(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            )}
          </>
        )}

        {/* ================= ENZYME KINETICS CONTROLS ================= */}
        {experimentId === "enzyme_kinetics" && (
          <>
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Substrate Conc [S]</span>
                <span className="font-mono text-cyan-400">{parameters.substrateConcentration || 15} mM</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={parameters.substrateConcentration || 15}
                onChange={(e) => onParamChange("substrateConcentration", parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Enzyme Conc [E₀]</span>
                <span className="font-mono text-cyan-400">{parameters.enzymeConcentration || 2.0} nM</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={parameters.enzymeConcentration || 2.0}
                onChange={(e) => onParamChange("enzymeConcentration", parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Incubation Temp (Denaturation @ &gt;50°C)</span>
                <span className="font-mono text-cyan-400">{parameters.temperature || 37}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="1"
                value={parameters.temperature || 37}
                onChange={(e) => onParamChange("temperature", parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Solution pH (Optimal @ 7.0)</span>
                <span className="font-mono text-cyan-400">{parameters.pH || 7.0}</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="11.0"
                step="0.2"
                value={parameters.pH || 7.0}
                onChange={(e) => onParamChange("pH", parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Inhibitor Molecule</label>
              <select
                value={parameters.inhibitorType || "none"}
                onChange={(e) => onParamChange("inhibitorType", e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="none">None (Standard Uninhibited)</option>
                <option value="competitive">Competitive Inhibitor (Increases Apparent Km)</option>
                <option value="non_competitive">Non-Competitive Inhibitor (Decreases Vmax)</option>
              </select>
            </div>

            {parameters.inhibitorType !== "none" && (
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Inhibitor Conc [I]</span>
                  <span className="font-mono text-amber-400">{parameters.inhibitorConcentration || 5.0} mM</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={parameters.inhibitorConcentration || 5.0}
                  onChange={(e) => onParamChange("inhibitorConcentration", parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            )}
          </>
        )}

        {/* ================= BACTERIAL GROWTH CONTROLS ================= */}
        {experimentId === "bacterial_growth" && (
          <>
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Antibiotic Diffusion Disc</label>
              <select
                value={parameters.antibioticType || "none"}
                onChange={(e) => onParamChange("antibioticType", e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="none">No Antibiotic (Control Lawn)</option>
                <option value="ampicillin">Ampicillin (Cell Wall Inhibitor)</option>
                <option value="kanamycin">Kanamycin (Ribosomal 30S Inhibitor)</option>
              </select>
            </div>

            {parameters.antibioticType !== "none" && (
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Disc Potency / Dose</span>
                  <span className="font-mono text-cyan-400">{parameters.antibioticDose || 20} μg</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  step="2"
                  value={parameters.antibioticDose || 20}
                  onChange={(e) => onParamChange("antibioticDose", parseInt(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Incubation Temp</span>
                <span className="font-mono text-cyan-400">{parameters.temperature || 37}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="1"
                value={parameters.temperature || 37}
                onChange={(e) => onParamChange("temperature", parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Agar Nutrient Density</span>
                <span className="font-mono text-cyan-400">{parameters.nutrientLevel || 100}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={parameters.nutrientLevel || 100}
                onChange={(e) => onParamChange("nutrientLevel", parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <span className="text-slate-300 font-medium">GFP Reporter Fluorescence</span>
              <input
                type="checkbox"
                checked={!!parameters.gfpFluorescence}
                onChange={(e) => onParamChange("gfpFluorescence", e.target.checked)}
                className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
