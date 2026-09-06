import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  UserCircle,
  LogOut,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Menu,
  X,
  Search,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function CitizenDashboard() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  // Fetch citizen's problems when dashboard loads
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
        setMessage("You must be logged in.")
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
      console.error("Error fetching dashboard problems:", error)
      setMessage(error.message || "Unable to load problems.")
    } finally {
      setLoading(false)
    }
  }

  // Logout
  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
      setMessage(error.message || "Unable to logout.")
    }
  }

  // Close mobile sidebar
  function closeSidebar() {
    setSidebarOpen(false)
  }

  // Calculate dashboard statistics
  const totalProblems = problems.length

  const underReviewCount = problems.filter(
    (problem) =>
      problem.status === "UNDER_REVIEW"
  ).length

  const verifiedCount = problems.filter(
    (problem) =>
      problem.status === "VERIFIED"
  ).length

  const resolvedCount = problems.filter(
    (problem) =>
      problem.status === "RESOLVED"
  ).length

  // Get latest 3 problems
  const recentProblems = problems.slice(0, 3)

  // Convert database status into readable text
  function formatStatus(status) {
    if (!status) return "Unknown"

    return status
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ")
  }

  // Status styling
  function getStatusStyle(status) {
    switch (status) {
      case "SUBMITTED":
        return "bg-slate-100 text-slate-700"

      case "AI_ANALYZED":
        return "bg-purple-100 text-purple-700"

      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-700"

      case "VERIFIED":
        return "bg-green-100 text-green-700"

      case "OPEN_FOR_SOLUTIONS":
        return "bg-blue-100 text-blue-700"

      case "SOLUTION_PROPOSED":
        return "bg-indigo-100 text-indigo-700"

      case "SOLUTION_ACCEPTED":
        return "bg-green-100 text-green-700"

      case "SUPPORT_REQUIRED":
        return "bg-orange-100 text-orange-700"

      case "IMPLEMENTATION":
        return "bg-purple-100 text-purple-700"

      case "GOVERNMENT_VERIFICATION":
        return "bg-blue-100 text-blue-700"

      case "RESOLVED":
        return "bg-green-100 text-green-700"

      case "REJECTED":
        return "bg-red-100 text-red-700"

      case "DUPLICATE":
        return "bg-orange-100 text-orange-700"

      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= MOBILE HEADER ================= */}

      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">

        <Link
          to="/citizen"
          onClick={closeSidebar}
        >
          <h1 className="font-bold text-slate-900">
            Samadhan Jharkhand
          </h1>

          <p className="text-xs text-slate-500">
            Citizen Portal
          </p>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>

      </div>


      {/* ================= SIDEBAR ================= */}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200
          transform transition-transform duration-200
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Logo */}

        <div className="h-20 px-6 border-b border-slate-200 flex items-center">

          <Link
            to="/citizen"
            onClick={closeSidebar}
          >
            <h1 className="font-bold text-lg text-slate-900">
              Samadhan Jharkhand
            </h1>

            <p className="text-xs text-slate-500">
              Citizen Portal
            </p>
          </Link>

        </div>


        {/* Navigation */}

        <nav className="p-4 space-y-1">

          {/* Dashboard */}

          <Link
            to="/citizen"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 text-green-700 font-semibold"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>


          {/* Report Problem */}

          <Link
            to="/citizen/report"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-green-700"
          >
            <PlusCircle size={19} />
            Report a Problem
          </Link>


          {/* My Problems */}

          <Link
            to="/citizen/problems"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-green-700"
          >
            <FileText size={19} />
            My Problems
          </Link>


          {/* Profile - page will be added later */}

          <Link
            to="/citizen"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-green-700"
          >
            <UserCircle size={19} />
            Profile
          </Link>

        </nav>


        {/* Logout */}

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Logout
          </button>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="lg:ml-64">


        {/* Top Bar */}

        <header className="hidden lg:flex h-20 bg-white border-b border-slate-200 px-8 items-center justify-between">

          <div>

            <p className="text-sm text-slate-500">
              Citizen Portal
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              Dashboard
            </h2>

          </div>


          <div className="flex items-center gap-3">

            <Link
              to="/citizen"
              className="text-right hover:opacity-80"
            >

              <p className="text-sm font-semibold text-slate-900">
                Welcome, Sourabh
              </p>

              <p className="text-xs text-slate-500">
                Citizen
              </p>

            </Link>


            <Link
              to="/citizen"
              className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition"
            >
              <UserCircle
                className="text-green-700"
                size={22}
              />
            </Link>

          </div>

        </header>


        {/* ================= DASHBOARD ================= */}

        <div className="p-5 lg:p-8 max-w-7xl mx-auto">


          {/* Welcome */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

            <div>

              <p className="text-green-700 font-semibold text-sm">
                Welcome back 👋
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Help make Jharkhand better.
              </h1>

              <p className="mt-2 text-slate-600">
                Report problems in your community and track their progress.
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


          {/* ================= STATS ================= */}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">


            {/* Total */}

            <Link
              to="/citizen/problems"
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition"
            >

              <div className="flex items-center justify-between">

                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">

                  <FileText
                    className="text-green-700"
                    size={21}
                  />

                </div>

                <span className="text-xs font-medium text-slate-400">
                  Total
                </span>

              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading ? "—" : totalProblems}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Problems Reported
              </p>

            </Link>


            {/* Under Review */}

            <Link
              to="/citizen/problems"
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition"
            >

              <div className="w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center">

                <Clock
                  className="text-yellow-700"
                  size={21}
                />

              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading ? "—" : underReviewCount}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Under Review
              </p>

            </Link>


            {/* Verified */}

            <Link
              to="/citizen/problems"
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition"
            >

              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">

                <AlertCircle
                  className="text-blue-700"
                  size={21}
                />

              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading ? "—" : verifiedCount}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Verified
              </p>

            </Link>


            {/* Resolved */}

            <Link
              to="/citizen/problems"
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition"
            >

              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">

                <CheckCircle2
                  className="text-green-700"
                  size={21}
                />

              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading ? "—" : resolvedCount}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Resolved
              </p>

            </Link>

          </div>


          {/* ================= RECENT PROBLEMS ================= */}

          <div className="mt-8 bg-white rounded-2xl border border-slate-200">

            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Recent Problems
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Track the problems you have reported
                </p>

              </div>


              <Link
                to="/citizen/problems"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800"
              >
                View All
                <ChevronRight size={17} />
              </Link>

            </div>


            {/* Loading */}

            {loading ? (

              <div className="px-6 py-12 text-center">

                <p className="text-sm text-slate-500">
                  Loading your problems...
                </p>

              </div>

            ) : message ? (

              /* Error */

              <div className="px-6 py-12 text-center">

                <p className="text-sm text-red-600">
                  {message}
                </p>

                <button
                  onClick={fetchProblems}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
                >
                  Try Again
                </button>

              </div>

            ) : recentProblems.length === 0 ? (

              /* No Problems */

              <div className="px-6 py-12 text-center">

                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">

                  <FileText
                    size={22}
                    className="text-slate-500"
                  />

                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  No problems reported yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your reported problems will appear here.
                </p>

                <Link
                  to="/citizen/report"
                  className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800"
                >
                  <PlusCircle size={17} />
                  Report a Problem
                </Link>

              </div>

            ) : (

              /* Problems */

              <div className="divide-y divide-slate-100">

                {recentProblems.map((problem) => (

                  <Link
                    key={problem.id}
                    to={`/citizen/problems?problem=${problem.id}`}
                    className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50 transition block"
                  >

                    {/* Problem Information */}

                    <div className="flex items-start gap-4">

                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">

                        <FileText
                          size={19}
                          className="text-slate-600"
                        />

                      </div>


                      <div>

                        <h3 className="font-semibold text-slate-900">
                          {problem.title}
                        </h3>


                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">

                          <MapPin size={15} />

                          <span>
                            {problem.district}
                          </span>

                          {problem.address && (
                            <span>
                              • {problem.address}
                            </span>
                          )}

                        </div>


                        <p className="mt-1 text-xs text-slate-400">

                          Reported{" "}
                          {new Date(
                            problem.created_at
                          ).toLocaleDateString()}

                        </p>

                      </div>

                    </div>


                    {/* Status */}

                    <div className="flex items-center gap-4">

                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(
                          problem.status
                        )}`}
                      >
                        {formatStatus(problem.status)}
                      </span>


                      <ChevronRight
                        size={18}
                        className="text-slate-400"
                      />

                    </div>

                  </Link>

                ))}

              </div>

            )}

          </div>


          {/* ================= QUICK ACTION ================= */}

          <div className="mt-8 rounded-2xl bg-green-700 p-6 lg:p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>

              <h2 className="text-xl font-bold">
                See a problem around you?
              </h2>

              <p className="mt-2 text-green-100">
                Report it and help your community find a solution.
              </p>

            </div>


            <Link
              to="/citizen/report"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-800 font-semibold px-5 py-3 rounded-xl hover:bg-green-50 transition"
            >
              <PlusCircle size={19} />
              Report a Problem
            </Link>

          </div>

        </div>

      </main>


      {/* ================= MOBILE OVERLAY ================= */}

      {sidebarOpen && (

        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />

      )}

    </div>
  )
}

export default CitizenDashboard