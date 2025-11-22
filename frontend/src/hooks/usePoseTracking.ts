import { useEffect, useRef, useState } from "react";
import { createPose } from "../lib/mediapipe/pose";
import { NormalizedLandmarkList } from "@mediapipe/pose";

export default function usePoseTracking() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [landmarks, setLandmarks] = useState<NormalizedLandmarkList | null>(null);

    useEffect(() => {
        const pose = createPose((results) => {
            setLandmarks(results.poseLandmarks ?? null);
        });

        let cameraStream: MediaStream | null = null;

        async function initCamera() {
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });

            if (!videoRef.current) return;

            videoRef.current.srcObject = cameraStream;
            await videoRef.current.play();

            const sendFrame = async () => {
                if (videoRef.current) {
                    await pose.send({ image: videoRef.current });
                }
                requestAnimationFrame(sendFrame);
            };

            sendFrame();
        }

        initCamera();

        return () => {
            cameraStream?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    return { videoRef, landmarks };
}
