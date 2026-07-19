export default function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">

        <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur">
          💬 We'd Love To Hear From You
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
          Contact GovMatch
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-primary-100">
          Whether you have a question, feedback, partnership opportunity,
          or found an issue, our team is here to help.
        </p>

      </div>
    </section>
  );
}
