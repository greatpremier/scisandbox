import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Maximize2, Minimize2, RotateCcw, Eye, Compass } from "lucide-react";
import { useLabTheme } from "../../context/ThemeContext";

interface ThreeCanvasWrapperProps {
  onSceneReady: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => (() => void) | void;
  className?: string;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  showGrid?: boolean;
}

export const ThreeCanvasWrapper: React.FC<ThreeCanvasWrapperProps> = ({
  onSceneReady,
  className = "",
  cameraPosition = [0, 5, 10],
  cameraTarget = [0, 1, 0],
  showGrid = true,
}) => {
  const { isLight } = useLabTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gridVisible, setGridVisible] = useState(showGrid);

  // Synchronize scene background & lighting when theme changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    
    if (isLight) {
      scene.background = new THREE.Color(0xf1f5f9); // Cleanroom studio off-white
      if (ambientLightRef.current) ambientLightRef.current.intensity = 1.1;
      if (dirLightRef.current) {
        dirLightRef.current.intensity = 1.8;
        dirLightRef.current.color.setHex(0xffffff);
      }
      if (fillLightRef.current) {
        fillLightRef.current.intensity = 0.5;
        fillLightRef.current.color.setHex(0xcbd5e1);
      }
      if (gridHelperRef.current) {
        // Re-create or color grid
        gridHelperRef.current.material = new THREE.LineBasicMaterial({
          color: 0xcbd5e1,
        });
      }
    } else {
      scene.background = new THREE.Color(0x0f172a); // Low-glare twilight slate
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.8;
      if (dirLightRef.current) {
        dirLightRef.current.intensity = 1.5;
        dirLightRef.current.color.setHex(0xffffff);
      }
      if (fillLightRef.current) {
        fillLightRef.current.intensity = 0.4;
        fillLightRef.current.color.setHex(0x38bdf8);
      }
      if (gridHelperRef.current) {
        gridHelperRef.current.material = new THREE.LineBasicMaterial({
          color: 0x334155,
        });
      }
    }
  }, [isLight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isLight ? 0xf1f5f9 : 0x0f172a);
    sceneRef.current = scene;

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isLight ? 1.05 : 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent flipping below floor
    controls.minDistance = 2;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // Laboratory Floor Grid
    const gridColor1 = isLight ? 0x94a3b8 : 0x38bdf8;
    const gridColor2 = isLight ? 0xe2e8f0 : 0x1e293b;
    const grid = new THREE.GridHelper(30, 30, gridColor1, gridColor2);
    grid.position.y = -0.01;
    grid.visible = gridVisible;
    scene.add(grid);
    gridHelperRef.current = grid;

    // Studio Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, isLight ? 1.1 : 0.8);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Directional Key Light
    const dirLight = new THREE.DirectionalLight(0xffffff, isLight ? 1.8 : 1.5);
    dirLight.position.set(8, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Soft Studio Fill Light
    const fillLight = new THREE.DirectionalLight(isLight ? 0xcbd5e1 : 0x38bdf8, isLight ? 0.5 : 0.4);
    fillLight.position.set(-8, 6, -6);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Call scene setup callback
    const cleanupScene = onSceneReady(scene, camera, renderer);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (cleanupScene) cleanupScene();
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
    controlsRef.current.target.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
    controlsRef.current.update();
  };

  const setTopDownView = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 16, 0.01);
    controlsRef.current.target.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
    controlsRef.current.update();
  };

  const setSideView = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(12, 3, 0);
    controlsRef.current.target.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
    controlsRef.current.update();
  };

  const toggleGrid = () => {
    setGridVisible((prev) => {
      const next = !prev;
      if (gridHelperRef.current) gridHelperRef.current.visible = next;
      return next;
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none transition-colors duration-200 ${
        isLight ? "bg-slate-100" : "bg-slate-950"
      } ${className}`}
    >
      {/* 3D Viewport Controls HUD */}
      <div
        className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 p-1 rounded-lg border shadow-sm transition-colors ${
          isLight
            ? "bg-white/90 backdrop-blur-md border-slate-200/90 text-slate-700"
            : "bg-slate-900/80 backdrop-blur-md border-slate-700/60 text-slate-300"
        }`}
      >
        <button
          onClick={resetCamera}
          title="Reset Camera View"
          className={`p-1.5 rounded transition-colors ${
            isLight ? "hover:text-slate-900 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={setTopDownView}
          title="Top-Down Plan View"
          className={`p-1.5 rounded transition-colors ${
            isLight ? "hover:text-slate-900 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={setSideView}
          title="Profile Side View"
          className={`p-1.5 rounded transition-colors ${
            isLight ? "hover:text-slate-900 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
          }`}
        >
          <Compass className="w-4 h-4" />
        </button>
        <div
          className={`w-[1px] h-4 mx-0.5 ${isLight ? "bg-slate-200" : "bg-slate-700"}`}
        />
        <button
          onClick={toggleGrid}
          title={gridVisible ? "Hide Floor Grid" : "Show Floor Grid"}
          className={`p-1.5 rounded transition-colors ${
            gridVisible
              ? isLight
                ? "text-blue-600 bg-blue-50 font-bold"
                : "text-cyan-400 bg-slate-800/80"
              : isLight
              ? "hover:text-slate-900 hover:bg-slate-100"
              : "hover:text-white hover:bg-slate-800"
          }`}
        >
          <span className="text-[11px] font-mono font-semibold px-0.5">#</span>
        </button>
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className={`p-1.5 rounded transition-colors ${
            isLight ? "hover:text-slate-900 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
          }`}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Orbit Navigation Tip Overlay */}
      <div
        className={`absolute bottom-3 right-3 z-10 pointer-events-none text-[11px] px-2.5 py-1 rounded-md border font-mono transition-colors ${
          isLight
            ? "text-slate-500 bg-white/90 backdrop-blur-xs border-slate-200/80 shadow-xs"
            : "text-slate-400/80 bg-slate-900/60 backdrop-blur-sm border-slate-800"
        }`}
      >
        Left-click: Orbit · Right-click: Pan · Scroll: Zoom
      </div>
    </div>
  );
};
