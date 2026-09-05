import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { ThreeCanvasWrapper } from "./ThreeCanvasWrapper";
import { TitrationResult, GasReactionState } from "../../utils/physicsEngine";

interface ChemistrySimulationProps {
  experimentId: "titration" | "reaction_kinetics";
  titrationState?: TitrationResult;
  gasState?: GasReactionState;
  isDispensing?: boolean;
  stirringSpeed?: number;
  temperature?: number;
}

export const ChemistrySimulation: React.FC<ChemistrySimulationProps> = ({
  experimentId,
  titrationState,
  gasState,
  isDispensing = false,
  stirringSpeed = 400,
  temperature = 25,
}) => {
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const stirBarRef = useRef<THREE.Mesh | null>(null);
  const stopcockRef = useRef<THREE.Mesh | null>(null);
  const syringePlungerRef = useRef<THREE.Group | null>(null);
  const dropsGroupRef = useRef<THREE.Group | null>(null);
  const bubblesGroupRef = useRef<THREE.Points | null>(null);
  const bubblePositionsRef = useRef<Float32Array | null>(null);

  // Synchronize liquid color, volume, and mechanics
  useEffect(() => {
    if (experimentId === "titration" && titrationState && liquidMeshRef.current) {
      // Smooth color transition
      const material = liquidMeshRef.current.material as THREE.MeshPhysicalMaterial;
      material.color.setHex(titrationState.solutionHex);
      material.roughness = 0.05;
      material.transmission = 0.65;
      material.transparent = true;
      material.opacity = 0.85;

      // Scale height with volume: 25mL base to ~75mL
      const heightScale = Math.min(2.2, 0.6 + (titrationState.currentVolume / 75) * 1.4);
      liquidMeshRef.current.scale.set(1, heightScale, 1);
      liquidMeshRef.current.position.y = 0.15 + (heightScale * 0.7) / 2;
    }
  }, [titrationState, experimentId]);

  // Synchronize gas syringe plunger displacement
  useEffect(() => {
    if (experimentId === "reaction_kinetics" && gasState && syringePlungerRef.current) {
      // 0 to 100 mL maps to 0 to 3.2 units along X-axis
      const displacement = Math.min(3.6, (gasState.gasVolumeML / Math.max(10, gasState.maxTheoreticalVolumeML)) * 3.2);
      syringePlungerRef.current.position.x = displacement;
    }
  }, [gasState, experimentId]);

  const handleSceneReady = (scene: THREE.Scene) => {
    // 1. Lab Tabletop Surface
    const benchGeo = new THREE.BoxGeometry(14, 0.4, 8);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.2,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -0.2, 0);
    bench.receiveShadow = true;
    scene.add(bench);

    // Bench Edge Accent
    const edgeGeo = new THREE.BoxGeometry(14.05, 0.06, 8.05);
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.set(0, -0.01, 0);
    scene.add(edge);

    if (experimentId === "titration") {
      // ==================== TITRATION APPARATUS ====================
      // A. Magnetic Stirrer Base
      const stirrerBaseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.45, 32);
      const stirrerBaseMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.5,
        metalness: 0.6,
      });
      const stirrerBase = new THREE.Mesh(stirrerBaseGeo, stirrerBaseMat);
      stirrerBase.position.set(0, 0.225, 0);
      stirrerBase.castShadow = true;
      stirrerBase.receiveShadow = true;
      scene.add(stirrerBase);

      // Stirrer Ceramic Top Plate
      const plateGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.08, 32);
      const plateMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1 });
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.position.set(0, 0.48, 0);
      scene.add(plate);

      // B. Retort Stand
      const standBaseGeo = new THREE.BoxGeometry(2.4, 0.15, 3.2);
      const standMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
      const standBase = new THREE.Mesh(standBaseGeo, standMat);
      standBase.position.set(-1.8, 0.08, 0);
      standBase.castShadow = true;
      scene.add(standBase);

      const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, 7.5, 16);
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 });
      const rod = new THREE.Mesh(rodGeo, metalMat);
      rod.position.set(-1.8, 3.75, 0);
      rod.castShadow = true;
      scene.add(rod);

      // Clamp arm holding burette
      const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.9, 16);
      const arm = new THREE.Mesh(armGeo, metalMat);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(-0.9, 5.0, 0);
      scene.add(arm);

      const clampRingGeo = new THREE.TorusGeometry(0.26, 0.04, 12, 24);
      const clampRing = new THREE.Mesh(clampRingGeo, metalMat);
      clampRing.rotation.x = Math.PI / 2;
      clampRing.position.set(0, 5.0, 0);
      scene.add(clampRing);

      // C. Glass Burette Tube
      const buretteGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.2, 24, 1, true);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.92,
        roughness: 0.05,
        ior: 1.52,
        transparent: true,
        opacity: 0.4,
      });
      const burette = new THREE.Mesh(buretteGeo, glassMat);
      burette.position.set(0, 5.2, 0);
      scene.add(burette);

      // Burette Liquid (Titrant NaOH)
      const titrantGeo = new THREE.CylinderGeometry(0.16, 0.16, 3.2, 24);
      const titrantMat = new THREE.MeshPhysicalMaterial({
        color: 0xcfe2ff,
        transmission: 0.8,
        roughness: 0.1,
        transparent: true,
        opacity: 0.6,
      });
      const titrant = new THREE.Mesh(titrantGeo, titrantMat);
      titrant.position.set(0, 5.0, 0);
      scene.add(titrant);

      // Burette Stopcock Valve
      const stopcockGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.5, 16);
      const valveMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      const stopcock = new THREE.Mesh(stopcockGeo, valveMat);
      stopcock.rotation.x = Math.PI / 2;
      stopcock.position.set(0, 3.1, 0);
      scene.add(stopcock);
      stopcockRef.current = stopcock;

      // Burette Tip Nozzle
      const tipGeo = new THREE.ConeGeometry(0.1, 0.45, 16);
      tipGeo.rotateX(Math.PI);
      const tip = new THREE.Mesh(tipGeo, glassMat);
      tip.position.set(0, 2.85, 0);
      scene.add(tip);

      // D. Erlenmeyer Flask
      const flaskGroup = new THREE.Group();
      flaskGroup.position.set(0, 0.52, 0);

      // Conical body
      const coneGeo = new THREE.ConeGeometry(1.2, 1.8, 32, 1, true);
      const flaskCone = new THREE.Mesh(coneGeo, glassMat);
      flaskCone.position.y = 0.9;
      flaskGroup.add(flaskCone);

      // Flask Neck
      const neckGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 24, 1, true);
      const flaskNeck = new THREE.Mesh(neckGeo, glassMat);
      flaskNeck.position.y = 1.9;
      flaskGroup.add(flaskNeck);

      // Flask Rim
      const rimGeo = new THREE.TorusGeometry(0.37, 0.035, 12, 24);
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, glassMat);
      rim.position.y = 2.3;
      flaskGroup.add(rim);

      // Liquid in flask
      const liquidGeo = new THREE.CylinderGeometry(0.35, 1.1, 0.7, 32);
      const liquidMat = new THREE.MeshPhysicalMaterial({
        color: 0xdbeafe,
        transmission: 0.7,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85,
      });
      const liquid = new THREE.Mesh(liquidGeo, liquidMat);
      liquid.position.y = 0.35;
      flaskGroup.add(liquid);
      liquidMeshRef.current = liquid;

      // Magnetic Stir Bar
      const stirBarGeo = new THREE.CapsuleGeometry(0.06, 0.35, 8, 12);
      stirBarGeo.rotateZ(Math.PI / 2);
      const stirBarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
      const stirBar = new THREE.Mesh(stirBarGeo, stirBarMat);
      stirBar.position.y = 0.06;
      flaskGroup.add(stirBar);
      stirBarRef.current = stirBar;

      scene.add(flaskGroup);

      // E. pH Probe dipped into flask
      const probeCableGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.8, 12);
      const probeCable = new THREE.Mesh(probeCableGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      probeCable.position.set(0.45, 2.5, 0.2);
      scene.add(probeCable);

      const probeTipGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.4, 16);
      const probeTipMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.2 });
      const probeTip = new THREE.Mesh(probeTipGeo, probeTipMat);
      probeTip.rotation.z = -0.15;
      probeTip.position.set(0.38, 1.4, 0.1);
      scene.add(probeTip);

      // Droplets Group
      const dropsGroup = new THREE.Group();
      scene.add(dropsGroup);
      dropsGroupRef.current = dropsGroup;
    } else {
      // ==================== REACTION KINETICS APPARATUS ====================
      // A. Reaction Flask on heating base
      const flaskGeo = new THREE.SphereGeometry(1.2, 32, 24);
      flaskGeo.scale(1, 1.1, 1);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.9,
        roughness: 0.05,
        transparent: true,
        opacity: 0.4,
      });
      const reactFlask = new THREE.Mesh(flaskGeo, glassMat);
      reactFlask.position.set(-2.5, 1.3, 0);
      scene.add(reactFlask);

      // Rubber Stopper
      const stopperGeo = new THREE.CylinderGeometry(0.38, 0.3, 0.5, 24);
      const stopperMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
      const stopper = new THREE.Mesh(stopperGeo, stopperMat);
      stopper.position.set(-2.5, 2.45, 0);
      scene.add(stopper);

      // Acid Liquid inside
      const acidLiquidGeo = new THREE.SphereGeometry(1.12, 32, 16, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.6);
      const acidLiquidMat = new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        transmission: 0.8,
        transparent: true,
        opacity: 0.75,
      });
      const acidLiquid = new THREE.Mesh(acidLiquidGeo, acidLiquidMat);
      acidLiquid.position.set(-2.5, 1.25, 0);
      scene.add(acidLiquid);

      // Zinc granules at the bottom
      const granulesGroup = new THREE.Group();
      for (let i = 0; i < 18; i++) {
        const size = 0.07 + Math.random() * 0.08;
        const granGeo = new THREE.DodecahedronGeometry(size, 0);
        const granMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.4 });
        const gran = new THREE.Mesh(granGeo, granMat);
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.random() * 0.55;
        gran.position.set(-2.5 + Math.cos(angle) * rad, 0.4 + Math.random() * 0.15, Math.sin(angle) * rad);
        granulesGroup.add(gran);
      }
      scene.add(granulesGroup);

      // B. Glass Delivery Tube connecting Flask to Syringe
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.5, 2.7, 0),
        new THREE.Vector3(-2.5, 3.4, 0),
        new THREE.Vector3(-0.5, 3.4, 0),
        new THREE.Vector3(0.8, 2.5, 0),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.06, 12, false);
      const tube = new THREE.Mesh(tubeGeo, glassMat);
      scene.add(tube);

      // C. 3D Gas Syringe Assembly
      const syringeAssembly = new THREE.Group();
      syringeAssembly.position.set(1.2, 2.5, 0);

      // Syringe Barrel (Stationary Glass Tube)
      const barrelGeo = new THREE.CylinderGeometry(0.42, 0.42, 4.0, 24, 1, true);
      barrelGeo.rotateZ(Math.PI / 2);
      const barrel = new THREE.Mesh(barrelGeo, glassMat);
      barrel.position.x = 2.0;
      syringeAssembly.add(barrel);

      // Graduations lines
      for (let g = 0; g <= 10; g++) {
        const ringGeo = new THREE.TorusGeometry(0.425, 0.01, 8, 24);
        ringGeo.rotateY(Math.PI / 2);
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        ring.position.x = 0.4 + g * 0.32;
        syringeAssembly.add(ring);
      }

      // Syringe Plunger (Movable Group)
      const plungerGroup = new THREE.Group();
      // Rubber Plunger Head
      const plungerHeadGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 24);
      plungerHeadGeo.rotateZ(Math.PI / 2);
      const plungerHeadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      const plungerHead = new THREE.Mesh(plungerHeadGeo, plungerHeadMat);
      plungerGroup.add(plungerHead);

      // Plunger Shaft
      const shaftGeo = new THREE.BoxGeometry(3.6, 0.18, 0.18);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3 });
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.position.x = 1.8;
      plungerGroup.add(shaft);

      // Plunger Thumb Rest
      const thumbGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 24);
      thumbGeo.rotateZ(Math.PI / 2);
      const thumb = new THREE.Mesh(thumbGeo, shaftMat);
      thumb.position.x = 3.6;
      plungerGroup.add(thumb);

      plungerGroup.position.x = 0.4;
      syringeAssembly.add(plungerGroup);
      syringePlungerRef.current = plungerGroup;

      scene.add(syringeAssembly);

      // D. Effervescence Bubbles Particle System
      const bubbleCount = 75;
      const bubblePositions = new Float32Array(bubbleCount * 3);
      for (let b = 0; b < bubbleCount; b++) {
        bubblePositions[b * 3] = -2.5 + (Math.random() - 0.5) * 0.7;
        bubblePositions[b * 3 + 1] = 0.5 + Math.random() * 1.2;
        bubblePositions[b * 3 + 2] = (Math.random() - 0.5) * 0.7;
      }
      const bubbleGeo = new THREE.BufferGeometry();
      bubbleGeo.setAttribute("position", new THREE.BufferAttribute(bubblePositions, 3));
      const bubbleMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.08,
        transparent: true,
        opacity: 0.7,
      });
      const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
      scene.add(bubbles);
      bubblesGroupRef.current = bubbles;
      bubblePositionsRef.current = bubblePositions;
    }

    // Animation hook inside render loop
    let lastDropTime = 0;
    const dropGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const dropMat = new THREE.MeshPhysicalMaterial({ color: 0xbae6fd, transmission: 0.9, transparent: true });

    const activeDrops: THREE.Mesh[] = [];

    const frameListener = () => {
      // 1. Stir bar spinning
      if (stirBarRef.current && stirringSpeed > 0) {
        stirBarRef.current.rotation.y += (stirringSpeed / 60) * 0.08;
      }

      // 2. Burette drops when dispensing
      if (experimentId === "titration" && isDispensing && dropsGroupRef.current) {
        const now = performance.now();
        if (now - lastDropTime > 280) {
          lastDropTime = now;
          const drop = new THREE.Mesh(dropGeo, dropMat);
          drop.position.set(0, 2.8, 0);
          dropsGroupRef.current.add(drop);
          activeDrops.push(drop);
        }

        if (stopcockRef.current) {
          stopcockRef.current.rotation.z = Math.PI / 4; // Open valve angle
        }
      } else if (stopcockRef.current) {
        stopcockRef.current.rotation.z = 0; // Closed valve
      }

      // Animate falling drops
      for (let i = activeDrops.length - 1; i >= 0; i--) {
        const drop = activeDrops[i];
        drop.position.y -= 0.12;
        if (drop.position.y <= 0.85) {
          if (dropsGroupRef.current) dropsGroupRef.current.remove(drop);
          activeDrops.splice(i, 1);
        }
      }

      // 3. Bubbles rising in reaction kinetics
      if (bubblesGroupRef.current && bubblePositionsRef.current) {
        const positions = bubblePositionsRef.current;
        const rateFactor = gasState ? Math.max(0.2, gasState.instantaneousRateML_s * 2.5) : 0.5;
        for (let b = 0; b < positions.length / 3; b++) {
          positions[b * 3 + 1] += 0.02 * rateFactor;
          if (positions[b * 3 + 1] > 2.1) {
            positions[b * 3 + 1] = 0.45;
            positions[b * 3] = -2.5 + (Math.random() - 0.5) * 0.6;
            positions[b * 3 + 2] = (Math.random() - 0.5) * 0.6;
          }
        }
        bubblesGroupRef.current.geometry.attributes.position.needsUpdate = true;
      }
    };

    const interval = setInterval(frameListener, 16);

    return () => {
      clearInterval(interval);
      activeDrops.forEach((d) => d.geometry.dispose());
    };
  };

  return (
    <div className="relative w-full h-full">
      <ThreeCanvasWrapper
        onSceneReady={handleSceneReady}
        cameraPosition={experimentId === "titration" ? [0, 4.5, 7.5] : [0, 4.0, 8.5]}
        cameraTarget={experimentId === "titration" ? [0, 2.5, 0] : [0, 1.8, 0]}
      />

      {/* Floating Real-time HUD Badges on 3D viewport */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-none">
        {experimentId === "titration" && titrationState && (
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl font-mono text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">pH Level</span>
              <span
                className="text-lg font-bold"
                style={{
                  color:
                    titrationState.pH < 6
                      ? "#f87171"
                      : titrationState.pH <= 8
                      ? "#4ade80"
                      : "#60a5fa",
                }}
              >
                {titrationState.pH.toFixed(2)}
              </span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Titrant Added</span>
              <span className="text-white font-semibold">{titrationState.addedTitrantVolume.toFixed(2)} mL</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Equivalence</span>
              <span className={titrationState.isEquivalenceReached ? "text-emerald-400 font-bold" : "text-slate-300"}>
                {titrationState.equivalenceVolume.toFixed(1)} mL
              </span>
            </div>
          </div>
        )}

        {experimentId === "reaction_kinetics" && gasState && (
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl font-mono text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">H₂ Evolved</span>
              <span className="text-cyan-400 text-lg font-bold">{gasState.gasVolumeML.toFixed(1)} mL</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Rate (dV/dt)</span>
              <span className="text-amber-400 font-semibold">{gasState.instantaneousRateML_s.toFixed(2)} mL/s</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Syringe Progress</span>
              <span className="text-white font-semibold">{gasState.reactionProgressPct.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
