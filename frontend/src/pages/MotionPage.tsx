import React from "react";
import PoseDetector from "../components/PoseDetector";

export default function MotionPage() {
    return (
        <div className="relative w-full max-w-xl mx-auto">
            <PoseDetector />
        </div>
    );
}
