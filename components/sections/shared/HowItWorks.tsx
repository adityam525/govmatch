// import {
//   UserCircle,
//   Target,
//   BellRing,
//   GraduationCap,
//   Check,
// } from "lucide-react";

// import type { ElementType } from "react";

// type Step = {
//   title: string;
//   description: string;
//   icon: ElementType;
// };

// type HowItWorksProps = {
//   variant?: "home" | "about";
//   title?: string;
//   subtitle?: string;
//   steps?: Step[];
// };

// const defaultSteps: Step[] = [
//   {
//     icon: UserCircle,
//     title: "Build Your Profile",
//     description:
//       "Upload your resume or add education, experience, category, and location details.",
//   },
//   {
//     icon: Target,
//     title: "Get Match %",
//     description:
//       "Our system checks your eligibility and shows how well each government job matches you.",
//   },
//   {
//     icon: BellRing,
//     title: "Track Jobs",
//     description:
//       "Save opportunities, receive reminders, and never miss important deadlines.",
//   },
//   {
//     icon: GraduationCap,
//     title: "Prepare & Apply",
//     description:
//       "Practice exams and apply directly through official government portals.",
//   },
// ];

// export default function HowItWorks({
//   variant = "home",
//   title,
//   subtitle,
//   steps = defaultSteps,
// }: HowItWorksProps) {
//   const isAbout = variant === "about";

//   return (
//     <section className={isAbout ? "bg-neutral-50 py-24" : "py-16"}>
//       <div className="mx-auto max-w-7xl px-6">
//         {/* HEADER */}
//         <div className="mx-auto max-w-3xl text-center">
//           <span className=" text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
//             How It Works
//           </span>

//           <h2 className=" mt-4 text-3xl font-bold text-neutral-900 md:text-5xl">
//             {title || "Our process makes government job discovery simple"}
//           </h2>

//           <p className=" mt-4 text-lg text-neutral-600">
//             {subtitle ||
//               "From profile creation to final application, we guide every step."}
//           </p>
//         </div>

//         {/* =========================HOME VIEW========================= */}

//         {!isAbout && (
//           <div className=" relative mt-16 grid gap-10 md:grid-cols-4 ">
//             {/* connector */}

//             <div className=" absolute left-[12%] right-[12%] top-7 hidden h-px bg-neutral-200 md:block" />

//             {steps.map((step) => {
//               const Icon = step.icon;

//               return (
//                 <div key={step.title} className=" relative text-center ">
//                   <div className=" relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg ">
//                     <Icon size={24} />
//                   </div>

//                   <h3 className=" mt-5 font-semibold text-neutral-900 ">
//                     {step.title}
//                   </h3>

//                   <p className=" mt-2 text-sm leading-6 text-neutral-600">
//                     {step.description}
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* ========================= ABOUT TIMELINE ========================= */}

//         {isAbout && (
//           <div className=" relative mt-20 ">
//             {/* vertical line */}
//             <div className=" absolute left-6 top-0 hidden h-full w-px bg-neutral-200 md:left-1/2 md:block " />
//             <div className="space-y-14 ">
//               {steps.map((step, index) => {
//                 const reverse = index % 2 !== 0;

//                 return (
//                   <div
//                     key={step.title}
//                     className=" relative grid items-center gap-8 md:grid-cols-2 "
//                   >
//                     {/* LEFT */}

//                     <div className={reverse ? "md:order-2" : ""}>
//                       {!reverse && <StepCard step={step} index={index} />}
//                     </div>

//                     {/* CENTER ICON */}

//                     <div className=" absolute left-6 hidden h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg md:left-1/2 md:flex">
//                       {(() => {
//                         const Icon = step.icon;
//                         return <Icon size={22} />;
//                       })()}
//                     </div>

//                     {/* RIGHT */}

//                     <div className={reverse ? "md:order-1" : ""}>
//                       {reverse && <StepCard step={step} index={index} />}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* MOBILE TIMELINE */}

//         <div className=" mt-14 space-y-10 md:hidden">
//           {steps.map((step, index) => {
//             const Icon = step.icon;

//             return (
//               <div key={step.title} className=" flex gap-5">
//                 <div className=" flex flex-col items-center ">
//                   <div className=" flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white">
//                     <Icon size={22} />
//                   </div>

//                   {index !== steps.length - 1 && (
//                     <div className=" mt-3 h-16 w-px bg-neutral-200" />
//                   )}
//                 </div>

//                 <StepContent step={step} index={index} />
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

// function StepCard({ step, index }: { step: Step; index: number }) {
//   return (
//     <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
//       <StepContent step={step} index={index} />
//       <div className=" mt-6 space-y-3">
//         {[
//           "Verified information",
//           "Personalized matching",
//           "Simple guided process",
//         ].map((item) => (
//           <div
//             key={item}
//             className=" flex items-center gap-3 text-sm text-neutral-600"
//           >
//             <Check size={16} className="text-primary-600" />
//             {item}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function StepContent({ step, index }: { step: Step; index: number }) {
//   const Icon = step.icon;

//   return (
//     <div>
//       <div className=" flex items-center gap-4">
//         <div className=" flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600 text-white ">
//           <Icon size={26} />
//         </div>

//         <div>
//           <span className=" text-xs font-bold uppercase text-primary-600 ">
//             Step {index + 1}
//           </span>

//           <h3 className=" text-xl font-bold text-neutral-900 ">{step.title}</h3>
//         </div>
//       </div>

//       <p className=" mt-5 leading-7 text-neutral-600 ">{step.description}</p>
//     </div>
//   );
// }

import { UserRound, Target, FileCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Create your profile",
    description: "Add your education, category, location and preferences.",
  },
  {
    number: "02",
    icon: Target,
    title: "Find matching jobs",
    description: "Get government vacancies matched to your eligibility.",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Prepare & apply",
    description: "Practice, track deadlines and apply with confidence.",
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <p className="text-xs font-semibold tracking-widest text-primary-600">
          HOW IT WORKS
        </p>

        <h2 className="mt-3 text-2xl md:text-3xl font-bold text-neutral-900">
          Your journey from profile to government job
        </h2>

        <p className="mt-3 text-sm text-neutral-500">
          GovMatch helps you discover opportunities, prepare effectively and
          stay ahead.
        </p>
      </div>

      {/* Steps */}
      <div className="relative mt-12 grid md:grid-cols-3 gap-8">
        {/* Connecting line */}
        <div
          className="
          hidden md:block
          absolute top-8 left-[16%] right-[16%]
          h-px bg-neutral-200
        "
        />

        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div key={step.number} className="relative text-center">
              {/* Number */}
              <div
                className="
                mx-auto flex h-16 w-16
                items-center justify-center
                rounded-full
                bg-primary-600
                text-white
                shadow-lg
              "
              >
                <Icon size={24} />
              </div>

              <span
                className="
                mt-4 block
                text-xs font-semibold
                text-primary-600
              "
              >
                STEP {step.number}
              </span>

              <h3
                className="
                mt-2
                text-base
                font-semibold
                text-neutral-900
              "
              >
                {step.title}
              </h3>

              <p
                className="
                mt-2
                mx-auto
                max-w-xs
                text-sm
                text-neutral-500
              "
              >
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
