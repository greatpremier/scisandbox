import { ExperimentMeta } from "../types";

export const EXPERIMENTS_LIST: ExperimentMeta[] = [
  // CHEMISTRY
  {
    id: "titration",
    discipline: "chemistry",
    title: "Acid-Base Titration & pH Curve",
    subtitle: "Strong/Weak Acid Neutralization & Volumetric Analysis",
    iconName: "FlaskConical",
    description: "Dispense precise volumes of standardized sodium hydroxide (NaOH) into hydrochloric or acetic acid with phenolphthalein/methyl orange indicators. Observe real-time color transitions, pH sigmoidal inflection curves, and locate the equivalence point.",
    learningObjectives: [
      "Determine acid concentration using stoichiometric neutralization (MaVa = MbVb)",
      "Analyze the sigmoidal buffer and equivalence inflection on pH curves",
      "Observe indicator transition intervals and endpoint vs. equivalence point discrepancy",
      "Calculate 1st derivative (dpH/dV) to pinpoint exact equivalence volume"
    ],
    principles: [
      "Equilibrium constant Kw = [H+][OH-] = 1.0 × 10^-14",
      "Henderson-Hasselbalch equation for buffer zones: pH = pKa + log([A-]/[HA])",
      "Neutralization enthalpy: H+(aq) + OH-(aq) → H2O(l), ΔH° ≈ -57.3 kJ/mol"
    ],
    presets: [
      {
        id: "strong_strong",
        name: "Standard: Strong Acid (0.10 M HCl) + Strong Base (0.10 M NaOH)",
        description: "Classic steep pH step from pH 3 to 11 with sharp equivalence at pH 7.0.",
        parameters: {
          acidType: "HCl",
          acidConcentration: 0.1,
          baseConcentration: 0.1,
          acidVolume: 25,
          indicator: "phenolphthalein",
          stirringSpeed: 400,
          dropRate: 1.0,
          temperature: 25.0
        }
      },
      {
        id: "weak_strong",
        name: "Buffer Chemistry: Weak Acid (0.10 M CH3COOH) + Strong Base",
        description: "Prominent buffering region, half-equivalence pKa determination, and basic equivalence at pH ~8.7.",
        parameters: {
          acidType: "CH3COOH",
          acidConcentration: 0.1,
          baseConcentration: 0.1,
          acidVolume: 25,
          indicator: "phenolphthalein",
          stirringSpeed: 450,
          dropRate: 1.0,
          temperature: 25.0
        }
      },
      {
        id: "unknown_acid",
        name: "Analytical Challenge: Unknown Acid Sample Determination",
        description: "Analyze an unknown acidic solution to discover its molarity through precise volumetric titration.",
        parameters: {
          acidType: "Unknown",
          acidConcentration: 0.145,
          baseConcentration: 0.1,
          acidVolume: 20,
          indicator: "bromothymol_blue",
          stirringSpeed: 500,
          dropRate: 0.8,
          temperature: 25.0
        }
      }
    ]
  },
  {
    id: "reaction_kinetics",
    discipline: "chemistry",
    title: "Gas Evolution & Reaction Kinetics",
    subtitle: "Metal-Acid Redox Kinetics (Zn + 2HCl → ZnCl₂ + H₂↑)",
    iconName: "Flame",
    description: "Measure reaction kinetics and activation energy by monitoring hydrogen gas displacement into a gas syringe. Adjust temperature, reagent concentration, and metal surface area to examine collision theory and Arrhenius kinetics.",
    learningObjectives: [
      "Measure reaction rate by monitoring gas volume evolution dV/dt over time",
      "Investigate the effect of surface area (granules vs powder) on collision frequency",
      "Calculate activation energy (Ea) using the Arrhenius relationship ln(k) vs 1/T",
      "Verify limiting reactant stoichiometry and total theoretical yield"
    ],
    principles: [
      "Arrhenius Equation: k = A · exp(-Ea / (R · T))",
      "Ideal Gas Law: P·V = n·R·T (at 1 atm, 1 mol H2 ≈ 24.45 L at 298 K)",
      "Collision Theory: Reaction rate is proportional to effective collision frequency"
    ],
    presets: [
      {
        id: "standard_granules",
        name: "Standard Zinc Granules + 1.0 M HCl (25°C)",
        description: "Moderate steady reaction rate with visible effervescence and syringe displacement.",
        parameters: {
          zincMass: 1.5,
          zincMorphology: "granules",
          acidConcentration: 1.0,
          acidVolume: 40,
          temperature: 25,
          catalystAdded: false
        }
      },
      {
        id: "high_surface_area",
        name: "Surface Area Effect: Fine Zinc Powder (25°C)",
        description: "Rapid effervescence with 5x higher initial reaction rate due to massive contact area.",
        parameters: {
          zincMass: 1.5,
          zincMorphology: "powder",
          acidConcentration: 1.0,
          acidVolume: 40,
          temperature: 25,
          catalystAdded: false
        }
      },
      {
        id: "elevated_temp",
        name: "Arrhenius Thermal Study: Elevated Temp (45°C) + Catalyst (Cu²⁺)",
        description: "Examines thermodynamic activation and catalytic electron-transfer acceleration.",
        parameters: {
          zincMass: 1.5,
          zincMorphology: "granules",
          acidConcentration: 1.5,
          acidVolume: 40,
          temperature: 45,
          catalystAdded: true
        }
      }
    ]
  },

  // PHYSICS
  {
    id: "projectile",
    discipline: "physics",
    title: "3D Projectile Motion & Aerodynamics",
    subtitle: "Kinematics, Quadratic Air Drag, Wind Vector & Energy Conservation",
    iconName: "Compass",
    description: "Launch ballistic projectiles in a fully interactive 3D environment. Adjust elevation angle, muzzle velocity, gravitational acceleration across different celestial bodies, quadratic air drag, and lateral crosswind. Track instantaneous trajectory coordinates, velocity vectors, and mechanical energy partition.",
    learningObjectives: [
      "Decompose 2D/3D velocity vectors into orthogonal x, y, z kinematic components",
      "Analyze the deviation between parabolic vacuum trajectories and non-parabolic aerodynamic drag",
      "Find optimal launch angles under air resistance (shifts below 45°)",
      "Examine mechanical energy conservation vs. work done against aerodynamic drag"
    ],
    principles: [
      "Newtonian Equation of Motion: m·(dv/dt) = m·g - (1/2)·ρ·Cd·A·|v|·v + F_wind",
      "Kinetic & Potential Energy: E_k = 0.5·m·v², E_p = m·g·h",
      "Theoretical vacuum range: R = (v₀² · sin(2θ)) / g"
    ],
    presets: [
      {
        id: "earth_vacuum",
        name: "Ideal Vacuum Parabola (Earth, g = 9.81 m/s², No Drag)",
        description: "Classic textbook symmetric trajectory peaking at 45° for maximum range.",
        parameters: {
          muzzleVelocity: 28,
          launchAngle: 45,
          launchHeight: 1.5,
          gravity: 9.81,
          projectileMass: 2.0,
          dragCoefficient: 0.0,
          airDensity: 0.0,
          windSpeed: 0.0,
          targetDistance: 75
        }
      },
      {
        id: "earth_real_aerodynamics",
        name: "Realistic Earth Ballistics (Spherical Cannonball, Drag & Wind)",
        description: "Steep terminal descent with kinetic energy dissipation into aerodynamic turbulence.",
        parameters: {
          muzzleVelocity: 35,
          launchAngle: 42,
          launchHeight: 1.5,
          gravity: 9.81,
          projectileMass: 4.5,
          dragCoefficient: 0.47,
          airDensity: 1.225,
          windSpeed: -4.0,
          targetDistance: 85
        }
      },
      {
        id: "moon_gravity",
        name: "Lunar Surface Ballistics (Moon, g = 1.62 m/s², High Altitude)",
        description: "Enormous hang-time and ballistic range in the lunar vacuum.",
        parameters: {
          muzzleVelocity: 25,
          launchAngle: 45,
          launchHeight: 2.0,
          gravity: 1.62,
          projectileMass: 2.0,
          dragCoefficient: 0.0,
          airDensity: 0.0,
          windSpeed: 0.0,
          targetDistance: 110
        }
      },
      {
        id: "mars_atmosphere",
        name: "Martian Atmospheric Launch (Mars, g = 3.71 m/s², Low Density)",
        description: "Low Martian gravity with thin atmosphere (1% Earth density).",
        parameters: {
          muzzleVelocity: 30,
          launchAngle: 45,
          launchHeight: 1.5,
          gravity: 3.71,
          projectileMass: 3.0,
          dragCoefficient: 0.35,
          airDensity: 0.02,
          windSpeed: 3.0,
          targetDistance: 95
        }
      }
    ]
  },
  {
    id: "optics_prism",
    discipline: "physics",
    title: "Wave Optics & Prism Refraction",
    subtitle: "Snell's Law, Sellmeier Dispersion, Rainbow Spectrum & Critical Angle",
    iconName: "Eye",
    description: "Direct precision laser beams and white-light polychromatic bundles through equilateral and triangular prisms. Measure angle of incidence vs. deviation angle, observe chromatic dispersion from violet (380 nm) to red (750 nm), and demonstrate total internal reflection (TIR).",
    learningObjectives: [
      "Verify Snell's Law at multiple planar interfaces: n₁·sin(θ₁) = n₂·sin(θ₂)",
      "Measure minimum angle of deviation (δ_min) to determine material refractive index",
      "Demonstrate wavelength-dependent chromatic dispersion (Cauchy/Sellmeier equations)",
      "Calculate critical angle θ_c = arcsin(n₂/n₁) and observe Total Internal Reflection"
    ],
    principles: [
      "Snell's Law: n₁·sin(θ₁) = n₂·sin(θ₂)",
      "Cauchy Dispersion: n(λ) = A + B / λ²",
      "Critical Angle for Total Internal Reflection: θ_c = arcsin(1 / n)"
    ],
    presets: [
      {
        id: "flint_white_dispersion",
        name: "Newton's Prism: White Light into Rainbow Spectrum (Dense Flint Glass)",
        description: "High-dispersion flint glass prism splitting white light into the full visible spectrum.",
        parameters: {
          lightMode: "white",
          wavelength: 550,
          incidentAngle: 48,
          prismMaterial: "flint_glass",
          prismApexAngle: 60,
          beamIntensity: 100
        }
      },
      {
        id: "crown_green_refraction",
        name: "Monochromatic Laser (532 nm Green) in Crown Glass",
        description: "Clear sharp refraction path with precise numerical measurement of incident and refracted angles.",
        parameters: {
          lightMode: "monochromatic",
          wavelength: 532,
          incidentAngle: 45,
          prismMaterial: "crown_glass",
          prismApexAngle: 60,
          beamIntensity: 100
        }
      },
      {
        id: "diamond_tir",
        name: "Diamond Prism & Total Internal Reflection (High Index n ≈ 2.42)",
        description: "Extreme refractive index showcasing tight critical angle (θ_c ≈ 24.4°) and internal reflection.",
        parameters: {
          lightMode: "monochromatic",
          wavelength: 633,
          incidentAngle: 65,
          prismMaterial: "diamond",
          prismApexAngle: 60,
          beamIntensity: 100
        }
      }
    ]
  },

  // BIOLOGY
  {
    id: "enzyme_kinetics",
    discipline: "biology",
    title: "Enzyme Kinetics & Molecular Docking",
    subtitle: "Michaelis-Menten Model, Lineweaver-Burk Analysis & Inhibitor Dynamics",
    iconName: "Dna",
    description: "Simulate catalytic substrate conversion by an enzyme (e.g., Catalase / Amylase). Vary substrate concentration [S], temperature, pH, and competitive/non-competitive inhibitors. Generate real-time Lineweaver-Burk double-reciprocal plots to calculate Vmax and Km.",
    learningObjectives: [
      "Determine fundamental kinetic constants: maximum velocity Vmax and Michaelis constant Km",
      "Construct and interpret double-reciprocal Lineweaver-Burk plots (1/V vs. 1/[S])",
      "Observe enzyme thermal denaturation and optimal pH bell-shaped activity curves",
      "Differentiate competitive inhibition (increased apparent Km) from non-competitive inhibition (reduced Vmax)"
    ],
    principles: [
      "Michaelis-Menten Rate Law: V = (Vmax · [S]) / (Km + [S])",
      "Lineweaver-Burk Reciprocal: 1/V = (Km / Vmax) · (1/[S]) + (1 / Vmax)",
      "Arrhenius Thermal Peak & Protein Denaturation: k_cat(T) = k₀ · T · exp(-Ea/RT) / (1 + K_denat)"
    ],
    presets: [
      {
        id: "standard_kinetics",
        name: "Baseline Enzyme Kinetics (Catalase / H₂O₂ at Optimal 37°C, pH 7.0)",
        description: "Classic hyperbolic saturation curve reaching asymptotic Vmax.",
        parameters: {
          substrateConcentration: 15, // mM
          enzymeConcentration: 2.0, // nM
          temperature: 37, // °C
          pH: 7.0,
          inhibitorType: "none",
          inhibitorConcentration: 0.0
        }
      },
      {
        id: "competitive_inhibition",
        name: "Competitive Inhibition (Substrate-Analog Drug)",
        description: "Inhibitor competes for the active site, increasing apparent Km while preserving theoretical Vmax.",
        parameters: {
          substrateConcentration: 15,
          enzymeConcentration: 2.0,
          temperature: 37,
          pH: 7.0,
          inhibitorType: "competitive",
          inhibitorConcentration: 5.0
        }
      },
      {
        id: "thermal_denaturation",
        name: "Thermal Stress & Denaturation (High Temp: 62°C)",
        description: "Enzyme active site conformation unravels at high temperatures, collapsing catalytic efficiency.",
        parameters: {
          substrateConcentration: 25,
          enzymeConcentration: 2.0,
          temperature: 62,
          pH: 7.0,
          inhibitorType: "none",
          inhibitorConcentration: 0.0
        }
      }
    ]
  },
  {
    id: "bacterial_growth",
    discipline: "biology",
    title: "Bacterial Population Growth & Antibiotic Assay",
    subtitle: "Logistic Population Dynamics, Kirby-Bauer Zone of Inhibition & Turbidity",
    iconName: "Microscope",
    description: "Cultivate microbial colonies (E. coli / B. subtilis) in an interactive 3D Petri dish with real-time optical density (OD600) logging. Test antimicrobial susceptibility using antibiotic diffusion discs (Ampicillin, Kanamycin) to measure the zone of inhibition (Kirby-Bauer assay).",
    learningObjectives: [
      "Identify the 4 bacterial growth phases: Lag, Exponential (Log), Stationary, and Death",
      "Model logistic carrying capacity K and specific growth rate μ using dN/dt = rN(1 - N/K)",
      "Conduct a standardized Kirby-Bauer antibiotic susceptibility test",
      "Calculate minimum inhibitory concentration (MIC) and correlate with clearance diameter"
    ],
    principles: [
      "Logistic Growth Equation: dN/dt = μ · N · (1 - N / K)",
      "Beer-Lambert Turbidimetry: Optical Density OD₆₀₀ = ε · c · l",
      "Fick's Second Law of Antibiotic Diffusion: C(r, t) = (M / 4πDt) · exp(-r² / 4Dt)"
    ],
    presets: [
      {
        id: "standard_growth",
        name: "Standard E. coli Culture in LB Broth (Optimal 37°C)",
        description: "Rapid exponential doubling leading to carrying-capacity nutrient exhaustion.",
        parameters: {
          initialCount: 50,
          nutrientLevel: 100, // %
          temperature: 37, // °C
          antibioticType: "none",
          antibioticDose: 0,
          agarType: "nutrient_agar",
          incubationSpeed: 1
        }
      },
      {
        id: "ampicillin_assay",
        name: "Kirby-Bauer Assay: Ampicillin Disc Diffusion",
        description: "Forms a sharp circular zone of inhibition where bacterial cell wall synthesis is blocked.",
        parameters: {
          initialCount: 120,
          nutrientLevel: 100,
          temperature: 37,
          antibioticType: "ampicillin",
          antibioticDose: 20, // ug
          agarType: "mueller_hinton",
          incubationSpeed: 2
        }
      },
      {
        id: "cold_stress",
        name: "Environmental Inhibition: Cold Storage (10°C Refrigeration)",
        description: "Metabolic kinetics slow down dramatically, keeping cells in an extended lag phase.",
        parameters: {
          initialCount: 80,
          nutrientLevel: 80,
          temperature: 10,
          antibioticType: "none",
          antibioticDose: 0,
          agarType: "nutrient_agar",
          incubationSpeed: 1
        }
      }
    ]
  }
];
