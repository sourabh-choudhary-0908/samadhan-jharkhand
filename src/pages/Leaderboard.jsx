function Leaderboard() {
  const students = [
    { rank: 1, name: "Aarav Kumar", points: 1240 },
    { rank: 2, name: "Priya Singh", points: 1120 },
    { rank: 3, name: "Rahul Verma", points: 980 },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center">
          <p className="text-green-700 font-semibold uppercase tracking-wider">
            Student Innovation
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            Monthly Leaderboard
          </h1>

          <p className="mt-4 text-slate-600">
            Students making an impact by solving real problems.
          </p>
        </div>

        <div className="mt-12 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {students.map((student) => (
            <div
              key={student.rank}
              className="flex items-center justify-between px-6 py-5 border-b border-slate-100 last:border-b-0"
            >
              <div className="flex items-center gap-5">
                <span className="text-xl font-bold text-green-700">
                  #{student.rank}
                </span>

                <span className="font-semibold text-slate-900">
                  {student.name}
                </span>
              </div>

              <span className="font-bold text-green-700">
                {student.points} points
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Leaderboard