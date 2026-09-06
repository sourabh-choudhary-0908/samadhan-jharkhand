import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb,
  MapPin,
  Camera,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function AdminSolutionReview() {
  const { id } = useParams()

  const [solution, setSolution] = useState(null)
  const [problem, setProblem] = useState(null)
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchSolution()
  }, [id])

  async function fetchSolution() {
    setLoading(true)
    setMessage("")

    const { data: solutionData, error: solutionError } =
      await supabase
        .from("solutions")
        .select("*")
        .eq("id", id)
        .single()

    if (solutionError) {
      console.error(solutionError)
      setMessage("Unable to load this solution.")
      setLoading(false)
      return
    }

    setSolution(solutionData)

    // Generate temporary URL for private solution image
    if (solutionData.image_path) {
      const { data: imageData, error: imageError } =
        await supabase.storage
          .from("solution-images")
          .createSignedUrl(solutionData.image_path, 60 * 60)

      if (imageError) {
        console.error("Solution image loading error:", imageError)
      } else {
        setImageUrl(imageData.signedUrl)
      }
    }

    const { data: problemData, error: problemError } =
      await supabase
        .from("problems")
        .select("*")
        .eq("id", solutionData.problem_id)
        .single()

    if (problemError) {
      console.error(problemError)
      setMessage(
        "Solution loaded, but the related problem could not be loaded."
      )
    } else {
      setProblem(problemData)
    }

    setLoading(false)
  }

  async function updateStatus(newStatus) {
    const confirmationMessage =
      newStatus === "ACCEPTED"
        ? "Accept this solution?\n\nThis will accept the student's proposal, create an implementation record, and move the problem to implementation."
        : newStatus === "REJECTED"
        ? "Reject this solution?\n\nThis will mark the student's proposal as rejected."
        : "Move this solution to Under Review?"

    const confirmed = window.confirm(confirmationMessage)

    if (!confirmed) {
      return
    }

    setUpdating(true)
    setMessage("")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage("You must be logged in to review a solution.")
      setUpdating(false)
      return
    }

    const { data: updatedSolution, error: solutionError } =
      await supabase
        .from("solutions")
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

    if (solutionError) {
      console.error(solutionError)
      setMessage(solutionError.message)
      setUpdating(false)
      return
    }

    setSolution(updatedSolution)

    // If solution is accepted,
    // create an implementation and move the problem to implementation.
    if (newStatus === "ACCEPTED") {
      const { error: implementationError } = await supabase
        .from("implementations")
        .upsert(
          {
            problem_id: solution.problem_id,
            solution_id: solution.id,
            student_id: solution.student_id,
            status: "PLANNED",
            progress: 0,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "solution_id",
          }
        )

      if (implementationError) {
        console.error(
          "Implementation creation error:",
          implementationError
        )

        setMessage(
          "Solution was accepted, but the implementation could not be created."
        )

        setUpdating(false)
        return
      }

      const { data: updatedProblem, error: problemError } =
        await supabase
          .from("problems")
          .update({
            status: "IMPLEMENTATION",
            updated_at: new Date().toISOString(),
          })
          .eq("id", solution.problem_id)
          .select()
          .single()

      if (problemError) {
        console.error(problemError)

        setMessage(
          "Solution and implementation were created, but the problem could not be moved to implementation."
        )
      } else {
        setProblem(updatedProblem)

        setMessage(
          "Solution accepted. Implementation has been created and the problem has moved to implementation."
        )
      }
    } else {
      setMessage(
        `Solution status changed to ${formatStatus(newStatus)}.`
      )
    }

    setUpdating(false)
  }

  function formatStatus(status) {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  function getStatusStyle(status) {
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

    return "bg-slate-100 text-slate-700"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">
          Loading solution...
        </p>
      </div>
    )
  }

  if (!solution) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-green-600"
        >
          <ArrowLeft size={18} />
          Back to Government Dashboard
        </Link>

        <div className="max-w-4xl mx-auto mt-8 bg-white border border-red-200 rounded-xl p-6">
          <p className="text-red-600">
            {message || "Solution not found."}
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
            to="/admin"
            className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
          >
            <ArrowLeft size={17} />
            Back to Government Dashboard
          </Link>

          <div className="mt-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">

            <div>
              <p className="text-sm text-green-600 font-medium">
                Student Solution Review
              </p>

              <h1 className="text-3xl font-bold text-slate-900 mt-1">
                {solution.title}
              </h1>
            </div>

            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                solution.status
              )}`}
            >
              {formatStatus(solution.status)}
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

          {/* Original Problem */}
          <section className="lg:col-span-2">

            <div className="bg-white border border-slate-200 rounded-xl p-6">

              <div className="flex items-center gap-2">

                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Lightbulb
                    size={20}
                    className="text-yellow-600"
                  />
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Original Problem
                </h2>

              </div>

              {problem ? (
                <>
                  <h3 className="font-semibold text-slate-900 mt-5">
                    {problem.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-6 mt-3">
                    {problem.description}
                  </p>

                  <div className="mt-5 space-y-3">

                    <div className="text-sm">
                      <span className="text-slate-500">
                        Category:
                      </span>{" "}
                      <span className="font-medium">
                        {problem.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={15} />
                      {problem.district}
                    </div>

                    <div className="text-sm">
                      <span className="text-slate-500">
                        Problem Status:
                      </span>{" "}
                      <span className="font-medium">
                        {formatStatus(problem.status)}
                      </span>
                    </div>

                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 mt-5">
                  Related problem unavailable.
                </p>
              )}

            </div>

          </section>

          {/* Solution */}
          <section className="lg:col-span-3">

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

              <div className="p-6 border-b border-slate-200">

                <p className="text-sm text-slate-500">
                  Proposed Solution
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mt-1">
                  {solution.title}
                </h2>

              </div>

              <div className="p-6">

                {/* Description */}
                <h3 className="font-semibold text-slate-900">
                  Description
                </h3>

                <div className="mt-3 bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700 leading-7 whitespace-pre-wrap">
                    {solution.description}
                  </p>
                </div>

                {/* Solution Photo */}
                <div className="mt-6">

                  <div className="flex items-center gap-2 mb-4">

                    <Camera
                      size={20}
                      className="text-green-700"
                    />

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Solution Photo
                      </h3>

                      <p className="text-xs text-slate-500">
                        Image submitted by the student
                      </p>
                    </div>

                  </div>

                  {imageUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={imageUrl}
                        alt={`Solution: ${solution.title}`}
                        className="w-full max-h-[500px] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">

                      <Camera
                        size={30}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        No photo was submitted with this solution.
                      </p>

                    </div>
                  )}

                </div>

                {/* Cost + Time */}
                <div className="grid sm:grid-cols-2 gap-5 mt-6">

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

                  <div>
                    <p className="text-xs text-slate-500">
                      Implementation Time
                    </p>

                    <p className="font-medium text-slate-900 mt-1">
                      {solution.implementation_time ||
                        "Not provided"}
                    </p>
                  </div>

                </div>

                {/* Review Information */}
                {solution.reviewed_at && (
                  <div className="mt-6 pt-5 border-t border-slate-100">

                    <p className="text-xs text-slate-500">
                      Last Reviewed
                    </p>

                    <p className="text-sm font-medium text-slate-800 mt-1">
                      {new Date(
                        solution.reviewed_at
                      ).toLocaleString()}
                    </p>

                  </div>
                )}

              </div>

              {/* Actions */}
              <div className="p-6 border-t border-slate-200">

                <h3 className="font-semibold text-slate-900">
                  Government Decision
                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-5">
                  Review the proposal and select the appropriate action.
                </p>

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      updateStatus("UNDER_REVIEW")
                    }
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 disabled:opacity-50"
                  >
                    <Clock size={18} />
                    Under Review
                  </button>

                  <button
                    onClick={() =>
                      updateStatus("ACCEPTED")
                    }
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    Accept Solution
                  </button>

                  <button
                    onClick={() =>
                      updateStatus("REJECTED")
                    }
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Reject Solution
                  </button>

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}

export default AdminSolutionReview