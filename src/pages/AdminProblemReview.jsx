import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Sparkles,
  ShieldCheck,
  Copy,
  ExternalLink,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function AdminProblemReview() {
  const { id } = useParams()

  const [problem, setProblem] = useState(null)
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("")
  const [duplicateProblems, setDuplicateProblems] = useState([])

  useEffect(() => {
    fetchProblem()
  }, [id])

  async function fetchProblem() {
    setLoading(true)
    setMessage("")

    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error(error)
      setMessage("Unable to load this problem.")
      setLoading(false)
      return
    }

    setProblem(data)

    // Load AI-suggested possible duplicate reports.
    const candidates = Array.isArray(data.ai_duplicate_candidates)
      ? data.ai_duplicate_candidates
      : []

    if (candidates.length > 0) {
      const candidateIds = candidates
        .map((candidate) => candidate.problem_id)
        .filter(Boolean)

      if (candidateIds.length > 0) {
        const { data: matches, error: duplicateError } = await supabase
          .from("problems")
          .select(
            "id,title,description,category,status,district,address,created_at"
          )
          .in("id", candidateIds)

        if (duplicateError) {
          console.error("Duplicate report loading error:", duplicateError)
          setDuplicateProblems([])
        } else {
          const orderedMatches = candidateIds
            .map((candidateId) => {
              const match = matches?.find(
                (item) => item.id === candidateId
              )
              const candidate = candidates.find(
                (item) => item.problem_id === candidateId
              )

              if (!match) return null

              return {
                ...match,
                similarity: candidate?.similarity ?? 0,
                reason:
                  candidate?.reason ||
                  "AI identified this report as potentially similar.",
              }
            })
            .filter(Boolean)

          setDuplicateProblems(orderedMatches)
        }
      } else {
        setDuplicateProblems([])
      }
    } else {
      setDuplicateProblems([])
    }

    // Generate temporary URL for private problem image
    if (data.image_path) {
      const { data: imageData, error: imageError } =
        await supabase.storage
          .from("problem-images")
          .createSignedUrl(data.image_path, 60 * 60)

      if (imageError) {
        console.error("Image loading error:", imageError)
      } else {
        setImageUrl(imageData.signedUrl)
      }
    }

    setLoading(false)
  }

  async function updateStatus(newStatus) {
    setUpdating(true)
    setMessage("")

    const { data, error } = await supabase
      .from("problems")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(error)
      setMessage(error.message)
    } else {
      setProblem(data)
      setMessage(
        `Problem status changed to ${formatStatus(newStatus)}.`
      )
    }

    setUpdating(false)
  }

  async function markAsDuplicate(candidateId) {
    if (!candidateId) return

    const confirmed = window.confirm(
      "Mark this citizen report as a duplicate of the selected report?"
    )

    if (!confirmed) return

    setUpdating(true)
    setMessage("")

    const { data, error } = await supabase
      .from("problems")
      .update({
        status: "DUPLICATE",
        duplicate_of_problem_id: candidateId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(error)
      setMessage(error.message)
    } else {
      setProblem(data)
      setMessage(
        "Problem marked as a duplicate of the selected report."
      )
    }

    setUpdating(false)
  }

  function formatStatus(status) {
    if (!status) return "Unknown"

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  function formatAiStatus(status) {
    if (!status) return "Not analyzed"

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

    return "bg-gray-100 text-gray-700"
  }

  function getAiSeverityStyle(severity) {
    if (severity === "CRITICAL") {
      return "bg-red-100 text-red-700"
    }

    if (severity === "HIGH") {
      return "bg-orange-100 text-orange-700"
    }

    if (severity === "MEDIUM") {
      return "bg-yellow-100 text-yellow-700"
    }

    if (severity === "LOW") {
      return "bg-green-100 text-green-700"
    }

    return "bg-slate-100 text-slate-700"
  }

  function formatConfidence(confidence) {
    if (confidence === null || confidence === undefined) {
      return "Not available"
    }

    const value = Number(confidence)

    if (Number.isNaN(value)) {
      return "Not available"
    }

    // Handles both 0.94 and 94 formats
    const percentage = value <= 1 ? value * 100 : value

    return `${Math.round(percentage)}%`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">
          Loading problem...
        </p>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-green-600"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="mt-8 bg-white border border-red-200 rounded-xl p-6">
          <p className="text-red-600">
            {message || "Problem not found."}
          </p>
        </div>
      </div>
    )
  }

  const aiCompleted =
    problem.ai_analysis_status === "COMPLETED"

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

          <h1 className="text-2xl font-bold text-slate-900 mt-4">
            Review Citizen Problem
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Review the citizen report and AI-assisted analysis before making a decision.
          </p>

        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">

        {/* Message */}
        {message && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3">
            {message}
          </div>
        )}

        {/* Main Problem Card */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

          {/* Title */}
          <div className="p-6 border-b border-slate-200">

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

              <div>
                <p className="text-sm text-green-600 font-medium">
                  Citizen Report
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {problem.title}
                </h2>
              </div>

              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                  problem.status
                )}`}
              >
                {formatStatus(problem.status)}
              </span>

            </div>

          </div>

          {/* Information */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div>
              <p className="text-sm text-slate-500">
                Category
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {problem.category || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Severity
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {problem.severity || "Not assessed"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                District
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {problem.district}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Submitted On
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {new Date(problem.created_at).toLocaleString()}
              </p>
            </div>

          </div>

          {/* Location */}
          <div className="px-6 pb-6">

            <div className="bg-slate-50 rounded-lg p-4">

              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <MapPin size={18} />
                Location
              </div>

              {problem.address && (
                <p className="text-sm text-slate-600 mt-2">
                  {problem.address}
                </p>
              )}

              {(problem.latitude || problem.longitude) && (
                <p className="text-xs text-slate-500 mt-2">
                  Coordinates: {problem.latitude}, {problem.longitude}
                </p>
              )}

            </div>

          </div>

          {/* Description */}
          <div className="px-6 pb-6">

            <h3 className="font-semibold text-slate-900">
              Problem Description
            </h3>

            <div className="mt-3 bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 whitespace-pre-wrap leading-7">
                {problem.description}
              </p>
            </div>

          </div>

          {/* Problem Photo */}
          <div className="px-6 pb-6">

            <div className="border-t border-slate-200 pt-6">

              <div className="flex items-center gap-2 mb-4">

                <Camera
                  size={20}
                  className="text-green-700"
                />

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Problem Photo
                  </h3>

                  <p className="text-xs text-slate-500">
                    Photo submitted by the citizen
                  </p>
                </div>

              </div>

              {imageUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={imageUrl}
                    alt={`Photo of ${problem.title}`}
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
                    No photo was submitted with this report.
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* AI ANALYSIS */}
        {/* ================================================= */}

        <section className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">

          {/* AI Header */}
          <div className="p-6 border-b border-slate-200">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="bg-purple-100 p-2.5 rounded-xl">
                  <Sparkles
                    size={22}
                    className="text-purple-600"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    AI-Assisted Analysis
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    AI analysis of the citizen's report
                  </p>
                </div>

              </div>

              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  aiCompleted
                    ? "bg-green-100 text-green-700"
                    : problem.ai_analysis_status === "PROCESSING"
                    ? "bg-yellow-100 text-yellow-700"
                    : problem.ai_analysis_status === "FAILED"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {formatAiStatus(problem.ai_analysis_status)}
              </span>

            </div>

          </div>

          {/* AI Content */}
          <div className="p-6">

            {aiCompleted ? (
              <>

                {/* AI Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                  {/* Category */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      AI Category
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {problem.ai_category || "Not available"}
                    </p>

                  </div>

                  {/* Subcategory */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      AI Subcategory
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {problem.ai_subcategory || "Not available"}
                    </p>

                  </div>

                  {/* Severity */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      AI Severity
                    </p>

                    <div className="mt-2">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getAiSeverityStyle(
                          problem.ai_severity
                        )}`}
                      >
                        {problem.ai_severity || "Not available"}
                      </span>
                    </div>

                  </div>

                  {/* Confidence */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      AI Confidence
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {formatConfidence(problem.ai_confidence)}
                    </p>

                  </div>

                </div>

                {/* AI Summary */}
                <div className="mt-6">

                  <div className="flex items-center gap-2">

                    <Sparkles
                      size={18}
                      className="text-purple-600"
                    />

                    <h3 className="font-semibold text-slate-900">
                      AI Summary
                    </h3>

                  </div>

                  <div className="mt-3 rounded-xl bg-purple-50 border border-purple-100 p-5">

                    <p className="text-slate-700 leading-7 whitespace-pre-wrap">
                      {problem.ai_summary ||
                        "No AI summary is available for this report."}
                    </p>

                  </div>

                </div>

                {/* AI Advisory Notice */}
                <div className="mt-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">

                  <ShieldCheck
                    size={21}
                    className="text-blue-600 flex-shrink-0 mt-0.5"
                  />

                  <div>

                    <p className="font-semibold text-blue-900">
                      Government decision required
                    </p>

                    <p className="text-sm text-blue-700 mt-1 leading-6">
                      AI analysis is advisory only. Government officials
                      should review the report, photo, location and AI
                      suggestions before verifying or rejecting the problem.
                    </p>

                  </div>

                </div>

                {/* Analysis Timestamp */}
                {problem.ai_analyzed_at && (
                  <p className="text-xs text-slate-400 mt-4">
                    AI analysis completed on{" "}
                    {new Date(
                      problem.ai_analyzed_at
                    ).toLocaleString()}
                  </p>
                )}

              </>

            ) : (

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                <Sparkles
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-medium text-slate-700">
                  AI analysis is not available yet.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Current AI status:{" "}
                  {formatAiStatus(problem.ai_analysis_status)}
                </p>

              </div>

            )}

          </div>

        </section>

        {/* ================================================= */}
        {/* AI DUPLICATE REVIEW */}
        {/* ================================================= */}

        <section className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2.5 rounded-xl">
                <Copy size={22} className="text-orange-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Possible Duplicate Reports
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  AI suggestions for reports that may describe the same real-world problem.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {duplicateProblems.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="font-semibold text-orange-900">
                    Government review required
                  </p>

                  <p className="text-sm text-orange-800 mt-1 leading-6">
                    AI has found {duplicateProblems.length} possible matching
                    report{duplicateProblems.length === 1 ? "" : "s"}. Review
                    the details below before deciding whether this report is a duplicate.
                  </p>
                </div>

                {duplicateProblems.map((candidate) => {
                  const similarity = Math.round(
                    Number(candidate.similarity || 0) * 100
                  )

                  return (
                    <div
                      key={candidate.id}
                      className="border border-slate-200 rounded-xl p-5 bg-slate-50"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                              {similarity}% similarity
                            </span>

                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                                candidate.status
                              )}`}
                            >
                              {formatStatus(candidate.status)}
                            </span>
                          </div>

                          <h3 className="mt-3 text-lg font-semibold text-slate-900">
                            {candidate.title}
                          </h3>

                          <div className="mt-2 text-sm text-slate-600 space-y-1">
                            <p>
                              <span className="font-medium">Category:</span>{" "}
                              {candidate.category || "Not specified"}
                            </p>

                            <p>
                              <span className="font-medium">District:</span>{" "}
                              {candidate.district || "Not specified"}
                            </p>

                            {candidate.address && (
                              <p>
                                <span className="font-medium">Location:</span>{" "}
                                {candidate.address}
                              </p>
                            )}

                            <p>
                              <span className="font-medium">Submitted:</span>{" "}
                              {candidate.created_at
                                ? new Date(
                                    candidate.created_at
                                  ).toLocaleString()
                                : "Not available"}
                            </p>
                          </div>

                          <div className="mt-4 rounded-lg bg-white border border-slate-200 p-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Why AI flagged it
                            </p>

                            <p className="mt-2 text-sm text-slate-700 leading-6">
                              {candidate.reason}
                            </p>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Existing report description
                            </p>

                            <p className="mt-2 text-sm text-slate-600 leading-6 whitespace-pre-wrap">
                              {candidate.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                          <Link
                            to={`/admin/problem/${candidate.id}`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-100"
                          >
                            <ExternalLink size={17} />
                            Open Report
                          </Link>

                          <button
                            onClick={() => markAsDuplicate(candidate.id)}
                            disabled={updating || problem.status === "DUPLICATE"}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-800 disabled:opacity-50"
                          >
                            <Copy size={17} />
                            Mark as Duplicate
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                <p className="text-xs text-slate-400">
                  AI duplicate detection is advisory. If none of these reports
                  describe the same issue, continue with the normal government
                  review below.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
                <Copy size={30} className="mx-auto text-slate-300" />

                <p className="mt-3 font-medium text-slate-700">
                  No possible duplicates were found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  AI did not identify a likely matching report for this problem.
                  Government can continue with the normal review.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ================================================= */}
        {/* GOVERNMENT ACTIONS */}
        {/* ================================================= */}

        <section className="mt-6 bg-white border border-slate-200 rounded-xl">

          <div className="p-6">

            <h3 className="font-semibold text-slate-900">
              Government Review
            </h3>

            <p className="text-sm text-slate-500 mt-1 mb-5">
              Review the citizen report and AI analysis, then select the
              appropriate action.
            </p>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() => updateStatus("UNDER_REVIEW")}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 disabled:opacity-50"
              >
                <Clock size={18} />
                Mark Under Review
              </button>

              <button
                onClick={() => updateStatus("VERIFIED")}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle size={18} />
                Verify Problem
              </button>

              <button
                onClick={() => updateStatus("REJECTED")}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle size={18} />
                Reject
              </button>

              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                To mark this report as a duplicate, select the matching report
                in the <span className="font-semibold">Possible Duplicate Reports</span>{" "}
                section above.
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}

export default AdminProblemReview