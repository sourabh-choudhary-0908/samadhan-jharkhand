import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CalendarDays,
  IndianRupee,
  User,
  Save,
  CircleDot,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function StudentImplementation() {
  const { id } = useParams()

  const [implementation, setImplementation] = useState(null)
  const [solution, setSolution] = useState(null)
  const [problem, setProblem] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const [status, setStatus] = useState("PLANNED")
  const [progress, setProgress] = useState(0)
  const [startDate, setStartDate] = useState("")
  const [expectedDate, setExpectedDate] = useState("")

  useEffect(() => {
    fetchImplementation()
  }, [id])

  async function fetchImplementation() {
    setLoading(true)
    setMessage("")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage("You must be logged in to view this implementation.")
      setLoading(false)
      return
    }

    // Fetch implementation belonging to current student
    const { data: implementationData, error: implementationError } =
      await supabase
        .from("implementations")
        .select("*")
        .eq("id", id)
        .eq("student_id", user.id)
        .single()

    if (implementationError) {
      console.error(implementationError)
      setMessage(
        "Unable to load this implementation. It may not belong to your account."
      )
      setLoading(false)
      return
    }

    setImplementation(implementationData)

    setStatus(implementationData.status)
    setProgress(implementationData.progress || 0)
    setStartDate(implementationData.start_date || "")
    setExpectedDate(
      implementationData.expected_completion_date || ""
    )

    // Fetch related solution
    const { data: solutionData, error: solutionError } =
      await supabase
        .from("solutions")
        .select("*")
        .eq("id", implementationData.solution_id)
        .single()

    if (solutionError) {
      console.error(solutionError)
    } else {
      setSolution(solutionData)
    }

    // Fetch related problem
    const { data: problemData, error: problemError } =
      await supabase
        .from("problems")
        .select("*")
        .eq("id", implementationData.problem_id)
        .single()

    if (problemError) {
      console.error(problemError)
    } else {
      setProblem(problemData)
    }

    setLoading(false)
  }

  async function saveProgress() {
    if (!implementation) return

    setSaving(true)
    setMessage("")

    let finalStatus = status
    let finalProgress = Number(progress)

    // Keep progress within 0-100
    if (finalProgress < 0) {
      finalProgress = 0
    }

    if (finalProgress > 100) {
      finalProgress = 100
    }

    // Automatically mark as in progress
    // when student starts working.
    if (
      finalProgress > 0 &&
      finalProgress < 100 &&
      status === "PLANNED"
    ) {
      finalStatus = "IN_PROGRESS"
    }

    // Automatically mark completed at 100%
    if (finalProgress === 100) {
      finalStatus = "COMPLETED"
    }

    const { data: updatedImplementation, error } =
      await supabase
        .from("implementations")
        .update({
          status: finalStatus,
          progress: finalProgress,
          start_date: startDate || null,
          expected_completion_date: expectedDate || null,
          completed_at:
            finalStatus === "COMPLETED"
              ? new Date().toISOString()
              : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", implementation.id)

        .select()
        .single()

    if (error) {
      console.error("Implementation update error:", error)
      setMessage(error.message)
      setSaving(false)
      return
    }

    setImplementation(updatedImplementation)
    setStatus(updatedImplementation.status)
    setProgress(updatedImplementation.progress)
    setStartDate(updatedImplementation.start_date || "")
    setExpectedDate(
      updatedImplementation.expected_completion_date || ""
    )

    setMessage("Implementation progress updated successfully.")

    setSaving(false)
  }

  function formatStatus(value) {
    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  function getStatusStyle(value) {
    if (value === "PLANNED") {
      return "bg-slate-100 text-slate-700"
    }

    if (value === "IN_PROGRESS") {
      return "bg-yellow-100 text-yellow-700"
    }

    if (value === "COMPLETED") {
      return "bg-blue-100 text-blue-700"
    }

    if (value === "GOVERNMENT_VERIFIED") {
      return "bg-green-100 text-green-700"
    }

    return "bg-slate-100 text-slate-700"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">
          Loading implementation...
        </p>
      </div>
    )
  }

  if (!implementation) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Link
          to="/student"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
        >
          <ArrowLeft size={18} />
          Back to Student Dashboard
        </Link>

        <div className="max-w-4xl mx-auto mt-8 bg-white border border-red-200 rounded-xl p-6">
          <p className="text-red-600">
            {message || "Implementation not found."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5">

          <Link
            to="/student"
            className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
          >
            <ArrowLeft size={17} />
            Back to Student Dashboard
          </Link>

          <div className="mt-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">

            <div>
              <p className="text-sm text-green-600 font-medium">
                Implementation Tracking
              </p>

              <h1 className="text-3xl font-bold text-slate-900 mt-1">
                {solution?.title || "Implementation"}
              </h1>
            </div>

            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                implementation.status
              )}`}
            >
              {formatStatus(implementation.status)}
            </span>

          </div>

        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">

        {/* Message */}
        {message && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3">
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">

          {/* Problem & Solution */}
          <section className="lg:col-span-3 space-y-6">

            {/* Original Problem */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">

              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <CircleDot
                    size={20}
                    className="text-yellow-600"
                  />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Original Problem
                  </p>

                  <h2 className="text-lg font-semibold text-slate-900">
                    {problem?.title || "Problem"}
                  </h2>
                </div>
              </div>

              {problem && (
                <>
                  <p className="text-sm text-slate-600 leading-6 mt-5">
                    {problem.description}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-5 text-sm text-slate-600">

                    <span>
                      Category:{" "}
                      <strong className="text-slate-900">
                        {problem.category}
                      </strong>
                    </span>

                    <span>
                      District:{" "}
                      <strong className="text-slate-900">
                        {problem.district}
                      </strong>
                    </span>

                  </div>
                </>
              )}

            </div>

            {/* Accepted Solution */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">

              <div className="flex items-center gap-3">

                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle
                    size={20}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Accepted Student Solution
                  </p>

                  <h2 className="text-lg font-semibold text-slate-900">
                    {solution?.title || "Solution"}
                  </h2>
                </div>

              </div>

              {solution && (
                <>
                  <div className="mt-5 bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap">
                      {solution.description}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5 mt-5">

                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <IndianRupee
                          size={18}
                          className="text-slate-600"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Estimated Cost
                        </p>

                        <p className="font-medium text-slate-900 mt-1">
                          {solution.estimated_cost
                            ? `₹${Number(
                                solution.estimated_cost
                              ).toLocaleString("en-IN")}`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <Clock
                          size={18}
                          className="text-slate-600"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Expected Time
                        </p>

                        <p className="font-medium text-slate-900 mt-1">
                          {solution.implementation_time ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>

                  </div>
                </>
              )}

            </div>

          </section>

          {/* Progress Panel */}
          <section className="lg:col-span-2">

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

              <div className="p-6 border-b border-slate-200">

                <p className="text-sm text-slate-500">
                  Implementation Progress
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mt-1">
                  Update Your Work
                </h2>

              </div>

              <div className="p-6">

                {/* Progress Circle */}
                <div className="text-center">

                  <div className="text-5xl font-bold text-slate-900">
                    {progress}%
                  </div>

                  <p className="text-sm text-slate-500 mt-2">
                    Overall Progress
                  </p>

                </div>

                {/* Progress Bar */}
                <div className="mt-6">

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-green-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                </div>

                {/* Status */}
                <div className="mt-6">

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                    disabled={progress === 100}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="PLANNED">
                      Planned
                    </option>

                    <option value="IN_PROGRESS">
                      In Progress
                    </option>

                    <option value="COMPLETED">
                      Completed
                    </option>
                  </select>

                </div>

                {/* Progress */}
                <div className="mt-5">

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Progress: {progress}%
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) =>
                      setProgress(Number(e.target.value))
                    }
                    className="w-full accent-green-600"
                  />

                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>

                </div>

                {/* Dates */}
                <div className="mt-6 space-y-5">

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <CalendarDays size={16} />
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) =>
                        setStartDate(e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <CalendarDays size={16} />
                      Expected Completion
                    </label>

                    <input
                      type="date"
                      value={expectedDate}
                      onChange={(e) =>
                        setExpectedDate(e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                </div>

                {/* Save */}
                <button
                  onClick={saveProgress}
                  disabled={saving}
                  className="w-full mt-7 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  <Save size={18} />

                  {saving
                    ? "Saving..."
                    : "Save Progress"}
                </button>

              </div>

            </div>

            {/* Current Status */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 mt-6">

              <div className="flex items-center gap-3">

                <User
                  size={20}
                  className="text-slate-500"
                />

                <div>
                  <p className="text-xs text-slate-500">
                    Current Status
                  </p>

                  <p className="font-medium text-slate-900 mt-1">
                    {formatStatus(implementation.status)}
                  </p>
                </div>

              </div>

              {implementation.completed_at && (
                <p className="text-xs text-slate-500 mt-4">
                  Completed on{" "}
                  {new Date(
                    implementation.completed_at
                  ).toLocaleString()}
                </p>
              )}

            </div>

          </section>

        </div>

      </main>
    </div>
  )
}

export default StudentImplementation