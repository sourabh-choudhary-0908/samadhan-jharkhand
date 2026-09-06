import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const responseHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Only POST requests are allowed",
        }),
        {
          status: 405,
          headers: responseHeaders,
        },
      );
    }

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // --------------------------------------------------
    // Create privileged Supabase client
    // --------------------------------------------------

    const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");

    if (!secretKeysRaw) {
      throw new Error("SUPABASE_SECRET_KEYS is not available");
    }

    const secretKeys = JSON.parse(secretKeysRaw);
    const secretKey = secretKeys["default"];

    if (!secretKey) {
      throw new Error("Default Supabase secret key is not available");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      secretKey,
    );

    // --------------------------------------------------
    // Read request
    // --------------------------------------------------

    const rawBody = await req.text();

    if (!rawBody) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Request body is empty",
        }),
        {
          status: 400,
          headers: responseHeaders,
        },
      );
    }

    let body;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Request body is not valid JSON",
        }),
        {
          status: 400,
          headers: responseHeaders,
        },
      );
    }

    const {
      problemId,
      title,
      description,
      district,
      category,
    } = body;

    if (!problemId || !title || !description || !district) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "problemId, title, description and district are required",
        }),
        {
          status: 400,
          headers: responseHeaders,
        },
      );
    }

    // --------------------------------------------------
    // Find existing candidate problems
    // --------------------------------------------------

    const { data: candidates, error: candidatesError } =
      await supabaseAdmin
        .from("problems")
        .select(
          "id, title, description, category, district, address, status, created_at",
        )
        .eq("district", district)
        .neq("id", problemId)
        .not("status", "in", '("REJECTED","DUPLICATE")')
        .order("created_at", { ascending: false })
        .limit(30);

    if (candidatesError) {
      console.error(
        "Candidate query error:",
        candidatesError,
      );

      throw candidatesError;
    }

    // No existing problems to compare with
    if (!candidates || candidates.length === 0) {
      const emptyCandidates: any[] = [];

      await supabaseAdmin
        .from("problems")
        .update({
          ai_duplicate_candidates: emptyCandidates,
          ai_duplicate_checked_at: new Date().toISOString(),
        })
        .eq("id", problemId);

      return new Response(
        JSON.stringify({
          success: true,
          duplicate_candidates: [],
          message: "No existing problems found for comparison.",
        }),
        {
          status: 200,
          headers: responseHeaders,
        },
      );
    }

    // --------------------------------------------------
    // Prepare candidate information for Gemini
    // --------------------------------------------------

    const candidateText = candidates
      .map((candidate, index) => {
        return `
CANDIDATE ${index + 1}

ID:
${candidate.id}

TITLE:
${candidate.title}

DESCRIPTION:
${candidate.description}

CATEGORY:
${candidate.category || "Not provided"}

DISTRICT:
${candidate.district}

ADDRESS:
${candidate.address || "Not provided"}

STATUS:
${candidate.status}
`;
      })
      .join("\n-----------------------------\n");

    // --------------------------------------------------
    // Gemini prompt
    // --------------------------------------------------

    const prompt = `
You are the duplicate-detection AI for "Samadhan Jharkhand",
a civic problem-solving platform.

Determine whether the NEW citizen report is likely to describe
the same real-world civic problem as any of the EXISTING reports.

NEW REPORT

ID:
${problemId}

TITLE:
${title}

DESCRIPTION:
${description}

CATEGORY:
${category || "Not provided"}

DISTRICT:
${district}

EXISTING REPORTS
${candidateText}

IMPORTANT RULES:

1. Only compare reports that are actually provided above.

2. Do not invent or modify problem IDs.

3. A duplicate means the reports likely describe the same
   real-world problem/location, not merely the same category.

4. Similar wording alone is not enough.

5. Consider:
   - location
   - landmark/address
   - type of problem
   - description
   - category
   - whether both reports could refer to the same physical issue

6. If there is not enough evidence, do not mark it as a duplicate.

7. Return only strong or reasonably strong duplicate candidates.

8. The government will make the final duplicate decision.
   AI is only providing recommendations.

For each likely duplicate, provide:
- the existing problem ID
- similarity from 0 to 1
- a short reason

Return ONLY valid JSON.
`;

    const responseSchema = {
      type: "object",
      properties: {
        duplicate_candidates: {
          type: "array",
          items: {
            type: "object",
            properties: {
              problem_id: {
                type: "string",
              },
              similarity: {
                type: "number",
              },
              reason: {
                type: "string",
              },
            },
            required: [
              "problem_id",
              "similarity",
              "reason",
            ],
          },
        },
      },
      required: ["duplicate_candidates"],
    };

    // --------------------------------------------------
    // Call Gemini
    // --------------------------------------------------

    console.log(
      `Checking duplicates for problem ${problemId}`,
    );

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          model: "gemini-3.6-flash",
          input: [
            {
              type: "text",
              text: prompt,
            },
          ],
          store: false,
          response_format: [
            {
              type: "text",
              mime_type: "application/json",
              schema: responseSchema,
            },
          ],
        }),
      },
    );

    const geminiRawResponse =
      await geminiResponse.text();

    console.log(
      "Gemini duplicate HTTP status:",
      geminiResponse.status,
      geminiResponse.statusText,
    );

    if (!geminiRawResponse) {
      throw new Error(
        "Gemini returned an empty response",
      );
    }

    let geminiData;

    try {
      geminiData = JSON.parse(geminiRawResponse);
    } catch {
      console.error(
        "Invalid Gemini response:",
        geminiRawResponse,
      );

      throw new Error(
        "Gemini returned a non-JSON response",
      );
    }

    if (!geminiResponse.ok) {
      console.error(
        "Gemini API error:",
        JSON.stringify(geminiData),
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Gemini API request failed",
          details: geminiData,
        }),
        {
          status: 502,
          headers: responseHeaders,
        },
      );
    }

    // --------------------------------------------------
    // Extract model output
    // --------------------------------------------------

    const modelOutputStep =
      geminiData?.steps?.find(
        (step: any) =>
          step.type === "model_output",
      );

    const outputText =
      modelOutputStep?.content?.find(
        (item: any) =>
          item.type === "text",
      )?.text;

    if (!outputText) {
      console.error(
        "Gemini response:",
        JSON.stringify(geminiData),
      );

      throw new Error(
        "Gemini returned no model output",
      );
    }

    let duplicateResult;

    try {
      duplicateResult = JSON.parse(outputText);
    } catch {
      console.error(
        "Invalid duplicate JSON:",
        outputText,
      );

      throw new Error(
        "Gemini returned invalid duplicate analysis",
      );
    }

    let duplicateCandidates =
      Array.isArray(
        duplicateResult?.duplicate_candidates,
      )
        ? duplicateResult.duplicate_candidates
        : [];

    // --------------------------------------------------
    // Validate returned IDs
    // --------------------------------------------------

    const validCandidateIds = new Set(
      candidates.map(
        (candidate) => candidate.id,
      ),
    );

    duplicateCandidates =
      duplicateCandidates.filter(
        (candidate: any) =>
          validCandidateIds.has(
            candidate.problem_id,
          ),
      );

    // Keep only reasonably strong matches
    duplicateCandidates =
      duplicateCandidates.filter(
        (candidate: any) =>
          Number(candidate.similarity) >= 0.7,
      );

    // Sort strongest matches first
    duplicateCandidates.sort(
      (a: any, b: any) =>
        Number(b.similarity) -
        Number(a.similarity),
    );

    // Keep maximum five candidates
    duplicateCandidates =
      duplicateCandidates.slice(0, 5);

    // --------------------------------------------------
    // Save duplicate results
    // --------------------------------------------------

    const { error: updateError } =
      await supabaseAdmin
        .from("problems")
        .update({
          ai_duplicate_candidates:
            duplicateCandidates,
          ai_duplicate_checked_at:
            new Date().toISOString(),
        })
        .eq("id", problemId);

    if (updateError) {
      console.error(
        "Duplicate result database error:",
        updateError,
      );

      throw updateError;
    }

    console.log(
      "Duplicate analysis completed:",
      JSON.stringify(duplicateCandidates),
    );

    return new Response(
      JSON.stringify({
        success: true,
        duplicate_candidates:
          duplicateCandidates,
      }),
      {
        status: 200,
        headers: responseHeaders,
      },
    );
  } catch (error) {
    console.error(
      "Duplicate function error:",
      error,
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      }),
      {
        status: 500,
        headers: responseHeaders,
      },
    );
  }
});