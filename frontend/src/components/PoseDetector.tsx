// src/components/PoseDetector.tsx
import React, { useEffect, useRef } from "react";
import { MediaPipe } from "../lib/mediapipe/MediaPipe";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

// determinePose function
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

type PoseDetectorProps = {
    onPoseChange?: (symbol: string) => void;
};

export default function PoseDetector({ onPoseChange }: PoseDetectorProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const symbolRef = useRef<string>("-");

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

                    // Draw landmarks only (no symbol)
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

                    // Determine pose and notify parent
                    const symbol = determinePose(result.landmarks ?? []);
                    if (symbolRef.current !== symbol) {
                        symbolRef.current = symbol;
                        if (onPoseChange) onPoseChange(symbol);
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
    }, [onPoseChange]);

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
