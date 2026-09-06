import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export type SupportedMediaType = "image" | "audio" | "video";

// Configure Cloudinary from environment variables
const isCloudinaryConfigured = Boolean(
  (process.env.CLOUDINARY_URL) ||
  (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET)
);

if (isCloudinaryConfigured) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      secure: true,
    });
  } else {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

/**
 * Uploads a remote media URL (or local path) directly to Cloudinary CDN.
 * Cloudinary natively handles remote URLs and automatic media compression/streaming.
 */
async function uploadToCloudinary(
  remoteUrl: string,
  type: SupportedMediaType
): Promise<string> {
  // Cloudinary uses "video" resource_type for both video and audio files, or "auto"
  const resourceType = type === "image" ? "image" : "auto";
  const folder = `genius_ai/${type}s`;

  console.log(`[Media Storage] Uploading ${type} to Cloudinary: ${remoteUrl.slice(0, 80)}...`);

  const result = await cloudinary.uploader.upload(remoteUrl, {
    folder,
    resource_type: resourceType,
    use_filename: false,
    unique_filename: true,
    overwrite: false,
  });

  console.log(`[Media Storage] Cloudinary upload successful: ${result.secure_url}`);
  return result.secure_url;
}

/**
 * Downloads media from a remote URL and saves it to public/generated/{type}/ on disk.
 * Used as offline / development fallback when Cloudinary is not configured.
 */
async function downloadAndSaveLocally(
  remoteUrl: string,
  type: SupportedMediaType
): Promise<string> {
  if (!remoteUrl || typeof remoteUrl !== "string") {
    return remoteUrl;
  }

  // If already stored locally or data URI, return as-is
  if (remoteUrl.startsWith("/") || remoteUrl.startsWith("data:")) {
    return remoteUrl;
  }

  try {
    const subFolder = type === "image" ? "images" : type === "audio" ? "audio" : "video";
    const baseDir = path.join(process.cwd(), "public", "generated", subFolder);

    await fs.mkdir(baseDir, { recursive: true });

    console.log(`[Media Storage Local Fallback] Persisting ${type} from: ${remoteUrl.slice(0, 80)}...`);

    const response = await fetch(remoteUrl, {
      headers: {
        "User-Agent": "GeniusAI-MediaPersister/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        `[Media Storage Local] Fetch failed with status ${response.status}: ${response.statusText}`
      );
      return remoteUrl;
    }

    const contentType = response.headers.get("content-type") || "";
    let ext = "";

    if (type === "image") {
      if (contentType.includes("webp") || remoteUrl.includes(".webp")) ext = ".webp";
      else if (contentType.includes("png") || remoteUrl.includes(".png")) ext = ".png";
      else if (
        contentType.includes("jpeg") ||
        contentType.includes("jpg") ||
        remoteUrl.includes(".jpg") ||
        remoteUrl.includes(".jpeg")
      )
        ext = ".jpg";
      else ext = ".webp";
    } else if (type === "audio") {
      if (contentType.includes("wav") || remoteUrl.includes(".wav")) ext = ".wav";
      else ext = ".mp3";
    } else if (type === "video") {
      ext = ".mp4";
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const filePath = path.join(baseDir, fileName);

    await fs.writeFile(filePath, uint8Array);

    const localUrl = `/generated/${subFolder}/${fileName}`;
    console.log(
      `[Media Storage Local] Successfully saved to ${localUrl} (${(uint8Array.byteLength / 1024).toFixed(1)} KB)`
    );

    return localUrl;
  } catch (error: any) {
    console.error(`[Media Storage Local] Failed to save locally:`, error?.message || error);
    return remoteUrl;
  }
}

/**
 * Persists media permanently.
 * In production / configured environments: Streams directly to Cloudinary CDN.
 * In local dev without cloud keys: Falls back to disk storage in public/generated/.
 */
export async function persistMedia(
  mediaInput: string | string[],
  type: SupportedMediaType
): Promise<string | string[]> {
  const saveSingle = async (url: string): Promise<string> => {
    if (!url || typeof url !== "string") return url;

    // Already hosted on Cloudinary or a permanent domain
    if (url.includes("res.cloudinary.com")) {
      return url;
    }

    if (isCloudinaryConfigured) {
      try {
        return await uploadToCloudinary(url, type);
      } catch (cloudErr: any) {
        console.warn(
          `[Media Storage] Cloudinary upload failed (${cloudErr?.message || cloudErr}). Falling back to local disk storage...`
        );
        return await downloadAndSaveLocally(url, type);
      }
    }

    return await downloadAndSaveLocally(url, type);
  };

  if (Array.isArray(mediaInput)) {
    return await Promise.all(mediaInput.map((url) => saveSingle(url)));
  }

  return await saveSingle(mediaInput);
}

// Backward compatibility alias
export const persistMediaLocally = persistMedia;
