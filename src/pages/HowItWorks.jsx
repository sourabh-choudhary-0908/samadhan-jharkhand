function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Report",
      description:
        "Citizens report local problems with descriptions, photographs and locations.",
    },
    {
      number: "02",
      title: "Innovate",
      description:
        "College students discover problems and propose practical solutions.",
    },
    {
      number: "03",
      title: "Support",
      description:
        "Industries can provide funding, resources, expertise and mentorship.",
    },
    {
      number: "04",
      title: "Resolve",
      description:
        "Government monitors implementation and verifies completed solutions.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center">
          <p className="text-green-700 font-semibold uppercase tracking-wider">
            How It Works
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            From Problem to Solution
          </h1>

          <p className="mt-4 text-slate-600">
            A collaborative process connecting citizens, students,
            industries and government.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-slate-200 p-6"
            >
              <div className="text-green-700 font-bold text-lg">
                {step.number}
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                {step.title}
              </h2>

              <p className="mt-3 text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HowItWorks