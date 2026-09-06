import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  Lightbulb,
  Send,
  Camera,
  Upload,
  X,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function StudentProblem() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [implementationTime, setImplementationTime] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  useEffect(() => {
    fetchProblem()
  }, [id])

  async function fetchProblem() {
    setLoading(true)

    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("id", id)
      .eq("status", "VERIFIED")
      .single()

    if (error) {
      console.error(error)
      setMessage("This problem could not be found or is no longer available.")
    } else {
      setProblem(data)
    }

    setLoading(false)
  }

  function handleImageChange(event) {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) return

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage("Please select a JPG, PNG or WEBP image.")
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (selectedFile.size > maxSize) {
      setMessage("Image size must be less than 5 MB.")
      return
    }

    setMessage("")

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setImage(selectedFile)
    setImagePreview(URL.createObjectURL(selectedFile))
  }

  function removeImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setImage(null)
    setImagePreview("")
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage("")

    if (!title.trim() || !description.trim()) {
      setMessage("Please enter a solution title and description.")
      return
    }

    setSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage("Please log in as a student before submitting a solution.")
        return
      }

      let imagePath = null

      // Upload solution image if the student selected one.
      if (image) {
        const fileExtension = image.name.split(".").pop()?.toLowerCase()
        const fileName = `${crypto.randomUUID()}.${fileExtension}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("solution-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error(uploadError)
          setMessage("Solution image upload failed. Please try again.")
          return
        }

        imagePath = filePath
      }

      const { error } = await supabase
        .from("solutions")
        .insert({
          problem_id: id,
          student_id: user.id,
          title: title.trim(),
          description: description.trim(),
          estimated_cost: estimatedCost
            ? Number(estimatedCost)
            : null,
          implementation_time: implementationTime.trim() || null,
          image_path: imagePath,
        })

      if (error) {
        console.error(error)
        setMessage(error.message)
      } else {
        setMessage("Your solution has been submitted successfully.")

        setTitle("")
        setDescription("")
        setEstimatedCost("")
        setImplementationTime("")
        removeImage()

        setTimeout(() => {
          navigate("/student")
        }, 1200)
      }
    } catch (error) {
      console.error(error)
      setMessage("Something went wrong while submitting your solution.")
    } finally {
      setSubmitting(false)
    }
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
          to="/student"
          className="inline-flex items-center gap-2 text-green-600"
        >
          <ArrowLeft size={18} />
          Back to Student Dashboard
        </Link>

        <div className="max-w-3xl mx-auto mt-8 bg-white border border-red-200 rounded-xl p-6">
          <p className="text-red-600">
            {message || "Problem not found."}
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

          <div className="mt-5">

            <div className="flex items-center gap-2">

              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                Government Verified
              </span>

              <span className="text-xs text-slate-500">
                {problem.category}
              </span>

            </div>

            <h1 className="text-3xl font-bold text-slate-900 mt-3">
              {problem.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-500 mt-3">
              <MapPin size={16} />
              {problem.district}
              {problem.address && ` • ${problem.address}`}
            </div>

          </div>

        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">

        <div className="grid lg:grid-cols-5 gap-6">

          {/* Problem Details */}
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
                  Problem Details
                </h2>
              </div>

              <p className="text-slate-600 leading-7 mt-5 whitespace-pre-wrap">
                {problem.description}
              </p>

              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">

                <div>
                  <p className="text-xs text-slate-500">
                    Category
                  </p>

                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {problem.category}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Severity
                  </p>

                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {problem.severity}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    District
                  </p>

                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {problem.district}
                  </p>
                </div>

              </div>

            </div>

          </section>

          {/* Solution Form */}
          <section className="lg:col-span-3">

            <div className="bg-white border border-slate-200 rounded-xl">

              <div className="p-6 border-b border-slate-200">

                <h2 className="text-xl font-semibold text-slate-900">
                  Propose Your Solution
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Explain how you would solve this civic problem.
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-5"
              >

                {message && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 text-sm">
                    {message}
                  </div>
                )}

                {/* Solution Title */}
                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Solution Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="e.g. Community Waste Collection System"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-green-500"
                  />

                </div>

                {/* Description */}
                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Solution Description
                  </label>

                  <textarea
                    rows="7"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Describe your solution, how it works, resources required, and how it will solve the problem..."
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-green-500 resize-none"
                  />

                </div>

                {/* Solution Photo */}
                <div className="border-t border-slate-200 pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Camera size={20} className="text-green-700" />

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Solution Photo
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        Optional. Add a prototype, sketch, design or reference image.
                      </p>
                    </div>
                  </div>

                  {!imagePreview ? (
                    <label className="block border-2 border-dashed border-slate-300 rounded-xl p-7 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/30 transition">
                      <Upload
                        size={28}
                        className="mx-auto text-slate-400"
                      />

                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Choose a solution image
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        JPG, PNG or WEBP • Maximum 5 MB
                      </p>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <img
                        src={imagePreview}
                        alt="Selected solution"
                        className="w-full max-h-80 object-contain"
                      />

                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-red-600 hover:bg-red-50"
                        title="Remove photo"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Cost + Time */}
                <div className="grid sm:grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Estimated Cost (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={estimatedCost}
                      onChange={(event) =>
                        setEstimatedCost(event.target.value)
                      }
                      placeholder="Optional"
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-green-500"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Implementation Time
                    </label>

                    <input
                      type="text"
                      value={implementationTime}
                      onChange={(event) =>
                        setImplementationTime(event.target.value)
                      }
                      placeholder="e.g. 2 months"
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-green-500"
                    />

                  </div>

                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  <Send size={18} />

                  {submitting
                    ? "Submitting..."
                    : "Submit Solution"}
                </button>

              </form>

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}

export default StudentProblem