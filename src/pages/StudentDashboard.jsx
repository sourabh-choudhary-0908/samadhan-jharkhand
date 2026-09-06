import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Search,
  Lightbulb,
  Trophy,
  LogOut,
  MapPin,
  ArrowRight,
  CheckCircle,
  Clock,
  PlayCircle,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function StudentDashboard() {
  const [problems, setProblems] = useState([])
  const [solutions, setSolutions] = useState([])
  const [implementations, setImplementations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentData()
  }, [])

  async function fetchStudentData() {
    setLoading(true)

    // Get logged-in student
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("User error:", userError)
      setLoading(false)
      return
    }

    // Fetch verified problems
    const { data: problemData, error: problemError } =
      await supabase
        .from("problems")
        .select("*")
        .eq("status", "VERIFIED")
        .order("created_at", { ascending: false })

    if (problemError) {
      console.error("Problem fetch error:", problemError)
    } else {
      setProblems(problemData || [])
    }

    // Fetch student's solutions
    const { data: solutionData, error: solutionError } =
      await supabase
        .from("solutions")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })

    if (solutionError) {
      console.error("Solution fetch error:", solutionError)
    } else {
      setSolutions(solutionData || [])
    }

    // Fetch student's implementations
    const {
      data: implementationData,
      error: implementationError,
    } = await supabase
      .from("implementations")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })

    if (implementationError) {
      console.error(
        "Implementation fetch error:",
        implementationError
      )
    } else {
      setImplementations(implementationData || [])
    }

    setLoading(false)
  }

  const totalSolutions = solutions.length

  const acceptedSolutions = solutions.filter(
    (solution) => solution.status === "ACCEPTED"
  ).length

  // Completed work should be based on actual implementations,
  // because the student updates implementation status rather
  // than changing the solution status.
  const completedSolutions = implementations.filter(
    (implementation) =>
      implementation.status === "COMPLETED" ||
      implementation.status === "GOVERNMENT_VERIFIED"
  ).length

  const activeImplementations = implementations.filter(
    (implementation) =>
      implementation.status === "PLANNED" ||
      implementation.status === "IN_PROGRESS"
  ).length

  function formatStatus(status) {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  function getImplementationStatusStyle(status) {
    if (status === "PLANNED") {
      return "bg-slate-100 text-slate-700"
    }

    if (status === "IN_PROGRESS") {
      return "bg-yellow-100 text-yellow-700"
    }

    if (status === "COMPLETED") {
      return "bg-blue-100 text-blue-700"
    }

    if (status === "GOVERNMENT_VERIFIED") {
      return "bg-green-100 text-green-700"
    }

    return "bg-slate-100 text-slate-700"
  }

  function getImplementationIcon(status) {
    if (status === "PLANNED") {
      return <Clock size={18} className="text-slate-600" />
    }

    if (status === "IN_PROGRESS") {
      return <PlayCircle size={18} className="text-yellow-600" />
    }

    if (
      status === "COMPLETED" ||
      status === "GOVERNMENT_VERIFIED"
    ) {
      return <CheckCircle size={18} className="text-green-600" />
    }

    return <Clock size={18} className="text-slate-600" />
  }

  function getProblemForImplementation(implementation) {
    return problems.find(
      (problem) => problem.id === implementation.problem_id
    )
  }

  function getSolutionForImplementation(implementation) {
    return solutions.find(
      (solution) => solution.id === implementation.solution_id
    )
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Logout error:", error)
      return
    }

    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">

        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-green-400">
            Samadhan Jharkhand
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Student Portal
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">

          <Link
            to="/student"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link
            to="/problems"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            <Search size={19} />
            Find Problems
          </Link>

          <Link
            to="/leaderboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            <Trophy size={19} />
            Leaderboard
          </Link>

        </nav>

        <div className="p-4 border-t border-slate-700">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            <LogOut size={19} />
            Logout
          </button>

        </div>

      </aside>

      {/* Main */}
      <main className="flex-1">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-5">

          <div className="max-w-7xl mx-auto">

            <p className="text-sm text-green-600 font-medium">
              Student Contribution Portal
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Student Dashboard
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Discover verified civic problems and propose solutions.
            </p>

          </div>

        </header>

        <div className="max-w-7xl mx-auto p-6">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            {/* Verified Problems */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">

              <p className="text-sm text-slate-500">
                Verified Problems
              </p>

              <p className="text-3xl font-bold text-slate-900 mt-2">
                {loading ? "..." : problems.length}
              </p>

            </div>

            {/* My Solutions */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">

              <p className="text-sm text-slate-500">
                My Solutions
              </p>

              <p className="text-3xl font-bold text-slate-900 mt-2">
                {loading ? "..." : totalSolutions}
              </p>

            </div>

            {/* Active Implementations */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">

              <p className="text-sm text-slate-500">
                Active Implementations
              </p>

              <p className="text-3xl font-bold text-slate-900 mt-2">
                {loading ? "..." : activeImplementations}
              </p>

            </div>

            {/* Completed Solutions */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">

              <p className="text-sm text-slate-500">
                Completed Solutions
              </p>

              <p className="text-3xl font-bold text-slate-900 mt-2">
                {loading ? "..." : completedSolutions}
              </p>

            </div>

          </div>

          {/* ================================================= */}
          {/* MY IMPLEMENTATIONS */}
          {/* ================================================= */}

          <section className="bg-white border border-slate-200 rounded-xl mb-8">

            <div className="p-6 border-b border-slate-200">

              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  My Implementations
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Track and update the progress of your accepted solutions.
                </p>
              </div>

            </div>

            <div className="p-6">

              {loading ? (

                <div className="text-center py-10 text-slate-500">
                  Loading implementations...
                </div>

              ) : implementations.length === 0 ? (

                <div className="text-center py-10">

                  <Clock
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="text-slate-500 mt-3">
                    You don't have any active implementations yet.
                  </p>

                  <Link
                    to="/problems"
                    className="inline-flex items-center gap-2 mt-4 text-green-600 font-medium"
                  >
                    Find Problems
                    <ArrowRight size={16} />
                  </Link>

                </div>

              ) : (

                <div className="space-y-4">

                  {implementations.map((implementation) => {

                    const relatedProblem =
                      getProblemForImplementation(implementation)

                    const relatedSolution =
                      getSolutionForImplementation(implementation)

                    return (
                      <div
                        key={implementation.id}
                        className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
                      >

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                          {/* Information */}
                          <div className="flex-1">

                            <div className="flex items-start gap-3">

                              <div className="bg-green-100 p-2 rounded-lg">
                                {getImplementationIcon(
                                  implementation.status
                                )}
                              </div>

                              <div className="min-w-0">

                                <h4 className="font-semibold text-slate-900">
                                  {relatedSolution?.title ||
                                    "Accepted Solution"}
                                </h4>

                                <p className="text-sm text-slate-500 mt-1">
                                  Problem:{" "}
                                  {relatedProblem?.title ||
                                    "Problem unavailable"}
                                </p>

                              </div>

                            </div>

                            {/* Progress */}
                            <div className="mt-5">

                              <div className="flex items-center justify-between mb-2">

                                <span className="text-xs text-slate-500">
                                  Progress
                                </span>

                                <span className="text-sm font-semibold text-slate-900">
                                  {implementation.progress || 0}%
                                </span>

                              </div>

                              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">

                                <div
                                  className="h-full bg-green-600 rounded-full transition-all"
                                  style={{
                                    width: `${implementation.progress || 0}%`,
                                  }}
                                />

                              </div>

                            </div>

                            {/* Additional information */}
                            <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">

                              {implementation.start_date && (
                                <span>
                                  Started:{" "}
                                  <strong className="text-slate-700">
                                    {new Date(
                                      implementation.start_date
                                    ).toLocaleDateString("en-IN")}
                                  </strong>
                                </span>
                              )}

                              {implementation.expected_completion_date && (
                                <span>
                                  Expected:{" "}
                                  <strong className="text-slate-700">
                                    {new Date(
                                      implementation.expected_completion_date
                                    ).toLocaleDateString("en-IN")}
                                  </strong>
                                </span>
                              )}

                            </div>

                          </div>

                          {/* Status + Action */}
                          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3">

                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${getImplementationStatusStyle(
                                implementation.status
                              )}`}
                            >
                              {formatStatus(
                                implementation.status
                              )}
                            </span>

                            <Link
                              to={`/student/implementation/${implementation.id}`}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 whitespace-nowrap"
                            >
                              Open Implementation
                              <ArrowRight size={16} />
                            </Link>

                          </div>

                        </div>

                      </div>
                    )
                  })}

                </div>

              )}

            </div>

          </section>

          {/* ================================================= */}
          {/* PROBLEMS */}
          {/* ================================================= */}

          <section className="bg-white border border-slate-200 rounded-xl">

            <div className="p-6 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Problems Seeking Solutions
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Government-verified problems available for student contribution.
                </p>

              </div>

              <Link
                to="/problems"
                className="flex items-center gap-1 text-sm text-green-600 font-medium"
              >
                View All
                <ArrowRight size={16} />
              </Link>

            </div>

            <div className="p-6">

              {loading ? (

                <div className="text-center py-10 text-slate-500">
                  Loading problems...
                </div>

              ) : problems.length === 0 ? (

                <div className="text-center py-10">

                  <Lightbulb
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="text-slate-500 mt-3">
                    No verified problems are currently available.
                  </p>

                </div>

              ) : (

                <div className="grid md:grid-cols-2 gap-5">

                  {problems.slice(0, 6).map((problem) => (

                    <div
                      key={problem.id}
                      className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="bg-yellow-100 p-2 rounded-lg">

                          <Lightbulb
                            size={20}
                            className="text-yellow-600"
                          />

                        </div>

                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          Verified
                        </span>

                      </div>

                      <h4 className="font-semibold text-lg text-slate-900 mt-4">
                        {problem.title}
                      </h4>

                      <p className="text-sm text-slate-500 mt-2 line-clamp-3">
                        {problem.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">

                        <MapPin size={14} />

                        {problem.district}

                      </div>

                      <Link
                        to={`/student/problem/${problem.id}`}
                        className="mt-5 flex items-center justify-center gap-2 w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700"
                      >
                        Propose a Solution
                        <ArrowRight size={17} />
                      </Link>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </section>

          {/* ================================================= */}
          {/* MY SOLUTIONS */}
          {/* ================================================= */}

          <section className="mt-8 bg-white border border-slate-200 rounded-xl">

            <div className="p-6 border-b border-slate-200">

              <h3 className="text-lg font-semibold text-slate-900">
                My Recent Solutions
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Track solutions you have proposed.
              </p>

            </div>

            <div className="divide-y divide-slate-100">

              {solutions.length === 0 ? (

                <div className="p-8 text-center text-slate-500">
                  You haven't proposed any solutions yet.
                </div>

              ) : (

                solutions.slice(0, 5).map((solution) => (

                  <div
                    key={solution.id}
                    className="p-5 flex items-center justify-between gap-4"
                  >

                    <div>

                      <h4 className="font-medium text-slate-900">
                        {solution.title}
                      </h4>

                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                        {solution.description}
                      </p>

                    </div>

                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        solution.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700"
                          : solution.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : solution.status === "UNDER_REVIEW"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {formatStatus(solution.status)}
                    </span>

                  </div>

                ))

              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}

export default StudentDashboard