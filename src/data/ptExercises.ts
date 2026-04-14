export interface PTExercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: string;
  phase: "early" | "mid" | "late";
  week: string;
  category: "rom" | "strengthening" | "balance" | "functional" | "stretching";
  instructions: string[];
}

export const kneeRehabExercises: PTExercise[] = [
  // Early phase (Weeks 1-2)
  {
    id: "ankle-pumps",
    name: "Ankle Pumps",
    description: "Improve circulation and prevent blood clots",
    sets: 3,
    reps: "20 each direction",
    phase: "early",
    week: "1-2",
    category: "rom",
    instructions: [
      "Lie on your back with legs straight",
      "Slowly push your foot down (like pressing a gas pedal)",
      "Then pull your foot back toward you",
      "Repeat in a pumping motion",
    ],
  },
  {
    id: "quad-sets",
    name: "Quad Sets",
    description: "Activate and strengthen the quadriceps",
    sets: 3,
    reps: "10 (hold 5 sec each)",
    phase: "early",
    week: "1-2",
    category: "strengthening",
    instructions: [
      "Lie on your back with leg straight",
      "Tighten the muscle on top of your thigh",
      "Push the back of your knee down into the bed",
      "Hold for 5 seconds, then relax",
    ],
  },
  {
    id: "heel-slides",
    name: "Heel Slides",
    description: "Improve knee flexion range of motion",
    sets: 3,
    reps: "10",
    phase: "early",
    week: "1-2",
    category: "rom",
    instructions: [
      "Lie on your back with legs straight",
      "Slowly slide your heel toward your buttock, bending your knee",
      "Go as far as comfortable, hold 2 seconds",
      "Slowly straighten your leg back out",
    ],
  },
  {
    id: "sle-supine",
    name: "Straight Leg Raises (Supine)",
    description: "Strengthen hip flexors and quadriceps",
    sets: 3,
    reps: "10",
    phase: "early",
    week: "1-2",
    category: "strengthening",
    instructions: [
      "Lie on your back, tighten quad on surgical leg",
      "Keep knee straight, lift leg 12 inches off bed",
      "Hold 3 seconds at the top",
      "Slowly lower back down",
    ],
  },
  // Mid phase (Weeks 3-6)
  {
    id: "wall-slides",
    name: "Wall Slides",
    description: "Progress knee flexion with gravity assistance",
    sets: 3,
    reps: "10 (hold 10 sec)",
    phase: "mid",
    week: "3-6",
    category: "rom",
    instructions: [
      "Lie on your back near a wall, feet on the wall",
      "Slowly slide your foot down the wall, bending your knee",
      "Hold for 10 seconds at maximum comfortable bend",
      "Slide back up to straighten",
    ],
  },
  {
    id: "mini-squats",
    name: "Mini Squats",
    description: "Build functional leg strength",
    sets: 3,
    reps: "10",
    phase: "mid",
    week: "3-6",
    category: "strengthening",
    instructions: [
      "Stand holding onto a sturdy surface for balance",
      "Slowly bend both knees to a partial squat (30-45°)",
      "Keep weight evenly distributed on both legs",
      "Slowly return to standing",
    ],
  },
  {
    id: "step-ups",
    name: "Step-Ups (4-6 inch)",
    description: "Improve stair climbing ability",
    sets: 3,
    reps: "10 each leg",
    phase: "mid",
    week: "3-6",
    category: "functional",
    instructions: [
      "Stand in front of a low step with railing support",
      "Step up with the surgical leg first",
      "Bring the other leg up to meet it",
      "Step down with the non-surgical leg first",
    ],
  },
  {
    id: "hamstring-curls",
    name: "Standing Hamstring Curls",
    description: "Strengthen the hamstrings",
    sets: 3,
    reps: "10",
    phase: "mid",
    week: "3-6",
    category: "strengthening",
    instructions: [
      "Stand holding a chair or counter for balance",
      "Slowly bend your knee, bringing heel toward buttock",
      "Hold 2 seconds at the top",
      "Slowly lower back down",
    ],
  },
  {
    id: "balance-single",
    name: "Single Leg Balance",
    description: "Improve balance and proprioception",
    sets: 3,
    reps: "30 sec hold",
    phase: "mid",
    week: "3-6",
    category: "balance",
    instructions: [
      "Stand near a counter for safety",
      "Shift weight to surgical leg",
      "Lift the other foot slightly off the ground",
      "Hold balance for 30 seconds, use support if needed",
    ],
  },
  // Late phase (Weeks 7-12)
  {
    id: "terminal-ext",
    name: "Terminal Knee Extensions",
    description: "Full quadriceps activation at end range",
    sets: 3,
    reps: "15",
    phase: "late",
    week: "7-12",
    category: "strengthening",
    instructions: [
      "Place a rolled towel under your knee while seated",
      "Straighten your knee fully against resistance",
      "Hold 3 seconds at full extension",
      "Slowly lower back to starting position",
    ],
  },
  {
    id: "lateral-steps",
    name: "Lateral Step-Overs",
    description: "Improve lateral stability and hip strength",
    sets: 3,
    reps: "10 each direction",
    phase: "late",
    week: "7-12",
    category: "functional",
    instructions: [
      "Set up small cones or objects in a line",
      "Step sideways over each object",
      "Keep knees slightly bent throughout",
      "Return in the other direction",
    ],
  },
  {
    id: "calf-raises",
    name: "Calf Raises",
    description: "Strengthen lower leg for walking endurance",
    sets: 3,
    reps: "15",
    phase: "late",
    week: "7-12",
    category: "strengthening",
    instructions: [
      "Stand with feet hip-width apart, holding support",
      "Rise up onto your toes as high as comfortable",
      "Hold 2 seconds at the top",
      "Slowly lower back down",
    ],
  },
  {
    id: "sit-to-stand",
    name: "Sit-to-Stand (No Hands)",
    description: "Functional strength for daily activities",
    sets: 3,
    reps: "10",
    phase: "late",
    week: "7-12",
    category: "functional",
    instructions: [
      "Sit on a firm chair with feet flat on the floor",
      "Cross arms over your chest",
      "Lean forward slightly and stand up using only your legs",
      "Slowly sit back down with control",
    ],
  },
];

export const categoryLabels: Record<PTExercise["category"], string> = {
  rom: "Range of Motion",
  strengthening: "Strengthening",
  balance: "Balance",
  functional: "Functional",
  stretching: "Stretching",
};

export const phaseLabels: Record<PTExercise["phase"], string> = {
  early: "Early Recovery (Weeks 1-2)",
  mid: "Building Strength (Weeks 3-6)",
  late: "Return to Function (Weeks 7-12)",
};
