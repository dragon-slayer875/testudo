"use client";
import React, { useRef } from "react";

export default function Commander() {
    const inputRef = useRef(null);
    return (
        <div className="absolute top-10 left-10">
            <input
                ref={inputRef}
                type="text"
                className="border-2 border-gray-500"
            />
            <button
                className="border-2 border-gray-500"
                onClick={() => {
                    // @ts-ignore
                    console.log(inputRef.current.value);
                }}
            >
                Send
            </button>
        </div>
    );
}
