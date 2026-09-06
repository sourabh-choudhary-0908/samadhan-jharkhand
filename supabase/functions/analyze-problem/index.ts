import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
  // Browser CORS preflight
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
      return new Response(
        JSON.stringify({
          success: false,
          error: "GEMINI_API_KEY is not configured",
        }),
        {
          status: 500,
          headers: responseHeaders,
        },
      );
    }

    // Read request body safely
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
      title,
      description,
      district,
      address,
      imageBase64,
      imageMimeType,
    } = body;

    if (!title || !description) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Title and description are required",
        }),
        {
          status: 400,
          headers: responseHeaders,
        },
      );
    }

    const prompt = `
You are the AI analysis system for "Samadhan Jharkhand",
a civic problem-solving platform.

Analyze the following citizen-reported civic problem.

PROBLEM TITLE:
${title}

PROBLEM DESCRIPTION:
${description}

DISTRICT:
${district || "Not provided"}

ADDRESS:
${address || "Not provided"}

Classify the problem using exactly one category:

INFRASTRUCTURE
WATER
WASTE
ELECTRICITY
ENVIRONMENT
TRANSPORT
HEALTHCARE
EDUCATION
PUBLIC_SAFETY
OTHER

Classify severity using exactly one:

LOW
MEDIUM
HIGH
CRITICAL

Severity guidelines:

LOW:
Minor inconvenience with limited impact.

MEDIUM:
Noticeable local problem affecting several people or normal daily activity.

HIGH:
Serious public impact, major service/infrastructure failure,
or significant safety concern.

CRITICAL:
Immediate threat to life, major public safety emergency,
or extremely severe civic failure.

If an image is provided, analyze it together with the written report.

Do not invent facts.

Return ONLY JSON in this exact structure:

{
  "category": "INFRASTRUCTURE",
  "subcategory": "short specific subcategory",
  "severity": "MEDIUM",
  "summary": "short clear summary of the reported problem",
  "confidence": 0.95
}

The category must be one of the allowed categories.
The severity must be one of the allowed severity values.
Confidence must be a number between 0 and 1.
`;

    const input: any[] = [];

    // Add image when provided
    if (imageBase64 && imageMimeType) {
      input.push({
        type: "image",
        data: imageBase64,
        mime_type: imageMimeType,
      });
    }

    // Add text prompt
    input.push({
      type: "text",
      text: prompt,
    });

    const responseSchema = {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: [
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
          ],
        },
        subcategory: {
          type: "string",
        },
        severity: {
          type: "string",
          enum: [
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL",
          ],
        },
        summary: {
          type: "string",
        },
        confidence: {
          type: "number",
        },
      },
      required: [
        "category",
        "subcategory",
        "severity",
        "summary",
        "confidence",
      ],
    };

    console.log("Calling Gemini...");

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
          input,
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

    // IMPORTANT:
    // Read the response as text first.
    // This prevents "Unexpected end of JSON input".
    const geminiRawResponse = await geminiResponse.text();

    console.log(
      "Gemini HTTP status:",
      geminiResponse.status,
      geminiResponse.statusText,
    );

    console.log(
      "Gemini response body:",
      geminiRawResponse,
    );

    // Gemini returned no body
    if (!geminiRawResponse) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Gemini returned an empty response",
          geminiStatus: geminiResponse.status,
        }),
        {
          status: 502,
          headers: responseHeaders,
        },
      );
    }

    // Try to parse Gemini response
    let geminiData;

    try {
      geminiData = JSON.parse(geminiRawResponse);
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Gemini returned a non-JSON response",
          geminiStatus: geminiResponse.status,
          response: geminiRawResponse,
        }),
        {
          status: 502,
          headers: responseHeaders,
        },
      );
    }

    // Gemini returned an HTTP error
    if (!geminiResponse.ok) {
      console.error(
        "Gemini API error:",
        JSON.stringify(geminiData),
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Gemini API request failed",
          geminiStatus: geminiResponse.status,
          details: geminiData,
        }),
        {
          status: 502,
          headers: responseHeaders,
        },
      );
    }

    // Find model output
    const modelOutputStep = geminiData?.steps?.find(
      (step: any) => step.type === "model_output",
    );

    const outputText = modelOutputStep?.content?.find(
      (item: any) => item.type === "text",
    )?.text;

    if (!outputText) {
      console.error(
        "No model output found:",
        JSON.stringify(geminiData),
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Gemini returned no model output",
          geminiResponse: geminiData,
        }),
        {
          status: 502,
          headers: responseHeaders,
        },
      );
    }

    let analysis;

    try {
      analysis = JSON.parse(outputText);
    } catch {
      console.error(
        "Model output was not valid JSON:",
        outputText,
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "AI returned invalid analysis JSON",
          rawOutput: outputText,
        }),
        {
          status: 502,
          headers: responseHeaders,
        },
      );
    }

    console.log(
      "AI analysis completed:",
      JSON.stringify(analysis),
    );

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
      }),
      {
        status: 200,
        headers: responseHeaders,
      },
    );
  } catch (error) {
    console.error("Function error:", error);

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