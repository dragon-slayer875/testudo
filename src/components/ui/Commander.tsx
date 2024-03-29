"use client";
import { Button } from "./button";
import React, { useRef } from "react";
import {
    forward,
    backward,
    undo,
    redo,
    selectCommands,
} from "@/lib/stateManagement/commandsSlice";
import { useDispatch, useSelector } from "react-redux";

export default function Commander() {
    const dispatch = useDispatch();
    const commands = useSelector(selectCommands);
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
            <Button
                variant={"secondary"}
                onClick={() => {
                    if (commands.instanceIndex > 0) {dispatch(undo())}
                    else {
                        alert("No more commands to undo");
                    }
                }}
            >
                Undo
            </Button>
            <Button
                variant={"secondary"}
                onClick={() => {
                    if (
                        commands.instanceIndex <
                        commands.commanderStateInstances.length - 1
                    )
                        {dispatch(redo())}
                    else {
                        alert("No more commands to redo");
                    }
                }}
            >
                Redo
            </Button>
        </div>
    );
}
