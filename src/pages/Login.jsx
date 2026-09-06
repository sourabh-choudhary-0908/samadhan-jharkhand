import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Lock, Mail } from "lucide-react"
import { useState } from "react"
import { supabase } from "../lib/supabaseClient"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const navigate = useNavigate()
  const handleLogin = async (e) => {
    
    e.preventDefault()

    setMessage("")

    if (!email || !password) {
      setMessage("Please enter your email and password.")
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      setMessage("Login successful, but your profile could not be loaded.")
      setLoading(false)
      return
    }

    setLoading(false)

    if (profile.role === "CITIZEN") {
      navigate("/citizen")
    } 
    else if (profile.role === "STUDENT") {
     navigate("/student")
    } 
    else if (profile.role === "INDUSTRIALIST") {
     navigate("/industry")
    } 
    else if (profile.role === "GOVERNMENT") {
     navigate("/admin")
    } 
    else {
      navigate("/")
    }
  }
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-green-700 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
              <Lock className="text-green-700" size={26} />
            </div>

            <h1 className="mt-5 text-3xl font-bold text-slate-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-slate-600">
              Login to your Samadhan Jharkhand account
            </p>
          </div>

          {/* Form */}
          <form 
            onSubmit={handleLogin}
            className="mt-8 space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-green-700 hover:text-green-800"
              >
                Forgot Password?
              </button>
            </div>
            {message && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {message}
                </div>
              )
            }
            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 transition"
            >
              {loading ? "Logging in..." : "Login"}
              
            </button>
          </form>

          {/* Register */}
          <div className="mt-7 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-green-700 hover:text-green-800"
            >
              Create Account
            </Link>
          </div>

        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Samadhan Jharkhand • Civic Innovation Platform
        </p>

      </div>
    </div>
  )
}

export default Login