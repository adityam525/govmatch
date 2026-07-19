import {
  HelpCircle,
  Bug,
  Briefcase,
  Lightbulb,
} from "lucide-react";

const cards = [
  {
    icon: HelpCircle,
    title: "General Inquiry",
    description: "Questions about GovMatch, government jobs or platform usage.",
  },
  {
    icon: Bug,
    title: "Report a Bug",
    description: "Found an issue? Let our engineering team know.",
  },
  {
    icon: Briefcase,
    title: "Business Partnership",
    description: "Interested in collaborating or advertising with us?",
  },
  {
    icon: Lightbulb,
    title: "Feature Request",
    description: "Have an idea to improve GovMatch? We'd love to hear it.",
  },
];

export default function SupportCards() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold">
            How can we help?
          </h2>

          <p className="mt-3 text-neutral-600">
            Choose a category that best matches your request.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-500 hover:shadow-lg cursor-pointer"
            >
              <div className="mb-5 inline-flex rounded-xl bg-primary-50 p-3 text-primary-600">
                <card.icon size={24} />
              </div>

              <h3 className="text-lg font-semibold">
                {card.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {card.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
