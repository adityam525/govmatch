"use client";

import { useEffect, useRef, useState } from "react";
import { UserRound, Target, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Create your profile",
    description: "Add your education, category, location and preferences.",
    color: "text-primary-600",
    background: "bg-primary-50",
    ripple: "border-primary-300",
  },
  {
    number: "02",
    icon: Target,
    title: "Find matching jobs",
    description: "Get government vacancies matched to your eligibility.",
    color: "text-violet-600",
    background: "bg-violet-50",
    ripple: "border-violet-300",
  },
  {
    number: "03",
    icon: Trophy,
    title: "Prepare & apply",
    description: "Practice, track deadlines and apply with confidence.",
    color: "text-emerald-600",
    background: "bg-emerald-50",
    ripple: "border-emerald-300",
  },
];

type Point = {
  x: number;
  y: number;
};

type JourneyGeometry = {
  width: number;
  height: number;
  points: Point[];
};

const CYCLE_DURATION = 8000;
const LINE_DURATION = 1600;

// Particle arrival times, relative to one animation cycle.
const ARRIVAL_TIMES = [150, 3250, 6550];

function getParticlePosition(
  time: number,
  points: Point[],
): { x: number; y: number; opacity: number; scale: number } {
  const [first, second, third] = points;

  let start: Point;
  let end: Point;
  let progress: number;

  // Step 1: Hold
  if (time <= 650) {
    return {
      x: first.x,
      y: first.y,
      opacity: time < 120 ? time / 120 : 1,
      scale: 1,
    };
  }

  // Step 1 -> Step 2
  if (time <= 3250) {
    start = first;
    end = second;
    progress = (time - 650) / (3250 - 650);
  }

  // Step 2: Hold
  else if (time <= 3950) {
    return {
      x: second.x,
      y: second.y,
      opacity: 1,
      scale: 1,
    };
  }

  // Step 2 -> Step 3
  else if (time <= 6550) {
    start = second;
    end = third;
    progress = (time - 3950) / (6550 - 3950);
  }

  // Step 3: Hold and fade
  else {
    const fadeProgress = Math.min(1, (time - 7350) / 650);

    return {
      x: third.x,
      y: third.y,
      opacity: 1 - fadeProgress,
      scale: 1 - fadeProgress * 0.3,
    };
  }

  // Smooth movement between actual icon centers.
  const eased = progress * progress * (3 - 2 * progress);

  return {
    x: start.x + (end.x - start.x) * eased,
    y: start.y + (end.y - start.y) * eased,
    opacity: 1,
    scale: 1,
  };
}

function getPulse(time: number, arrival: number) {
  const elapsed = time - arrival;

  const duration = 480;

  if (elapsed < 0 || elapsed > duration) {
    return {
      scale: 1,
      rippleOpacity: 0,
      rippleScale: 0.8,
    };
  }

  const progress = elapsed / duration;

  // Smooth icon pulse.
  const pulse = Math.sin(progress * Math.PI);

  // Ripple expands and fades.
  return {
    scale: 1 + 0.12 * pulse,
    rippleOpacity: 0.75 * (1 - progress),
    rippleScale: 0.8 + progress * 0.85,
  };
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);

  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pulseRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rippleRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const particleRef = useRef<HTMLSpanElement>(null);

  const geometryRef = useRef<JourneyGeometry | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [geometry, setGeometry] = useState<JourneyGeometry | null>(null);

  // =========================================
  // SECTION VISIBILITY
  // =========================================

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // =========================================
  // MEASURE ACTUAL ICON CENTERS
  // =========================================

  useEffect(() => {
    const journey = journeyRef.current;

    if (!journey) return;

    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const container = journey.getBoundingClientRect();

        if (!container.width || !container.height) return;

        const icons = iconRefs.current;

        if (icons.some((icon) => !icon)) return;

        const points = icons.map((icon) => {
          const rect = icon!.getBoundingClientRect();

          return {
            x: rect.left + rect.width / 2 - container.left,

            y: rect.top + rect.height / 2 - container.top,
          };
        });

        const nextGeometry = {
          width: container.width,
          height: container.height,
          points,
        };

        geometryRef.current = nextGeometry;
        setGeometry(nextGeometry);
      });
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);

    resizeObserver.observe(journey);

    iconRefs.current.forEach((icon) => {
      if (icon) resizeObserver.observe(icon);
    });

    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();

      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  // =========================================
  // SINGLE ANIMATION CONTROLLER
  // PARTICLE + ICONS + RIPPLES
  // =========================================

  useEffect(() => {
    if (!isVisible) return;

    let animationFrame = 0;

    const startTime = performance.now() + LINE_DURATION;

    const animate = (now: number) => {
      animationFrame = requestAnimationFrame(animate);

      const currentGeometry = geometryRef.current;
      const particle = particleRef.current;

      if (!currentGeometry || !particle) return;

      // Wait for connecting line entrance.
      if (now < startTime) {
        particle.style.opacity = "0";
        return;
      }

      // One shared animation clock.
      const elapsed = now - startTime;

      const cycleTime = elapsed % CYCLE_DURATION;

      // -------------------------------------
      // PARTICLE POSITION
      // -------------------------------------

      const position = getParticlePosition(cycleTime, currentGeometry.points);

      particle.style.left = `${position.x}px`;
      particle.style.top = `${position.y}px`;

      particle.style.opacity = String(position.opacity);

      particle.style.transform = `translate3d(-50%, -50%, 0) scale(${position.scale})`;

      // -------------------------------------
      // ICONS AND RIPPLES
      // -------------------------------------

      ARRIVAL_TIMES.forEach((arrival, index) => {
        const pulse = getPulse(cycleTime, arrival);

        const icon = pulseRefs.current[index];
        const ripple = rippleRefs.current[index];

        if (icon) {
          icon.style.transform = `scale(${pulse.scale})`;

          icon.style.filter =
            pulse.scale > 1
              ? "drop-shadow(0 0 7px rgba(99,102,241,0.3))"
              : "none";
        }

        if (ripple) {
          ripple.style.opacity = String(pulse.rippleOpacity);

          ripple.style.transform = `scale(${pulse.rippleScale})`;
        }
      });
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isVisible]);

  const linePoints = geometry
    ? geometry.points.map((point) => `${point.x},${point.y}`).join(" ")
    : "";

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14"
    >
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold tracking-widest text-primary-600">
          HOW IT WORKS
        </p>

        <h2 className="mx-auto mt-3 max-w-3xl text-[26px] font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl md:text-[40px]">
          Your journey from profile to government job
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:mt-4 sm:text-base">
          We help you discover opportunities, prepare effectively and stay
          ahead.
        </p>
      </div>

      {/* Journey */}
      <div
        ref={journeyRef}
        className="how-journey relative mt-8 sm:mt-10 lg:mt-12"
      >
        {/* Connecting line */}
        {geometry && (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="howJourneyGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Background line */}
            <polyline
              points={linePoints}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Animated line */}
            <polyline
              points={linePoints}
              pathLength="1"
              fill="none"
              stroke="url(#howJourneyGradient)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={
                isVisible ? "how-journey-line-active" : "how-journey-line"
              }
            />
          </svg>
        )}

        {/* Particle */}
        {isVisible && geometry && (
          <span
            ref={particleRef}
            aria-hidden="true"
            className="how-journey-particle"
          >
            <span className="how-journey-particle-tail" />
          </span>
        )}

        {/* Steps */}
        <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className={[
                  "how-step-enter relative flex min-w-0 items-start gap-4 text-left",
                  "md:flex-col md:items-center md:text-center",
                  isVisible ? "how-step-visible" : "",
                  `how-step-delay-${index}`,
                ].join(" ")}
              >
                {/* Icon */}
                <div
                  ref={(element) => {
                    iconRefs.current[index] = element;
                  }}
                  className={[
                    "how-step-icon relative z-10 flex h-12 w-12 shrink-0",
                    "items-center justify-center rounded-full",
                    "border border-neutral-100 bg-white shadow-md",
                    "sm:h-14 sm:w-14 md:h-16 md:w-16",
                    isVisible ? "how-step-icon-enter-active" : "",
                  ].join(" ")}
                >
                  {/* Background */}
                  <div
                    className={[
                      "absolute inset-1 rounded-full sm:inset-1.5",
                      step.background,
                    ].join(" ")}
                  />

                  {/* Ripple */}
                  <span
                    ref={(element) => {
                      rippleRefs.current[index] = element;
                    }}
                    aria-hidden="true"
                    className={[
                      "how-step-ripple pointer-events-none absolute inset-0",
                      "rounded-full border-2",
                      step.ripple,
                    ].join(" ")}
                  />

                  {/* Animated icon */}
                  <span
                    ref={(element) => {
                      pulseRefs.current[index] = element;
                    }}
                    className="how-step-icon-active relative z-10"
                  >
                    <Icon
                      size={25}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className={step.color}
                    />
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pb-2 md:pb-0">
                  <span className="block text-xs font-semibold tracking-wide text-primary-600 md:mt-4">
                    STEP {step.number}
                  </span>

                  <h3 className="mt-1.5 text-base font-semibold leading-6 text-neutral-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500 md:mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
