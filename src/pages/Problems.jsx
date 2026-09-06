import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  MapPin,
  ArrowRight,
  AlertTriangle,
  Search,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function Problems() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("ALL")

  useEffect(() => {
    fetchProblems()
  }, [])

  async function fetchProblems() {
    setLoading(true)

    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("status", "VERIFIED")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setProblems(data || [])
    }

    setLoading(false)
  }

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(search.toLowerCase()) ||
      problem.description.toLowerCase().includes(search.toLowerCase()) ||
      problem.district.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === "ALL" || problem.category === category

    return matchesSearch && matchesCategory
  })

  const categories = [
    "ALL",
    "INFRASTRUCTURE",
    "WATER",
    "WASTE",
    "ELECTRICITY",
    "ENVIRONMENT",
    "TRANSPORT",
    "HEALTHCARE",
    "EDUCATION",
    "PUBLIC_SAFETY",
    "OTHER",
  ]

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link to="/" className="text-xl font-bold text-slate-900">
            Samadhan <span className="text-green-600">Jharkhand</span>
          </Link>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-slate-600 hover:text-green-600">
              Home
            </Link>

            <Link
              to="/problems"
              className="text-green-600 font-medium"
            >
              Problems
            </Link>

            <Link
              to="/how-it-works"
              className="text-slate-600 hover:text-green-600"
            >
              How It Works
            </Link>

            <Link
              to="/leaderboard"
              className="text-slate-600 hover:text-green-600"
            >
              Leaderboard
            </Link>
          </div>

        </div>
      </nav>

      {/* Header */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">

          <p className="text-green-400 font-medium text-sm">
            Verified Civic Problems
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Problems That Need Solutions
          </h1>

          <p className="text-slate-300 mt-3 max-w-2xl">
            Explore civic problems verified by the government and
            discover opportunities to contribute solutions.
          </p>

        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8">

          <div className="flex flex-col md:flex-row gap-4">

            {/* Search */}
            <div className="relative flex-1">

              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-green-500"
              />

            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-2.5 bg-white outline-none focus:border-green-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL"
                    ? "All Categories"
                    : item.replaceAll("_", " ")}
                </option>
              ))}
            </select>

          </div>

        </div>

        {/* Problems */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">
            Loading verified problems...
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">

            <AlertTriangle
              size={42}
              className="mx-auto text-slate-300"
            />

            <h2 className="text-lg font-semibold text-slate-800 mt-4">
              No verified problems found
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Try changing your search or category filter.
            </p>

          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="bg-green-100 p-2 rounded-lg">
                    <AlertTriangle
                      size={20}
                      className="text-green-700"
                    />
                  </div>

                  <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    Verified
                  </span>

                </div>

                <h2 className="font-semibold text-lg text-slate-900 mt-4">
                  {problem.title}
                </h2>

                <p className="text-sm text-slate-500 mt-2 line-clamp-3">
                  {problem.description}
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-500">

                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    {problem.district}
                  </div>

                  <div>
                    Category:{" "}
                    <span className="font-medium text-slate-700">
                      {problem.category}
                    </span>
                  </div>

                  <div>
                    Severity:{" "}
                    <span className="font-medium text-slate-700">
                      {problem.severity}
                    </span>
                  </div>

                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">

                  <button
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700"
                  >
                    View Problem
                    <ArrowRight size={17} />
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>

    </div>
  )
}

export default Problems