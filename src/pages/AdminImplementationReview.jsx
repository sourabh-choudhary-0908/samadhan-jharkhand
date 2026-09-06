import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  User,
  Lightbulb,
  AlertTriangle,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function AdminImplementationReview() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [implementation, setImplementation] = useState(null)
  const [problem, setProblem] = useState(null)
  const [solution, setSolution] = useState(null)
  const [student, setStudent] = useState(null)

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchImplementation()
  }, [id])

  async function fetchImplementation() {
    setLoading(true)
    setError("")
    setMessage("")

    // =====================================================
    // FETCH IMPLEMENTATION
    // =====================================================

    const {
      data: implementationData,
      error: implementationError,
    } = await supabase
      .from("implementations")
      .select("*")
      .eq("id", id)
      .single()

    if (implementationError) {
      console.error(implementationError)
      setError("Unable to load this implementation.")
      setLoading(false)
      return
    }

    setImplementation(implementationData)

    // =====================================================
    // FETCH RELATED PROBLEM
    // =====================================================

    const { data: problemData, error: problemError } = await supabase
      .from("problems")
      .select("*")
      .eq("id", implementationData.problem_id)
      .single()

    if (problemError) {
      console.error(problemError)
      setError("Implementation loaded, but the problem could not be loaded.")
    } else {
      setProblem(problemData)
    }

    // =====================================================
    // FETCH RELATED SOLUTION
    // =====================================================

    const { data: solutionData, error: solutionError } = await supabase
      .from("solutions")
      .select("*")
      .eq("id", implementationData.solution_id)
      .single()

    if (solutionError) {
      console.error(solutionError)
      setError("Implementation loaded, but the solution could not be loaded.")
    } else {
      setSolution(solutionData)
    }

    // =====================================================
    // FETCH STUDENT PROFILE
    // =====================================================

    const { data: studentData, error: studentError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, district")
      .eq("id", implementationData.student_id)
      .single()

    if (studentError) {
      console.error(studentError)
    } else {
      setStudent(studentData)
    }

    setLoading(false)
  }

  // =====================================================
  // VERIFY IMPLEMENTATION
  // =====================================================

  async function verifyImplementation() {
    const confirmed = window.confirm(
      "Are you sure this implementation has been completed successfully? This will mark the problem as RESOLVED."
    )

    if (!confirmed) {
      return
    }

    setUpdating(true)
    setError("")
    setMessage("")

    // Get logged-in government user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setError("You must be logged in as a government user.")
      setUpdating(false)
      return
    }

    // =====================================================
    // UPDATE IMPLEMENTATION
    // =====================================================

    const {
      data: updatedImplementation,
      error: implementationError,
    } = await supabase
      .from("implementations")
      .update({
        status: "GOVERNMENT_VERIFIED",
        government_verified_at: new Date().toISOString(),
        government_verified_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (implementationError) {
      console.error(implementationError)
      setError(implementationError.message)
      setUpdating(false)
      return
    }

    setImplementation(updatedImplementation)

    // =====================================================
    // UPDATE PROBLEM TO RESOLVED
    // =====================================================

    const { data: updatedProblem, error: problemError } =
      await supabase
        .from("problems")
        .update({
          status: "RESOLVED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", implementation.problem_id)
        .select()
        .single()

    if (problemError) {
      console.error(problemError)

      setError(
        "Implementation was verified, but the problem could not be marked as resolved."
      )

      setUpdating(false)
      return
    }

    setProblem(updatedProblem)

    setMessage(
      "Implementation verified successfully. The problem has been marked as RESOLVED."
    )

    setUpdating(false)
  }

  // =====================================================
  // REQUEST CHANGES
  // =====================================================

  async function requestChanges() {
    const confirmed = window.confirm(
      "Are you sure you want to send this implementation back for changes?"
    )

    if (!confirmed) {
      return
    }

    setUpdating(true)
    setError("")
    setMessage("")

    // Move implementation back to IN_PROGRESS
    const { data: updatedImplementation, error: implementationError } =
      await supabase
        .from("implementations")
        .update({
          status: "IN_PROGRESS",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

    if (implementationError) {
      console.error(implementationError)
      setError(implementationError.message)
      setUpdating(false)
      return
    }

    setImplementation(updatedImplementation)

    // Keep problem in implementation stage
    const { data: updatedProblem, error: problemError } =
      await supabase
        .from("problems")
        .update({
          status: "IMPLEMENTATION",
          updated_at: new Date().toISOString(),
        })
        .eq("id", implementation.problem_id)
        .select()
        .single()

    if (problemError) {
      console.error(problemError)
      setError(
        "Implementation status was updated, but the problem status could not be updated."
      )
      setUpdating(false)
      return
    }

    setProblem(updatedProblem)

    setMessage(
      "Changes requested. The implementation has been moved back to IN PROGRESS."
    )

    setUpdating(false)
  }

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

  function getImplementationStatusStyle(status) {
    if (status === "GOVERNMENT_VERIFIED") {
      return "bg-green-100 text-green-700"
    }

    if (status === "COMPLETED") {
      return "bg-blue-100 text-blue-700"
    }

    if (status === "IN_PROGRESS") {
      return "bg-yellow-100 text-yellow-700"
    }

    return "bg-slate-100 text-slate-700"
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" />

          <p className="text-slate-500 mt-4">
            Loading implementation...
          </p>
        </div>
      </div>
    )
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!implementation) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
        >
          <ArrowLeft size={18} />
          Back to Government Dashboard
        </Link>

        <div className="max-w-4xl mx-auto mt-8 bg-white border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle size={22} />

            <p>
              {error || "Implementation not found."}
            </p>
          </div>
        </div>

      </div>
    )
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="bg-white border-b border-slate-200">

        <div className="max-w-6xl mx-auto px-6 py-5">

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
          >
            <ArrowLeft size={17} />
            Back to Government Dashboard
          </Link>

          <div className="mt-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">

            <div>

              <p className="text-sm text-green-600 font-medium">
                Government Verification
              </p>

              <h1 className="text-3xl font-bold text-slate-900 mt-1">
                Implementation Review
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Review the completed implementation before resolving the civic problem.
              </p>

            </div>

            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${getImplementationStatusStyle(
                implementation.status
              )}`}
            >
              {formatStatus(implementation.status)}
            </span>

          </div>

        </div>

      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main className="max-w-6xl mx-auto p-6">

        {/* MESSAGE */}

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3">
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">

          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div className="lg:col-span-3 space-y-6">

            {/* ORIGINAL PROBLEM */}

            <section className="bg-white border border-slate-200 rounded-xl">

              <div className="p-6 border-b border-slate-200">

                <div className="flex items-center gap-2">

                  <AlertTriangle
                    size={20}
                    className="text-orange-500"
                  />

                  <h2 className="text-lg font-semibold text-slate-900">
                    Original Problem
                  </h2>

                </div>

              </div>

              <div className="p-6">

                <h3 className="text-xl font-bold text-slate-900">
                  {problem?.title || "Problem unavailable"}
                </h3>

                <p className="text-slate-600 mt-3 leading-7">
                  {problem?.description || "No description available."}
                </p>

                <div className="flex flex-wrap gap-4 mt-5 text-sm text-slate-500">

                  {problem?.district && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} />
                      {problem.district}
                    </span>
                  )}

                  {problem?.category && (
                    <span>
                      Category:{" "}
                      <strong className="text-slate-700">
                        {formatStatus(problem.category)}
                      </strong>
                    </span>
                  )}

                  {problem?.severity && (
                    <span>
                      Severity:{" "}
                      <strong className="text-slate-700">
                        {formatStatus(problem.severity)}
                      </strong>
                    </span>
                  )}

                </div>

              </div>

            </section>

            {/* STUDENT SOLUTION */}

            <section className="bg-white border border-slate-200 rounded-xl">

              <div className="p-6 border-b border-slate-200">

                <div className="flex items-center gap-2">

                  <Lightbulb
                    size={20}
                    className="text-yellow-600"
                  />

                  <h2 className="text-lg font-semibold text-slate-900">
                    Student's Solution
                  </h2>

                </div>

              </div>

              <div className="p-6">

                <h3 className="text-xl font-bold text-slate-900">
                  {solution?.title || "Solution unavailable"}
                </h3>

                <p className="text-slate-600 mt-3 leading-7">
                  {solution?.description || "No solution description available."}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mt-6">

                  <div className="bg-slate-50 rounded-lg p-4">

                    <p className="text-xs text-slate-500">
                      Estimated Cost
                    </p>

                    <p className="font-semibold text-slate-900 mt-1">
                      {solution?.estimated_cost
                        ? `₹${Number(
                            solution.estimated_cost
                          ).toLocaleString("en-IN")}`
                        : "Not specified"}
                    </p>

                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">

                    <p className="text-xs text-slate-500">
                      Estimated Time
                    </p>

                    <p className="font-semibold text-slate-900 mt-1">
                      {solution?.implementation_time ||
                        "Not specified"}
                    </p>

                  </div>

                </div>

              </div>

            </section>

          </div>

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <div className="lg:col-span-2 space-y-6">

            {/* IMPLEMENTATION STATUS */}

            <section className="bg-white border border-slate-200 rounded-xl">

              <div className="p-6 border-b border-slate-200">

                <h2 className="text-lg font-semibold text-slate-900">
                  Implementation Details
                </h2>

              </div>

              <div className="p-6 space-y-5">

                {/* PROGRESS */}

                <div>

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Progress
                    </span>

                    <strong className="text-lg text-slate-900">
                      {implementation.progress}%
                    </strong>

                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-3 mt-3">

                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${implementation.progress}%`,
                      }}
                    />

                  </div>

                </div>

                {/* STATUS */}

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-500">
                    Status
                  </span>

                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${getImplementationStatusStyle(
                      implementation.status
                    )}`}
                  >
                    {formatStatus(implementation.status)}
                  </span>

                </div>

                {/* RESPONSIBLE PARTY */}

                {implementation.responsible_party && (
                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-slate-500">
                      Responsible Party
                    </span>

                    <span className="text-sm font-medium text-slate-900 text-right">
                      {implementation.responsible_party}
                    </span>

                  </div>
                )}

                {/* START DATE */}

                {implementation.start_date && (
                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Start Date
                    </span>

                    <span className="text-sm font-medium text-slate-900">
                      {new Date(
                        implementation.start_date
                      ).toLocaleDateString()}
                    </span>

                  </div>
                )}

                {/* EXPECTED COMPLETION */}

                {implementation.expected_completion_date && (
                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Expected Completion
                    </span>

                    <span className="text-sm font-medium text-slate-900">
                      {new Date(
                        implementation.expected_completion_date
                      ).toLocaleDateString()}
                    </span>

                  </div>
                )}

                {/* COMPLETED DATE */}

                {implementation.completed_at && (
                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Completed On
                    </span>

                    <span className="text-sm font-medium text-slate-900">
                      {new Date(
                        implementation.completed_at
                      ).toLocaleDateString()}
                    </span>

                  </div>
                )}

              </div>

            </section>

            {/* STUDENT INFORMATION */}

            <section className="bg-white border border-slate-200 rounded-xl">

              <div className="p-6 border-b border-slate-200">

                <h2 className="text-lg font-semibold text-slate-900">
                  Student Information
                </h2>

              </div>

              <div className="p-6">

                <div className="flex items-center gap-3">

                  <div className="bg-green-100 p-3 rounded-full">

                    <User
                      size={22}
                      className="text-green-600"
                    />

                  </div>

                  <div>

                    <p className="font-semibold text-slate-900">
                      {student?.full_name || "Student"}
                    </p>

                    <p className="text-sm text-slate-500">
                      {student?.district
                        ? student.district
                        : "Student Contributor"}
                    </p>

                  </div>

                </div>

              </div>

            </section>

          </div>

        </div>

        {/* ================================================= */}
        {/* VERIFICATION ACTIONS */}
        {/* ================================================= */}

        {implementation.status === "COMPLETED" && (

          <section className="mt-6 bg-white border border-slate-200 rounded-xl">

            <div className="p-6">

              <h2 className="text-lg font-semibold text-slate-900">
                Government Verification
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Confirm whether the implemented solution has actually resolved the reported problem.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mt-6">

                {/* REQUEST CHANGES */}

                <button
                  onClick={requestChanges}
                  disabled={updating}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >

                  <XCircle size={19} />

                  {updating
                    ? "Processing..."
                    : "Request Changes"}

                </button>

                {/* VERIFY */}

                <button
                  onClick={verifyImplementation}
                  disabled={updating}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >

                  <CheckCircle size={19} />

                  {updating
                    ? "Verifying..."
                    : "Verify Implementation"}

                </button>

              </div>

            </div>

          </section>

        )}

        {/* ALREADY VERIFIED */}

        {implementation.status === "GOVERNMENT_VERIFIED" && (

          <section className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">

            <div className="flex items-start gap-3">

              <CheckCircle
                size={24}
                className="text-green-600 mt-0.5"
              />

              <div>

                <h2 className="font-semibold text-green-800">
                  Implementation Government Verified
                </h2>

                <p className="text-sm text-green-700 mt-1">
                  This implementation has been verified by the government and the related problem has been resolved.
                </p>

                {implementation.government_verified_at && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <Clock size={13} />

                    Verified on{" "}

                    {new Date(
                      implementation.government_verified_at
                    ).toLocaleString()}
                  </p>
                )}

              </div>

            </div>

          </section>

        )}

        {/* BACK BUTTON */}

        <div className="mt-8">

          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Return to Government Dashboard
          </button>

        </div>

      </main>

    </div>
  )
}

export default AdminImplementationReview