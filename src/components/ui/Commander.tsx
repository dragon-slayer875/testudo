"use client";
import { Button } from "./button";
import React, { useRef } from "react";
import { forward, backward, undo, redo } from "@/stateManagement/commandsSlice";
import { useDispatch } from "react-redux";

export default function Commander() {
    const dispatch = useDispatch();
    const inputRef = useRef<null | HTMLInputElement>(null);
    return (
        <div className="absolute top-10 left-10 flex gap-3">
            <input
                ref={inputRef}
                type="number"
                name="commander"
                className="border-2 border-red-500 focus:border-blue-500 text"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        if (inputRef.current !== null) {
                            dispatch(forward(Number(inputRef.current.value)));
                        }
                    }
                }}
            />
            <Button
                variant={"secondary"}
                onClick={() => {
                    if (inputRef.current !== null) {
                        dispatch(forward(Number(inputRef.current.value)));
                    }
                }}
            >
                Send
            </Button>
            <Button variant={"secondary"} onClick={() => dispatch(undo())}>
                Undo
            </Button>
            <Button variant={"secondary"} onClick={() => dispatch(redo())}>
                Redo
            </Button>
        </div>
    );
}
