import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { ThreeCanvasWrapper } from "./ThreeCanvasWrapper";
import { EnzymeKineticsState, BacterialGrowthState, PhotosynthesisState } from "../../utils/physicsEngine";

interface BiologySimulationProps {
  experimentId: "enzyme_kinetics" | "bacterial_growth" | "photosynthesis";
  enzymeState?: EnzymeKineticsState;
  bacterialState?: BacterialGrowthState;
  photosynthesisState?: PhotosynthesisState;
  substrateConc?: number;
  inhibitorType?: string;
  antibioticDose?: number;
  gfpFluorescence?: boolean;
  lightColor?: "white" | "blue" | "red" | "green";
  lightIntensity?: number;
}

export const BiologySimulation: React.FC<BiologySimulationProps> = ({
  experimentId,
  enzymeState,
  bacterialState,
  photosynthesisState,
  substrateConc = 15,
  inhibitorType = "none",
  antibioticDose = 20,
  gfpFluorescence = false,
  lightColor = "white",
  lightIntensity = 500,
}) => {
  const enzymeGroupRef = useRef<THREE.Group | null>(null);
  const substrateGroupRef = useRef<THREE.Group | null>(null);
  const bacteriaGroupRef = useRef<THREE.Group | null>(null);
  const zoneMeshRef = useRef<THREE.Mesh | null>(null);
  const cuvetteLiquidRef = useRef<THREE.Mesh | null>(null);

  // Photosynthesis Refs
  const photoBubblesRef = useRef<THREE.Points | null>(null);
  const photoBubblePosRef = useRef<Float32Array | null>(null);
  const lampLightRef = useRef<THREE.SpotLight | null>(null);
  const lampBeamMeshRef = useRef<THREE.Mesh | null>(null);

  // Update cuvette absorbance color and enzyme pocket glow
  useEffect(() => {
    if (experimentId === "enzyme_kinetics" && enzymeState && cuvetteLiquidRef.current) {
      const mat = cuvetteLiquidRef.current.material as THREE.MeshStandardMaterial;
      // As product accumulates, absorbance turns amber/deep gold
      const t = Math.min(1.0, enzymeState.productAccumulated / 40);
      const r = Math.round(230 - t * 40);
      const g = Math.round(210 - t * 110);
      const b = Math.round(140 - t * 120);
      mat.color.setRGB(r / 255, g / 255, b / 255);
      mat.opacity = 0.4 + t * 0.55;
    }
  }, [enzymeState, experimentId]);

  // Update Kirby-Bauer zone of inhibition diameter and bacterial fluorescence
  useEffect(() => {
    if (experimentId === "bacterial_growth" && bacterialState) {
      if (zoneMeshRef.current) {
        // Diameter in mm to 3D world units (scale: 10mm = 1 unit)
        const radius = (bacterialState.zoneOfInhibitionDiameterMM / 2) * 0.1;
        zoneMeshRef.current.scale.set(radius, 1, radius);
        zoneMeshRef.current.visible = bacterialState.zoneOfInhibitionDiameterMM > 0;
      }

      // Update bacteria material color for GFP mode
      if (bacteriaGroupRef.current) {
        bacteriaGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshStandardMaterial;
            if (gfpFluorescence) {
              mat.color.setHex(0x22c55e); // Neon Green GFP
              mat.emissive.setHex(0x16a34a);
              mat.emissiveIntensity = 0.6;
            } else {
              mat.color.setHex(0xfef08a); // Natural pale cream/amber agar colony
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0.0;
            }
          }
        });
      }
    }
  }, [bacterialState, gfpFluorescence, experimentId]);

  // Update Photosynthesis Lamp Color and Beam
  useEffect(() => {
    if (experimentId === "photosynthesis") {
      let colorHex = 0xffffff;
      if (lightColor === "blue") colorHex = 0x3b82f6;
      else if (lightColor === "red") colorHex = 0xef4444;
      else if (lightColor === "green") colorHex = 0x22c55e;

      if (lampLightRef.current) {
        lampLightRef.current.color.setHex(colorHex);
        lampLightRef.current.intensity = Math.max(0.2, (lightIntensity / 1000) * 4.0);
      }

      if (lampBeamMeshRef.current) {
        const mat = lampBeamMeshRef.current.material as THREE.MeshBasicMaterial;
        mat.color.setHex(colorHex);
        mat.opacity = Math.max(0.04, Math.min(0.4, (lightIntensity / 1000) * 0.35));
      }
    }
  }, [lightColor, lightIntensity, experimentId]);

  const handleSceneReady = (scene: THREE.Scene) => {
    if (experimentId === "enzyme_kinetics") {
      // ==================== 3D ENZYME MOLECULAR VIEWPORT ====================
      // A. Dark molecular viewport pedestal
      const pedestalGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.4, 48);
      const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.7 });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = -0.2;
      pedestal.receiveShadow = true;
      scene.add(pedestal);

      // B. 3D Macromolecular Enzyme (Multi-Subunit Globular Protein with Active Site Pocket)
      const enzymeGroup = new THREE.Group();
      enzymeGroup.position.set(-0.6, 1.8, 0);

      // Core protein subunits (clusters of organic overlapping spheres)
      const subunitColors = [0x38bdf8, 0x6366f1, 0x0ea5e9, 0x818cf8, 0x0284c7];
      const subunitPositions = [
        [-0.7, 0.2, 0.3],
        [0.8, 0.4, -0.2],
        [-0.3, -0.6, 0.4],
        [0.5, -0.5, 0.3],
        [0.1, 0.8, -0.4],
        [-0.8, -0.2, -0.5],
        [0.7, 0.1, 0.6],
      ];

      subunitPositions.forEach(([x, y, z], i) => {
        const radius = 0.65 + (i % 3) * 0.12;
        const sphereGeo = new THREE.SphereGeometry(radius, 24, 24);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: subunitColors[i % subunitColors.length],
          roughness: 0.25,
          metalness: 0.2,
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(x, y, z);
        enzymeGroup.add(sphere);
      });

      // Active Site Catalytic Pocket (Ring with glowing interior)
      const pocketRingGeo = new THREE.TorusGeometry(0.5, 0.12, 16, 32);
      const pocketMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.4 });
      const pocket = new THREE.Mesh(pocketRingGeo, pocketMat);
      pocket.rotation.y = Math.PI / 4;
      pocket.position.set(0.1, 0.1, 0.7);
      enzymeGroup.add(pocket);

      scene.add(enzymeGroup);
      enzymeGroupRef.current = enzymeGroup;

      // C. Substrate & Inhibitor Molecules Group (Floating Brownian Motion)
      const substrateGroup = new THREE.Group();
      const substrateCount = Math.min(30, Math.round(substrateConc * 1.2));

      for (let s = 0; s < substrateCount; s++) {
        // Molecule (dimer or trimer spheres)
        const molGroup = new THREE.Group();
        const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 }); // Green substrate
        const s1 = new THREE.Mesh(sphereGeo, sphereMat);
        const s2 = new THREE.Mesh(sphereGeo, sphereMat);
        s2.position.x = 0.16;
        molGroup.add(s1);
        molGroup.add(s2);

        // Random starting position in cloud
        const radius = 2.0 + Math.random() * 2.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        molGroup.position.set(
          -0.6 + radius * Math.sin(phi) * Math.cos(theta),
          1.8 + radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
        substrateGroup.add(molGroup);
      }

      // If competitive inhibitor present, add orange inhibitor molecules
      if (inhibitorType !== "none") {
        for (let inH = 0; inH < 8; inH++) {
          const inGroup = new THREE.Group();
          const octGeo = new THREE.OctahedronGeometry(0.16);
          const octMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
          const oct = new THREE.Mesh(octGeo, octMat);
          inGroup.add(oct);

          inGroup.position.set(
            -0.6 + (Math.random() - 0.5) * 3.5,
            1.8 + (Math.random() - 0.5) * 3.5,
            (Math.random() - 0.5) * 3.5
          );
          substrateGroup.add(inGroup);
        }
      }

      scene.add(substrateGroup);
      substrateGroupRef.current = substrateGroup;

      // D. Spectrophotometer Cuvette Display beside Enzyme
      const cuvetteGroup = new THREE.Group();
      cuvetteGroup.position.set(3.4, 1.2, 0);

      // Glass Cuvette Body
      const cuvetteBoxGeo = new THREE.BoxGeometry(0.9, 2.4, 0.9);
      const cuvetteGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.9,
        roughness: 0.05,
        transparent: true,
        opacity: 0.3,
      });
      const cuvetteMesh = new THREE.Mesh(cuvetteBoxGeo, cuvetteGlassMat);
      cuvetteGroup.add(cuvetteMesh);

      // Liquid inside cuvette
      const liquidGeo = new THREE.BoxGeometry(0.8, 2.1, 0.8);
      const liquidMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.45,
      });
      const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
      liquidMesh.position.y = -0.1;
      cuvetteGroup.add(liquidMesh);
      cuvetteLiquidRef.current = liquidMesh;

      scene.add(cuvetteGroup);
    } else if (experimentId === "bacterial_growth") {
      // ==================== 3D BACTERIAL CULTURE & PETRI DISH ====================
      // A. Stereomicroscope Base Stage
      const stageGeo = new THREE.CylinderGeometry(4.8, 5.0, 0.35, 48);
      const stageMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 });
      const stage = new THREE.Mesh(stageGeo, stageMat);
      stage.position.y = -0.18;
      scene.add(stage);

      // B. Transparent Glass/Plastic Petri Dish
      const dishGroup = new THREE.Group();
      dishGroup.position.set(0, 0.2, 0);

      // Outer rim
      const dishGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.92,
        roughness: 0.05,
        transparent: true,
        opacity: 0.35,
      });
      const rimGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.6, 48, 1, true);
      const rim = new THREE.Mesh(rimGeo, dishGlassMat);
      dishGroup.add(rim);

      // Dish Base Bottom
      const baseGeo = new THREE.CylinderGeometry(3.55, 3.55, 0.05, 48);
      const baseMesh = new THREE.Mesh(baseGeo, dishGlassMat);
      baseMesh.position.y = -0.28;
      dishGroup.add(baseMesh);

      // Agar Gel Medium (Nutrient Amber Layer)
      const agarGeo = new THREE.CylinderGeometry(3.52, 3.52, 0.22, 48);
      const agarMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.3,
        metalness: 0.05,
      });
      const agar = new THREE.Mesh(agarGeo, agarMat);
      agar.position.y = -0.18;
      dishGroup.add(agar);

      // C. Central Antibiotic Paper Disc
      const discGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 24);
      const discMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.set(0, -0.05, 0);
      dishGroup.add(disc);

      // D. Zone of Inhibition (Circular Translucent Halo)
      const zoneGeo = new THREE.CylinderGeometry(1, 1, 0.03, 36);
      const zoneMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        roughness: 0.2,
      });
      const zoneMesh = new THREE.Mesh(zoneGeo, zoneMat);
      zoneMesh.position.set(0, -0.06, 0);
      dishGroup.add(zoneMesh);
      zoneMeshRef.current = zoneMesh;

      // E. Bacterial Colonies on Agar
      const bacteriaGroup = new THREE.Group();
      const numColonies = 60;

      for (let c = 0; c < numColonies; c++) {
        // Random placement on dish
        const radius = 0.7 + Math.sqrt(Math.random()) * 2.6;
        const angle = Math.random() * Math.PI * 2;
        const posX = Math.cos(angle) * radius;
        const posZ = Math.sin(angle) * radius;

        // Colony size variation
        const colonySize = 0.08 + Math.random() * 0.14;
        const colGeo = new THREE.SphereGeometry(colonySize, 12, 10);
        colGeo.scale(1.2, 0.4, 1.2); // flatten like a lawn colony
        const colMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          roughness: 0.4,
        });
        const colony = new THREE.Mesh(colGeo, colMat);
        colony.position.set(posX, -0.06, posZ);
        bacteriaGroup.add(colony);
      }

      dishGroup.add(bacteriaGroup);
      bacteriaGroupRef.current = bacteriaGroup;

      scene.add(dishGroup);
    } else if (experimentId === "photosynthesis") {
      // ==================== PHOTOSYNTHESIS WATER APPARATUS ====================
      const photoGroup = new THREE.Group();

      // Tabletop
      const benchGeo = new THREE.BoxGeometry(10, 0.3, 7);
      const benchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
      const bench = new THREE.Mesh(benchGeo, benchMat);
      bench.position.set(0, -0.15, 0);
      photoGroup.add(bench);

      // Glass Beaker
      const beakerGeo = new THREE.CylinderGeometry(1.4, 1.4, 3.2, 32, 1, true);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.94,
        roughness: 0.05,
        ior: 1.5,
        transparent: true,
        opacity: 0.35,
      });
      const beaker = new THREE.Mesh(beakerGeo, glassMat);
      beaker.position.set(0, 1.6, 0);
      photoGroup.add(beaker);

      // Beaker bottom plate
      const bottomGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.1, 32);
      const bottom = new THREE.Mesh(bottomGeo, glassMat);
      bottom.position.set(0, 0.05, 0);
      photoGroup.add(bottom);

      // Water Liquid inside beaker
      const waterGeo = new THREE.CylinderGeometry(1.36, 1.36, 2.9, 32);
      const waterMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.88,
        roughness: 0.1,
        transparent: true,
        opacity: 0.35,
      });
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.position.set(0, 1.45, 0);
      photoGroup.add(water);

      // Submerged Aquatic Plant (Elodea sprig)
      const plantGroup = new THREE.Group();
      // Main central stem
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 16);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(0, 1.0, 0);
      plantGroup.add(stem);

      // Whorls of dark green leaves
      const leafGeo = new THREE.ConeGeometry(0.18, 0.5, 5);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
      for (let h = 0.3; h <= 1.7; h += 0.28) {
        for (let a = 0; a < 4; a++) {
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          const ang = (a * Math.PI) / 2 + h * 1.5;
          leaf.position.set(Math.cos(ang) * 0.22, h, Math.sin(ang) * 0.22);
          leaf.rotation.z = Math.cos(ang) * 0.7;
          leaf.rotation.x = -Math.sin(ang) * 0.7;
          plantGroup.add(leaf);
        }
      }
      photoGroup.add(plantGroup);

      // Inverted Glass Funnel (covering the plant)
      const coneGeo = new THREE.ConeGeometry(1.2, 1.1, 24, 1, true);
      const funnelCone = new THREE.Mesh(coneGeo, glassMat);
      funnelCone.rotation.x = Math.PI;
      funnelCone.position.set(0, 1.1, 0);
      photoGroup.add(funnelCone);

      // Funnel Stem (pointing up)
      const fStemGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 16, 1, true);
      const fStem = new THREE.Mesh(fStemGeo, glassMat);
      fStem.position.set(0, 2.1, 0);
      photoGroup.add(fStem);

      // Inverted Test Tube Collecting Gas
      const tubeGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.6, 20, 1, true);
      const tube = new THREE.Mesh(tubeGeo, glassMat);
      tube.position.set(0, 2.7, 0);
      photoGroup.add(tube);

      // Dissolved Oxygen Sensor Probe
      const probeGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 12);
      const probeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
      const probe = new THREE.Mesh(probeGeo, probeMat);
      probe.rotation.z = -0.35;
      probe.position.set(0.9, 1.9, 0.3);
      photoGroup.add(probe);

      // Laboratory Gooseneck Illumination Lamp
      const lampStandGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8, 16);
      const lampStand = new THREE.Mesh(lampStandGeo, new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
      lampStand.position.set(-3.2, 1.9, 0);
      photoGroup.add(lampStand);

      // Lamp Hood
      const hoodGeo = new THREE.ConeGeometry(0.65, 0.8, 20, 1, true);
      const hoodMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
      const hood = new THREE.Mesh(hoodGeo, hoodMat);
      hood.rotation.z = -Math.PI / 2.8;
      hood.position.set(-2.4, 2.6, 0);
      photoGroup.add(hood);

      // Spotlight shining on beaker
      const spotLight = new THREE.SpotLight(0xffffff, 2.5);
      spotLight.position.set(-2.4, 2.6, 0);
      spotLight.target = beaker;
      spotLight.angle = 0.55;
      spotLight.penumbra = 0.4;
      photoGroup.add(spotLight);
      lampLightRef.current = spotLight;

      // Visual Light Cone Mesh
      const beamGeo = new THREE.ConeGeometry(1.6, 3.2, 24, 1, true);
      beamGeo.translate(0, -1.6, 0);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.set(-2.4, 2.6, 0);
      beamMesh.lookAt(0, 1.6, 0);
      beamMesh.rotateX(-Math.PI / 2);
      photoGroup.add(beamMesh);
      lampBeamMeshRef.current = beamMesh;

      // Rising Oxygen Bubble Particles (stream from stem into tube)
      const numBubbles = 45;
      const bubblePositions = new Float32Array(numBubbles * 3);
      for (let i = 0; i < numBubbles; i++) {
        bubblePositions[i * 3] = (Math.random() - 0.5) * 0.1;
        bubblePositions[i * 3 + 1] = 1.6 + Math.random() * 1.8;
        bubblePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      }
      const bGeo = new THREE.BufferGeometry();
      bGeo.setAttribute("position", new THREE.BufferAttribute(bubblePositions, 3));
      const bMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.07,
        transparent: true,
        opacity: 0.85,
      });
      const bubbles = new THREE.Points(bGeo, bMat);
      photoGroup.add(bubbles);
      photoBubblesRef.current = bubbles;
      photoBubblePosRef.current = bubblePositions;

      scene.add(photoGroup);
    }

    // Animation Loop Hook (Brownian Motion & Bubbles)
    const interval = setInterval(() => {
      // Rotate enzyme slowly
      if (enzymeGroupRef.current) {
        enzymeGroupRef.current.rotation.y += 0.003;
        enzymeGroupRef.current.rotation.x = Math.sin(performance.now() * 0.0008) * 0.08;
      }

      // Jiggle substrate molecules with Brownian motion
      if (substrateGroupRef.current) {
        substrateGroupRef.current.children.forEach((mol) => {
          mol.position.x += (Math.random() - 0.5) * 0.015;
          mol.position.y += (Math.random() - 0.5) * 0.015;
          mol.position.z += (Math.random() - 0.5) * 0.015;
          mol.rotation.x += 0.02;
          mol.rotation.y += 0.015;
        });
      }

      // Rise photosynthesis bubbles
      if (photoBubblesRef.current && photoBubblePosRef.current && photosynthesisState) {
        const positions = photoBubblePosRef.current;
        const speed = Math.max(0.004, (photosynthesisState.bubbleRatePerMin / 60) * 0.025);
        for (let b = 0; b < positions.length / 3; b++) {
          positions[b * 3 + 1] += speed;
          if (positions[b * 3 + 1] > 3.4) {
            positions[b * 3 + 1] = 1.7;
            positions[b * 3] = (Math.random() - 0.5) * 0.08;
            positions[b * 3 + 2] = (Math.random() - 0.5) * 0.08;
          }
        }
        photoBubblesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }, 20);

    return () => clearInterval(interval);
  };

  return (
    <div className="relative w-full h-full">
      <ThreeCanvasWrapper
        key={experimentId}
        onSceneReady={handleSceneReady}
        cameraPosition={
          experimentId === "enzyme_kinetics"
            ? [0, 4.0, 7.0]
            : experimentId === "photosynthesis"
            ? [0, 2.8, 6.8]
            : [0, 7.5, 0.01]
        }
        cameraTarget={
          experimentId === "enzyme_kinetics"
            ? [0, 1.6, 0]
            : experimentId === "photosynthesis"
            ? [0, 1.6, 0]
            : [0, 0, 0]
        }
      />

      {/* Real-Time Biology Telemetry HUD */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-none">
        {experimentId === "enzyme_kinetics" && enzymeState && (
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl font-mono text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Velocity (V)</span>
              <span className="text-emerald-400 text-lg font-bold">
                {enzymeState.velocity.toFixed(1)} <span className="text-[10px] font-normal">μmol/min</span>
              </span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Apparent Km</span>
              <span className="text-cyan-400 font-semibold">{enzymeState.apparentKm.toFixed(2)} mM</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Product [P]</span>
              <span className="text-amber-400 font-semibold">{enzymeState.productAccumulated.toFixed(1)} μmol</span>
            </div>
          </div>
        )}

        {experimentId === "bacterial_growth" && bacterialState && (
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl font-mono text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Optical Density OD₆₀₀</span>
              <span className="text-emerald-400 text-lg font-bold">{bacterialState.opticalDensityOD600.toFixed(3)}</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Phase</span>
              <span className="text-cyan-400 font-semibold">{bacterialState.growthPhase}</span>
            </div>
            {bacterialState.zoneOfInhibitionDiameterMM > 0 && (
              <>
                <div className="w-[1px] h-7 bg-slate-700" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Inhibition Halo</span>
                  <span className="text-amber-400 font-semibold">{bacterialState.zoneOfInhibitionDiameterMM.toFixed(1)} mm</span>
                </div>
              </>
            )}
          </div>
        )}

        {experimentId === "photosynthesis" && photosynthesisState && (
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl font-mono text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Dissolved O₂</span>
              <span className="text-cyan-400 text-lg font-bold">
                {photosynthesisState.dissolvedOxygenMg_L.toFixed(2)} <span className="text-[10px] font-normal">mg/L</span>
              </span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">O₂ Bubble Rate</span>
              <span className="text-emerald-400 font-semibold">{photosynthesisState.bubbleRatePerMin.toFixed(0)} /min</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Net O₂ Rate</span>
              <span className="text-amber-400 font-semibold">{photosynthesisState.netPhotosyntheticRate.toFixed(1)} μmol/hr</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Light Level</span>
              <span className="text-white font-semibold">{photosynthesisState.lightIntensity} μmol/m²·s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
