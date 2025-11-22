import React, { useEffect, useRef } from "react";
import { NormalizedLandmarkList, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

interface PoseOverlayProps {
    landmarks: NormalizedLandmarkList | null;
}

export default function PoseOverlay({ landmarks }: PoseOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!landmarks || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawConnectors(ctx, landmarks, POSE_CONNECTIONS);
        drawLandmarks(ctx, landmarks);
    }, [landmarks]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
        />
    );
}
