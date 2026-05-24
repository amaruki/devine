"use client";

import { motion } from "motion/react";

type DuckSpeechBubbleProps = {
  speech: string;
  animationCue: "idle" | "celebrate" | "tired" | "revive";
};

export function DuckSpeechBubble({ speech, animationCue }: DuckSpeechBubbleProps) {
  const isCelebrate = animationCue === "celebrate";
  const isRevive = animationCue === "revive";

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl px-5 py-4 ${
          isCelebrate
            ? "border border-yellow-500/40 bg-gradient-to-r from-yellow-500/20 to-orange-500/20"
            : isRevive
              ? "border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
              : "border border-slate-700 bg-slate-900"
        }`}
      >
        <p className="text-slate-200">{speech}</p>
      </motion.div>
      <div
        className={`absolute top-4 -left-2 h-0 w-0 border-y-8 border-r-8 border-y-transparent ${
          isCelebrate
            ? "border-r-yellow-500/40"
            : isRevive
              ? "border-r-cyan-500/40"
              : "border-r-slate-700"
        }`}
        style={{ transform: "translateX(-100%)" }}
      />
    </div>
  );
}
