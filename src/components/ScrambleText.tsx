import { useEffect, useRef, useState } from "react";
import { motion, type MotionProps } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";

function randChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function scrambledOf(text: string) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    out += text[i] === " " ? " " : randChar();
  }
  return out;
}

interface ScrambleProps {
  text: string;
  delay?: number; // seconds — when scrambling should START
  duration?: number; // legacy/compat — not used (length determined by step/intervalMs)
  intervalMs?: number;
  step?: number;
  className?: string;
  as?: "span" | "div";
  motionProps?: MotionProps;
}

/** A single scrambling text node. Resolves char-by-char from left to right.
 *  Scrambling starts AFTER `delay` seconds — synced with framer-motion entrance. */
export function ScrambleText({
  text,
  delay: _delay = 0,
  intervalMs = 20,
  step = 0.5,
  className,
  as = "span",
  motionProps,
}: ScrambleProps) {
  // Start with the REAL text — no scramble flash on initial render.
  const [display, setDisplay] = useState(text);
  const textRef = useRef(text);
  textRef.current = text;

  useEffect(() => {
    setDisplay(text);
    let interval = 0;
    // Always wait exactly 500ms after mount before triggering the scramble decode.
    const SCRAMBLE_START_MS = 500;
    const startTimeout = window.setTimeout(() => {
      let iteration = 0;
      const len = text.length;
      // Kick off in a fully-scrambled state, then decode left → right.
      setDisplay(scrambledOf(text));
      interval = window.setInterval(() => {
        const lockIdx = Math.floor(iteration);
        if (iteration >= len) {
          setDisplay(text);
          window.clearInterval(interval);
          return;
        }
        let out = "";
        for (let i = 0; i < len; i++) {
          const ch = text[i];
          if (ch === " ") out += " ";
          else if (i < lockIdx) out += ch;
          else out += randChar();
        }
        setDisplay(out);
        iteration += step;
      }, intervalMs);
    }, SCRAMBLE_START_MS);

    return () => {
      window.clearTimeout(startTimeout);
      window.clearInterval(interval);
    };
  }, [text, intervalMs, step]);

  const Comp = as === "div" ? motion.div : motion.span;
  return (
    <Comp className={className} {...motionProps}>
      {display}
    </Comp>
  );
}

/** Scrambles each word with a stagger. Each word fades in (opacity 0 → 1)
 *  exactly when its scramble starts. */
export function ScrambleWords({
  text,
  baseDelay = 0,
  stagger = 0.12,
  duration = 0.4,
  className,
  wordClassName,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  transition,
}: {
  text: string;
  baseDelay?: number;
  stagger?: number;
  duration?: number;
  className?: string;
  wordClassName?: string;
  initial?: MotionProps["initial"];
  animate?: MotionProps["animate"];
  transition?: (i: number) => MotionProps["transition"];
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => {
        const wordDelay = baseDelay + i * stagger;
        return (
          <span key={i} className="inline-block">
            <ScrambleText
              text={w}
              delay={wordDelay}
              className={wordClassName}
              motionProps={{
                initial,
                animate,
                transition: transition?.(i) ?? { delay: wordDelay, duration, ease: "easeOut" },
                style: { display: "inline-block" },
              }}
            />
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        );
      })}
    </span>
  );
}
