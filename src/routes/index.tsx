import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import GlassCoin from "@/components/GlassCoin";
import liquidArrow from "@/assets/liquidArrow.svg?url";
import arrowRight from "@/assets/ArrowRight.svg?url";
import { ScrambleText, ScrambleWords } from "@/components/ScrambleText";

const SQUASH_INITIAL = { opacity: 0, scaleY: 0.1 };
const SQUASH_ANIMATE = { opacity: 1, scaleY: 1 };

const projects = [
  { id: 1, title: "Oakley", img: "/1.png", year: "2026" },
  { id: 2, title: "Nike", img: "/2.png", year: "2026" },
  { id: 3, title: "Lumina", img: "/3.png", year: "2026" },
  { id: 4, title: "Argentum", img: "/4.png", year: "2026" },
  { id: 5, title: "Vortex", img: "/Rectangle_11.png", year: "2026" },
  { id: 6, title: "Xiaomi", img: "/Rectangle_20.png", year: "2026" },
  { id: 7, title: "Fayze", img: "/Rectangle_21.png", year: "2026" },
  { id: 8, title: "Cube", img: "/Rectangle_23.png", year: "2026" },
  { id: 9, title: "Revora", img: "/Rectangle_24.png", year: "2026" },
  { id: 10, title: "100Percent", img: "/Rectangle_25.png", year: "2026" },
  { id: 11, title: "Vision", img: "/Rectangle_26.png", year: "2026" },
  { id: 12, title: "Aura", img: "/Rectangle_27.png", year: "2026" },
  { id: 13, title: "Essence", img: "/Rectangle_28.png", year: "2026" },
];

const lightSectionBackground =
  "linear-gradient(to bottom right, #CCDAE4 0%, #FDF8E3 35%, #F9F5EA 70%, #F8F4F1 100%)";

function ProjectCard({
  project,
  i,
  progress,
  total,
}: {
  project: (typeof projects)[number];
  i: number;
  progress: MotionValue<number>;
  total: number;
}) {
  const step = 1 / total;
  const activePoint = i * step;

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const distanceFromActive = (p: number) => clamp((p - activePoint) / step, -3, 3);
  const mapStack = (
    distance: number,
    values: [number, number, number, number, number, number, number],
  ) => {
    const normalized = distance + 3;
    const index = Math.min(5, Math.floor(normalized));
    return lerp(values[index], values[index + 1], normalized - index);
  };
  const updateFromProgress = (p: number) => {
    const distance = distanceFromActive(p);
    y.set(mapStack(distance, [315, 270, 225, 0, -225, -270, -315]));
    scale.set(mapStack(distance, [0.85, 0.9, 0.95, 1, 0.95, 0.9, 0.85]));
    rotateX.set(mapStack(distance, [80, 80, 80, 0, 295, 295, 295]));
    rotateY.set(0);
    opacity.set(mapStack(distance, [0, 1, 1, 1, 1, 1, 0]));
    zIndex.set(Math.round(100 - Math.abs(distance) * 10));
  };

  const initialDistance = distanceFromActive(progress.get());
  const y = useMotionValue(mapStack(initialDistance, [315, 270, 225, 0, -225, -270, -315]));
  const scale = useMotionValue(mapStack(initialDistance, [0.85, 0.9, 0.95, 1, 0.95, 0.9, 0.85]));
  const rotateX = useMotionValue(mapStack(initialDistance, [80, 80, 80, 0, 295, 295, 295]));
  const rotateY = useMotionValue(0);
  const opacity = useMotionValue(mapStack(initialDistance, [0, 1, 1, 1, 1, 1, 0]));
  const zIndex = useMotionValue(Math.round(100 - Math.abs(initialDistance) * 10));

  useMotionValueEvent(progress, "change", (p) => {
    const distance = (p - activePoint) / step;
    updateFromProgress(activePoint + clamp(distance, -3, 3) * step);
  });

  return (
    <motion.div
      className="absolute top-0 left-0 w-[240px] h-[320px] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
      style={{
        y,
        scale,
        rotateX,
        rotateY,
        opacity,
        zIndex,
        transformOrigin: "center center",
      }}
    >
      <img src={project.img} alt={project.title} className="w-full h-full object-cover" />
    </motion.div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "We help brands shine beyond trends" },
      { name: "description", content: "We turn brands into visual experiences." },
    ],
  }),
  component: Index,
});

function Index() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const worksRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const { scrollYProgress: worksProgress } = useScroll({
    container: scrollRef,
    target: worksRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(worksProgress, "change", (latest) => {
    const index = Math.min(Math.floor(latest * projects.length), projects.length - 1);
    setActiveIndex(index);
  });

  // Scene 3 entry fade-ins — trigger once the works section enters view.
  const w3Viewport = { root: scrollRef, once: true, amount: 0.2 } as const;
  const w3Fade = (delay: number) => ({
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: w3Viewport,
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  });

  // UI tokens — flip as the light section enters viewport.
  // Задаем жесткие рамки для всего скролла [0, 0.4, 0.7, 1], чтобы избежать сброса значений в конце
  const INPUT = [0, 0.02, 0.06, 1];

  const textColor = useTransform(scrollYProgress, INPUT, [
    "#ffffff",
    "#ffffff",
    "#000000",
    "#000000",
  ]);
  const textColorDim = useTransform(scrollYProgress, INPUT, [
    "rgba(255,255,255,0.7)",
    "rgba(255,255,255,0.7)",
    "rgba(0,0,0,0.7)",
    "rgba(0,0,0,0.7)",
  ]);
  const textColorDimmer = useTransform(scrollYProgress, INPUT, [
    "rgba(255,255,255,0.5)",
    "rgba(255,255,255,0.5)",
    "rgba(0,0,0,0.5)",
    "rgba(0,0,0,0.5)",
  ]);
  const markerBg = useTransform(scrollYProgress, INPUT, [
    "#ffffff",
    "#ffffff",
    "#000000",
    "#000000",
  ]);
  const gridLineColor = useTransform(scrollYProgress, INPUT, [
    "rgba(255,255,255,0.05)",
    "rgba(255,255,255,0.05)",
    "rgba(0,0,0,0.05)",
    "rgba(0,0,0,0.05)",
  ]);
  const worksBtnBg = useTransform(scrollYProgress, INPUT, [
    "rgba(255,255,255,0.1)",
    "rgba(255,255,255,0.1)",
    "rgba(0,0,0,0.05)",
    "rgba(0,0,0,0.05)",
  ]);

  const svgInvert = useTransform(scrollYProgress, INPUT, [0, 0, 1, 1]);
  const svgFilter = useMotionTemplate`invert(${svgInvert})`;

  const darkHeadlineOpacity = useTransform(scrollYProgress, [0, 0.02, 0.05, 1], [1, 0, 0, 0]);
  const lightHeadlineOpacity = useTransform(scrollYProgress, INPUT, [0, 0, 1, 1]);

  // Per-word scroll-driven fade-in for the light headline (7 words, staggered).
  const LIGHT_WORD_START = 0.025;
  const LIGHT_WORD_STAGGER = 0.01;
  const LIGHT_WORD_DURATION = 0.03;
  const lightWordOpacities = Array.from({ length: 7 }, (_, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(
      scrollYProgress,
      [
        LIGHT_WORD_START + i * LIGHT_WORD_STAGGER,
        LIGHT_WORD_START + i * LIGHT_WORD_STAGGER + LIGHT_WORD_DURATION,
      ],
      [0, 1],
    ),
  );

  const lightWordBlurs = Array.from({ length: 7 }, (_, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(
      scrollYProgress,
      [
        LIGHT_WORD_START + i * LIGHT_WORD_STAGGER,
        LIGHT_WORD_START + i * LIGHT_WORD_STAGGER + LIGHT_WORD_DURATION,
      ],
      [8, 0],
    ),
  );

  const lightWordFilters = Array.from(
    { length: 7 },
    (_, i) => useMotionTemplate`blur(${lightWordBlurs[i]}px)`,
  );

  return (
    <div
      ref={scrollRef}
      className="h-screen w-full max-w-[100vw] overflow-x-clip overflow-y-auto snap-y snap-mandatory relative"
    >
      {/* Scene 1: hero + light sections with sticky coin/UI overlay */}
      <div className="relative">
        {/* Layer z-0: native-scrolling backgrounds only */}
        <div className="relative z-0 w-full">
          {/* Hero section — dark, 110vh */}
          <section className="snap-start relative z-0 w-full h-[110vh] bg-[linear-gradient(to_bottom_right,#020307_0%,#03081A_20%,#03172E_45%,#1C4F6F_70%,#91A4A2_100%)]">
            {/* Gradient bridge — fades dark into next section's top color */}
            <div className="absolute bottom-0 left-0 w-full h-[5vh] bg-gradient-to-b from-transparent to-[#E4EBE6] pointer-events-none" />
          </section>

          {/* Light section — 100vh */}
          <section
            className="snap-start relative z-0 w-full h-[100vh]"
            style={{ background: lightSectionBackground }}
          />
        </div>

        {/* Layer z-10: sticky 3D coin */}
        <div
          className="sticky bottom-0 left-0 w-full h-screen z-10 pointer-events-none -mt-[100vh]"
          style={{ top: 0 }}
        >
          <div className="absolute inset-0 pointer-events-auto">
            <GlassCoin coinScale={isMobile ? 0.8 : 1} />
          </div>
        </div>

        {/* Layer z-20: sticky UI */}
        <div
          className="sticky bottom-0 left-0 w-full h-screen z-20 pointer-events-none -mt-[100vh]"
          style={{ top: 0 }}
        >
          {/* Vertical grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              style={{ backgroundColor: gridLineColor }}
              className="absolute top-0 bottom-0 left-1/4 w-px"
            />
            <motion.div
              style={{ backgroundColor: gridLineColor }}
              className="absolute top-0 bottom-0 left-1/2 w-px"
            />
            <motion.div
              style={{ backgroundColor: gridLineColor }}
              className="absolute top-0 bottom-0 left-3/4 w-px"
            />
          </div>

          <div className="relative h-full w-full [&_button]:pointer-events-auto [&_a]:pointer-events-auto">
            {/* Headline stack */}
            <div className="absolute top-8 left-8 md:top-10 md:left-12 right-8 md:right-12">
              <div className="relative w-full h-[300px]">
                <motion.h1
                  style={{ opacity: darkHeadlineOpacity }}
                  className="absolute top-0 left-0 w-full font-inter-tight text-white text-3xl sm:text-4xl md:text-5xl lg:text-8xl leading-[0.95] tracking-tight"
                >
                  {(() => {
                    let i = 0;
                    const word = (text: string, italic = false) => {
                      const idx = i++;
                      return (
                        <motion.span
                          key={`d-${idx}`}
                          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{
                            delay: 0.5 + idx * 0.22,
                            duration: 1.8,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          style={{ display: "inline-block" }}
                          className={italic ? "font-instrument italic font-normal" : undefined}
                        >
                          {text}
                        </motion.span>
                      );
                    };
                    return (
                      <>
                        {word("We")}
                        {"\u00A0"}
                        {word("help")}
                        {"\u00A0"}
                        {word("brands")}
                        <br />
                        {word("shine", true)}
                        {"\u00A0"}
                        {word("beyond")}
                        <br />
                        {word("trends")}
                      </>
                    );
                  })()}
                </motion.h1>
                <motion.h1
                  style={{ opacity: lightHeadlineOpacity }}
                  className="absolute top-0 left-0 w-full font-inter-tight text-black text-3xl sm:text-4xl md:text-5xl lg:text-8xl leading-[0.95] tracking-tight"
                >
                  {(() => {
                    let i = 0;
                    const word = (text: string, italic = false) => {
                      const idx = i++;
                      return (
                        <motion.span
                          key={`l-${idx}`}
                          style={{
                            opacity: lightWordOpacities[idx],
                            filter: lightWordFilters[idx],
                            display: "inline-block",
                          }}
                          className={italic ? "font-instrument italic font-normal" : undefined}
                        >
                          {text}
                        </motion.span>
                      );
                    };
                    return (
                      <>
                        {word("Create")}
                        {"\u00A0"}
                        {word("experiences")}
                        <br />
                        {word("that")}
                        {"\u00A0"}
                        {word("feel")}
                        {"\u00A0"}
                        {word("simple", true)}
                        <br />
                        {word("and")}
                        {"\u00A0"}
                        {word("clear")}
                      </>
                    );
                  })()}
                </motion.h1>
              </div>
            </div>

            {/* Top right info */}
            <div className="absolute top-6 right-4 md:top-8 md:right-6 lg:top-10 lg:right-12 flex flex-col md:flex-row items-start gap-4 md:gap-8 lg:gap-[105px]">
              <motion.div
                style={{ color: textColorDim }}
                className="font-mono-fragment text-[10px] md:text-[11px] lg:text-xs uppercase leading-relaxed tracking-wider"
              >
                <ScrambleWords
                  text="WE TURN BRANDS"
                  baseDelay={1}
                  stagger={0.35}
                  duration={1.6}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={(i) => ({ delay: 1 + i * 0.22, duration: 0.8 })}
                />
                <br />
                <ScrambleWords
                  text="INTO VISUAL"
                  baseDelay={1.6}
                  stagger={0.35}
                  duration={1.6}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={(i) => ({ delay: 1.6 + i * 0.22, duration: 1.3 })}
                />
                <br />
                <span className="inline-flex items-center gap-2">
                  <motion.img
                    src={liquidArrow}
                    alt=""
                    className="w-3 h-3"
                    style={{ filter: svgFilter }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.55, duration: 1.1 }}
                  />
                  <ScrambleText
                    text="EXPERIENCES"
                    delay={2.0}
                    duration={1.6}
                    motionProps={{
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      transition: { delay: 2.0, duration: 1.3 },
                      style: { display: "inline-block" },
                    }}
                  />
                </span>
              </motion.div>
              <motion.button
                style={{ color: textColor }}
                className="font-mono-fragment text-[10px] md:text-[11px] lg:text-xs uppercase tracking-wider inline-flex items-center hover:opacity-70 transition-opacity"
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 1.6 }}
              >
                <motion.img
                  src={arrowRight}
                  alt=""
                  className="w-[11px] h-[10px]"
                  style={{ marginRight: 14, filter: svgFilter }}
                />
                <ScrambleText text="CONTACT US" delay={1.1} duration={0.6} />
              </motion.button>
            </div>

            {/* Mid-line markers */}
            <div className="absolute top-1/2 left-4 md:left-6 lg:left-8 -translate-y-1/2 flex items-center gap-4 md:gap-8 lg:gap-[100px]">
              <motion.div style={{ backgroundColor: markerBg }} className="w-1.5 h-1.5" />
              <motion.span
                style={{ color: textColorDimmer }}
                className="font-mono-fragment text-[10px] md:text-[11px] lg:text-xs uppercase tracking-wider"
                initial={{ opacity: 0, x: 20, y: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8, duration: 1.0 }}
              >
                <ScrambleText text="YOUR BRAND, BUT BRIGHTER" delay={1.8} duration={1.1} />
              </motion.span>
            </div>
            <div className="absolute top-1/2 right-4 md:right-6 lg:right-8 -translate-y-1/2 flex items-center gap-4 md:gap-8 lg:gap-[100px]">
              <motion.span
                style={{ color: textColorDimmer }}
                className="font-mono-fragment text-[10px] md:text-[11px] lg:text-xs uppercase tracking-wider"
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8, duration: 1.0 }}
              >
                <ScrambleText text="BUILT TO BE NOTICED" delay={1.8} duration={1.1} />
              </motion.span>
              <motion.div style={{ backgroundColor: markerBg }} className="w-1.5 h-1.5" />
            </div>

            {/* Bottom left button */}
            <motion.button
              style={{ backgroundColor: worksBtnBg, color: textColor, gap: "12px" }}
              className="absolute bottom-10 left-8 inline-flex items-center rounded-full px-6 py-2.5 backdrop-blur-md font-mono-fragment text-xs uppercase tracking-wider"
              initial={{ scale: 0, y: 12 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: 2.2 }}
            >
              <motion.img
                src={arrowRight}
                alt=""
                className="w-[11px] h-[10px]"
                style={{ filter: svgFilter }}
              />
              OUR WORKS
            </motion.button>
          </div>
        </div>

        {/* /Scene 1 wrapper */}
      </div>

      {/* Scene 2-pin + Scene 3 combined: section 2's background stays pinned
          while section 3 slides up over it (no buffer scroll, snap jumps
          directly from light section to works section). */}
      <div className="relative w-full">
        {/* Pinned mirror of section 2's background — keeps "section 2" visible
            while user scrolls into section 3. */}
        <div
          className="sticky top-0 h-screen w-full z-0 pointer-events-none"
          style={{ background: lightSectionBackground }}
        >
          {/* 🔥 Протягиваем сетку через буферную зону 🔥 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 left-1/4 w-px bg-black/5" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/5" />
            <div className="absolute top-0 bottom-0 left-3/4 w-px bg-black/5" />
          </div>
        </div>

        {/* Scene 3: Our Works — Sticky Stack Slider. -mt-[100vh] pulls it up to
            overlap the pinned bg so the snap goes section 2 → section 3 directly. */}
        <section
          ref={worksRef}
          className="relative w-full h-[700vh] snap-start z-20 overflow-x-clip -mt-[50vh]"
        >
          <div className="sticky top-0 w-full h-[100vh] overflow-visible flex items-center justify-center">
            {/* Light buffer fill — same exact background as section 2 behind the diagonal cut */}
            <div
              className="absolute bottom-0 left-0 w-full h-[150vh] pointer-events-none z-0"
              style={{ background: "#e1e0db" }}
            >
              <div className="absolute top-0 bottom-0 left-1/4 w-px bg-black/5" />
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/5" />
              <div className="absolute top-0 bottom-0 left-3/4 w-px bg-black/5" />
            </div>

            {/* Blurred background — physically 150vh, bulging up over previous section via clip-path */}
            <div className="absolute bottom-0 left-0 w-full h-[150vh] [clip-path:polygon(0_50vh,100%_0,100%_100%,0_100%)] pointer-events-none z-10">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={activeIndex}
                  src={projects[activeIndex].img}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 w-full h-full object-cover blur-[15px] scale-[1.3]"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-[#020307]/80" />
              {/* Buffer-zone grid lines — clipped to the diagonal triangle so they continue from section 2's lines */}
              <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/5" />
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5" />
              <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/5" />
            </div>

            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/5" />
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5" />
              <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/5" />
            </div>

            {/* Typography layer */}
            <div className="absolute inset-0 z-30 text-white pointer-events-none hidden md:block">
              <motion.h2
                {...w3Fade(0)}
                className="absolute top-8 left-8 md:top-10 md:left-12 font-inter-tight text-5xl lg:text-8xl leading-[0.95] tracking-tight"
              >
                Our
                <br />
                Works
              </motion.h2>

              <div className="absolute top-8 right-6 lg:top-10 lg:right-12 flex items-start gap-6 lg:gap-[105px]">
                <motion.div
                  {...w3Fade(0.1)}
                  className="font-mono-fragment text-xs uppercase leading-relaxed tracking-wider opacity-70"
                >
                  WE TURN BRANDS
                  <br />
                  INTO VISUAL
                  <br />
                  <span className="inline-flex items-center gap-2">
                    <img src={liquidArrow} alt="" className="w-3 h-3" />
                    EXPERIENCES
                  </span>
                </motion.div>
                <motion.button
                  {...w3Fade(0.2)}
                  className="font-mono-fragment text-xs uppercase tracking-wider inline-flex items-center hover:opacity-70 transition-opacity pointer-events-auto"
                >
                  <img
                    src={arrowRight}
                    alt=""
                    className="w-[11px] h-[10px]"
                    style={{ marginRight: 14 }}
                  />
                  CONTACT US
                </motion.button>
              </div>

              {/* Mid-line: left marker + counter */}
              <motion.div
                {...w3Fade(0.3)}
                className="absolute top-1/2 left-6 lg:left-8 -translate-y-1/2 flex items-center gap-6 lg:gap-[100px]"
              >
                <div className="w-1.5 h-1.5 bg-white" />
                <span className="font-mono-fragment text-xs uppercase tracking-wider opacity-70 inline-flex">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeIndex}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                    >
                      {String(activeIndex + 1).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                  <span className="opacity-50">&nbsp;/ 13</span>
                </span>
              </motion.div>

              {/* Title (left of card) */}
              <motion.div
                {...w3Fade(0.4)}
                className="absolute top-1/2 left-[33%] -translate-y-1/2 -translate-x-full pr-8 overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="font-inter-tight text-3xl whitespace-nowrap"
                  >
                    {projects[activeIndex].title}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Year (right of card) */}
              <motion.div
                {...w3Fade(0.5)}
                className="absolute top-1/2 right-[33%] -translate-y-1/2 translate-x-full pl-8 overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="font-mono-fragment text-xs uppercase tracking-wider opacity-70 inline-block"
                  >
                    / {projects[activeIndex].year}
                  </motion.span>
                </AnimatePresence>
              </motion.div>

              {/* Mid-line: VIEW PROJECT + right marker */}
              <motion.div
                {...w3Fade(0.6)}
                className="absolute top-1/2 right-6 lg:right-8 -translate-y-1/2 flex items-center gap-6 lg:gap-[100px]"
              >
                <button className="font-mono-fragment text-xs uppercase tracking-wider inline-flex items-center hover:opacity-70 transition-opacity pointer-events-auto">
                  <img
                    src={arrowRight}
                    alt=""
                    className="w-[11px] h-[10px]"
                    style={{ marginRight: 14 }}
                  />
                  VIEW PROJECT
                </button>
                <div className="w-1.5 h-1.5 bg-white" />
              </motion.div>
            </div>

            {/* Card stack — centered */}
            <div className="relative z-40 w-[240px] h-[320px] [perspective:1000px]">
              {projects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  i={i}
                  progress={worksProgress}
                  total={projects.length}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
