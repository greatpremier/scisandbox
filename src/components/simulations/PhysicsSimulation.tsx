import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { ThreeCanvasWrapper } from "./ThreeCanvasWrapper";
import { ProjectileState, RayPath, PendulumState } from "../../utils/physicsEngine";

interface PhysicsSimulationProps {
  experimentId: "projectile" | "optics_prism" | "pendulum_harmonic";
  projectileState?: ProjectileState;
  pastTrajectory?: { x: number; y: number; z: number }[];
  launchAngle?: number;
  targetDistance?: number;
  prismRayPaths?: RayPath[];
  lightMode?: "white" | "monochromatic";
  incidentAngle?: number;
  pendulumState?: PendulumState;
}

export const PhysicsSimulation: React.FC<PhysicsSimulationProps> = ({
  experimentId,
  projectileState,
  pastTrajectory = [],
  launchAngle = 45,
  targetDistance = 75,
  prismRayPaths = [],
  lightMode = "white",
  incidentAngle = 45,
  pendulumState,
}) => {
  const cannonBarrelRef = useRef<THREE.Group | null>(null);
  const cannonballMeshRef = useRef<THREE.Mesh | null>(null);
  const trajectoryLineRef = useRef<THREE.Line | null>(null);
  const velocityArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const targetMeshRef = useRef<THREE.Group | null>(null);
  const prismMeshRef = useRef<THREE.Mesh | null>(null);
  const rayLinesGroupRef = useRef<THREE.Group | null>(null);

  // Pendulum Refs
  const pendulumBobMeshRef = useRef<THREE.Mesh | null>(null);
  const pendulumStringLineRef = useRef<THREE.Line | null>(null);
  const pendulumArrowRef = useRef<THREE.ArrowHelper | null>(null);

  // Update cannon angle and target distance
  useEffect(() => {
    if (cannonBarrelRef.current) {
      // Rotate elevation around Z-axis
      const angleRad = (launchAngle * Math.PI) / 180;
      cannonBarrelRef.current.rotation.z = angleRad;
    }
  }, [launchAngle]);

  useEffect(() => {
    if (targetMeshRef.current) {
      // Map meters to 3D world units (scale factor: 1 meter = 0.25 units)
      const scale = 0.25;
      targetMeshRef.current.position.x = targetDistance * scale;
    }
  }, [targetDistance]);

  // Update pendulum bob position, string line, and velocity vector
  useEffect(() => {
    if (experimentId === "pendulum_harmonic" && pendulumState) {
      const pivotY = 3.2;
      // Scale length from meters to 3D units (e.g. 1m = 1.8 units)
      const scale = 1.8;
      const bobX = pendulumState.length * scale * Math.sin(pendulumState.angleRad);
      const bobY = pivotY - pendulumState.length * scale * Math.cos(pendulumState.angleRad);

      if (pendulumBobMeshRef.current) {
        pendulumBobMeshRef.current.position.set(bobX, bobY, 0);
        // Scale bob radius with mass (0.1 kg to 5.0 kg maps to radius 0.15 to 0.35)
        const bobScale = Math.max(0.6, Math.min(1.6, 0.7 + (pendulumState.mass / 5.0) * 0.7));
        pendulumBobMeshRef.current.scale.set(bobScale, bobScale, bobScale);
      }

      if (pendulumStringLineRef.current) {
        const positions = new Float32Array([0, pivotY, 0, bobX, bobY, 0]);
        pendulumStringLineRef.current.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        pendulumStringLineRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (pendulumArrowRef.current) {
        const speed = Math.abs(pendulumState.angularVelocity);
        if (speed > 0.05) {
          const dir = new THREE.Vector3(
            Math.cos(pendulumState.angleRad) * Math.sign(pendulumState.angularVelocity),
            Math.sin(pendulumState.angleRad) * Math.sign(pendulumState.angularVelocity),
            0
          ).normalize();
          pendulumArrowRef.current.position.set(bobX, bobY, 0);
          pendulumArrowRef.current.setDirection(dir);
          pendulumArrowRef.current.setLength(Math.min(1.2, speed * 0.3), 0.12, 0.08);
          pendulumArrowRef.current.visible = true;
        } else {
          pendulumArrowRef.current.visible = false;
        }
      }
    }
  }, [pendulumState, experimentId]);

  // Update projectile position, velocity arrow, and trail
  useEffect(() => {
    if (experimentId === "projectile" && projectileState) {
      const scale = 0.25;
      const posX = projectileState.x * scale;
      const posY = projectileState.y * scale + 0.35;
      const posZ = projectileState.z * scale;

      if (cannonballMeshRef.current) {
        cannonballMeshRef.current.position.set(posX, posY, posZ);
        cannonballMeshRef.current.visible = true;
      }

      // Update velocity vector arrow
      if (velocityArrowRef.current) {
        const speed = projectileState.speed;
        if (speed > 0.1 && !projectileState.isGrounded) {
          const dir = new THREE.Vector3(
            projectileState.vx,
            projectileState.vy,
            projectileState.vz
          ).normalize();
          velocityArrowRef.current.setDirection(dir);
          velocityArrowRef.current.setLength(Math.min(2.5, speed * 0.08), 0.25, 0.15);
          velocityArrowRef.current.position.set(posX, posY, posZ);
          velocityArrowRef.current.visible = true;
        } else {
          velocityArrowRef.current.visible = false;
        }
      }

      // Update trajectory trail line
      if (trajectoryLineRef.current && pastTrajectory.length > 1) {
        const points = pastTrajectory.map((p) => new THREE.Vector3(p.x * scale, p.y * scale + 0.35, p.z * scale));
        trajectoryLineRef.current.geometry.setFromPoints(points);
        trajectoryLineRef.current.visible = true;
      }
    }
  }, [projectileState, pastTrajectory, experimentId]);

  // Update optical rays and prism rotation
  useEffect(() => {
    if (experimentId === "optics_prism" && rayLinesGroupRef.current) {
      // Clear previous rays
      while (rayLinesGroupRef.current.children.length > 0) {
        const obj = rayLinesGroupRef.current.children[0];
        rayLinesGroupRef.current.remove(obj);
      }

      // Draw each spectral ray path
      prismRayPaths.forEach((ray) => {
        const points = ray.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: ray.colorNumber,
          linewidth: ray.isTotalInternalReflection ? 3 : 2,
          transparent: true,
          opacity: 0.95,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        rayLinesGroupRef.current?.add(line);

        // Add glowing point on detector screen
        const lastPt = ray.points[ray.points.length - 1];
        const dotGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const dotMat = new THREE.MeshBasicMaterial({ color: ray.colorNumber });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(lastPt.x, lastPt.y, lastPt.z);
        rayLinesGroupRef.current?.add(dot);
      });
    }
  }, [prismRayPaths, experimentId]);

  const handleSceneReady = (scene: THREE.Scene) => {
    if (experimentId === "projectile") {
      // ==================== 3D PROJECTILE RANGE ====================
      // Test Range Ground Plate
      const groundGeo = new THREE.BoxGeometry(40, 0.2, 12);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.8,
        metalness: 0.1,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.set(15, -0.1, 0);
      ground.receiveShadow = true;
      scene.add(ground);

      // Distance graduation markers (Every 20 meters = 5 units)
      const scale = 0.25;
      for (let m = 0; m <= 120; m += 20) {
        const markerGeo = new THREE.BoxGeometry(0.1, 0.05, 8);
        const markerMat = new THREE.MeshBasicMaterial({ color: m % 40 === 0 ? 0x38bdf8 : 0x475569 });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.set(m * scale, 0.03, 0);
        scene.add(marker);
      }

      // A. Cannon Platform & Turret
      const cannonGroup = new THREE.Group();
      cannonGroup.position.set(0, 0, 0);

      // Concrete / metallic launch pad
      const padGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.4, 32);
      const padMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.5 });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = 0.2;
      cannonGroup.add(pad);

      // Yoke Mount
      const yokeGeo = new THREE.BoxGeometry(0.8, 0.9, 1.2);
      const yokeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
      const yoke = new THREE.Mesh(yokeGeo, yokeMat);
      yoke.position.y = 0.85;
      cannonGroup.add(yoke);

      // Elevating Barrel Assembly (rotates around Z)
      const barrelAssembly = new THREE.Group();
      barrelAssembly.position.set(0, 0.95, 0);

      const barrelGeo = new THREE.CylinderGeometry(0.2, 0.28, 2.4, 24);
      barrelGeo.rotateZ(-Math.PI / 2); // default horizontal along +X
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.position.x = 1.0;
      barrelAssembly.add(barrel);

      // Barrel muzzle ring
      const ringGeo = new THREE.TorusGeometry(0.22, 0.04, 12, 24);
      ringGeo.rotateY(Math.PI / 2);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 });
      const muzzleRing = new THREE.Mesh(ringGeo, ringMat);
      muzzleRing.position.x = 2.2;
      barrelAssembly.add(muzzleRing);

      // Protractor Arc indicator on cannon side
      const arcGeo = new THREE.RingGeometry(0.4, 0.45, 32, 1, 0, Math.PI / 2);
      const arcMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
      const arc = new THREE.Mesh(arcGeo, arcMat);
      arc.position.set(0, 0, 0.65);
      barrelAssembly.add(arc);

      cannonGroup.add(barrelAssembly);
      cannonBarrelRef.current = barrelAssembly;

      scene.add(cannonGroup);

      // B. Projectile Cannonball
      const ballGeo = new THREE.SphereGeometry(0.18, 24, 24);
      const ballMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        metalness: 0.7,
        roughness: 0.2,
      });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.castShadow = true;
      ball.position.set(0, 0.95, 0);
      scene.add(ball);
      cannonballMeshRef.current = ball;

      // C. Velocity Vector Arrow
      const arrowDir = new THREE.Vector3(1, 1, 0).normalize();
      const arrow = new THREE.ArrowHelper(arrowDir, new THREE.Vector3(0, 0, 0), 1.5, 0x10b981, 0.25, 0.15);
      arrow.visible = false;
      scene.add(arrow);
      velocityArrowRef.current = arrow;

      // D. Trajectory Trail Line
      const trajGeo = new THREE.BufferGeometry();
      const trajMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.3,
        gapSize: 0.15,
        linewidth: 2,
      });
      const trajLine = new THREE.Line(trajGeo, trajMat);
      trajLine.visible = false;
      scene.add(trajLine);
      trajectoryLineRef.current = trajLine;

      // E. Target Landing Pad
      const targetGroup = new THREE.Group();
      targetGroup.position.set(targetDistance * scale, 0.02, 0);

      // Bullseye concentric rings
      const rings = [
        { radius: 1.6, color: 0xffffff },
        { radius: 1.2, color: 0xef4444 },
        { radius: 0.8, color: 0xffffff },
        { radius: 0.4, color: 0xef4444 },
      ];
      rings.forEach((r, idx) => {
        const ringGeo = new THREE.CylinderGeometry(r.radius, r.radius, 0.03 - idx * 0.005, 32);
        const ringMat = new THREE.MeshStandardMaterial({ color: r.color, roughness: 0.5 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        targetGroup.add(ringMesh);
      });
      scene.add(targetGroup);
      targetMeshRef.current = targetGroup;
    } else if (experimentId === "optics_prism") {
      // ==================== 3D WAVE OPTICS & PRISM ====================
      // A. Optical Bench Rails
      const railGeo = new THREE.BoxGeometry(11, 0.25, 3);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 });
      const rails = new THREE.Mesh(railGeo, railMat);
      rails.position.set(0, -0.125, 0);
      scene.add(rails);

      // B. Laser Emitter Assembly
      const laserGroup = new THREE.Group();
      laserGroup.position.set(-4.2, 0.6, 0);

      const laserTubeGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.8, 24);
      laserTubeGeo.rotateZ(Math.PI / 2);
      const laserTubeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
      const laserTube = new THREE.Mesh(laserTubeGeo, laserTubeMat);
      laserGroup.add(laserTube);

      // Glowing aperture
      const apertureGeo = new THREE.RingGeometry(0.05, 0.22, 24);
      apertureGeo.rotateY(Math.PI / 2);
      const beamColor = lightMode === "white" ? 0xffffff : 0x22c55e;
      const apertureMat = new THREE.MeshBasicMaterial({ color: beamColor });
      const aperture = new THREE.Mesh(apertureGeo, apertureMat);
      aperture.position.x = 0.91;
      laserGroup.add(aperture);

      scene.add(laserGroup);

      // C. Rotating Turntable for Prism
      const turntableGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.35, 32);
      const turntableMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
      const turntable = new THREE.Mesh(turntableGeo, turntableMat);
      turntable.position.set(0, 0.175, 0);
      scene.add(turntable);

      // Angle Vernier graduation ring
      const degRingGeo = new THREE.TorusGeometry(1.5, 0.025, 8, 48);
      degRingGeo.rotateX(Math.PI / 2);
      const degRing = new THREE.Mesh(degRingGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      degRing.position.set(0, 0.36, 0);
      scene.add(degRing);

      // D. Triangular Glass Prism
      // Prism shape extruded along height
      const prismShape = new THREE.Shape();
      const s = 1.3;
      prismShape.moveTo(-s, -s * 0.6);
      prismShape.lineTo(s, -s * 0.6);
      prismShape.lineTo(0, s * 0.9);
      prismShape.closePath();

      const extrudeSettings = {
        depth: 1.8,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.05,
        bevelThickness: 0.05,
      };
      const prismGeo = new THREE.ExtrudeGeometry(prismShape, extrudeSettings);
      prismGeo.center();
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.94,
        roughness: 0.02,
        ior: 1.62,
        thickness: 1.4,
        transparent: true,
        opacity: 0.45,
      });
      const prism = new THREE.Mesh(prismGeo, glassMat);
      prism.position.set(0, 1.4, 0);
      scene.add(prism);
      prismMeshRef.current = prism;

      // E. Detector Projection Screen
      const screenGeo = new THREE.BoxGeometry(0.1, 3.2, 2.2);
      const screenMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(5.0, 1.6, 0);
      scene.add(screenMesh);

      // Ray Lines Group
      const rayLinesGroup = new THREE.Group();
      scene.add(rayLinesGroup);
      rayLinesGroupRef.current = rayLinesGroup;
    } else if (experimentId === "pendulum_harmonic") {
      // ==================== HARMONIC PENDULUM 3D APPARATUS ====================
      const standGroup = new THREE.Group();

      // Heavy Cast-Iron Base Plate
      const baseGeo = new THREE.BoxGeometry(2.2, 0.25, 2.2);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.35,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(-1.4, 0.125, 0);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      standGroup.add(baseMesh);

      // Vertical Chrome Support Mast
      const mastGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.6, 24);
      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.1,
      });
      const mast = new THREE.Mesh(mastGeo, chromeMat);
      mast.position.set(-1.4, 1.8, 0);
      mast.castShadow = true;
      standGroup.add(mast);

      // Horizontal Arm
      const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 24);
      armGeo.rotateZ(Math.PI / 2);
      const arm = new THREE.Mesh(armGeo, chromeMat);
      arm.position.set(-0.65, 3.2, 0);
      arm.castShadow = true;
      standGroup.add(arm);

      // Pivot Bearing Clamp
      const pivotGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.25, 24);
      pivotGeo.rotateX(Math.PI / 2);
      const pivotMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.7,
        roughness: 0.2,
      });
      const pivot = new THREE.Mesh(pivotGeo, pivotMat);
      pivot.position.set(0, 3.2, 0);
      standGroup.add(pivot);

      // Protractor Arc Gauge (-90 to +90 deg)
      const protractorGeo = new THREE.RingGeometry(0.5, 0.95, 32, 1, Math.PI, Math.PI);
      const protractorMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      });
      const protractor = new THREE.Mesh(protractorGeo, protractorMat);
      protractor.position.set(0, 3.2, -0.05);
      standGroup.add(protractor);

      // Degree Graduation Ring Marker at 0 deg (vertical plumb line)
      const plumbGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8);
      const plumb = new THREE.Mesh(plumbGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      plumb.position.set(0, 2.75, -0.04);
      standGroup.add(plumb);

      scene.add(standGroup);

      // Suspension String Line
      const stringGeo = new THREE.BufferGeometry();
      const stringPositions = new Float32Array([0, 3.2, 0, 0, 1.4, 0]);
      stringGeo.setAttribute("position", new THREE.BufferAttribute(stringPositions, 3));
      const stringMat = new THREE.LineBasicMaterial({ color: 0xf8fafc, linewidth: 2 });
      const stringLine = new THREE.Line(stringGeo, stringMat);
      scene.add(stringLine);
      pendulumStringLineRef.current = stringLine;

      // Precision Metallic Spherical Bob
      const bobGeo = new THREE.SphereGeometry(0.24, 32, 32);
      const bobMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // Polished brass / gold
        metalness: 0.9,
        roughness: 0.15,
      });
      const bobMesh = new THREE.Mesh(bobGeo, bobMat);
      bobMesh.position.set(0, 1.4, 0);
      bobMesh.castShadow = true;
      scene.add(bobMesh);
      pendulumBobMeshRef.current = bobMesh;

      // Tangential Velocity Arrow Helper
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1.4, 0), 0.6, 0x10b981);
      scene.add(arrow);
      pendulumArrowRef.current = arrow;
    }

    return () => {};
  };

  return (
    <div className="relative w-full h-full">
      <ThreeCanvasWrapper
        onSceneReady={handleSceneReady}
        cameraPosition={
          experimentId === "projectile"
            ? [12, 9, 22]
            : experimentId === "pendulum_harmonic"
            ? [0, 2.8, 6.8]
            : [0, 4.5, 8.5]
        }
        cameraTarget={
          experimentId === "projectile"
            ? [14, 2, 0]
            : experimentId === "pendulum_harmonic"
            ? [0, 2.0, 0]
            : [0, 1.2, 0]
        }
      />

      {/* Real-Time Physics Telemetry HUD */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-none">
        {experimentId === "projectile" && projectileState && (
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl font-mono text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Range (X)</span>
              <span className="text-emerald-400 text-lg font-bold">{projectileState.x.toFixed(1)} m</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Altitude (Y)</span>
              <span className="text-cyan-400 font-semibold">{projectileState.y.toFixed(1)} m</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Total Energy</span>
              <span className="text-amber-400 font-semibold">{projectileState.totalEnergy.toFixed(0)} J</span>
            </div>
            {projectileState.hitTarget && (
              <>
                <div className="w-[1px] h-7 bg-slate-700" />
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-500/40">
                  TARGET HIT!
                </span>
              </>
            )}
          </div>
        )}

        {experimentId === "optics_prism" && (
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl font-mono text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Incidence θ₁</span>
              <span className="text-cyan-400 text-lg font-bold">{incidentAngle}°</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Light Spectrum</span>
              <span className="text-amber-400 font-semibold">
                {lightMode === "white" ? "Polychromatic Fan (7 Wavelengths)" : "Monochromatic Laser"}
              </span>
            </div>
          </div>
        )}

        {experimentId === "pendulum_harmonic" && pendulumState && (
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl font-mono text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Angle (θ)</span>
              <span className="text-amber-400 text-lg font-bold">{pendulumState.angleDeg.toFixed(1)}°</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Angular Velocity</span>
              <span className="text-cyan-400 font-semibold">{pendulumState.angularVelocity.toFixed(2)} rad/s</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Theoretical Period</span>
              <span className="text-emerald-400 font-semibold">{pendulumState.theoreticalPeriod.toFixed(2)} s</span>
            </div>
            <div className="w-[1px] h-7 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Total Energy</span>
              <span className="text-white font-semibold">{pendulumState.totalEnergy.toFixed(2)} J</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
