import React from "react";

interface VideoFeedProps {
    videoRef: React.RefObject<HTMLVideoElement>;
}

export default function VideoFeed({ videoRef }: VideoFeedProps) {
    return (
        <video
            ref={videoRef}
            className="w-full h-auto"
            playsInline
            muted
        />
    );
}
