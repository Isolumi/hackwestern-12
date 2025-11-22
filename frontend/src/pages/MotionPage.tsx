import React from "react";
import usePoseTracking from "../hooks/usePoseTracking";
import VideoFeed from "../components/VideoFeed";
import PoseOverlay from "../components/PoseOverlay";

export default function MotionPage() {
    const { videoRef, landmarks } = usePoseTracking();

    return (
        <div className="relative w-full max-w-xl mx-auto">
            <VideoFeed videoRef={videoRef} />
            <PoseOverlay landmarks={landmarks} />
        </div>
    );
}
