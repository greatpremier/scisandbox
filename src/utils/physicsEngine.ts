// Scientific mathematical models and numerical algorithms for OmniLab

// ==================== CHEMISTRY: TITRATION ====================
export interface TitrationResult {
  currentVolume: number; // total mL
  addedTitrantVolume: number; // mL NaOH added
  pH: number;
  dpH_dV: number; // first derivative
  equivalenceVolume: number;
  isEquivalenceReached: boolean;
  solutionColor: string; // CSS color string (hex or rgba)
  solutionHex: number; // Three.js color number
  temperature: number; // °C (neutralization heats solution)
  conductivity: number; // uS/cm
  ions: {
    H_plus: number;
    OH_minus: number;
    Na_plus: number;
    Cl_minus: number;
    Acetate: number;
  };
}

export function calculateTitrationState(
  acidType: string,
  acidConc: number,
  baseConc: number,
  acidVolume: number,
  addedBaseVol: number,
  indicator: string,
  baseTemperature = 25.0
): TitrationResult {
  const totalVolume = acidVolume + addedBaseVol;
  const n_acid = acidConc * acidVolume; // mmol
  const n_base = baseConc * addedBaseVol; // mmol
  const eqVolume = n_acid / baseConc; // mL of base for 1:1 stoichiometry

  let pH = 7.0;
  const Kw = 1e-14;

  if (acidType === "HCl") {
    // Strong Acid + Strong Base
    if (addedBaseVol < eqVolume - 0.001) {
      const excessH = (n_acid - n_base) / totalVolume; // M
      pH = -Math.log10(Math.max(excessH, 1e-7));
    } else if (Math.abs(addedBaseVol - eqVolume) <= 0.001) {
      pH = 7.0;
    } else {
      const excessOH = (n_base - n_acid) / totalVolume; // M
      const pOH = -Math.log10(Math.max(excessOH, 1e-7));
      pH = 14.0 - pOH;
    }
  } else if (acidType === "CH3COOH") {
    // Weak Acid (Ka = 1.76e-5, pKa = 4.75)
    const Ka = 1.76e-5;
    const pKa = 4.754;

    if (addedBaseVol <= 0.01) {
      // Initial pure weak acid: [H+] = sqrt(Ka * Ca)
      const H = Math.sqrt(Ka * acidConc);
      pH = -Math.log10(H);
    } else if (addedBaseVol < eqVolume - 0.05) {
      // Buffer region: Henderson-Hasselbalch
      const salt = n_base;
      const acidRem = n_acid - n_base;
      const ratio = salt / acidRem;
      pH = pKa + Math.log10(ratio);
    } else if (Math.abs(addedBaseVol - eqVolume) <= 0.05) {
      // Equivalence point: basic hydrolysis of acetate
      const C_salt = n_acid / totalVolume;
      const Kb = Kw / Ka;
      const OH = Math.sqrt(Kb * C_salt);
      pH = 14.0 - (-Math.log10(OH));
    } else {
      // Past equivalence: excess strong base dominates
      const excessOH = (n_base - n_acid) / totalVolume;
      pH = 14.0 - (-Math.log10(excessOH));
    }
  } else {
    // Unknown acid (treat as monoprotic with pKa ~ 3.5)
    if (addedBaseVol < eqVolume) {
      const ratio = Math.max(0.01, addedBaseVol / (eqVolume - addedBaseVol));
      pH = 3.6 + Math.log10(ratio);
    } else {
      const excessOH = (n_base - n_acid) / totalVolume;
      pH = 14.0 - (-Math.log10(Math.max(excessOH, 1e-7)));
    }
  }

  // Bound pH between 0.5 and 13.8
  pH = Math.max(0.5, Math.min(13.8, pH));

  // Compute approximate 1st derivative dpH/dV
  const dV = 0.1;
  const pH_plus = calculateSimplepH(acidType, acidConc, baseConc, acidVolume, addedBaseVol + dV);
  const pH_minus = calculateSimplepH(acidType, acidConc, baseConc, acidVolume, Math.max(0, addedBaseVol - dV));
  const dpH_dV = Math.abs(pH_plus - pH_minus) / (2 * dV);

  // Indicator color
  let solutionColor = "#d6eaf8";
  let solutionHex = 0xd6eaf8;

  if (indicator === "phenolphthalein") {
    // Colorless below pH 8.2 -> Pink/Magenta above 8.3
    if (pH < 8.2) {
      solutionColor = "rgba(225, 240, 255, 0.55)";
      solutionHex = 0xe2f1ff;
    } else if (pH >= 8.2 && pH <= 10.0) {
      const t = (pH - 8.2) / 1.8;
      // Soft blush pink to bright fuchsia
      const r = 255;
      const g = Math.round(180 - t * 140);
      const b = Math.round(210 - t * 70);
      solutionColor = `rgba(${r}, ${g}, ${b}, ${0.65 + t * 0.25})`;
      solutionHex = (r << 16) | (g << 8) | b;
    } else {
      solutionColor = "rgba(225, 29, 120, 0.9)";
      solutionHex = 0xe11d78;
    }
  } else if (indicator === "methyl_orange") {
    // Red below 3.1 -> Orange 3.1-4.4 -> Yellow above 4.4
    if (pH < 3.1) {
      solutionColor = "rgba(239, 68, 68, 0.85)";
      solutionHex = 0xef4444;
    } else if (pH <= 4.4) {
      solutionColor = "rgba(249, 115, 22, 0.85)";
      solutionHex = 0xf97316;
    } else {
      solutionColor = "rgba(234, 179, 8, 0.85)";
      solutionHex = 0xeab308;
    }
  } else {
    // Bromothymol blue: Yellow below 6.0, Green at 7.0, Blue above 7.6
    if (pH < 6.0) {
      solutionColor = "rgba(234, 179, 8, 0.85)";
      solutionHex = 0xeab308;
    } else if (pH <= 7.6) {
      const t = (pH - 6.0) / 1.6;
      const r = Math.round(234 - t * 200);
      const g = Math.round(179 + t * 20);
      const b = Math.round(8 + t * 220);
      solutionColor = `rgba(${r}, ${g}, ${b}, 0.85)`;
      solutionHex = (r << 16) | (g << 8) | b;
    } else {
      solutionColor = "rgba(37, 99, 235, 0.85)";
      solutionHex = 0x2563eb;
    }
  }

  // Temperature rise: deltaH = -57.3 kJ/mol
  const reactedMoles = Math.min(n_acid, n_base) * 1e-3;
  const q_heat = reactedMoles * 57300; // Joules
  const massSol = totalVolume * 1.0; // approx grams
  const deltaT = massSol > 0 ? q_heat / (massSol * 4.184) : 0;
  const temperature = Number((baseTemperature + deltaT).toFixed(2));

  // Conductivity (arbitrary realistic curve with minimum at equivalence for strong acid)
  const conductivity = Math.round(
    Math.max(120, Math.abs(addedBaseVol - eqVolume) * 220 + (totalVolume * 8))
  );

  return {
    currentVolume: totalVolume,
    addedTitrantVolume: addedBaseVol,
    pH: Number(pH.toFixed(2)),
    dpH_dV: Number(dpH_dV.toFixed(2)),
    equivalenceVolume: Number(eqVolume.toFixed(2)),
    isEquivalenceReached: Math.abs(addedBaseVol - eqVolume) < 0.25,
    solutionColor,
    solutionHex,
    temperature,
    conductivity,
    ions: {
      H_plus: Number(Math.pow(10, -pH).toExponential(2)),
      OH_minus: Number((Kw / Math.pow(10, -pH)).toExponential(2)),
      Na_plus: Number((n_base / totalVolume).toFixed(4)),
      Cl_minus: Number((n_acid / totalVolume).toFixed(4)),
      Acetate: Number((Math.min(n_acid, n_base) / totalVolume).toFixed(4)),
    },
  };
}

function calculateSimplepH(
  acidType: string,
  acidConc: number,
  baseConc: number,
  acidVolume: number,
  addedBaseVol: number
): number {
  const totalVolume = acidVolume + addedBaseVol;
  const n_acid = acidConc * acidVolume;
  const n_base = baseConc * addedBaseVol;
  const eqVolume = n_acid / baseConc;
  if (addedBaseVol < eqVolume) {
    const excessH = (n_acid - n_base) / totalVolume;
    return -Math.log10(Math.max(excessH, 1e-7));
  } else if (Math.abs(addedBaseVol - eqVolume) < 0.001) {
    return 7.0;
  } else {
    const excessOH = (n_base - n_acid) / totalVolume;
    return 14.0 + Math.log10(Math.max(excessOH, 1e-7));
  }
}

// ==================== CHEMISTRY: REACTION KINETICS ====================
export interface GasReactionState {
  gasVolumeML: number; // accumulated H2 in mL
  maxTheoreticalVolumeML: number;
  instantaneousRateML_s: number; // dV/dt
  reactionProgressPct: number;
  temperatureC: number;
  pressureKPa: number;
}

export function calculateGasKinetics(
  timeSeconds: number,
  zincMassGrams: number,
  morphology: "powder" | "granules" | "strip",
  acidConcM: number,
  acidVolumeML: number,
  temperatureC: number,
  catalystAdded: boolean
): GasReactionState {
  // Zn + 2HCl -> ZnCl2 + H2
  // Molar mass Zn = 65.38 g/mol
  const molesZn = zincMassGrams / 65.38;
  const molesHCl = (acidConcM * acidVolumeML) / 1000;
  const limitingMolesH2 = Math.min(molesZn, molesHCl / 2);

  // Ideal Gas Law: V = nRT / P (at 1 atm, approx 24450 mL/mol at 298K)
  const T_Kelvin = temperatureC + 273.15;
  const R_const = 8.314; // J/(mol K)
  const P_Pa = 101325;
  const molarVolumeML = ((R_const * T_Kelvin) / P_Pa) * 1e6;
  const maxTheoreticalVolumeML = limitingMolesH2 * molarVolumeML;

  // Rate constant k via Arrhenius law
  // Ea approx 45,000 J/mol
  const Ea = 45000;
  const A_freq = 1.2e6;
  let k_base = A_freq * Math.exp(-Ea / (R_const * T_Kelvin));

  // Surface area factor
  let surfaceFactor = 1.0;
  if (morphology === "powder") surfaceFactor = 4.8;
  else if (morphology === "granules") surfaceFactor = 1.4;
  else surfaceFactor = 0.65;

  // Catalyst multiplier
  const catalystFactor = catalystAdded ? 2.8 : 1.0;

  // Concentration order (first-order in HCl)
  const concFactor = Math.pow(acidConcM, 1.2);

  const k_effective = k_base * surfaceFactor * catalystFactor * concFactor * 0.08;

  // Volume(t) = Vmax * (1 - exp(-k * t))
  const gasVolumeML = maxTheoreticalVolumeML * (1 - Math.exp(-k_effective * timeSeconds));
  const instantaneousRateML_s = k_effective * (maxTheoreticalVolumeML - gasVolumeML);
  const reactionProgressPct = Math.min(100, (gasVolumeML / Math.max(1, maxTheoreticalVolumeML)) * 100);

  return {
    gasVolumeML: Number(gasVolumeML.toFixed(2)),
    maxTheoreticalVolumeML: Number(maxTheoreticalVolumeML.toFixed(2)),
    instantaneousRateML_s: Number(instantaneousRateML_s.toFixed(3)),
    reactionProgressPct: Number(reactionProgressPct.toFixed(1)),
    temperatureC: Number(temperatureC.toFixed(1)),
    pressureKPa: Number((101.3 + (gasVolumeML / 100) * 1.5).toFixed(1)),
  };
}

// ==================== PHYSICS: 3D PROJECTILE MOTION ====================
export interface ProjectileState {
  x: number; // horizontal range (m)
  y: number; // height (m)
  z: number; // crosswind drift (m)
  vx: number;
  vy: number;
  vz: number;
  speed: number;
  kineticEnergy: number; // Joules
  potentialEnergy: number; // Joules
  totalEnergy: number;
  timeElapsed: number;
  isGrounded: boolean;
  distanceToTarget: number;
  hitTarget: boolean;
}

export function stepProjectileRK4(
  current: ProjectileState,
  dt: number,
  mass: number,
  gravity: number,
  cd: number,
  airDensity: number,
  windSpeedZ: number,
  targetDistance: number,
  projectileRadius = 0.08
): ProjectileState {
  if (current.isGrounded) return current;

  const area = Math.PI * projectileRadius * projectileRadius;
  const dragFactor = 0.5 * airDensity * cd * area;

  // Accelerations function
  const getAcc = (vx: number, vy: number, vz: number) => {
    const vRelZ = vz - windSpeedZ;
    const vMag = Math.sqrt(vx * vx + vy * vy + vRelZ * vRelZ);
    const dragX = -dragFactor * vMag * vx;
    const dragY = -dragFactor * vMag * vy;
    const dragZ = -dragFactor * vMag * vRelZ;

    const ax = dragX / mass;
    const ay = -gravity + dragY / mass;
    const az = dragZ / mass;
    return { ax, ay, az };
  };

  // Runge-Kutta 4th Order
  const k1_v = { vx: current.vx, vy: current.vy, vz: current.vz };
  const k1_a = getAcc(k1_v.vx, k1_v.vy, k1_v.vz);

  const k2_v = {
    vx: current.vx + 0.5 * dt * k1_a.ax,
    vy: current.vy + 0.5 * dt * k1_a.ay,
    vz: current.vz + 0.5 * dt * k1_a.az,
  };
  const k2_a = getAcc(k2_v.vx, k2_v.vy, k2_v.vz);

  const k3_v = {
    vx: current.vx + 0.5 * dt * k2_a.ax,
    vy: current.vy + 0.5 * dt * k2_a.ay,
    vz: current.vz + 0.5 * dt * k2_a.az,
  };
  const k3_a = getAcc(k3_v.vx, k3_v.vy, k3_v.vz);

  const k4_v = {
    vx: current.vx + dt * k3_a.ax,
    vy: current.vy + dt * k3_a.ay,
    vz: current.vz + dt * k3_a.az,
  };
  const k4_a = getAcc(k4_v.vx, k4_v.vy, k4_v.vz);

  const newX = current.x + (dt / 6) * (k1_v.vx + 2 * k2_v.vx + 2 * k3_v.vx + k4_v.vx);
  let newY = current.y + (dt / 6) * (k1_v.vy + 2 * k2_v.vy + 2 * k3_v.vy + k4_v.vy);
  const newZ = current.z + (dt / 6) * (k1_v.vz + 2 * k2_v.vz + 2 * k3_v.vz + k4_v.vz);

  let newVx = current.vx + (dt / 6) * (k1_a.ax + 2 * k2_a.ax + 2 * k3_a.ax + k4_a.ax);
  let newVy = current.vy + (dt / 6) * (k1_a.ay + 2 * k2_a.ay + 2 * k3_a.ay + k4_a.ay);
  let newVz = current.vz + (dt / 6) * (k1_a.az + 2 * k2_a.az + 2 * k3_a.az + k4_a.az);

  let isGrounded = false;
  if (newY <= 0) {
    newY = 0;
    isGrounded = true;
    newVx = 0;
    newVy = 0;
    newVz = 0;
  }

  const speed = Math.sqrt(newVx * newVx + newVy * newVy + newVz * newVz);
  const kineticEnergy = 0.5 * mass * speed * speed;
  const potentialEnergy = mass * gravity * Math.max(0, newY);
  const totalEnergy = kineticEnergy + potentialEnergy;
  const distanceToTarget = Math.abs(newX - targetDistance);
  const hitTarget = isGrounded && distanceToTarget <= 3.5;

  return {
    x: Number(newX.toFixed(2)),
    y: Number(newY.toFixed(2)),
    z: Number(newZ.toFixed(2)),
    vx: Number(newVx.toFixed(2)),
    vy: Number(newVy.toFixed(2)),
    vz: Number(newVz.toFixed(2)),
    speed: Number(speed.toFixed(2)),
    kineticEnergy: Number(kineticEnergy.toFixed(1)),
    potentialEnergy: Number(potentialEnergy.toFixed(1)),
    totalEnergy: Number(totalEnergy.toFixed(1)),
    timeElapsed: Number((current.timeElapsed + dt).toFixed(3)),
    isGrounded,
    distanceToTarget: Number(distanceToTarget.toFixed(2)),
    hitTarget,
  };
}

// ==================== PHYSICS: WAVE OPTICS & PRISM ====================
export interface PrismRayPoint {
  x: number;
  y: number;
  z: number;
}

export interface RayPath {
  wavelength: number; // nm
  colorHex: string;
  colorNumber: number;
  refractiveIndex: number;
  incidentAngleDeg: number;
  refractedAngle1Deg: number;
  internalIncidentDeg: number;
  exitAngleDeg: number;
  deviationAngleDeg: number;
  isTotalInternalReflection: boolean;
  points: PrismRayPoint[];
}

export function calculatePrismDispersion(
  incidentAngleDeg: number,
  prismApexAngleDeg: number,
  material: string,
  lightMode: "white" | "monochromatic",
  monochromaticWavelength = 532
): RayPath[] {
  // Sellmeier / Cauchy parameters A & B: n(lambda) = A + B / lambda^2 (lambda in um)
  let A = 1.5046;
  let B = 0.0042; // Crown glass

  if (material === "flint_glass") {
    A = 1.6202;
    B = 0.0118;
  } else if (material === "diamond") {
    A = 2.378;
    B = 0.024;
  } else if (material === "acrylic") {
    A = 1.488;
    B = 0.0039;
  } else if (material === "water") {
    A = 1.328;
    B = 0.0031;
  }

  const wavelengthsToTrace =
    lightMode === "white"
      ? [400, 440, 480, 520, 560, 600, 650, 700] // spectrum fan
      : [monochromaticWavelength];

  const theta1_rad = (incidentAngleDeg * Math.PI) / 180;
  const alpha_rad = (prismApexAngleDeg * Math.PI) / 180;

  return wavelengthsToTrace.map((wl) => {
    const lambda_um = wl / 1000;
    const n = A + B / (lambda_um * lambda_um);

    // Interface 1 (Air n1=1.0 to Prism n2=n)
    // sin(theta2) = sin(theta1) / n
    const sinTheta2 = Math.sin(theta1_rad) / n;
    const theta2_rad = Math.asin(Math.min(1.0, Math.max(-1.0, sinTheta2)));

    // Internal angle at interface 2: theta3 = alpha - theta2
    const theta3_rad = alpha_rad - theta2_rad;
    const criticalAngle_rad = Math.asin(1.0 / n);

    let isTIR = theta3_rad > criticalAngle_rad;
    let theta4_rad = 0;
    let deviation_rad = 0;

    if (!isTIR) {
      const sinTheta4 = n * Math.sin(theta3_rad);
      if (Math.abs(sinTheta4) <= 1.0) {
        theta4_rad = Math.asin(sinTheta4);
        deviation_rad = theta1_rad + theta4_rad - alpha_rad;
      } else {
        isTIR = true;
      }
    }

    const colorHex = wavelengthToColor(wl);
    const colorNumber = parseInt(colorHex.replace("#", "0x"), 16);

    // Build 3D ray coordinates through prism geometry
    // Prism centered at (0, 0, 0)
    const points: PrismRayPoint[] = [
      { x: -4.0, y: Math.tan(theta1_rad * 0.4) - 0.2, z: 0 }, // Emitter
      { x: -1.0, y: 0.1, z: 0 }, // Surface 1 impact
      { x: 1.0, y: -0.15 + (theta2_rad * 0.2), z: 0 }, // Surface 2 exit
      isTIR
        ? { x: 0.2, y: -2.8, z: 0 } // Reflected internal downward
        : { x: 5.0, y: -0.15 - Math.tan(deviation_rad) * 3.5, z: 0 }, // Screen impact
    ];

    return {
      wavelength: wl,
      colorHex,
      colorNumber,
      refractiveIndex: Number(n.toFixed(4)),
      incidentAngleDeg: Number(incidentAngleDeg.toFixed(1)),
      refractedAngle1Deg: Number(((theta2_rad * 180) / Math.PI).toFixed(2)),
      internalIncidentDeg: Number(((theta3_rad * 180) / Math.PI).toFixed(2)),
      exitAngleDeg: isTIR ? 90 : Number(((theta4_rad * 180) / Math.PI).toFixed(2)),
      deviationAngleDeg: isTIR ? 180 : Number(((deviation_rad * 180) / Math.PI).toFixed(2)),
      isTotalInternalReflection: isTIR,
      points,
    };
  });
}

export function wavelengthToColor(wavelength: number): string {
  let r = 0,
    g = 0,
    b = 0;
  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    b = 1.0;
  } else if (wavelength >= 440 && wavelength < 490) {
    g = (wavelength - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelength >= 490 && wavelength < 510) {
    g = 1.0;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1.0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1.0;
    g = -(wavelength - 645) / (645 - 580);
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1.0;
  }
  const toHex = (c: number) => {
    const val = Math.round(Math.max(0, Math.min(1, c)) * 255);
    return val.toString(16).padStart(2, "0");
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ==================== BIOLOGY: ENZYME KINETICS ====================
export interface EnzymeKineticsState {
  substrateConc: number; // mM [S]
  velocity: number; // umol/(min*mg)
  theoreticalVmax: number;
  apparentVmax: number;
  theoreticalKm: number;
  apparentKm: number;
  temperatureEffect: number; // 0 to 1
  pHEffect: number; // 0 to 1
  lineweaverBurk: {
    invSubstrate: number; // 1/[S]
    invVelocity: number; // 1/V
    slope: number; // Km / Vmax
    yIntercept: number; // 1 / Vmax
    xIntercept: number; // -1 / Km
  };
  productAccumulated: number; // umol
}

export function calculateEnzymeKinetics(
  substrateConcMM: number,
  enzymeConcNM: number,
  temperatureC: number,
  pH: number,
  inhibitorType: string,
  inhibitorConcMM: number,
  timeMinutes: number
): EnzymeKineticsState {
  const baseVmax = 120.0 * (enzymeConcNM / 2.0); // umol/(min*mg)
  const baseKm = 4.5; // mM

  // Temperature optimum curve (Gaussian around 37°C + thermal denaturation collapse above 50°C)
  const optTemp = 37.0;
  let tempFactor = 1.0;
  if (temperatureC <= optTemp) {
    tempFactor = Math.pow(2.0, (temperatureC - optTemp) / 10); // Q10 approx 2
  } else {
    // Sharp denaturation
    tempFactor = Math.max(0.01, 1.0 - Math.pow((temperatureC - optTemp) / 25, 2.2));
  }
  tempFactor = Math.max(0.02, Math.min(1.25, tempFactor));

  // pH optimum bell curve (centered at pH 7.0)
  const optpH = 7.0;
  const phFactor = Math.max(0.05, Math.exp(-Math.pow(pH - optpH, 2) / 2.2));

  // Inhibitor dynamics
  let apparentKm = baseKm;
  let apparentVmax = baseVmax * tempFactor * phFactor;
  const Ki = 3.0; // mM inhibition constant

  if (inhibitorType === "competitive") {
    // Km increases, Vmax constant
    apparentKm = baseKm * (1 + inhibitorConcMM / Ki);
  } else if (inhibitorType === "non_competitive") {
    // Vmax decreases, Km constant
    apparentVmax = apparentVmax / (1 + inhibitorConcMM / Ki);
  }

  // Michaelis-Menten Rate Law: V = (Vmax * [S]) / (Km + [S])
  const velocity = (apparentVmax * substrateConcMM) / (apparentKm + substrateConcMM);

  // Lineweaver-Burk coordinates (Double reciprocal: 1/V vs 1/[S])
  const invSubstrate = substrateConcMM > 0 ? 1 / substrateConcMM : 0;
  const invVelocity = velocity > 0 ? 1 / velocity : 0;
  const slope = apparentKm / Math.max(0.1, apparentVmax);
  const yIntercept = 1 / Math.max(0.1, apparentVmax);
  const xIntercept = -1 / Math.max(0.1, apparentKm);

  // Product formation over time (with substrate depletion approximation)
  const productAccumulated = Math.min(
    substrateConcMM * 10,
    velocity * timeMinutes * 0.85
  );

  return {
    substrateConc: substrateConcMM,
    velocity: Number(velocity.toFixed(2)),
    theoreticalVmax: Number(baseVmax.toFixed(1)),
    apparentVmax: Number(apparentVmax.toFixed(2)),
    theoreticalKm: Number(baseKm.toFixed(2)),
    apparentKm: Number(apparentKm.toFixed(2)),
    temperatureEffect: Number(tempFactor.toFixed(3)),
    pHEffect: Number(phFactor.toFixed(3)),
    lineweaverBurk: {
      invSubstrate: Number(invSubstrate.toFixed(3)),
      invVelocity: Number(invVelocity.toFixed(4)),
      slope: Number(slope.toFixed(4)),
      yIntercept: Number(yIntercept.toFixed(4)),
      xIntercept: Number(xIntercept.toFixed(4)),
    },
    productAccumulated: Number(productAccumulated.toFixed(2)),
  };
}

// ==================== BIOLOGY: BACTERIAL GROWTH & ANTIBIOTIC ====================
export interface BacterialGrowthState {
  timeHours: number;
  cellCount: number;
  log10Count: number;
  opticalDensityOD600: number;
  growthPhase: "Lag" | "Exponential (Log)" | "Stationary" | "Death";
  growthRateMu: number;
  zoneOfInhibitionDiameterMM: number; // Kirby-Bauer clearance diameter
  antibioticEfficacy: string;
}

export function calculateBacterialDynamics(
  timeHours: number,
  initialCount: number,
  nutrientLevelPct: number,
  temperatureC: number,
  antibioticType: string,
  antibioticDoseUG: number
): BacterialGrowthState {
  // Temperature factor (optimal 37°C)
  const tempFactor = Math.max(0.05, Math.exp(-Math.pow(temperatureC - 37, 2) / 120));

  // Nutrient capacity limit
  const carryingCapacity = 1.2e8 * (nutrientLevelPct / 100);
  const baseMu = 0.85 * tempFactor; // specific growth rate hr^-1

  // Kirby-Bauer Zone of Inhibition (diameter in mm)
  let zoneDiameter = 0;
  let efficacy = "No Antibiotic";
  if (antibioticType !== "none" && antibioticDoseUG > 0) {
    // Zone ~ D_disc (6mm) + slope * ln(Dose / MIC)
    const MIC = antibioticType === "ampicillin" ? 2.5 : 4.0; // ug
    if (antibioticDoseUG > MIC) {
      zoneDiameter = Math.min(38, 6.0 + 8.5 * Math.log(antibioticDoseUG / MIC));
      if (zoneDiameter >= 22) efficacy = "Susceptible (High Efficacy)";
      else if (zoneDiameter >= 14) efficacy = "Intermediate Susceptibility";
      else efficacy = "Resistant (Low Efficacy)";
    } else {
      zoneDiameter = 6.0;
      efficacy = "Sub-inhibitory (Ineffective)";
    }
  }

  // Logistic model with Lag phase (first 1.5 hrs)
  const lagDuration = 1.5 / Math.max(0.1, tempFactor);
  let effectiveTime = Math.max(0, timeHours - lagDuration);

  // Antibiotic kill rate penalty
  const killPenalty = antibioticType !== "none" ? (antibioticDoseUG / 50) * 0.45 : 0;
  const netMu = Math.max(-0.2, baseMu - killPenalty);

  let cellCount = initialCount;
  if (effectiveTime <= 0) {
    cellCount = initialCount * (1 + 0.1 * (timeHours / lagDuration));
  } else {
    // Logistic formula
    const expTerm = Math.exp(netMu * effectiveTime);
    cellCount = (carryingCapacity * initialCount * expTerm) / (carryingCapacity + initialCount * (expTerm - 1));
  }

  // Death phase after nutrient exhaustion (> 16 hours)
  if (timeHours > 16) {
    const deathFactor = Math.exp(-0.06 * (timeHours - 16));
    cellCount *= deathFactor;
  }

  cellCount = Math.max(10, Math.round(cellCount));
  const log10Count = Number(Math.log10(cellCount).toFixed(2));
  const opticalDensityOD600 = Number((Math.min(2.5, (cellCount / carryingCapacity) * 1.8)).toFixed(3));

  let growthPhase: "Lag" | "Exponential (Log)" | "Stationary" | "Death" = "Lag";
  if (timeHours < lagDuration) growthPhase = "Lag";
  else if (timeHours < 11 && cellCount < carryingCapacity * 0.85) growthPhase = "Exponential (Log)";
  else if (timeHours <= 16) growthPhase = "Stationary";
  else growthPhase = "Death";

  return {
    timeHours: Number(timeHours.toFixed(2)),
    cellCount,
    log10Count,
    opticalDensityOD600,
    growthPhase,
    growthRateMu: Number(netMu.toFixed(3)),
    zoneOfInhibitionDiameterMM: Number(zoneDiameter.toFixed(1)),
    antibioticEfficacy: efficacy,
  };
}
