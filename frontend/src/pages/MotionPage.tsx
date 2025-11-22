import React, { useState } from "react";
import PoseDetector from "../components/PoseDetector";

export default function MainPage() {
    const [symbol, setSymbol] = useState("-");

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-700 via-blue-600 to-indigo-500 flex items-center justify-center p-6">
            <div className="flex flex-col items-center justify-center space-y-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg text-center">
                    Current Pose: <span className="text-yellow-300">{symbol}</span>
                </h1>

                <div className="relative w-full max-w-[640px] h-[480px] rounded-2xl shadow-2xl overflow-hidden border-4 border-white">
                    <PoseDetector onPoseChange={setSymbol} />
                </div>
            </div>
        </div>
    );
}
