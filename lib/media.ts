import Replicate from "replicate";
import { persistMedia } from "./media-storage";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
});

export interface MediaGenerationResult {
  url: string | string[];
  modelUsed: string;
  duration?: number;
}

/**
 * Generate photorealistic real-life images with automatic fallback
 * Primary: black-forest-labs/flux-schnell ($0.003)
 * Fallback: stability-ai/sdxl ($0.004)
 */
export async function generateImageWithFallback(
  prompt: string,
  options: {
    numOutputs?: number;
    aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  } = {}
): Promise<MediaGenerationResult> {
  const { numOutputs = 1, aspectRatio = "1:1" } = options;

  // Realism Prompt Injection: Guarantees authentic photography over anime/render
  const realismEnhancement =
    "RAW 35mm photo, natural lighting, authentic photography, realistic skin textures and fine details, shot on Sony A7 IV, 8k resolution";
  const enhancedPrompt = `${prompt}, ${realismEnhancement}`;

  // Priority 1: FLUX.1 [schnell] (~$0.003 / image, 1.5s)
  try {
    console.log("[Media Engine] Generating image with black-forest-labs/flux-schnell...");
    const output: any = await replicate.run(
      "black-forest-labs/flux-schnell" as any,
      {
        input: {
          prompt: enhancedPrompt,
          num_outputs: numOutputs,
          aspect_ratio: aspectRatio,
          output_format: "webp",
        },
      }
    );

    const persistentUrl = await persistMedia(
      Array.isArray(output) ? output : [output],
      "image"
    );

    return {
      url: persistentUrl,
      modelUsed: "black-forest-labs/flux-schnell",
    };
  } catch (fluxError: any) {
    console.warn(
      `[Media Engine] Flux Schnell failed or queued out (${fluxError?.message || fluxError}). Falling back to SDXL...`
    );
  }

  // Priority 2: SDXL Photographic Fallback (~$0.004 / image)
  try {
    console.log("[Media Engine] Generating image with stability-ai/sdxl...");
    const output: any = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: enhancedPrompt,
          negative_prompt:
            "cartoon, anime, 3d, render, illustration, bad anatomy, deformed, sketch, painting, drawing, plastic, low quality",
          num_outputs: numOutputs,
        },
      }
    );

    const persistentUrl = await persistMedia(
      Array.isArray(output) ? output : [output],
      "image"
    );

    return {
      url: persistentUrl,
      modelUsed: "stability-ai/sdxl",
    };
  } catch (sdxlError: any) {
    throw new Error(
      `All image generation models failed. Last error: ${sdxlError?.message || sdxlError}`
    );
  }
}

/**
 * Generate real studio-quality music with dynamic duration clamping and fallback
 * Primary: meta/musicgen (~$0.006 for 10s)
 * Fallback: riffusion/riffusion (emergency)
 */
export async function generateMusicWithFallback(
  prompt: string,
  requestedDuration?: number
): Promise<MediaGenerationResult> {
  // Clamping duration: default 10 seconds, user-requested clamped strictly between 5s and 30s
  const duration = Math.min(Math.max(requestedDuration || 10, 5), 30);

  // Priority 1: Meta's MusicGen (~$0.006 per 10s, authentic studio instruments)
  try {
    console.log(
      `[Media Engine] Generating ${duration}s audio track with meta/musicgen...`
    );
    const output: any = await replicate.run(
      "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
      {
        input: {
          prompt: String(prompt),
          duration,
          model_version: "stereo-large",
          output_format: "mp3",
          normalization_strategy: "loudness",
        },
      }
    );

    const audioUrl = typeof output === "string" ? output : (output as any)?.audio || output;
    const persistentAudio = await persistMedia(audioUrl, "audio");

    return {
      url: persistentAudio,
      modelUsed: "meta/musicgen",
      duration,
    };
  } catch (musicgenError: any) {
    console.warn(
      `[Media Engine] MusicGen failed (${musicgenError?.message || musicgenError}). Waiting for rate-limit reset before Riffusion fallback...`
    );
    // Wait 3.5s to respect Replicate's 429 burst rate limit before fallback request
    await new Promise((resolve) => setTimeout(resolve, 3500));
  }

  // Priority 2: Riffusion Emergency Fallback
  try {
    console.log("[Media Engine] Generating audio with riffusion/riffusion emergency fallback...");
    const output: any = await replicate.run(
      "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
      {
        input: {
          prompt_a: String(prompt),
        },
      }
    );

    const audioUrl = typeof output === "string" ? output : (output as any)?.audio || output;
    const persistentAudio = await persistMedia(audioUrl, "audio");

    return {
      url: persistentAudio,
      modelUsed: "riffusion/riffusion",
      duration: 8,
    };
  } catch (riffusionError: any) {
    throw new Error(
      `All music generation models failed. Last error: ${riffusionError?.message || riffusionError}`
    );
  }
}

/**
 * Generate cinematic 720p HD real-life video at 24fps
 * Dedicated single lean model: lightricks/ltx-video (~$0.068 / video, 4-5s duration)
 */
export async function generateVideo(
  prompt: string,
  aspectRatio: "16:9" | "9:16" = "16:9"
): Promise<MediaGenerationResult> {
  const cinematicEnhancement =
    "35mm film, 24fps cinematic camera pan, natural lighting, photorealistic, realistic motion, 4k resolution";
  const enhancedPrompt = `${prompt}, ${cinematicEnhancement}`;

  const negativePrompt =
    "cartoon, anime, 3d render, watermark, text, blurry, deformed, low quality, distorted, glitch, morphing";

  console.log("[Media Engine] Generating cinematic video with lightricks/ltx-video (~$0.068)...");

  try {
    const output: any = await replicate.run(
      "lightricks/ltx-video:5ddec822499d46d11a93a92ef87e26adefda6608279d9d35c454e50e5e298d92",
      {
        input: {
          prompt: enhancedPrompt,
          negative_prompt: negativePrompt,
          aspect_ratio: aspectRatio,
          length: 97, // ~4.04 seconds @ 24fps
          cfg: 3,
          steps: 30,
        },
      }
    );

    const videoUrl = typeof output === "string" ? output : Array.isArray(output) ? output[0] : output;
    const persistentVideo = await persistMedia(videoUrl, "video");

    return {
      url: persistentVideo,
      modelUsed: "lightricks/ltx-video",
      duration: 4,
    };
  } catch (ltxError: any) {
    throw new Error(
      `Video generation failed with lightricks/ltx-video: ${ltxError?.message || ltxError}`
    );
  }
}
