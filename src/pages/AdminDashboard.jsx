import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  LogOut,
  MapPin,
  ArrowRight,
  Lightbulb,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function AdminDashboard() {
  const [problems, setProblems] = useState([])
  const [solutions, setSolutions] = useState([])
  const [implementations, setImplementations] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    setMessage("")

    // =====================================================
    // FETCH PROBLEMS
    // =====================================================

    const { data: problemData, error: problemError } = await supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false })

    if (problemError) {
      console.error("Problem fetch error:", problemError)
      setMessage("Unable to load problems.")
    } else {
      setProblems(problemData || [])
    }

    // =====================================================
    // FETCH STUDENT SOLUTIONS
    // =====================================================

    const { data: solutionData, error: solutionError } = await supabase
      .from("solutions")
      .select("*")
      .order("created_at", { ascending: false })

    if (solutionError) {
      console.error("Solution fetch error:", solutionError)

      if (!problemError) {
        setMessage(
          "Problems loaded, but unable to load student solutions."
        )
      }
    } else {
      setSolutions(solutionData || [])
    }

    // =====================================================
    // FETCH IMPLEMENTATIONS
    // =====================================================

    const {
      data: implementationData,
      error: implementationError,
    } = await supabase
      .from("implementations")
      .select("*")
      .order("created_at", { ascending: false })

    if (implementationError) {
      console.error(
        "Implementation fetch error:",
        implementationError
      )

      if (!problemError && !solutionError) {
        setMessage(
          "Problems and solutions loaded, but unable to load implementations."
        )
      }
    } else {
      setImplementations(implementationData || [])
    }

    setLoading(false)
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalProblems = problems.length

  const submittedCount = problems.filter(
    (problem) => problem.status === "SUBMITTED"
  ).length

  const verifiedCount = problems.filter(
    (problem) => problem.status === "VERIFIED"
  ).length

  const resolvedCount = problems.filter(
    (problem) => problem.status === "RESOLVED"
  ).length

  const pendingSolutions = solutions.filter(
    (solution) => solution.status === "PROPOSED"
  ).length

  const completedImplementations = implementations.filter(
    (implementation) => implementation.status === "COMPLETED"
  )

  const recentProblems = problems.slice(0, 5)

  const recentSolutions = solutions.slice(0, 5)

  // =====================================================
  // HELPERS
  // =====================================================

  function formatStatus(status) {
    if (!status) return ""

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  function getStatusStyle(status) {
    if (status === "RESOLVED") {
      return "bg-green-100 text-green-700"
    }

    if (status === "VERIFIED") {
      return "bg-blue-100 text-blue-700"
    }

    if (status === "UNDER_REVIEW") {
      return "bg-yellow-100 text-yellow-700"
    }

    if (status === "REJECTED" || status === "DUPLICATE") {
      return "bg-red-100 text-red-700"
    }

    if (status === "IMPLEMENTATION") {
      return "bg-purple-100 text-purple-700"
    }

    if (status === "GOVERNMENT_VERIFICATION") {
      return "bg-orange-100 text-orange-700"
    }

    return "bg-gray-100 text-gray-700"
  }

  function getSolutionStatusStyle(status) {
    if (status === "ACCEPTED") {
      return "bg-green-100 text-green-700"
    }

    if (status === "UNDER_REVIEW") {
      return "bg-yellow-100 text-yellow-700"
    }

    if (status === "REJECTED") {
      return "bg-red-100 text-red-700"
    }

    if (status === "COMPLETED") {
      return "bg-blue-100 text-blue-700"
    }

    return "bg-gray-100 text-gray-700"
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">

        <div className="p-6 border-b border-slate-700">

          <h1 className="text-xl font-bold text-green-400">
            Samadhan Jharkhand
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Government Portal
          </p>

        </div>

        <nav className="flex-1 p-4 space-y-2">

          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link
            to="/problems"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            <FileText size={19} />
            All Problems
          </Link>

          <Link
            to="/leaderboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            <CheckCircle size={19} />
            Student Contributions
          </Link>

        </nav>

        <div className="p-4 border-t border-slate-700">

          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = "/login"
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            <LogOut size={19} />
            Logout
          </button>

        </div>

      </aside>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <main className="flex-1">

        {/* HEADER */}

        <header className="bg-white border-b border-slate-200 px-6 py-5">

          <div className="max-w-7xl mx-auto">

            <p className="text-sm text-green-600 font-medium">
              Government Administration
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Government Dashboard
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Monitor and manage civic problems reported by citizens.
            </p>

          </div>

        </header>

        <div className="max-w-7xl mx-auto p-6">

          {/* ================================================= */}
          {/* MESSAGE */}
          {/* ================================================= */}

          {message && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
              {message}
            </div>
          )}

          {/* ================================================= */}
          {/* STATISTICS */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

            {/* TOTAL PROBLEMS */}

            <div className="bg-white rounded-xl border border-slate-200 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Total Problems
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? "..." : totalProblems}
                  </p>

                </div>

                <div className="bg-slate-100 p-3 rounded-lg">

                  <FileText
                    className="text-slate-700"
                    size={22}
                  />

                </div>

              </div>

            </div>

            {/* NEW REPORTS */}

            <div className="bg-white rounded-xl border border-slate-200 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    New Reports
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? "..." : submittedCount}
                  </p>

                </div>

                <div className="bg-yellow-100 p-3 rounded-lg">

                  <Clock
                    className="text-yellow-600"
                    size={22}
                  />

                </div>

              </div>

            </div>

            {/* VERIFIED */}

            <div className="bg-white rounded-xl border border-slate-200 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Verified
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? "..." : verifiedCount}
                  </p>

                </div>

                <div className="bg-blue-100 p-3 rounded-lg">

                  <CheckCircle
                    className="text-blue-600"
                    size={22}
                  />

                </div>

              </div>

            </div>

            {/* RESOLVED */}

            <div className="bg-white rounded-xl border border-slate-200 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Resolved
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? "..." : resolvedCount}
                  </p>

                </div>

                <div className="bg-green-100 p-3 rounded-lg">

                  <CheckCircle
                    className="text-green-600"
                    size={22}
                  />

                </div>

              </div>

            </div>

            {/* PENDING SOLUTIONS */}

            <div className="bg-white rounded-xl border border-slate-200 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Pending Solutions
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? "..." : pendingSolutions}
                  </p>

                </div>

                <div className="bg-yellow-100 p-3 rounded-lg">

                  <Lightbulb
                    className="text-yellow-600"
                    size={22}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* RECENT PROBLEMS */}
          {/* ================================================= */}

          <section className="bg-white rounded-xl border border-slate-200">

            <div className="p-6 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Problems
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Latest reports submitted by citizens
                </p>

              </div>

              <Link
                to="/problems"
                className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
              >
                View All
                <ArrowRight size={16} />
              </Link>

            </div>

            <div className="divide-y divide-slate-100">

              {loading ? (

                <div className="p-8 text-center text-slate-500">
                  Loading problems...
                </div>

              ) : recentProblems.length === 0 ? (

                <div className="p-8 text-center">

                  <AlertTriangle
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-slate-500">
                    No citizen problems have been reported yet.
                  </p>

                </div>

              ) : (

                recentProblems.map((problem) => (

                  <Link
                    key={problem.id}
                    to={`/admin/problem/${problem.id}`}
                    className="block p-5 hover:bg-slate-50 transition"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      <div className="flex-1">

                        <div className="flex items-start gap-3">

                          <div className="bg-green-100 p-2 rounded-lg mt-1">

                            <AlertTriangle
                              size={18}
                              className="text-green-700"
                            />

                          </div>

                          <div>

                            <h4 className="font-semibold text-slate-900">
                              {problem.title}
                            </h4>

                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                              {problem.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">

                              <span className="font-medium">
                                {problem.category}
                              </span>

                              <span className="flex items-center gap-1">
                                <MapPin size={13} />
                                {problem.district}
                              </span>

                              <span>
                                {new Date(
                                  problem.created_at
                                ).toLocaleDateString()}
                              </span>

                            </div>

                          </div>

                        </div>

                      </div>

                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusStyle(
                          problem.status
                        )}`}
                      >
                        {formatStatus(problem.status)}
                      </span>

                    </div>

                  </Link>

                ))

              )}

            </div>

          </section>

          {/* ================================================= */}
          {/* IMPLEMENTATION VERIFICATION */}
          {/* ================================================= */}

          <section className="bg-white rounded-xl border border-slate-200 mt-8">

            <div className="p-6 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Implementation Verification
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Review completed student implementations before resolving problems.
                </p>

              </div>

              <div className="hidden sm:flex items-center gap-2 text-sm text-green-600 font-medium">

                <CheckCircle size={17} />

                {completedImplementations.length} Completed

              </div>

            </div>

            <div className="divide-y divide-slate-100">

              {loading ? (

                <div className="p-8 text-center text-slate-500">
                  Loading implementations...
                </div>

              ) : completedImplementations.length === 0 ? (

                <div className="p-8 text-center">

                  <CheckCircle
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-slate-500">
                    No completed implementations are waiting for verification.
                  </p>

                </div>

              ) : (

                completedImplementations.map((implementation) => {

                  const relatedProblem = problems.find(
                    (problem) =>
                      problem.id === implementation.problem_id
                  )

                  const relatedSolution = solutions.find(
                    (solution) =>
                      solution.id === implementation.solution_id
                  )

                  return (

                    <Link
                      key={implementation.id}
                      to={`/admin/implementation/${implementation.id}`}
                      className="block p-5 hover:bg-slate-50 transition"
                    >

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div className="flex-1">

                          <div className="flex items-start gap-3">

                            <div className="bg-green-100 p-2 rounded-lg mt-1">

                              <CheckCircle
                                size={18}
                                className="text-green-600"
                              />

                            </div>

                            <div>

                              <h4 className="font-semibold text-slate-900">
                                {relatedSolution?.title ||
                                  "Completed Implementation"}
                              </h4>

                              <p className="text-sm text-slate-500 mt-1">

                                Problem:{" "}

                                {relatedProblem?.title ||
                                  "Problem unavailable"}

                              </p>

                              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">

                                <span>

                                  Progress:{" "}

                                  <strong className="text-slate-700">
                                    {implementation.progress}%
                                  </strong>

                                </span>

                                {relatedProblem?.district && (

                                  <span className="flex items-center gap-1">

                                    <MapPin size={13} />

                                    {relatedProblem.district}

                                  </span>

                                )}

                                {implementation.completed_at && (

                                  <span>

                                    Completed{" "}

                                    {new Date(
                                      implementation.completed_at
                                    ).toLocaleDateString()}

                                  </span>

                                )}

                              </div>

                            </div>

                          </div>

                        </div>

                        <div className="flex items-center gap-3">

                          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                            Completed
                          </span>

                          <ArrowRight
                            size={17}
                            className="text-slate-400"
                          />

                        </div>

                      </div>

                    </Link>

                  )
                })

              )}

            </div>

          </section>

          {/* ================================================= */}
          {/* STUDENT SOLUTIONS */}
          {/* ================================================= */}

          <section className="bg-white rounded-xl border border-slate-200 mt-8">

            <div className="p-6 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Student Solutions
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Review solutions proposed by students for verified problems.
                </p>

              </div>

              <div className="hidden sm:flex items-center gap-2 text-sm text-yellow-600 font-medium">

                <Lightbulb size={17} />

                {pendingSolutions} Pending

              </div>

            </div>

            <div className="divide-y divide-slate-100">

              {loading ? (

                <div className="p-8 text-center text-slate-500">
                  Loading solutions...
                </div>

              ) : recentSolutions.length === 0 ? (

                <div className="p-8 text-center">

                  <Lightbulb
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-slate-500">
                    No student solutions have been submitted yet.
                  </p>

                </div>

              ) : (

                recentSolutions.map((solution) => (

                  <Link
                    key={solution.id}
                    to={`/admin/solution/${solution.id}`}
                    className="block p-5 hover:bg-slate-50 transition"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      <div className="flex-1">

                        <div className="flex items-start gap-3">

                          <div className="bg-yellow-100 p-2 rounded-lg">

                            <Lightbulb
                              size={18}
                              className="text-yellow-600"
                            />

                          </div>

                          <div>

                            <h4 className="font-semibold text-slate-900">
                              {solution.title}
                            </h4>

                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                              {solution.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">

                              <span>

                                Submitted{" "}

                                {new Date(
                                  solution.created_at
                                ).toLocaleDateString()}

                              </span>

                              {solution.estimated_cost && (

                                <span>

                                  Estimated Cost: ₹
                                  {Number(
                                    solution.estimated_cost
                                  ).toLocaleString("en-IN")}

                                </span>

                              )}

                              {solution.implementation_time && (

                                <span>

                                  Time:{" "}
                                  {solution.implementation_time}

                                </span>

                              )}

                            </div>

                          </div>

                        </div>

                      </div>

                      <div className="flex items-center gap-3">

                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${getSolutionStatusStyle(
                            solution.status
                          )}`}
                        >
                          {formatStatus(solution.status)}
                        </span>

                        <ArrowRight
                          size={17}
                          className="text-slate-400"
                        />

                      </div>

                    </div>

                  </Link>

                ))

              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}

export default AdminDashboard