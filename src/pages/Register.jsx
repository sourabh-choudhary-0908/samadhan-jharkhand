import { Link } from "react-router-dom"
import {
  ArrowLeft,
  User,
  GraduationCap,
  Building2,
  Landmark,
} from "lucide-react"

import { useState } from "react"
import { supabase } from "../lib/supabaseClient"

function Register() {
  const [selectedRole, setSelectedRole] = useState("citizen")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const roles = [
    {
      id: "citizen",
      title: "Citizen",
      description: "Report and track civic problems",
      icon: User,
    },
    {
      id: "student",
      title: "Student",
      description: "Propose solutions and earn points",
      icon: GraduationCap,
    },
    {
      id: "industrialist",
      title: "Industrialist",
      description: "Support solutions and provide mentorship",
      icon: Building2,
    },
    {
      id: "government",
      title: "Government",
      description: "Verify and manage civic problems",
      icon: Landmark,
    },
  ]
  const handleRegister = async (e) => {
  e.preventDefault()

  setMessage("")

  if (!fullName || !email || !password || !confirmPassword) {
    setMessage("Please fill in all required fields.")
    return
  }

  if (password !== confirmPassword) {
    setMessage("Passwords do not match.")
    return
  }

  if (password.length < 6) {
    setMessage("Password must be at least 6 characters.")
    return
  }

  setLoading(true)

  const role = selectedRole.toUpperCase()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        role: role,
      },
    },
  })

  if (error) {
    setMessage(error.message)
    setLoading(false)
    return
  }

  if (!data.user) {
    setMessage("Registration could not be completed.")
    setLoading(false)
    return
  }


  setMessage(
    "Account created successfully! Please check your email to verify your account."
  )

  setLoading(false)
  }
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-green-700 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Create Your Account
            </h1>

            <p className="mt-2 text-slate-600">
              Join Samadhan Jharkhand and become part of the solution
            </p>
          </div>

          {/* Role Selection */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              I want to join as
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {roles.map((role) => {
                const Icon = role.icon

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`text-left rounded-xl border p-4 transition ${
                      selectedRole === role.id
                      ? "border-green-600 bg-green-50 ring-2 ring-green-100"
                      : "border-slate-200 hover:border-green-500 hover:bg-green-50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <Icon className="text-green-700" size={22} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {role.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <form 
            onSubmit={handleRegister}
            className="mt-8 space-y-5"
          >

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
              {message && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                {message}
                </div>
              )}
            </div>

            {/* Register */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <div className="mt-7 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-green-700 hover:text-green-800"
            >
              Login
            </Link>
          </div>

        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Samadhan Jharkhand • Civic Innovation Platform
        </p>

      </div>
    </div>
  )
}

export default Register