import { CompanionType } from "@/data/mockData";

import plantSad from "@/assets/plant-sad.png";
import plantNeutral from "@/assets/plant-neutral.png";
import plantHappy from "@/assets/plant-happy.png";
import plantThriving from "@/assets/plant-thriving.png";
import petSad from "@/assets/pet-sad.png";
import petNeutral from "@/assets/pet-neutral.png";
import petHappy from "@/assets/pet-happy.png";
import petThriving from "@/assets/pet-thriving.png";

interface Props {
  type: CompanionType;
  mood: "sad" | "neutral" | "happy" | "thriving";
  size?: "sm" | "md" | "lg";
}

const plantImages = { sad: plantSad, neutral: plantNeutral, happy: plantHappy, thriving: plantThriving };
const petImages = { sad: petSad, neutral: petNeutral, happy: petHappy, thriving: petThriving };

const plantLabels = {
  sad: "Your plant needs attention...",
  neutral: "Your plant is growing!",
  happy: "Your plant is doing great!",
  thriving: "Your plant is blooming beautifully!",
};
const petLabels = {
  sad: "Your kitty misses you...",
  neutral: "Your kitty is waking up!",
  happy: "Your kitty is purring!",
  thriving: "Your kitty is so happy!",
};

const sizes = {
  sm: "h-20 w-20",
  md: "h-32 w-32",
  lg: "h-44 w-44",
};

export function CompanionDisplay({ type, mood, size = "lg" }: Props) {
  const image = type === "plant" ? plantImages[mood] : petImages[mood];
  const label = type === "plant" ? plantLabels[mood] : petLabels[mood];

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={image}
        alt={label}
        className={`${sizes[size]} object-contain transition-all duration-700 ${
          mood === "thriving" ? "animate-[sway_3s_ease-in-out_infinite]" : mood === "sad" ? "opacity-70" : ""
        }`}
        width={512}
        height={512}
      />
      <p className="text-sm text-muted-foreground text-center font-medium">{label}</p>
    </div>
  );
}
