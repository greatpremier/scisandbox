import React, { useState, useEffect, useRef, useMemo } from "react";
import { DisciplineType, ExperimentId, SimulationDataPoint, LabTrial } from "./types";
import { EXPERIMENTS_LIST } from "./constants/experiments";
import { NavigationHeader } from "./components/NavigationHeader";
import { LabControlsPanel } from "./components/LabControlsPanel";
import { DataAnalysisDashboard } from "./components/DataAnalysisDashboard";
import { ChemistrySimulation } from "./components/simulations/ChemistrySimulation";
import { PhysicsSimulation } from "./components/simulations/PhysicsSimulation";
import { BiologySimulation } from "./components/simulations/BiologySimulation";
import { AIAssistantDrawer } from "./components/AIAssistantDrawer";
import { LabNotebookModal } from "./components/LabNotebookModal";
import { ExperimentGuideModal } from "./components/ExperimentGuideModal";
import {
  calculateTitrationState,
  calculateGasKinetics,
  stepProjectileRK4,
  calculatePrismDispersion,
  calculateEnzymeKinetics,
  calculateBacterialDynamics,
  TitrationResult,
  GasReactionState,
  ProjectileState,
  RayPath,
  EnzymeKineticsState,
  BacterialGrowthState,
} from "./utils/physicsEngine";
import { useLabTheme } from "./context/ThemeContext";

export default function App() {
  const { isLight } = useLabTheme();
  const [currentDiscipline, setCurrentDiscipline] = useState<DisciplineType>("chemistry");
  const [currentExperimentId, setCurrentExperimentId] = useState<ExperimentId>("titration");

  const currentExperiment = useMemo(() => {
    return (
      EXPERIMENTS_LIST.find((exp) => exp.id === currentExperimentId) ||
      EXPERIMENTS_LIST[0]
    );
  }, [currentExperimentId]);

  // Parameters state initialized from experiment default preset
  const [parameters, setParameters] = useState<Record<string, any>>(() => {
    const initPreset = currentExperiment.presets[0]?.parameters || {};
    return { ...initPreset };
  });

  // UI Drawer & Modal states
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Simulation execution state
  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);

  // Real-time telemetry data points for charting
  const [dataPoints, setDataPoints] = useState<SimulationDataPoint[]>([]);
  const [trials, setTrials] = useState<LabTrial[]>([]);

  // ================= SIMULATION SPECIFIC STATES =================
  // Titration
  const [titrationState, setTitrationState] = useState<TitrationResult>(() =>
    calculateTitrationState("HCl", 0.1, 0.1, 25, 0, "phenolphthalein")
  );

  // Reaction Kinetics
  const [gasState, setGasState] = useState<GasReactionState>(() =>
    calculateGasKinetics(0, 1.5, "granules", 1.0, 40, 25, false)
  );

  // Projectile Motion
  const [projectileState, setProjectileState] = useState<ProjectileState>({
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    speed: 0,
    kineticEnergy: 0,
    potentialEnergy: 0,
    totalEnergy: 0,
    timeElapsed: 0,
    isGrounded: true,
    distanceToTarget: 75,
    hitTarget: false,
  });
  const [pastTrajectory, setPastTrajectory] = useState<{ x: number; y: number; z: number }[]>([]);

  // Wave Optics Prism
  const [prismRays, setPrismRays] = useState<RayPath[]>(() =>
    calculatePrismDispersion(45, 60, "flint_glass", "white", 532)
  );

  // Enzyme Kinetics
  const [enzymeState, setEnzymeState] = useState<EnzymeKineticsState>(() =>
    calculateEnzymeKinetics(15, 2.0, 37, 7.0, "none", 5.0, 0)
  );

  // Bacterial Growth
  const [bacterialState, setBacterialState] = useState<BacterialGrowthState>(() =>
    calculateBacterialDynamics(0, 1000, 100, 37, "none", 20)
  );

  // Handle switching discipline
  const handleSelectDiscipline = (disc: DisciplineType) => {
    setCurrentDiscipline(disc);
    const firstExp = EXPERIMENTS_LIST.find((e) => e.discipline === disc);
    if (firstExp) {
      handleSelectExperiment(firstExp.id);
    }
  };

  // Handle switching experiment
  const handleSelectExperiment = (id: ExperimentId) => {
    setCurrentExperimentId(id);
    const exp = EXPERIMENTS_LIST.find((e) => e.id === id);
    if (exp) {
      setCurrentDiscipline(exp.discipline);
      const newParams = { ...(exp.presets[0]?.parameters || {}) };
      setParameters(newParams);
    }
    setIsRunning(false);
    setSimulationTime(0);
    setDataPoints([]);
    setPastTrajectory([]);
    resetExperimentState(id);
  };

  // Parameter Change Handler
  const handleParamChange = (key: string, value: any) => {
    setParameters((prev) => {
      const updated = { ...prev, [key]: value };
      // Instant updates for static or parameter-driven optics
      if (currentExperimentId === "optics_prism") {
        const rays = calculatePrismDispersion(
          updated.incidentAngle ?? 45,
          60,
          updated.prismMaterial ?? "flint_glass",
          updated.lightMode ?? "white",
          updated.wavelength ?? 532
        );
        setPrismRays(rays);
      } else if (currentExperimentId === "enzyme_kinetics") {
        const newEnzyme = calculateEnzymeKinetics(
          updated.substrateConcentration ?? 15,
          updated.enzymeConcentration ?? 2.0,
          updated.temperature ?? 37,
          updated.pH ?? 7.0,
          updated.inhibitorType ?? "none",
          updated.inhibitorConcentration ?? 5.0,
          simulationTime
        );
        setEnzymeState(newEnzyme);
      }
      return updated;
    });
  };

  // Preset Applicator
  const handleApplyPreset = (presetId: string) => {
    const preset = currentExperiment.presets.find((p) => p.id === presetId);
    if (preset) {
      setParameters((prev) => ({ ...prev, ...preset.parameters }));
      handleReset();
    }
  };

  // Reset Apparatus
  const handleReset = () => {
    setIsRunning(false);
    setSimulationTime(0);
    setDataPoints([]);
    setPastTrajectory([]);
    resetExperimentState(currentExperimentId);
  };

  const resetExperimentState = (id: ExperimentId) => {
    if (id === "titration") {
      setTitrationState(calculateTitrationState("HCl", 0.1, 0.1, 25, 0, "phenolphthalein"));
    } else if (id === "reaction_kinetics") {
      setGasState(calculateGasKinetics(0, parameters.zincMass || 1.5, parameters.zincMorphology || "granules", 1.0, 40, 25, false));
    } else if (id === "projectile") {
      setProjectileState({
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        speed: 0,
        kineticEnergy: 0,
        potentialEnergy: 0,
        totalEnergy: 0,
        timeElapsed: 0,
        isGrounded: true,
        distanceToTarget: parameters.targetDistance || 75,
        hitTarget: false,
      });
    } else if (id === "bacterial_growth") {
      setBacterialState(calculateBacterialDynamics(0, 1000, 100, 37, "none", 20));
    }
  };

  // Specific Actions
  const handleSingleDrop = () => {
    if (currentExperimentId === "titration") {
      const dropVol = 0.05;
      const nextVol = titrationState.addedTitrantVolume + dropVol;
      const nextState = calculateTitrationState(
        parameters.acidType || "HCl",
        parameters.acidConcentration || 0.1,
        parameters.baseConcentration || 0.1,
        parameters.acidVolume || 25,
        nextVol,
        parameters.indicator || "phenolphthalein"
      );
      setTitrationState(nextState);
      setDataPoints((prev) => [
        ...prev,
        {
          time: parseFloat(simulationTime.toFixed(1)),
          addedTitrantVolume: parseFloat(nextVol.toFixed(2)),
          pH: parseFloat(nextState.pH.toFixed(2)),
          dpH_dV: parseFloat(nextState.dpH_dV.toFixed(1)),
        },
      ]);
    }
  };

  const handleBurstDispense = (vol: number) => {
    if (currentExperimentId === "titration") {
      const nextVol = titrationState.addedTitrantVolume + vol;
      const nextState = calculateTitrationState(
        parameters.acidType || "HCl",
        parameters.acidConcentration || 0.1,
        parameters.baseConcentration || 0.1,
        parameters.acidVolume || 25,
        nextVol,
        parameters.indicator || "phenolphthalein"
      );
      setTitrationState(nextState);
      setDataPoints((prev) => [
        ...prev,
        {
          time: parseFloat(simulationTime.toFixed(1)),
          addedTitrantVolume: parseFloat(nextVol.toFixed(2)),
          pH: parseFloat(nextState.pH.toFixed(2)),
          dpH_dV: parseFloat(nextState.dpH_dV.toFixed(1)),
        },
      ]);
    }
  };

  const handleFireProjectile = () => {
    setIsRunning(true);
    setPastTrajectory([]);
    setDataPoints([]);
    const angleRad = ((parameters.launchAngle || 45) * Math.PI) / 180;
    const v0 = parameters.muzzleVelocity || 30;
    const initialVx = v0 * Math.cos(angleRad);
    const initialVy = v0 * Math.sin(angleRad);

    const initial: ProjectileState = {
      x: 0,
      y: 0.1,
      z: 0,
      vx: initialVx,
      vy: initialVy,
      vz: 0,
      speed: v0,
      kineticEnergy: 0.5 * 2.0 * v0 * v0,
      potentialEnergy: 0,
      totalEnergy: 0.5 * 2.0 * v0 * v0,
      timeElapsed: 0,
      isGrounded: false,
      distanceToTarget: parameters.targetDistance || 75,
      hitTarget: false,
    };
    setProjectileState(initial);
  };

  // Main Simulation Loop (ticking at 50ms)
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimulationTime((prevT) => {
        const dt = 0.05;
        const newT = prevT + dt;

        // 1. Titration continuous dispense
        if (currentExperimentId === "titration") {
          const flowRateML_s = 0.8;
          const nextVol = titrationState.addedTitrantVolume + flowRateML_s * dt;
          if (nextVol > 50) {
            setIsRunning(false);
            return newT;
          }
          const nextState = calculateTitrationState(
            parameters.acidType || "HCl",
            parameters.acidConcentration || 0.1,
            parameters.baseConcentration || 0.1,
            parameters.acidVolume || 25,
            nextVol,
            parameters.indicator || "phenolphthalein"
          );
          setTitrationState(nextState);

          if (Math.round(nextVol * 10) % 2 === 0) {
            setDataPoints((pts) => [
              ...pts,
              {
                time: parseFloat(newT.toFixed(1)),
                addedTitrantVolume: parseFloat(nextVol.toFixed(2)),
                pH: parseFloat(nextState.pH.toFixed(2)),
                dpH_dV: parseFloat(nextState.dpH_dV.toFixed(1)),
              },
            ]);
          }
        }

        // 2. Reaction Kinetics Gas Evolution
        else if (currentExperimentId === "reaction_kinetics") {
          const nextState = calculateGasKinetics(
            newT,
            parameters.zincMass || 1.5,
            parameters.zincMorphology || "granules",
            parameters.acidConcentration || 1.0,
            40,
            parameters.temperature || 25,
            !!parameters.catalystAdded
          );
          setGasState(nextState);

          setDataPoints((pts) => [
            ...pts,
            {
              time: parseFloat(newT.toFixed(1)),
              gasVolumeML: parseFloat(nextState.gasVolumeML.toFixed(1)),
              instantaneousRateML_s: parseFloat(nextState.instantaneousRateML_s.toFixed(2)),
            },
          ]);

          if (nextState.reactionProgressPct >= 99) {
            setIsRunning(false);
          }
        }

        // 3. Projectile Ballistics
        else if (currentExperimentId === "projectile") {
          const nextState = stepProjectileRK4(
            projectileState,
            dt,
            2.0, // mass kg
            parameters.gravity || 9.81,
            parameters.dragCoefficient ?? 0.47,
            1.225, // air density
            parameters.windSpeed || 0,
            parameters.targetDistance || 75
          );
          setProjectileState(nextState);

          setPastTrajectory((prev) => [...prev, { x: nextState.x, y: nextState.y, z: nextState.z }]);

          setDataPoints((pts) => [
            ...pts,
            {
              time: parseFloat(newT.toFixed(2)),
              timeElapsed: parseFloat(newT.toFixed(2)),
              x: parseFloat(nextState.x.toFixed(1)),
              y: parseFloat(nextState.y.toFixed(1)),
              kineticEnergy: parseFloat(nextState.kineticEnergy.toFixed(1)),
              potentialEnergy: parseFloat(nextState.potentialEnergy.toFixed(1)),
              totalEnergy: parseFloat(nextState.totalEnergy.toFixed(1)),
            },
          ]);

          if (nextState.isGrounded) {
            setIsRunning(false);
          }
        }

        // 4. Enzyme Kinetics Timecourse
        else if (currentExperimentId === "enzyme_kinetics") {
          const nextState = calculateEnzymeKinetics(
            parameters.substrateConcentration || 15,
            parameters.enzymeConcentration || 2.0,
            parameters.temperature || 37,
            parameters.pH || 7.0,
            parameters.inhibitorType || "none",
            parameters.inhibitorConcentration || 5.0,
            newT
          );
          setEnzymeState(nextState);

          setDataPoints((pts) => [
            ...pts,
            {
              time: parseFloat(newT.toFixed(1)),
              substrateConc: parameters.substrateConcentration || 15,
              velocity: parseFloat(nextState.velocity.toFixed(2)),
              productAccumulated: parseFloat(nextState.productAccumulated.toFixed(1)),
              invSubstrate: parseFloat((1 / (parameters.substrateConcentration || 15)).toFixed(3)),
              invVelocity: parseFloat((1 / Math.max(0.1, nextState.velocity)).toFixed(3)),
            },
          ]);
        }

        // 5. Bacterial Growth Inoculation & Halo Diffusion
        else if (currentExperimentId === "bacterial_growth") {
          const nextState = calculateBacterialDynamics(
            newT * 0.5,
            1000,
            parameters.nutrientLevel || 100,
            parameters.temperature || 37,
            parameters.antibioticType || "none",
            parameters.antibioticDose || 20
          );
          setBacterialState(nextState);

          setDataPoints((pts) => [
            ...pts,
            {
              time: parseFloat((newT * 0.5).toFixed(1)),
              timeHours: parseFloat((newT * 0.5).toFixed(1)),
              opticalDensityOD600: parseFloat(nextState.opticalDensityOD600.toFixed(3)),
              cellCount: Math.round(nextState.cellCount),
              zoneDiameterMM: parseFloat(nextState.zoneOfInhibitionDiameterMM.toFixed(1)),
            },
          ]);
        }

        return newT;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, currentExperimentId, parameters, titrationState.addedTitrantVolume, projectileState]);

  // Handle Snapshot / Record Point
  const handleSnapshotPoint = () => {
    let newPt: SimulationDataPoint = { time: parseFloat(simulationTime.toFixed(1)) };
    if (currentExperimentId === "titration") {
      newPt = {
        time: parseFloat(simulationTime.toFixed(1)),
        addedTitrantVolume: parseFloat(titrationState.addedTitrantVolume.toFixed(2)),
        pH: parseFloat(titrationState.pH.toFixed(2)),
        dpH_dV: parseFloat(titrationState.dpH_dV.toFixed(1)),
      };
    } else if (currentExperimentId === "reaction_kinetics") {
      newPt = {
        time: parseFloat(simulationTime.toFixed(1)),
        gasVolumeML: parseFloat(gasState.gasVolumeML.toFixed(1)),
        instantaneousRateML_s: parseFloat(gasState.instantaneousRateML_s.toFixed(2)),
      };
    } else if (currentExperimentId === "projectile") {
      newPt = {
        time: parseFloat(projectileState.timeElapsed.toFixed(2)),
        timeElapsed: parseFloat(projectileState.timeElapsed.toFixed(2)),
        x: parseFloat(projectileState.x.toFixed(1)),
        y: parseFloat(projectileState.y.toFixed(1)),
        kineticEnergy: parseFloat(projectileState.kineticEnergy.toFixed(1)),
        potentialEnergy: parseFloat(projectileState.potentialEnergy.toFixed(1)),
        totalEnergy: parseFloat(projectileState.totalEnergy.toFixed(1)),
      };
    } else if (currentExperimentId === "optics_prism") {
      const primaryRay = prismRays[0];
      newPt = {
        time: 0,
        wavelength: primaryRay ? primaryRay.wavelength : 532,
        refractiveIndex: primaryRay ? parseFloat(primaryRay.refractiveIndex.toFixed(4)) : 1.5,
        deviationAngleDeg: primaryRay ? parseFloat(primaryRay.deviationAngleDeg.toFixed(2)) : 0,
      };
    } else if (currentExperimentId === "enzyme_kinetics") {
      newPt = {
        time: parseFloat(simulationTime.toFixed(1)),
        substrateConc: parameters.substrateConcentration || 15,
        velocity: parseFloat(enzymeState.velocity.toFixed(2)),
        productAccumulated: parseFloat(enzymeState.productAccumulated.toFixed(1)),
        invSubstrate: parseFloat((1 / (parameters.substrateConcentration || 15)).toFixed(3)),
        invVelocity: parseFloat((1 / Math.max(0.1, enzymeState.velocity)).toFixed(3)),
      };
    } else {
      newPt = {
        time: parseFloat(bacterialState.timeHours.toFixed(1)),
        timeHours: parseFloat(bacterialState.timeHours.toFixed(1)),
        opticalDensityOD600: parseFloat(bacterialState.opticalDensityOD600.toFixed(3)),
        cellCount: Math.round(bacterialState.cellCount),
        zoneDiameterMM: parseFloat(bacterialState.zoneOfInhibitionDiameterMM.toFixed(1)),
      };
    }
    setDataPoints((prev) => [...prev, newPt]);
  };

  // Commit current trial to notebook
  const handleSaveCurrentTrial = (notes: string) => {
    let summary: Record<string, any> = {};
    if (currentExperimentId === "titration") {
      summary = {
        "Titrant Vol": `${titrationState.addedTitrantVolume.toFixed(2)} mL`,
        "Final pH": titrationState.pH.toFixed(2),
        "Equivalence Vol": `${titrationState.equivalenceVolume.toFixed(1)} mL`,
      };
    } else if (currentExperimentId === "reaction_kinetics") {
      summary = {
        "Gas Evolved": `${gasState.gasVolumeML.toFixed(1)} mL`,
        "Reaction Progress": `${gasState.reactionProgressPct.toFixed(1)}%`,
      };
    } else if (currentExperimentId === "projectile") {
      summary = {
        "Impact Range": `${projectileState.x.toFixed(1)} m`,
        "Max Alt": `${projectileState.y.toFixed(1)} m`,
        "Hit Target": projectileState.hitTarget ? "YES" : "NO",
      };
    } else if (currentExperimentId === "optics_prism") {
      summary = {
        "Rays Traced": prismRays.length,
        "Material": parameters.prismMaterial || "flint_glass",
      };
    } else if (currentExperimentId === "enzyme_kinetics") {
      summary = {
        "Apparent Vmax": `${enzymeState.apparentVmax.toFixed(1)} μmol/min`,
        "Apparent Km": `${enzymeState.apparentKm.toFixed(2)} mM`,
      };
    } else {
      summary = {
        "OD600": bacterialState.opticalDensityOD600.toFixed(3),
        "Zone of Inhibition": `${bacterialState.zoneOfInhibitionDiameterMM.toFixed(1)} mm`,
      };
    }

    const newTrial: LabTrial = {
      id: `trial_${Date.now()}`,
      trialNumber: trials.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      experimentId: currentExperimentId,
      experimentTitle: currentExperiment.title,
      parameters: { ...parameters },
      summaryMetrics: summary,
      dataPointsCount: dataPoints.length,
      data: [...dataPoints],
      notes,
    };

    setTrials((prev) => [...prev, newTrial]);
  };

  const handleDeleteTrial = (id: string) => {
    setTrials((prev) => prev.filter((t) => t.id !== id));
  };

  // Prepare Live Metrics for Ribbon & Dashboard
  const liveMetrics = useMemo(() => {
    if (currentExperimentId === "titration") {
      return {
        label1: "Sensor pH",
        value1: titrationState.pH.toFixed(2),
        unit1: "pH",
        label2: "Burette Vol",
        value2: titrationState.addedTitrantVolume.toFixed(2),
        unit2: "mL",
        label3: "Equivalence",
        value3: titrationState.isEquivalenceReached ? "REACHED" : `${titrationState.equivalenceVolume.toFixed(1)}`,
        unit3: "mL",
        label4: "Stirrer",
        value4: parameters.stirringSpeed ?? 400,
        unit4: "RPM",
      };
    } else if (currentExperimentId === "reaction_kinetics") {
      return {
        label1: "H₂ Gas Volume",
        value1: gasState.gasVolumeML.toFixed(1),
        unit1: "mL",
        label2: "Reaction Rate",
        value2: gasState.instantaneousRateML_s.toFixed(2),
        unit2: "mL/s",
        label3: "Pressure",
        value3: gasState.pressureKPa.toFixed(1),
        unit3: "kPa",
        label4: "Bath Temp",
        value4: parameters.temperature || 25,
        unit4: "°C",
      };
    } else if (currentExperimentId === "projectile") {
      return {
        label1: "Range (X)",
        value1: projectileState.x.toFixed(1),
        unit1: "m",
        label2: "Altitude (Y)",
        value2: projectileState.y.toFixed(1),
        unit2: "m",
        label3: "Total Energy",
        value3: projectileState.totalEnergy.toFixed(0),
        unit3: "J",
        label4: "Speed",
        value4: projectileState.speed.toFixed(1),
        unit4: "m/s",
      };
    } else if (currentExperimentId === "optics_prism") {
      const firstRay = prismRays[0];
      return {
        label1: "Refractive Index",
        value1: firstRay ? firstRay.refractiveIndex.toFixed(4) : "1.6200",
        unit1: "n",
        label2: "Deviation θ",
        value2: firstRay ? firstRay.deviationAngleDeg.toFixed(2) : "0.00",
        unit2: "deg",
        label3: "Wavelength",
        value3: parameters.wavelength || 532,
        unit3: "nm",
        label4: "Mode",
        value4: parameters.lightMode === "white" ? "Spectrum" : "Laser",
        unit4: "",
      };
    } else if (currentExperimentId === "enzyme_kinetics") {
      return {
        label1: "Rate (V)",
        value1: enzymeState.velocity.toFixed(2),
        unit1: "μmol/min",
        label2: "Apparent Km",
        value2: enzymeState.apparentKm.toFixed(2),
        unit2: "mM",
        label3: "Product [P]",
        value3: enzymeState.productAccumulated.toFixed(1),
        unit3: "μmol",
        label4: "Vmax",
        value4: enzymeState.apparentVmax.toFixed(1),
        unit4: "μmol/min",
      };
    } else {
      return {
        label1: "Absorbance OD₆₀₀",
        value1: bacterialState.opticalDensityOD600.toFixed(3),
        unit1: "OD",
        label2: "Growth Phase",
        value2: bacterialState.growthPhase,
        unit2: "",
        label3: "Inhibition Halo",
        value3: bacterialState.zoneOfInhibitionDiameterMM.toFixed(1),
        unit3: "mm",
        label4: "Incubation",
        value4: bacterialState.timeHours.toFixed(1),
        unit4: "hrs",
      };
    }
  }, [
    currentExperimentId,
    titrationState,
    gasState,
    projectileState,
    prismRays,
    enzymeState,
    bacterialState,
    parameters,
  ]);

  return (
    <div
      className={`flex flex-col w-screen h-screen ${
        isLight ? "bg-slate-100 text-slate-800" : "bg-slate-950 text-slate-100"
      } overflow-hidden select-none font-sans`}
    >
      {/* 1. Global Navigation & Top Bar */}
      <NavigationHeader
        currentDiscipline={currentDiscipline}
        onSelectDiscipline={handleSelectDiscipline}
        currentExperiment={currentExperiment}
        allExperiments={EXPERIMENTS_LIST}
        onSelectExperiment={handleSelectExperiment}
        onApplyPreset={handleApplyPreset}
        onOpenNotebook={() => setIsNotebookOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* 2. Middle Body: Left Control Station + Central 3D Canvas */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">
        {/* Left Side Parameter Control Station */}
        <LabControlsPanel
          experimentId={currentExperimentId}
          parameters={parameters}
          onParamChange={handleParamChange}
          isRunning={isRunning}
          onToggleRun={() => setIsRunning(!isRunning)}
          onReset={handleReset}
          onSingleDrop={handleSingleDrop}
          onBurstDispense={handleBurstDispense}
          onFireProjectile={handleFireProjectile}
        />

        {/* Central 3D Interactive Lab Simulation Viewport */}
        <main
          className={`flex-1 relative h-full ${
            isLight ? "bg-slate-200/40" : "bg-slate-950"
          } overflow-hidden`}
        >
          {currentDiscipline === "chemistry" && (
            <ChemistrySimulation
              experimentId={currentExperimentId as "titration" | "reaction_kinetics"}
              titrationState={titrationState}
              gasState={gasState}
              stirringSpeed={parameters.stirringSpeed ?? 400}
              temperature={parameters.temperature ?? 25}
              isDispensing={isRunning}
            />
          )}

          {currentDiscipline === "physics" && (
            <PhysicsSimulation
              experimentId={currentExperimentId as "projectile" | "optics_prism"}
              projectileState={projectileState}
              pastTrajectory={pastTrajectory}
              launchAngle={parameters.launchAngle || 45}
              targetDistance={parameters.targetDistance || 75}
              prismRayPaths={prismRays}
              lightMode={parameters.lightMode || "white"}
              incidentAngle={parameters.incidentAngle || 45}
            />
          )}

          {currentDiscipline === "biology" && (
            <BiologySimulation
              experimentId={currentExperimentId as "enzyme_kinetics" | "bacterial_growth"}
              enzymeState={enzymeState}
              bacterialState={bacterialState}
              substrateConc={parameters.substrateConcentration || 15}
              inhibitorType={parameters.inhibitorType || "none"}
              antibioticDose={parameters.antibioticDose || 20}
              gfpFluorescence={!!parameters.gfpFluorescence}
            />
          )}
        </main>
      </div>

      {/* 3. Bottom Real-Time Telemetry & Data Analysis Dashboard */}
      <DataAnalysisDashboard
        experimentId={currentExperimentId}
        dataPoints={dataPoints}
        liveMetrics={liveMetrics}
        onClearData={() => setDataPoints([])}
        onSnapshot={handleSnapshotPoint}
      />

      {/* 4. Modals & AI Scientist Drawer */}
      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        experiment={currentExperiment}
        parameters={parameters}
        measurements={liveMetrics}
        dataPoints={dataPoints}
        trials={trials}
      />

      <LabNotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        experiment={currentExperiment}
        trials={trials}
        onSaveCurrentTrial={handleSaveCurrentTrial}
        onDeleteTrial={handleDeleteTrial}
      />

      <ExperimentGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        experiment={currentExperiment}
      />
    </div>
  );
}
