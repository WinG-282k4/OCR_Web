import { NextRequest, NextResponse } from "next/server";
import { ComponentType, OCRResult } from "@/lib/types";

// Types for Nanonets response
interface NanonetsBound {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface NanonetsLabel {
  label: string;
  confidence: number;
  bounding_box: NanonetsBound;
}

interface NanonetsResponse {
  result: Array<{
    prediction: NanonetsLabel[];
  }>;
}

// Map Nanonets labels to our component types
function mapLabelToComponentType(label: string): ComponentType {
  const normalized = label.toLowerCase().trim();

  if (
    normalized.includes("button") ||
    normalized.includes("btn") ||
    normalized.includes("click")
  ) {
    return "button";
  }
  if (
    normalized.includes("text") ||
    normalized.includes("paragraph") ||
    normalized.includes("p")
  ) {
    return "text";
  }
  if (
    normalized.includes("image") ||
    normalized.includes("img") ||
    normalized.includes("picture")
  ) {
    return "image";
  }
  if (normalized.includes("input") || normalized.includes("field")) {
    return "input";
  }
  if (normalized.includes("textarea") || normalized.includes("comment")) {
    return "textarea";
  }
  if (normalized.includes("checkbox") || normalized.includes("check")) {
    return "checkbox";
  }
  if (
    normalized.includes("card") ||
    normalized.includes("box") ||
    normalized.includes("panel")
  ) {
    return "card";
  }
  if (
    normalized.includes("container") ||
    normalized.includes("section") ||
    normalized.includes("div")
  ) {
    return "container";
  }
  if (
    normalized.includes("heading") ||
    normalized.includes("header") ||
    normalized.includes("title")
  ) {
    return "heading";
  }
  if (
    normalized.includes("form") ||
    normalized.includes("formcontainer")
  ) {
    return "form";
  }

  // Default to container if no match
  return "container";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Get Nanonets API key from environment
    const nanonetsApiKey = process.env.NANONETS_API_KEY;
    if (!nanonetsApiKey) {
      return NextResponse.json(
        { error: "Nanonets API key not configured" },
        { status: 500 }
      );
    }

    // Prepare form data for Nanonets
    const ocrFormData = new FormData();
    ocrFormData.append("file", imageFile);

    // Call Nanonets API
    // Note: This assumes you have a custom Nanonets model for UI component detection
    // You may need to adjust the endpoint based on your model ID
    const nanonetsResponse = await fetch(
      "https://app.nanonets.com/api/v2/ObjectDetection/LabelFile/",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${nanonetsApiKey}:`
          ).toString("base64")}`,
        },
        body: ocrFormData,
      }
    );

    if (!nanonetsResponse.ok) {
      // Try to parse JSON, fall back to text if the mock returns plain text or HTML
      let errorData: any = null;
      const contentType = nanonetsResponse.headers.get("content-type") || "";
      try {
        if (contentType.includes("application/json")) {
          errorData = await nanonetsResponse.json();
        } else {
          errorData = await nanonetsResponse.text();
        }
      } catch (e) {
        try {
          errorData = await nanonetsResponse.text();
        } catch (_) {
          errorData = "Could not read error body";
        }
      }

      console.error("Nanonets error:", errorData);
      return NextResponse.json(
        {
          error: "OCR processing failed",
          details: errorData,
          status: nanonetsResponse.status,
          statusText: nanonetsResponse.statusText,
        },
        { status: 400 }
      );
    }

    let nanonetsData: NanonetsResponse | null = null;
    try {
      nanonetsData = await nanonetsResponse.json();
    } catch (e) {
      // If parsing fails, log and return a helpful error
      const textBody = await nanonetsResponse.text().catch(() => "");
      console.error("Failed to parse Nanonets JSON response:", textBody);
      return NextResponse.json(
        { error: "Invalid OCR provider response", details: textBody },
        { status: 502 }
      );
    }

    // Parse Nanonets response and convert to our format
    const detectedComponents: any[] = [];

    if (nanonetsData && nanonetsData.result && nanonetsData.result.length > 0) {
      nanonetsData.result[0].prediction.forEach((prediction) => {
        const bbox = prediction.bounding_box;
        const width = Math.abs(bbox.right - bbox.left);
        const height = Math.abs(bbox.bottom - bbox.top);

        detectedComponents.push({
          type: mapLabelToComponentType(prediction.label),
          label: prediction.label,
          bounds: {
            x: bbox.left,
            y: bbox.top,
            width,
            height,
          },
          confidence: prediction.confidence,
        });
      });
    }

    const result: OCRResult = {
      detectedComponents,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("OCR API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
