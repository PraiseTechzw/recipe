import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

export interface ProcessedImage {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

/**
 * Normalizes an image by resizing and compressing it.
 * Then reads the base64 representation.
 *
 * @param uri - The local URI of the image
 * @param options - Custom options for resizing and compression
 */
export async function prepareImageForAI(
  uri: string,
  options: { maxDimension?: number; quality?: number } = {},
): Promise<ProcessedImage> {
  const { maxDimension = 1280, quality = 0.7 } = options;
  return await processImage(uri, maxDimension, quality);
}

async function processImage(
  uri: string,
  maxDimension: number,
  quality: number,
): Promise<ProcessedImage> {
  // 1. Get original dimensions to determine resize target
  // Use React Native's Image.getSize. It's fast for local URIs.
  const { width, height } = await new Promise<{
    width: number;
    height: number;
  }>((resolve, reject) => {
    // dynamic import to avoid issues if used in non-RN env (though this is RN project)
    const { Image } = require("react-native");
    Image.getSize(
      uri,
      (w: number, h: number) => resolve({ width: w, height: h }),
      (e: any) => reject(e),
    );
  });

  let resizeAction = {};
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      resizeAction = { resize: { width: maxDimension } };
    } else {
      resizeAction = { resize: { height: maxDimension } };
    }
  } else {
    // No resize needed if smaller than maxDimension
    // But we still want to compress.
    // We pass empty actions array or just skip resize.
  }

  const actions = Object.keys(resizeAction).length > 0 ? [resizeAction] : [];

  const result = await ImageManipulator.manipulateAsync(
    uri,
    actions,
    {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: false,
    }, // We read base64 separately as requested
  );

  // 2. Read Base64 using Expo FileSystem
  const base64 = await FileSystem.readAsStringAsync(result.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return {
    uri: result.uri,
    base64,
    width: result.width,
    height: result.height,
  };
}
