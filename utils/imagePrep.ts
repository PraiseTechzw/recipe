import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";

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
    Image.getSize(
      uri,
      (w: number, h: number) => resolve({ width: w, height: h }),
      (e: any) => reject(e),
    );
  });

  const actions: ImageManipulator.Action[] = [];

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      actions.push({ resize: { width: maxDimension } });
    } else {
      actions.push({ resize: { height: maxDimension } });
    }
  }

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
    encoding: "base64",
  });

  return {
    uri: result.uri,
    base64,
    width: result.width,
    height: result.height,
  };
}
