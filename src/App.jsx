import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  MapPin,
  Menu,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react"

import { useState } from "react"
import logo from "./assets/jharkhand-logo.jpg"

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom"

import Problems from "./pages/Problems"
import Leaderboard from "./pages/Leaderboard"
import HowItWorks from "./pages/HowItWorks"

import Login from "./pages/Login"
import Register from "./pages/Register"

import CitizenDashboard from "./pages/CitizenDashboard"
import StudentDashboard from "./pages/StudentDashboard"
import IndustryDashboard from "./pages/IndustryDashboard"
import AdminDashboard from "./pages/AdminDashboard"

import ReportProblem from "./pages/ReportProblem"

import MyProblems from "./pages/MyProblems"

import AdminProblemReview from "./pages/AdminProblemReview"

import StudentProblem from "./pages/StudentProblem"

import AdminSolutionReview from "./pages/AdminSolutionReview"

import StudentImplementation from "./pages/StudentImplementation"

import AdminImplementationReview from "./pages/AdminImplementationReview"

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const categories = [
    { name: "Infrastructure", icon: Building2 },
    { name: "Water", icon: Sparkles },
    { name: "Waste Management", icon: CheckCircle2 },
    { name: "Electricity", icon: Lightbulb },
    { name: "Environment", icon: Sparkles },
    { name: "Transportation", icon: MapPin },
    { name: "Healthcare", icon: ShieldCheck },
    { name: "Education", icon: GraduationCap },
  ]

  const problems = [
    {
      title: "Large pothole near college gate",
      district: "Ranchi",
      category: "Infrastructure",
      severity: "High",
      solutions: 8,
    },
    {
      title: "Water accumulation after rainfall",
      district: "Jamshedpur",
      category: "Water",
      severity: "Medium",
      solutions: 5,
    },
    {
      title: "Waste collection issue in residential area",
      district: "Dhanbad",
      category: "Waste Management",
      severity: "High",
      solutions: 11,
    },
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ================= NAVBAR ================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          {/* Logo */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >

            <img
              src={logo}
              alt="Jharkhand Government"
              className="h-12 w-12 object-contain"
            />

            <div>

              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Samadhan Jharkhand
              </h1>

              <p className="text-xs text-slate-500">
                Citizen Innovation Platform
              </p>

            </div>

          </Link>


          {/* Desktop Navigation */}

          <nav className="hidden items-center gap-7 md:flex">

            <Link
              to="/"
              className="text-sm font-medium text-slate-700 hover:text-green-700"
            >
              Home
            </Link>

            <Link
              to="/problems"
              className="text-sm font-medium text-slate-700 hover:text-green-700"
            >
              Problems
            </Link>

            <Link
              to="/how-it-works"
              className="text-sm font-medium text-slate-700 hover:text-green-700"
            >
              How It Works
            </Link>

            <Link
              to="/leaderboard"
              className="text-sm font-medium text-slate-700 hover:text-green-700"
            >
              Leaderboard
            </Link>

          </nav>


          {/* Desktop Auth */}

          <div className="hidden items-center gap-3 md:flex">

            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
            >
              Register
            </Link>

          </div>


          {/* Mobile Menu Button */}

          <button
            className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>

        </div>


        {/* Mobile Navigation */}

        {mobileMenuOpen && (

          <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden">

            <div className="flex flex-col gap-4">

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium"
              >
                Home
              </Link>

              <Link
                to="/problems"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium"
              >
                Problems
              </Link>

              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium"
              >
                How It Works
              </Link>

              <Link
                to="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium"
              >
                Leaderboard
              </Link>


              <div className="flex gap-3 pt-2">

                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center font-semibold"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg bg-green-700 px-4 py-2.5 text-center font-semibold text-white"
                >
                  Register
                </Link>

              </div>

            </div>

          </div>

        )}

      </header>


      {/* ================= HERO ================= */}

      <main>

        <section className="relative overflow-hidden bg-slate-50">

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">

            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-800">

                <ShieldCheck size={16} />

                Building a better Jharkhand together

              </div>


              <h2 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">

                Your Problem.

                <br />

                <span className="text-green-700">
                  Our Collective Solution.
                </span>

              </h2>


              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">

                Report problems around you and connect citizens, students,
                industries and government to create meaningful solutions
                for Jharkhand.

              </p>


              {/* Hero Buttons */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/citizen/report"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-800"
                >
                  Report a Problem
                  <ArrowRight size={18} />
                </Link>


                <Link
                  to="/problems"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  Explore Problems
                  <ChevronRight size={18} />
                </Link>

              </div>


              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">

                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-green-600"
                  />
                  Report local problems
                </span>


                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-green-600"
                  />
                  Student innovation
                </span>


                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-green-600"
                  />
                  Industry support
                </span>

              </div>

            </div>


            {/* Hero visual */}

            <div className="relative">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-100 pb-5">

                  <div>

                    <p className="text-sm font-medium text-slate-500">
                      Civic Impact
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      Working together
                    </p>

                  </div>


                  <div className="rounded-xl bg-green-50 p-3 text-green-700">
                    <Users size={25} />
                  </div>

                </div>


                <div className="mt-6 space-y-4">

                  <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">

                    <div className="rounded-lg bg-green-100 p-3 text-green-700">
                      <MessageSquare size={21} />
                    </div>

                    <div>

                      <p className="font-semibold">
                        Citizen reports
                      </p>

                      <p className="text-sm text-slate-500">
                        Real problems from communities
                      </p>

                    </div>

                  </div>


                  <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">

                    <div className="rounded-lg bg-amber-100 p-3 text-amber-700">
                      <GraduationCap size={21} />
                    </div>

                    <div>

                      <p className="font-semibold">
                        Students innovate
                      </p>

                      <p className="text-sm text-slate-500">
                        Ideas and practical solutions
                      </p>

                    </div>

                  </div>


                  <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">

                    <div className="rounded-lg bg-green-100 p-3 text-green-700">
                      <Building2 size={21} />
                    </div>

                    <div>

                      <p className="font-semibold">
                        Industry supports
                      </p>

                      <p className="text-sm text-slate-500">
                        Funding and mentorship
                      </p>

                    </div>

                  </div>


                  <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">

                    <div className="rounded-lg bg-purple-100 p-3 text-purple-700">
                      <ShieldCheck size={21} />
                    </div>

                    <div>

                      <p className="font-semibold">
                        Government verifies
                      </p>

                      <p className="text-sm text-slate-500">
                        Transparent implementation
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= STATS ================= */}

        <section className="border-y border-slate-200 bg-white">

          <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">

            {[
              ["12,842", "Problems Reported"],
              ["4,281", "Solutions Proposed"],
              ["2,450", "Students Participating"],
              ["9,455", "Problems Resolved"],
            ].map(([number, label]) => (

              <div
                key={label}
                className="border-b border-slate-200 px-5 py-8 text-center last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >

                <p className="text-3xl font-bold text-green-700">
                  {number}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {label}
                </p>

              </div>

            ))}

          </div>

        </section>


        {/* ================= HOW IT WORKS ================= */}

        <section
          id="how-it-works"
          className="bg-white px-5 py-20 lg:px-8"
        >

          <div className="mx-auto max-w-7xl">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-bold uppercase tracking-widest text-green-700">
                How it works
              </p>

              <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                From problem to solution
              </h3>

              <p className="mt-4 text-slate-600">
                Samadhan Jharkhand connects the people who identify problems
                with the people who can help solve them.
              </p>

            </div>


            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

              {[
                {
                  number: "01",
                  title: "Report",
                  text: "Citizens report problems with descriptions, photographs and locations.",
                  icon: MessageSquare,
                },
                {
                  number: "02",
                  title: "Innovate",
                  text: "College students discover problems and propose practical solutions.",
                  icon: Lightbulb,
                },
                {
                  number: "03",
                  title: "Support",
                  text: "Industries can provide funding, expertise and mentorship.",
                  icon: Building2,
                },
                {
                  number: "04",
                  title: "Resolve",
                  text: "Government monitors implementation and verifies completed solutions.",
                  icon: CheckCircle2,
                },
              ].map((item) => {

                const Icon = item.icon

                return (

                  <div
                    key={item.number}
                    className="relative rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                  >

                    <div className="flex items-center justify-between">

                      <div className="rounded-lg bg-green-50 p-3 text-green-700">
                        <Icon size={23} />
                      </div>

                      <span className="text-4xl font-bold text-slate-100">
                        {item.number}
                      </span>

                    </div>


                    <h4 className="mt-6 text-xl font-bold">
                      {item.title}
                    </h4>


                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>

                  </div>

                )

              })}

            </div>

          </div>

        </section>


        {/* ================= CATEGORIES ================= */}

        <section className="bg-slate-50 px-5 py-20 lg:px-8">

          <div className="mx-auto max-w-7xl">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>

                <p className="text-sm font-bold uppercase tracking-widest text-green-700">
                  Explore
                </p>

                <h3 className="mt-2 text-3xl font-bold">
                  Problems across Jharkhand
                </h3>

              </div>


              <Link
                to="/problems"
                className="flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-900"
              >
                View all categories
                <ArrowRight size={17} />
              </Link>

            </div>


            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">

              {categories.map((category) => {

                const Icon = category.icon

                return (

                  <Link
                    key={category.name}
                    to="/problems"
                    className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-green-300 hover:shadow-md"
                  >

                    <div className="rounded-lg bg-slate-100 p-3 text-slate-700 transition group-hover:bg-green-50 group-hover:text-green-700">

                      <Icon size={21} />

                    </div>


                    <span className="text-sm font-semibold">
                      {category.name}
                    </span>

                  </Link>

                )

              })}

            </div>

          </div>

        </section>


        {/* ================= FEATURED PROBLEMS ================= */}

        <section
          id="problems"
          className="bg-white px-5 py-20 lg:px-8"
        >

          <div className="mx-auto max-w-7xl">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>

                <p className="text-sm font-bold uppercase tracking-widest text-green-700">
                  Civic challenges
                </p>

                <h3 className="mt-2 text-3xl font-bold">
                  Featured problems
                </h3>

              </div>


              <Link
                to="/problems"
                className="flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-900"
              >
                Explore all problems
                <ArrowRight size={17} />
              </Link>

            </div>


            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {problems.map((problem) => (

                <article
                  key={problem.title}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >

                  <div className="flex h-44 items-center justify-center bg-slate-100">

                    <div className="text-center">

                      <MapPin
                        className="mx-auto text-slate-400"
                        size={32}
                      />

                      <p className="mt-2 text-sm text-slate-400">
                        Problem image
                      </p>

                    </div>

                  </div>


                  <div className="p-6">

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-xs font-semibold text-green-700">
                        {problem.category}
                      </span>

                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        {problem.severity}
                      </span>

                    </div>


                    <h4 className="mt-4 text-lg font-bold">
                      {problem.title}
                    </h4>


                    <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={15} />
                      {problem.district}, Jharkhand
                    </p>


                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                      <span className="text-sm text-slate-500">
                        {problem.solutions} solutions proposed
                      </span>


                      <Link
                        to="/problems"
                        className="text-sm font-bold text-green-700 hover:text-green-900"
                      >
                        View
                      </Link>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          </div>

        </section>


        {/* ================= STUDENT SECTION ================= */}

        <section className="bg-green-700 px-5 py-20 text-white lg:px-8">

          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">

            <div>

              <div className="mb-5 inline-flex rounded-lg bg-white/10 p-3">
                <GraduationCap size={28} />
              </div>


              <h3 className="text-3xl font-bold sm:text-4xl">
                Students can turn real problems into real solutions.
              </h3>


              <p className="mt-5 max-w-xl leading-7 text-green-100">
                College students can discover challenges around them,
                contribute ideas, collaborate with others and earn recognition
                for solutions that make a real-world impact.
              </p>


              <Link
                to="/student"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-green-700 hover:bg-green-50"
              >
                Start Solving Problems
                <ArrowRight size={18} />
              </Link>

            </div>


            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">

              <div className="grid grid-cols-2 gap-4">

                {[
                  ["1,240", "Your Points"],
                  ["#12", "Current Rank"],
                  ["14", "Solutions"],
                  ["6", "Problems Solved"],
                ].map(([number, label]) => (

                  <div
                    key={label}
                    className="rounded-xl bg-white/10 p-5"
                  >

                    <p className="text-2xl font-bold">
                      {number}
                    </p>

                    <p className="mt-1 text-sm text-green-100">
                      {label}
                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>


        {/* ================= INDUSTRY SECTION ================= */}

        <section className="bg-slate-50 px-5 py-20 lg:px-8">

          <div className="mx-auto max-w-7xl">

            <div className="grid items-center gap-10 lg:grid-cols-2">

              <div className="order-2 lg:order-1">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">

                    <div>

                      <p className="text-sm text-slate-500">
                        Industry support
                      </p>

                      <h4 className="mt-1 text-xl font-bold">
                        Projects seeking support
                      </h4>

                    </div>


                    <Building2 className="text-green-600" />

                  </div>


                  <div className="mt-5 space-y-4">

                    {[
                      ["Smart Waste Monitoring", "₹75,000"],
                      ["Water Leakage Detection", "₹50,000"],
                      ["Low-Cost Road Sensors", "₹90,000"],
                    ].map(([name, amount]) => (

                      <Link
                        key={name}
                        to="/industry"
                        className="flex items-center justify-between rounded-xl bg-slate-50 p-4 transition hover:bg-slate-100"
                      >

                        <div>

                          <p className="font-semibold">
                            {name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Student innovation project
                          </p>

                        </div>


                        <span className="font-bold text-green-700">
                          {amount}
                        </span>

                      </Link>

                    ))}

                  </div>

                </div>

              </div>


              <div className="order-1 lg:order-2">

                <p className="text-sm font-bold uppercase tracking-widest text-green-700">
                  For industries
                </p>


                <h3 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Support ideas that can create real impact.
                </h3>


                <p className="mt-5 leading-7 text-slate-600">
                  Industries can discover promising student solutions and
                  contribute through funding, technical expertise, resources
                  and mentorship.
                </p>


                <Link
                  to="/industry"
                  className="mt-7 inline-flex items-center gap-2 rounded-lg bg-green-700 px-6 py-3.5 font-semibold text-white hover:bg-green-800"
                >
                  Support Innovation
                  <ArrowRight size={18} />
                </Link>

              </div>

            </div>

          </div>

        </section>


        {/* ================= GOVERNMENT SECTION ================= */}

        <section className="bg-white px-5 py-20 lg:px-8">

          <div className="mx-auto max-w-5xl text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <ShieldCheck size={32} />
            </div>


            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-green-700">
              Government oversight
            </p>


            <h3 className="mt-3 text-3xl font-bold sm:text-4xl">
              Transparent problem solving for Jharkhand.
            </h3>


            <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
              Government administrators can verify reported problems, review
              proposed solutions, monitor implementation and measure the
              impact of civic participation.
            </p>


            <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">

              {[
                [
                  "Verify",
                  "Review and verify citizen-reported problems.",
                ],
                [
                  "Monitor",
                  "Track solutions and implementation progress.",
                ],
                [
                  "Measure",
                  "Understand impact through meaningful analytics.",
                ],
              ].map(([title, text]) => (

                <Link
                  key={title}
                  to="/login"
                  className="rounded-xl border border-slate-200 p-6 transition hover:border-green-300 hover:shadow-md"
                >

                  <h4 className="font-bold">
                    {title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {text}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-700">
                    Government Login
                    <ArrowRight size={15} />
                  </span>

                </Link>

              ))}

            </div>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="bg-slate-950 px-5 py-12 text-slate-300 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 md:grid-cols-4">


            {/* Footer Brand */}

            <div className="md:col-span-2">

              <Link
                to="/"
                className="flex items-center gap-3"
              >

                <img
                  src={logo}
                  alt="Jharkhand Government"
                  className="h-12 w-12 rounded-lg bg-white object-contain p-1"
                />


                <div>

                  <h4 className="font-bold text-white">
                    Samadhan Jharkhand
                  </h4>

                  <p className="text-xs text-slate-400">
                    Citizen Innovation Platform
                  </p>

                </div>

              </Link>


              <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
                A platform concept connecting citizens, students, industries
                and government to identify and solve real-world problems.
              </p>

            </div>


            {/* Quick Links */}

            <div>

              <h4 className="font-semibold text-white">
                Quick Links
              </h4>


              <div className="mt-4 space-y-3 text-sm">

                <Link
                  to="/"
                  className="block hover:text-white"
                >
                  Home
                </Link>

                <Link
                  to="/problems"
                  className="block hover:text-white"
                >
                  Problems
                </Link>

                <Link
                  to="/how-it-works"
                  className="block hover:text-white"
                >
                  How It Works
                </Link>

                <Link
                  to="/leaderboard"
                  className="block hover:text-white"
                >
                  Leaderboard
                </Link>

              </div>

            </div>


            {/* Participate */}

            <div>

              <h4 className="font-semibold text-white">
                Participate
              </h4>


              <div className="mt-4 space-y-3 text-sm">

                <Link
                  to="/register"
                  className="block hover:text-white"
                >
                  Citizens
                </Link>

                <Link
                  to="/register"
                  className="block hover:text-white"
                >
                  Students
                </Link>

                <Link
                  to="/register"
                  className="block hover:text-white"
                >
                  Industries
                </Link>

                <Link
                  to="/login"
                  className="block hover:text-white"
                >
                  Government
                </Link>

              </div>

            </div>

          </div>


          <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
            © 2026 Samadhan Jharkhand — Prototype Project
          </div>

        </div>

      </footer>

    </div>
  )
}


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Public Pages */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/problems"
          element={<Problems />}
        />

        <Route
          path="/how-it-works"
          element={<HowItWorks />}
        />

        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Dashboards */}

        <Route
          path="/citizen"
          element={<CitizenDashboard />}
        />

        <Route
          path="/student"
          element={<StudentDashboard />}
        />

        <Route
          path="/industry"
          element={<IndustryDashboard />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />


        {/* Citizen */}

        <Route
          path="/citizen/report"
          element={<ReportProblem />}
        />

        <Route
          path="/citizen/problems"
          element={<MyProblems />}
        />


        {/* Government */}

        <Route
          path="/admin/problem/:id"
          element={<AdminProblemReview />}
        />

        <Route
          path="/admin/solution/:id"
          element={<AdminSolutionReview />}
        />


        {/* Student */}

        <Route
          path="/student/problem/:id"
          element={<StudentProblem />}
        />

        <Route
          path="/student/implementation/:id"
          element={<StudentImplementation />}
        />

        <Route
          path="/admin/implementation/:id"
          element={<AdminImplementationReview />}
        />

      </Routes>

    </BrowserRouter>

  )
}


export default App