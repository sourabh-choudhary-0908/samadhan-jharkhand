import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  Camera,
  X,
  AlertTriangle,
  Upload,
  Sparkles,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function ReportProblem() {
  const navigate = useNavigate()

  const categories = [
    { label: "Infrastructure", value: "INFRASTRUCTURE" },
    { label: "Water", value: "WATER" },
    { label: "Waste", value: "WASTE" },
    { label: "Electricity", value: "ELECTRICITY" },
    { label: "Environment", value: "ENVIRONMENT" },
    { label: "Transport", value: "TRANSPORT" },
    { label: "Healthcare", value: "HEALTHCARE" },
    { label: "Education", value: "EDUCATION" },
    { label: "Public Safety", value: "PUBLIC_SAFETY" },
    { label: "Other", value: "OTHER" },
  ]

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [district, setDistrict] = useState("")
  const [address, setAddress] = useState("")

  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

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
    setImage(selectedFile)

    const previewUrl = URL.createObjectURL(selectedFile)
    setImagePreview(previewUrl)
  }

  function removeImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setImage(null)
    setImagePreview("")
  }

  // Convert image to base64 for AI analysis
  async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        const result = reader.result

        if (typeof result !== "string") {
          reject(new Error("Could not read image"))
          return
        }

        // Remove "data:image/jpeg;base64," part
        const base64 = result.split(",")[1]

        resolve(base64)
      }

      reader.onerror = () => {
        reject(new Error("Could not convert image"))
      }

      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage("")
    setLoading(true)

    let imagePath = null
    let problemId = null

    try {
      // Get currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        setMessage("You must be logged in to report a problem.")
        return
      }

      // Basic validation
      if (!title || !description || !category || !district) {
        setMessage("Please fill in all required fields.")
        return
      }

      // ---------------------------------------
      // 1. Upload problem image
      // ---------------------------------------

      if (image) {
        const fileExtension = image.name
          .split(".")
          .pop()
          ?.toLowerCase()

        const fileName = `${crypto.randomUUID()}.${fileExtension}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("problem-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          throw uploadError
        }

        imagePath = filePath
      }

      // ---------------------------------------
      // 2. Save problem in database
      // ---------------------------------------

      const { data: problemData, error: problemError } =
        await supabase
          .from("problems")
          .insert({
            citizen_id: user.id,
            title: title,
            description: description,
            category: category,
            district: district,
            address: address,
            image_path: imagePath,
            ai_analysis_status: "PROCESSING",
          })
          .select("id")
          .single()

      if (problemError) {
        // Remove image if database insertion fails
        if (imagePath) {
          await supabase.storage
            .from("problem-images")
            .remove([imagePath])
        }

        throw problemError
      }

      problemId = problemData.id

      // ---------------------------------------
      // 3. Prepare image for AI
      // ---------------------------------------

      let imageBase64 = null

      if (image) {
        imageBase64 = await fileToBase64(image)
      }

      // ---------------------------------------
      // 4. Send problem to AI
      // ---------------------------------------

      setMessage("Problem saved. AI is analyzing your report...")

      const { data: aiData, error: aiError } =
        await supabase.functions.invoke("analyze-problem", {
          body: {
            title,
            description,
            district,
            address,
            imageBase64,
            imageMimeType: image?.type || null,
          },
        })

      // ---------------------------------------
      // 5. Handle AI failure
      // ---------------------------------------

      if (aiError || !aiData?.success) {
        console.error("AI analysis error:", aiError || aiData)

        await supabase
          .from("problems")
          .update({
            ai_analysis_status: "FAILED",
          })
          .eq("id", problemId)

        setMessage(
          "Problem submitted successfully, but AI analysis could not be completed. Government review can continue."
        )

        setTimeout(() => {
          navigate("/citizen")
        }, 1800)

        return
      }

      const analysis = aiData.analysis

      // ---------------------------------------
      // 6. Save AI analysis
      // ---------------------------------------

      const { error: aiUpdateError } = await supabase
        .from("problems")
        .update({
          category: analysis.category || category,
          ai_category: analysis.category || null,
          ai_subcategory: analysis.subcategory || null,
          ai_severity: analysis.severity || null,
          ai_summary: analysis.summary || null,
          ai_confidence:
            typeof analysis.confidence === "number"
              ? analysis.confidence
              : null,
          ai_analysis_status: "COMPLETED",
          ai_analyzed_at: new Date().toISOString(),
          status: "AI_ANALYZED",
        })
        .eq("id", problemId)

      if (aiUpdateError) {
        console.error("AI database update error:", aiUpdateError)

        await supabase
          .from("problems")
          .update({
            ai_analysis_status: "FAILED",
          })
          .eq("id", problemId)

        setMessage(
          "Problem submitted, but the AI result could not be saved. Government review can continue."
        )

        setTimeout(() => {
          navigate("/citizen")
        }, 1800)

        return
      }

      // ---------------------------------------
      // 7. Check for possible duplicate problems
      // ---------------------------------------

      setMessage(
        "AI analysis completed. Checking for possible duplicate reports..."
      )

      const { data: duplicateData, error: duplicateError } =
        await supabase.functions.invoke("find-duplicates", {
          body: {
            problemId,
            title,
            description,
            district,
            category: analysis.category || category,
          },
        })

      if (duplicateError || !duplicateData?.success) {
        console.warn(
          "Duplicate detection could not be completed:",
          duplicateError || duplicateData
        )

        // Duplicate detection is advisory. A failure here should not
        // prevent the citizen's successfully analyzed report from being submitted.
        setMessage(
          "Problem reported successfully! AI analysis completed. Duplicate checking could not be completed, but government review can continue."
        )
      } else {
        const duplicateCount =
          duplicateData.duplicate_candidates?.length || 0

        if (duplicateCount > 0) {
          setMessage(
            `Problem reported successfully! AI found ${duplicateCount} possible duplicate report${duplicateCount > 1 ? "s" : ""}. Government review is required.`
          )
        } else {
          setMessage(
            "Problem reported successfully! AI analysis completed and no likely duplicates were found."
          )
        }
      }

      setTimeout(() => {
        navigate("/citizen")
      }, 2200)
    } catch (error) {
      console.error("Problem submission error:", error)

      // If a problem was not created, clean up uploaded image
      if (imagePath && !problemId) {
        await supabase.storage
          .from("problem-images")
          .remove([imagePath])
      }

      setMessage(
        error.message || "Something went wrong while submitting the problem."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-5">
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
      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            Citizen Report
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Report a Problem
          </h1>

          <p className="mt-2 text-slate-600">
            Tell us about a problem in your community. Your report can help
            students, industries and government work toward a solution.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Problem Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Large pothole near college gate"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Give your problem a short and clear title.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Describe the Problem *
              </label>

              <textarea
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is happening, where it is happening and how it affects people..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none resize-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Please provide as much useful information as possible.
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Problem Category *
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="">
                  Select a category
                </option>

                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-xs text-slate-500">
                AI will analyze the report and may update the category.
              </p>
            </div>

            {/* Location */}
            <div className="border-t border-slate-200 pt-7">

              <div className="flex items-center gap-2 mb-5">
                <MapPin className="text-green-700" size={20} />

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Location
                  </h2>

                  <p className="text-xs text-slate-500">
                    Where is this problem located?
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    District *
                  </label>

                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Example: Ranchi"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address / Landmark
                  </label>

                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Example: Near Main Gate"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

              </div>
            </div>

            {/* Photo */}
            <div className="border-t border-slate-200 pt-7">

              <div className="flex items-center gap-2 mb-4">
                <Camera className="text-green-700" size={20} />

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Problem Photo
                  </h2>

                  <p className="text-xs text-slate-500">
                    Add a photo to help government and AI understand the problem.
                  </p>
                </div>
              </div>

              {!imagePreview ? (
                <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/30 transition">

                  <Upload
                    size={30}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Choose a photo
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
                    alt="Selected problem"
                    className="w-full max-h-96 object-contain"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-red-600 hover:bg-red-50"
                    title="Remove photo"
                  >
                    <X size={18} />
                  </button>

                  <div className="p-3 bg-white border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {image?.name}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Photo selected successfully
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* AI Notice */}
            <div className="flex gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
              <Sparkles
                size={20}
                className="text-green-700 shrink-0 mt-0.5"
              />

              <div>
                <p className="text-sm font-semibold text-green-900">
                  AI-assisted analysis
                </p>

                <p className="text-sm text-green-800 mt-1">
                  After submission, AI will analyze your description and
                  photo to help classify the problem and estimate its severity.
                  Government officials will make the final decision.
                </p>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">
                  {message}
                </p>
              </div>
            )}

            {/* Notice */}
            <div className="flex gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
              <AlertTriangle
                size={20}
                className="text-yellow-700 shrink-0 mt-0.5"
              />

              <p className="text-sm text-yellow-800">
                Please provide accurate information. Reports may be reviewed
                by the appropriate government department.
              </p>
            </div>

            {/* Submit */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">

              <Link
                to="/citizen"
                className="px-5 py-3 rounded-xl border border-slate-300 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60"
              >
                {loading ? "Analyzing..." : "Submit Problem"}
              </button>

            </div>

          </form>
        </div>
      </main>
    </div>
  )
}

export default ReportProblem