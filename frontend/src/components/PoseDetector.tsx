// src/components/PoseDetector.tsx
import React, { useEffect, useRef } from "react";
import { MediaPipe } from "../lib/mediapipe/MediaPipe";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";

export default function PoseDetector() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let animationFrameId: number;
        let drawingUtils: DrawingUtils | null = null;

        async function init() {
            console.log("[PoseDetector] Initializing MediaPipe...");
            let poseLandmarker: PoseLandmarker;

            try {
                poseLandmarker = await MediaPipe.buildPoseLandmarker();
                console.log("[PoseDetector] PoseLandmarker ready");
            } catch (err) {
                console.error("[PoseDetector] Failed to initialize PoseLandmarker:", err);
                return;
            }

            if (!videoRef.current) {
                console.error("[PoseDetector] Video element not found");
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                console.log("[PoseDetector] Video playing, readyState:", videoRef.current.readyState);
            } catch (err) {
                console.error("[PoseDetector] Camera access or play failed:", err);
                return;
            }

            const canvas = canvasRef.current;
            if (!canvas) {
                console.error("[PoseDetector] Canvas element not found");
                return;
            }

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                console.error("[PoseDetector] Failed to get canvas context");
                return;
            }

            drawingUtils = new DrawingUtils(ctx);

            const detectFrame = async () => {
                if (!videoRef.current || videoRef.current.readyState < 2) {
                    animationFrameId = requestAnimationFrame(detectFrame);
                    return;
                }

                try {
                    const result = await poseLandmarker.detectForVideo(videoRef.current, performance.now());

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    result.landmarks?.forEach((landmark) => {
                        drawingUtils!.drawLandmarks(landmark, {
                            radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
                        });
                        drawingUtils!.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
                    });
                } catch (err) {
                    console.error("[PoseDetector] Detection error:", err);
                }

                animationFrameId = requestAnimationFrame(detectFrame);
            };

            detectFrame();
        }

        init();

        return () => {
            console.log("[PoseDetector] Cleaning up...");
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            const video = videoRef.current;
            if (video?.srcObject) {
                (video.srcObject as MediaStream)
                    .getTracks()
                    .forEach((track) => track.stop());
                video.srcObject = null;
                console.log("[PoseDetector] Camera stopped");
            }
        };
    }, []);

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
