import { useState, useEffect, useRef, useCallback } from "react";
import { usePatient } from "@/context/PatientContext";
import { PainLevel, AIPersona } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send } from "lucide-react";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  role: "ai" | "user";
  text: string;
  options?: ChatOption[];
  type?: "pain-scale" | "yes-no" | "open-ended";
}

interface ChatOption {
  label: string;
  emoji?: string;
  image?: string;
  value: string;
}

type CheckInPhase = "greeting" | "pain" | "medication" | "exercises" | "falls" | "feelings" | "closing";

const personaStyles: Record<AIPersona, {
  greeting: (name: string) => string;
  painAsk: string;
  painResponse: (level: PainLevel) => string;
  medAsk: string;
  medYes: string;
  medNo: string;
  exerciseAsk: string;
  exerciseYes: string;
  exerciseNo: string;
  exercisePartial: string;
  fallAsk: string;
  fallNo: string;
  fallYes: string;
  feelingsAsk: string;
  closing: (streak: number) => string;
}> = {
  "warm-elder": {
    greeting: (name) =>
      `Good ${getTimeOfDay()}, ${name || "dear"}! So glad you're here. How are we doing today? Let's have a little chat about how you're feeling.`,
    painAsk:
      "First things first — how's the pain been today? Pick a number that matches how you're feeling.",
    painResponse: (level) => {
      if (level === 0) return "Wonderful — no pain at all! That's a beautiful thing. Keep doing what you're doing! 🌟";
      if (level === 1) return "Just a tiny bit — barely there. That's really great news, dear. You're doing so well!";
      if (level === 2) return "A little twinge, but nothing too bad. You're managing really well. 💛";
      if (level === 3) return "A mild amount of pain — that's okay, it's part of the healing process. You're hanging in there.";
      if (level === 4) return "A bit more than mild — I hear you. Let's keep an eye on it. You're doing a great job staying on top of things.";
      if (level === 5) return "Right in the middle — moderate pain. That can be tough to deal with. Remember to rest when you need to. 🤗";
      if (level === 6) return "That's more than moderate — I'm sorry you're going through that. Your care team should know about this.";
      if (level === 7) return "Severe pain — I'm really sorry, dear. That must be so hard. We'll make sure your care team is aware. 💜";
      if (level === 8) return "That's a lot of pain. I wish I could do more. Please know your care team will be notified right away. You're so brave.";
      if (level === 9) return "I'm so sorry you're hurting this much. That takes real strength to share. Your care team will be alerted immediately. 🫂";
      return "Extreme pain — oh dear, I'm truly sorry. Please rest and know that your care team is being contacted right now. You're not alone. ❤️";
    },
    medAsk: "Now, did you manage to take all your medications today? I know it can be a lot to keep track of.",
    medYes: "That's fantastic! Staying on top of your meds is so important, and you're doing a wonderful job.",
    medNo: "That's okay — it happens to the best of us. Let's make sure we note that so your care team can help.",
    exerciseAsk: "How about your physical therapy exercises today? Have you been able to do them?",
    exerciseYes: "That's wonderful! Doing your exercises is so important for your recovery. I'm really proud of you! 💪",
    exerciseNo: "That's alright, dear. Tomorrow is a new day. Even a little movement helps your healing.",
    exercisePartial: "Good effort! Every bit counts. Try to finish the rest when you feel up to it. 🌟",
    fallAsk: "One more quick question — have you had any stumbles or falls today? Even a little wobble counts.",
    fallNo: "That's great news! Steady on your feet — keep it up.",
    fallYes: "Thank you for letting me know. That's really important information. Your care team will want to know about this.",
    feelingsAsk: "Last thing — how are you really feeling today? You can talk about anything at all. Try tapping the mic to speak!",
    closing: (streak) =>
      `You're amazing! That's ${streak + 1} days in a row of checking in. Thank you for spending this time with me today.`,
  },
  "friendly-adult": {
    greeting: (name) =>
      `Hey ${name || "there"}! Good ${getTimeOfDay()}. Ready for your daily check-in? It'll just take a minute.`,
    painAsk: "How's your pain level today? Pick the one that feels right:",
    painResponse: (level) => {
      if (level === 0) return "Zero pain — amazing! Love to see it! 🎉";
      if (level <= 2) return "Barely any pain — that's a great day! Keep it up! 💪";
      if (level <= 4) return "Mild to moderate — not bad at all. Thanks for logging that.";
      if (level <= 6) return "Moderate pain — that's tough but you're pushing through. We've got your back.";
      if (level <= 8) return "That's a rough one. Sorry you're dealing with that. Your team will be looped in. 💙";
      return "Extreme pain — I'm really sorry. Hang in there, your care team is being notified. 🫂";
    },
    medAsk: "Did you take all your meds today?",
    medYes: "Perfect, that's logged. Consistency is key.",
    medNo: "No worries — we'll note it. Try to catch up if you can.",
    exerciseAsk: "Did you get your PT exercises done today?",
    exerciseYes: "Nice work! Consistency with your exercises is key to recovery. 🏋️",
    exerciseNo: "No worries — try to fit some in later if you can. Every rep counts.",
    exercisePartial: "Good start! Try to finish the rest when you get a chance.",
    fallAsk: "Any falls or stumbles today?",
    fallNo: "Awesome, glad to hear it!",
    fallYes: "Thanks for letting me know. Your care team will be informed.",
    feelingsAsk: "How are you feeling overall? Tap the mic to speak or type it out.",
    closing: (streak) =>
      `Done! ${streak + 1}-day streak. Your companion is thriving. See you tomorrow!`,
  },
  clinical: {
    greeting: (name) =>
      `Hello${name ? `, ${name}` : ""}. Let's complete your daily health check-in.`,
    painAsk: "Please rate your current pain level on a scale of 0 to 10:",
    painResponse: (level) => {
      if (level === 0) return "Pain level 0 — no pain reported. Excellent status.";
      if (level <= 2) return `Pain level ${level} noted. Minimal pain — within optimal recovery range.`;
      if (level <= 4) return `Pain level ${level} recorded. Mild range. Monitoring recommended.`;
      if (level <= 6) return `Pain level ${level} recorded. Moderate range. This will be flagged for review.`;
      if (level <= 8) return `Pain level ${level} recorded. Severe range. Provider will be notified promptly.`;
      return `Pain level ${level} recorded. Critical pain level. Immediate provider notification initiated.`;
    },
    medAsk: "Have you taken all prescribed medications today?",
    medYes: "Medication adherence confirmed.",
    medNo: "Non-adherence noted. Please take medications as prescribed when possible.",
    exerciseAsk: "Have you completed your prescribed physical therapy exercises today?",
    exerciseYes: "Exercise adherence confirmed. This supports optimal recovery trajectory.",
    exerciseNo: "Exercise non-adherence noted. Rehabilitation exercises are critical for recovery outcomes.",
    exercisePartial: "Partial completion recorded. Please complete remaining exercises when possible.",
    fallAsk: "Have you experienced any falls or balance issues today?",
    fallNo: "No falls recorded.",
    fallYes: "Fall event recorded. Your provider will be notified.",
    feelingsAsk: "Please describe your overall condition or any concerns. You may use the microphone:",
    closing: (streak) =>
      `Check-in complete. Consecutive days: ${streak + 1}. Next check-in due tomorrow.`,
  },
};

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

const painOptions: ChatOption[] = [
  { label: "0 – No pain", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3 – Mild", value: "3" },
  { label: "4", value: "4" },
  { label: "5 – Moderate", value: "5" },
  { label: "6", value: "6" },
  { label: "7 – Severe", value: "7" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "10 – Extreme", value: "10" },
];

const yesNoOptions: ChatOption[] = [
  { label: "Yes, I did", value: "yes" },
  { label: "No, not today", value: "no" },
];

const fallOptions: ChatOption[] = [
  { label: "No, all good", value: "no" },
  { label: "Yes, I had one", value: "yes" },
];

const exerciseOptions: ChatOption[] = [
  { label: "Yes, all done! 💪", value: "yes" },
  { label: "Some of them", value: "partial" },
  { label: "Not today", value: "no" },
];

interface Props {
  onComplete: (painLevel: PainLevel, medsTaken: boolean, falls: boolean, summary: string) => void;
}

export function ChatCheckIn({ onComplete }: Props) {
  const { settings, streak } = usePatient();
  const persona = personaStyles[settings.aiPersona] || personaStyles["warm-elder"];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<CheckInPhase>("greeting");
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [painLevel, setPainLevel] = useState<PainLevel>(5);
  const [medsTaken, setMedsTaken] = useState(true);
  const [falls, setFalls] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ElevenLabs Scribe for voice-to-text
  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    onCommittedTranscript: (data) => {
      if (data.text) {
        setUserInput((prev) => prev + data.text + " ");
      }
    },
  });

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, []);

  const addAIMessage = useCallback(
    (text: string, options?: ChatOption[], type?: ChatMessage["type"]) => {
      setIsTyping(true);
      const delay = Math.min(800 + text.length * 12, 2500);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { role: "ai", text, options, type }]);
        scrollToBottom();
      }, delay);
    },
    [scrollToBottom]
  );

  useEffect(() => {
    addAIMessage(persona.greeting(settings.name));
    const t = setTimeout(() => {
      addAIMessage(persona.painAsk, painOptions, "pain-scale");
    }, 2000 + persona.greeting(settings.name).length * 12);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRecording = useCallback(async () => {
    if (recording) {
      // Stop recording
      scribe.disconnect();
      setRecording(false);
    } else {
      // Start recording
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const { data, error } = await supabase.functions.invoke("elevenlabs-scribe-token");

        if (error || !data?.token) {
          toast.error("Voice transcription unavailable. Please type instead.");
          return;
        }

        await scribe.connect({
          token: data.token,
          microphone: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        setRecording(true);
      } catch (e) {
        console.error("Mic error:", e);
        toast.error("Could not access microphone. Please check permissions.");
      }
    }
  }, [recording, scribe]);

  const handleOptionSelect = (option: ChatOption) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: option.label },
    ]);
    setMessages((prev) =>
      prev.map((m, i) => (i === prev.length - 1 && m.role === "ai" ? { ...m, options: undefined } : m))
    );
    scrollToBottom();

    if (phase === "greeting" || phase === "pain") {
      const level = parseInt(option.value) as PainLevel;
      setPainLevel(level);
      setPhase("medication");
      addAIMessage(persona.painResponse(level));
      setTimeout(() => {
        addAIMessage(persona.medAsk, yesNoOptions, "yes-no");
      }, 1500 + persona.painResponse(level).length * 10);
    } else if (phase === "medication") {
      const took = option.value === "yes";
      setMedsTaken(took);
      setPhase("exercises");
      addAIMessage(took ? persona.medYes : persona.medNo);
      setTimeout(() => {
        addAIMessage(persona.exerciseAsk, exerciseOptions, "yes-no");
      }, 1500 + (took ? persona.medYes : persona.medNo).length * 10);
    } else if (phase === "exercises") {
      const response = option.value === "yes" ? persona.exerciseYes : option.value === "partial" ? persona.exercisePartial : persona.exerciseNo;
      setPhase("falls");
      addAIMessage(response);
      setTimeout(() => {
        addAIMessage(persona.fallAsk, fallOptions, "yes-no");
      }, 1500 + response.length * 10);
    } else if (phase === "falls") {
      const fell = option.value === "yes";
      setFalls(fell);
      setPhase("feelings");
      addAIMessage(fell ? persona.fallYes : persona.fallNo);
      setTimeout(() => {
        addAIMessage(persona.feelingsAsk, undefined, "open-ended");
      }, 1500 + (fell ? persona.fallYes : persona.fallNo).length * 10);
    }
  };

  const handleSendText = () => {
    if (!userInput.trim()) return;
    const text = userInput.trim();
    setUserInput("");

    // Stop recording if active
    if (recording) {
      scribe.disconnect();
      setRecording(false);
    }

    setMessages((prev) => [...prev, { role: "user", text }]);
    scrollToBottom();

    if (phase === "feelings") {
      setPhase("closing");
      addAIMessage(persona.closing(streak));
      setTimeout(() => {
        onComplete(painLevel, medsTaken, falls, text);
      }, 2000 + persona.closing(streak).length * 12);
    }
  };

  const showTextInput = phase === "feelings" && !isTyping && messages.some(m => m.type === "open-ended");
  const isComplete = phase === "closing";

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "ai"
                  ? "bg-card text-card-foreground shadow-sm rounded-bl-md"
                  : "bg-primary text-primary-foreground rounded-br-md"
              }`}
            >
              {msg.text}
              {msg.options && (
                <div className={`mt-3 flex flex-wrap gap-2 ${msg.type === "pain-scale" ? "justify-center" : ""}`}>
                  {msg.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleOptionSelect(opt)}
                      className={`flex items-center gap-1.5 rounded-xl bg-background border border-border hover:border-primary hover:bg-primary/5 transition-all text-foreground text-sm font-medium ${opt.image ? "flex-col px-3 py-2" : "px-3.5 py-2.5"}`}
                    >
                      {opt.image && <img src={opt.image} alt={opt.label} className="h-10 w-10 object-contain" />}
                      {opt.emoji && !opt.image && <span className="text-lg">{opt.emoji}</span>}
                      <span className={opt.image ? "text-xs" : ""}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card text-card-foreground shadow-sm rounded-2xl rounded-bl-md px-4 py-3.5">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      {showTextInput && !isComplete && (
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="flex gap-2 items-end max-w-lg mx-auto">
            <button
              onClick={toggleRecording}
              className={`p-2.5 rounded-xl shrink-0 transition-all ${
                recording
                  ? "bg-destructive/10 border border-destructive"
                  : "bg-secondary border border-transparent hover:bg-muted"
              }`}
            >
              {recording ? (
                <MicOff className="h-5 w-5 text-destructive" />
              ) : (
                <Mic className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <div className="flex-1 relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendText();
                  }
                }}
                placeholder={recording ? (scribe.partialTranscript || "Listening... speak now") : "Type how you're feeling..."}
                rows={2}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <Button
              onClick={handleSendText}
              disabled={!userInput.trim()}
              size="icon"
              className="rounded-xl h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {recording && (
            <p className="text-center text-destructive text-xs mt-2 animate-pulse font-medium">
              🎤 Recording... tap mic to stop
            </p>
          )}
        </div>
      )}
    </div>
  );
}
