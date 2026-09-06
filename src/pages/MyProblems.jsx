import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  FileText,
  MapPin,
  PlusCircle,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function MyProblems() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchProblems()
  }, [])

  async function fetchProblems() {
    try {
      setLoading(true)
      setMessage("")

      // Get currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        setMessage("You must be logged in to view your problems.")
        return
      }

      // Get this citizen's problems
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("citizen_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setProblems(data || [])

    } catch (error) {
      console.error("Error fetching problems:", error)
      setMessage(error.message || "Unable to load your problems.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5">

          <Link
            to="/citizen"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-green-700"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
              Citizen Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              My Problems
            </h1>

            <p className="mt-2 text-slate-600">
              View and track the problems you have reported.
            </p>
          </div>

          <Link
            to="/citizen/report"
            className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            <PlusCircle size={19} />
            Report a Problem
          </Link>

        </div>

        {/* Problems Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              Reported Problems
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Your submitted community problems will appear here.
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="px-6 py-16 text-center">

              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <FileText
                  size={22}
                  className="text-slate-500"
                />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Loading your problems...
              </p>

            </div>

          ) : message ? (

            /* Error */
            <div className="px-6 py-16 text-center">

              <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 flex items-center justify-center">
                <FileText
                  size={22}
                  className="text-red-500"
                />
              </div>

              <p className="mt-4 text-sm text-red-600">
                {message}
              </p>

            </div>

          ) : problems.length === 0 ? (

            /* Empty State */
            <div className="px-6 py-16 text-center">

              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileText
                  size={25}
                  className="text-slate-500"
                />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No problems reported yet
              </h3>

              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                Once you report a problem, it will appear here so you can
                track its status and progress.
              </p>

              <Link
                to="/citizen/report"
                className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800"
              >
                <PlusCircle size={18} />
                Report a Problem
              </Link>

            </div>

          ) : (

            /* Problems List */
            <div className="divide-y divide-slate-100">

              {problems.map((problem) => (

                <div
                  key={problem.id}
                  className="p-6 hover:bg-slate-50 transition"
                >

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                    {/* Problem Information */}
                    <div className="flex items-start gap-4">

                      <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                        <FileText
                          size={20}
                          className="text-green-700"
                        />
                      </div>

                      <div>

                        <h3 className="font-semibold text-slate-900">
                          {problem.title}
                        </h3>

                        <p className="mt-2 text-sm text-slate-600">
                          {problem.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">

                          {/* District */}
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={14} />
                            {problem.district}
                          </span>

                          {/* Address */}
                          {problem.address && (
                            <span>
                              {problem.address}
                            </span>
                          )}

                          {/* Date */}
                          <span>
                            Reported{" "}
                            {new Date(
                              problem.created_at
                            ).toLocaleDateString()}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* Status */}
                    <div className="shrink-0">

                      <span className="inline-flex px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                        {problem.status}
                      </span>

                    </div>

                  </div>

                  {/* Category */}
                  <div className="mt-4">

                    <span className="inline-flex px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                      {problem.category}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  )
}

export default MyProblems