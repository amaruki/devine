"use client";

import { motion } from "motion/react";

type DuckAvatarProps = {
  healthState: "thriving" | "stable" | "tired" | "sick" | "critical" | "hibernating";
  seniorityLevel: "ignorant_copaster" | "code_monkey" | "grounded_scholar" | "tech_philosopher";
  animationCue: "idle" | "celebrate" | "tired" | "revive";
};

const bodyGradients: Record<string, { body: string; wing: string }> = {
  ignorant_copaster: {
    body: "#C4C4C4",
    wing: "#A0A0A0",
  },
  code_monkey: {
    body: "#FFD700",
    wing: "#FFC300",
  },
  grounded_scholar: {
    body: "#7B68EE",
    wing: "#6A5ACD",
  },
  tech_philosopher: {
    body: "#00CED1",
    wing: "#20B2AA",
  },
};

const healthGlow: Record<string, string> = {
  thriving: "border-cyan-400/40",
  stable: "border-cyan-400/30",
  tired: "border-yellow-400/30",
  sick: "border-orange-400/40",
  critical: "border-red-400/50",
  hibernating: "border-slate-600/30",
};

export function DuckAvatar({ healthState, seniorityLevel, animationCue }: DuckAvatarProps) {
  const colors = bodyGradients[seniorityLevel] ?? bodyGradients.code_monkey;
  const glow = healthGlow[healthState] ?? healthGlow.stable;

  const animateProps =
    animationCue === "celebrate"
      ? { y: [0, -8, 0, -5, 0], transition: { duration: 0.6, ease: "easeInOut" as const } }
      : animationCue === "tired"
        ? {
            y: [0, 2, 0],
            rotate: [-0.5, 0.5, 0],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
          }
        : animationCue === "revive"
          ? {
              scale: [1, 0.95, 1.02, 1],
              transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
            }
          : {
              y: [0, -1, 0],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
            };

  const opacity = healthState === "hibernating" ? 0.5 : 1;

  return (
    <motion.div
      animate={animateProps}
      className={`inline-flex shrink-0 rounded-3xl border ${glow} bg-cyan-400/10 p-6`}
      aria-label={`${seniorityLevel} duck is ${healthState}`}
      transition={{ duration: 0.5 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        className="h-48 w-48 sm:h-56 sm:w-56"
        style={{ opacity }}
      >
        <defs>
          <radialGradient id="bodyGrad" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#FFF066" />
            <stop offset="60%" stopColor={colors.body} />
            <stop offset="100%" stopColor={colors.wing} />
          </radialGradient>
          <radialGradient id="wingGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFEA4D" />
            <stop offset="100%" stopColor={colors.wing} />
          </radialGradient>
          <linearGradient id="topBeakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFAA00" />
            <stop offset="100%" stopColor="#E65C00" />
          </linearGradient>
          <linearGradient id="bottomBeakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF7F00" />
            <stop offset="100%" stopColor="#CC4400" />
          </linearGradient>
        </defs>

        <g id="water-base">
          <ellipse cx="200" cy="320" rx="140" ry="35" fill="#9CD8E8" />
          <ellipse cx="200" cy="320" rx="110" ry="25" fill="#BAE6F5" />
          <ellipse cx="200" cy="320" rx="80" ry="15" fill="#D3F0FA" />
          <ellipse cx="190" cy="315" rx="70" ry="15" fill="#69B4D1" opacity="0.6" />
          <path
            d="M 80 320 A 120 30 0 0 0 320 320"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 110 330 A 90 20 0 0 0 290 330"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        <path
          d="M 190 90
                   C 140 90, 130 130, 130 160
                   C 130 180, 145 195, 145 195
                   C 120 195, 100 180, 90 190
                   C 80 200, 80 240, 110 270
                   C 130 290, 160 310, 190 310
                   C 250 310, 280 260, 270 210
                   C 260 180, 230 170, 230 170
                   C 240 130, 230 90, 190 90 Z"
          fill="url(#bodyGrad)"
          stroke="#7A4214"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        <g id="wing">
          <path
            d="M 120 230
                     C 115 260, 130 285, 160 290
                     C 190 295, 210 270, 210 240
                     C 210 215, 190 215, 170 215
                     C 140 215, 125 220, 120 230 Z"
            fill="url(#wingGrad)"
            stroke="#7A4214"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path
            d="M 130 250 C 145 260, 170 260, 185 245"
            fill="none"
            stroke="#7A4214"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 140 270 C 150 275, 165 275, 175 265"
            fill="none"
            stroke="#7A4214"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        <g id="beak">
          <path
            d="M 215 155
                     C 250 145, 280 155, 295 170
                     C 305 185, 290 200, 260 200
                     C 230 200, 215 185, 205 175 Z"
            fill="url(#topBeakGrad)"
            stroke="#7A4214"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path
            d="M 235 155 Q 260 152, 280 162"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
          />
          <ellipse cx="250" cy="158" rx="2" ry="4" fill="#7A4214" transform="rotate(-30 250 158)" />
          <path
            d="M 210 185
                     C 225 220, 275 215, 285 190
                     C 265 205, 235 200, 210 185 Z"
            fill="url(#bottomBeakGrad)"
            stroke="#7A4214"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path
            d="M 210 180 C 235 195, 265 195, 285 185 C 265 198, 235 198, 210 180 Z"
            fill="#660000"
          />
        </g>

        <g id="face-details">
          <ellipse cx="185" cy="125" rx="7" ry="12" fill="#1A1A1A" />
          <circle cx="187" cy="120" r="2.5" fill="#FFFFFF" />
          <ellipse cx="220" cy="130" rx="12" ry="18" fill="#1A1A1A" />
          <circle cx="223" cy="122" r="4.5" fill="#FFFFFF" />
          <circle cx="217" cy="138" r="2" fill="#FFFFFF" />
          <path
            d="M 175 105 Q 185 98, 195 105"
            fill="none"
            stroke="#7A4214"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 210 100 Q 225 90, 240 100"
            fill="none"
            stroke="#7A4214"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 200 165 Q 195 175, 205 185"
            fill="none"
            stroke="#7A4214"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        <g id="water-front">
          <path
            d="M 150 312 A 60 15 0 0 0 240 312"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 130 322 A 80 18 0 0 0 260 322"
            fill="none"
            stroke="#A6DDEB"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </motion.div>
  );
}
