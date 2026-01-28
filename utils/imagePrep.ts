import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

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
  options: { maxDimension?: number; quality?: number } = {}
): Promise<ProcessedImage> {
  const { maxDimension = 1280, quality = 0.7 } = options;

  try {
    // 1. Manipulate: Resize and Compress
    // We resize so the longest edge is at most maxDimension
    const manipulationActions = [
      {
        resize: {
          width: maxDimension, // ImageManipulator preserves aspect ratio if only one dim is provided? 
          // Actually for 'resize', if we want to constrain the longest side, we might need to know dimensions first.
          // But ImageManipulator's resize takes width OR height. If we provide only one, it scales proportionally.
          // However, we don't know which is the long edge without checking.
          // A safe bet is to let ImageManipulator handle it if we knew the dimensions, or we can just set width to maxDimension? 
          // If the image is portrait, setting width to 1280 might make height 2000+.
          // Let's check dimensions first or use a smarter resize action if available.
          // 'expo-image-manipulator' resize action: { width?: number, height?: number }.
        },
      },
    ];

    // Optimization: Check original dimensions first to decide how to resize
    // But getting dimensions requires an extra call. 
    // Let's just blindly resize to a reasonable width if we want to be fast, 
    // OR we can use the "width" property if we assume landscape, but that's risky.
    
    // Better approach: We can use a helper to get size, but let's try to do it in one pass if possible.
    // If we pass ONLY width, it maintains aspect ratio. If we pass ONLY height, it maintains aspect ratio.
    // We can't easily do "longest edge" without knowing the aspect ratio.
    // So let's add a step to get image size.
  } catch (error) {
      throw error;
  }
  
  // Revised implementation below
  return await processImage(uri, maxDimension, quality);
}

async function processImage(uri: string, maxDimension: number, quality: number): Promise<ProcessedImage> {
    // 1. Get original dimensions to determine resize target
    // We can use Image.getSize or just let ImageManipulator do a first pass? 
    // Image.getSize is standard React Native.
    // However, since we are in a utility, importing Image from react-native is fine.
    
    // Actually, let's just use a safe width. 1080p is usually fine.
    // But to strictly follow "1280px long edge", we need dimensions.
    // We can use `ImageManipulator.manipulateAsync` with no actions to get dimensions efficiently?
    // Or just use `await new Promise((resolve, reject) => Image.getSize(uri, (w, h) => resolve({width: w, height: h}), reject))`
    
    // Let's assume we want to be efficient. 
    // Use ImageManipulator to just convert/compress first? No, resizing is key for memory.
    
    // Let's use React Native's Image.getSize. It's fast for local URIs.
    const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        // dynamic import to avoid issues if used in non-RN env (though this is RN project)
        const { Image } = require('react-native');
        Image.getSize(uri, (w: number, h: number) => resolve({ width: w, height: h }), (e: any) => reject(e));
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
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG, base64: false } // We read base64 separately as requested
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
