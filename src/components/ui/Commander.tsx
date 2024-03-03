"use client";
import { Button } from "./button";
import React, { useRef } from "react";

export default function Commander() {
    const inputRef = useRef(null);
    return (
        <div className="absolute top-10 left-10 flex gap-3">
            <input
                ref={inputRef}
                type="number"
                name="commander"
                className="border-2 border-red-500 focus:border-blue-500 text"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        // @ts-ignore
                        console.log(inputRef.current.value);
                    }
                }}
            />
            <Button variant={"secondary"} onClick={() => console.log("clicked")}>Send</Button>
        </div>
    );
}
