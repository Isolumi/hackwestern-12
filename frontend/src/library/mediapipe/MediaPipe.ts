// src/MediaPipe.ts
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

export class MediaPipe {
    public static async buildPoseLandmarker() {
        // Load WASM runtime
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        // Create PoseLandmarker instance (no type assertions)
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            },
            runningMode: "VIDEO", // string value, not enum/type
        });

        return poseLandmarker;
    }
}
