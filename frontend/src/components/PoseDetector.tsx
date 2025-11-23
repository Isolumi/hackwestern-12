// src/components/PoseDetector.tsx
import React, { useEffect, useRef } from "react";
import { MediaPipe } from "../library/mediapipe/MediaPipe";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

// -----------------------------
// determinePose (existing)
// -----------------------------
export function determinePose(landmarks: NormalizedLandmark[][]): string {
    if (!landmarks || landmarks.length === 0) return "-";

    const pose = landmarks[0];
    const nose = pose[0];
    const leftWrist = pose[15];
    const rightWrist = pose[16];
    const leftShoulder = pose[11];
    const rightShoulder = pose[12];

    // "O" gesture
    const handsAboveHead = leftWrist.y < nose.y && rightWrist.y < nose.y;
    const wristDistanceX = Math.abs(leftWrist.x - rightWrist.x);
    const shoulderDistanceX = Math.abs(leftShoulder.x - rightShoulder.x);
    if (handsAboveHead && wristDistanceX < shoulderDistanceX) return "O";

    // "X" gesture
    const wristsBelowNose = leftWrist.y > nose.y && rightWrist.y > nose.y;
    const wristsCrossed = leftWrist.x - rightWrist.x < 0;
    if (wristsBelowNose && wristsCrossed) return "X";

    return "-";
}

export function determineMovement(
    landmarks: NormalizedLandmark[][],
): [number, number, number, number] {

    const vector: [number, number, number, number] = [0, 0, 0, 0];

    if (!landmarks || landmarks.length === 0) return vector;

    const pose = landmarks[0];

    // Nose tip
    const noseX = pose[0].x;

    const eyeRightX = pose[7].x;

    const thresholdRotation = 0.02; // adjust for sensitivity
    const diffNoseRight = noseX - eyeRightX;

    if (Math.abs(diffNoseRight) < thresholdRotation) {
        vector[3] = 1;
    }

    const eyeLeftX = pose[8].x;

    const diffNoseLeft = noseX - eyeLeftX;

    if (Math.abs(diffNoseLeft) < thresholdRotation) {
        vector[3] = -1;
    }


    const leftWidth = Math.abs(pose[15].x - pose[11].x);
    const rightWidth = Math.abs(pose[16].x - pose[12].x);
    const torsoWidth = Math.abs(pose[11].x - pose[12].x);

    if (leftWidth > torsoWidth) {
        vector[0] = 1;
    } else if (rightWidth > torsoWidth) {
        vector[0] = -1;
    }

    // for moving back and forth
    const yThreshold = 0.085;
    const leftWrist = pose[15];
    const rightWrist = pose[16];
    const leftElbow = pose[13];
    const rightElbow = pose[14];
    const leftShoulder = pose[11];
    const rightShoulder = pose[12];

    if ((Math.abs(leftWrist.y - leftElbow.y) < yThreshold && Math.abs(leftWrist.x - leftElbow.x) < yThreshold) &&
        (Math.abs(rightWrist.y - rightElbow.y) < yThreshold && Math.abs(rightWrist.x - rightElbow.x) < yThreshold)) {
        vector[1] = 1; // move forward
    } else if ((Math.abs(leftWrist.y - leftShoulder.y) < yThreshold + 0.035 && Math.abs(leftWrist.x - leftShoulder.x) < yThreshold + 0.035) &&
        (Math.abs(rightWrist.y - rightShoulder.y) < yThreshold + 0.035 && Math.abs(rightWrist.x - rightShoulder.x) < yThreshold + 0.035)) {
        vector[1] = -1; // move backward
    }

    return vector;
}

type PoseDetectorProps = {
    onPoseChange?: (symbol: string) => void;
    onMovementChange?: (vec: [number, number, number, number]) => void; // NEW optional callback
};

export default function PoseDetector({ onPoseChange, onMovementChange }: PoseDetectorProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const symbolRef = useRef<string>("-");
    const vectorRef = useRef<[number, number, number, number]>([0, 0, 0, 0]);

    useEffect(() => {
        let animationFrameId: number;
        let drawingUtils: DrawingUtils | null = null;

        async function init() {
            let poseLandmarker: PoseLandmarker;
            try {
                poseLandmarker = await MediaPipe.buildPoseLandmarker();
            } catch (err) {
                console.error("Failed to initialize PoseLandmarker:", err);
                return;
            }

            if (!videoRef.current) return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            } catch (err) {
                console.error("Camera access or play failed:", err);
                return;
            }

            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            drawingUtils = new DrawingUtils(ctx);

            const detectFrame = async () => {
                if (!videoRef.current || videoRef.current.readyState < 2) {
                    animationFrameId = requestAnimationFrame(detectFrame);
                    return;
                }

                try {
                    const result = await poseLandmarker.detectForVideo(
                        videoRef.current,
                        performance.now()
                    );

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Draw landmarks
                    result.landmarks?.forEach((landmark) => {
                        drawingUtils!.drawLandmarks(landmark, {
                            radius: (data) =>
                                DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
                        });
                        drawingUtils!.drawConnectors(
                            landmark,
                            PoseLandmarker.POSE_CONNECTIONS
                        );
                    });

                    // SYMBOL
                    const symbol = determinePose(result.landmarks ?? []);
                    if (symbolRef.current !== symbol) {
                        symbolRef.current = symbol;
                        onPoseChange?.(symbol);
                    }

                    // VECTOR
                    const vector = determineMovement(result.landmarks ?? []);
                    if (JSON.stringify(vectorRef.current) !== JSON.stringify(vector)) {
                        vectorRef.current = vector;
                        onMovementChange?.(vector);
                    }

                } catch (err) {
                    console.error("Detection error:", err);
                }

                animationFrameId = requestAnimationFrame(detectFrame);
            };

            detectFrame();
        }

        init();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            const video = videoRef.current;
            if (video?.srcObject) {
                (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
                video.srcObject = null;
            }
        };
    }, [onPoseChange, onMovementChange]);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <video
                ref={videoRef}
                style={{ position: "absolute", top: 0, left: 0 }}
                width={640}
                height={480}
                muted
            />
            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{ position: "absolute", top: 0, left: 0 }}
            />
        </div>
    );
}
