"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState, useLayoutEffect, use } from "react";
import { Drawable } from "roughjs/bin/core";
import rough from "roughjs/bin/rough";
import { useDispatch, useSelector } from "react-redux";
import { selectDrawings } from "@/stateManagement/drawingsSlice";
import { selectCommands } from "@/stateManagement/commandsSlice";
import {
    addDrawable,
    updateLastDrawable,
} from "@/stateManagement/drawingsSlice";
import { setCoordinates } from "@/stateManagement/commandsSlice";

export type ElementInfo = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    roughElement: Drawable;
};

const usePressedKeys = () => {
    const [keys, setKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            setKeys((prevState) => new Set(prevState.add(event.key)));
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            setKeys((prevState) => {
                prevState.delete(event.key);
                return new Set(prevState);
            });
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return keys;
};

const generator = rough.generator();

function createElement(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): ElementInfo {
    const roughElement = generator.line(x1, y1, x2, y2);
    return { x1, y1, x2, y2, roughElement };
}

export default function Canvas(): JSX.Element {
    const dispatch = useDispatch();
    const [action, setAction] = useState<
        "draw" | "select" | "move" | "delete" | "pan" | "none"
    >("none");
    const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [scaleOffset, setScaleOffset] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const drawables = useSelector(selectDrawings);
    const commanderState = useSelector(selectCommands);
    const pressedKeys = usePressedKeys();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    useLayoutEffect(() => {
        dispatch(setCoordinates({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
    }
    ,[]);

    useLayoutEffect(() => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
        function handleResize() {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        }

        window.addEventListener("resize", handleResize);
        const canvas = canvasRef.current;

        if (!canvas) return;
        canvas.width = width;
        canvas.height = height;
        contextRef.current = canvas.getContext("2d");

        const ctx = contextRef.current;
        const roughCanvas = rough.canvas(canvas);

        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;
        const scaledOffestX = (scaledWidth - canvas.width) / 2;
        const scaledOffestY = (scaledHeight - canvas.height) / 2;
        setScaleOffset({ x: scaledOffestX, y: scaledOffestY });

        if (!ctx) return;

        ctx.save();
        ctx.translate(
            panOffset.x * scale - scaledOffestX,
            panOffset.y * scale - scaledOffestY
        );
        ctx.scale(scale, scale);

        drawables.forEach(({ roughElement }) => {
            roughCanvas.draw(roughElement);
        });
        commanderState.commanderDrawings.forEach(({ roughElement }) => {
            roughCanvas.draw(roughElement);
        });
        ctx.restore();
    }, [drawables, commanderState, panOffset, scale, width, height]);

    useEffect(() => {
        const panOrZoomHandler = (event: WheelEvent) => {
            if (pressedKeys.has(" ")) onZoom(event.deltaY * -0.001);
            else {
                setPanOffset((prevState) => ({
                    x: prevState.x - event.deltaX,
                    y: prevState.y - event.deltaY,
                }));
            }
        };

        document.addEventListener("wheel", panOrZoomHandler);
        return () => document.removeEventListener("wheel", panOrZoomHandler);
    }, [pressedKeys]);

    function getMouseCoordinates(
        event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
    ) {
        const clientX =
            (event.clientX - panOffset.x * scale + scaleOffset.x) / scale;
        const clientY =
            (event.clientY - panOffset.y * scale + scaleOffset.y) / scale;
        return { clientX, clientY };
    }

    function handleMouseDown(
        event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
    ) {
        const { clientX, clientY } = getMouseCoordinates(event);
        if (event.button === 1 || pressedKeys.has(" ")) {
            setAction("pan");
            setStartPanPosition({ x: clientX, y: clientY });
            return;
        }
        if (event.button === 0) {
            setAction("draw");
            const element = createElement(clientX, clientY, clientX, clientY);
            dispatch(addDrawable(element));
        }
    }

    function handleMouseMove(
        event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
    ) {
        const { clientX, clientY } = getMouseCoordinates(event);
        if (action === "pan") {
            const deltaX = clientX - startPanPosition.x;
            const deltaY = clientY - startPanPosition.y;
            setPanOffset((prevState) => ({
                x: prevState.x + deltaX,
                y: prevState.y + deltaY,
            }));
            return;
        }
        if (action === "draw") {
            const index = drawables.length - 1;
            const { x1, y1 } = drawables[index];
            const updatedElement = createElement(x1, y1, clientX, clientY);
            dispatch(updateLastDrawable(updatedElement));
        }
    }

    function handleMouseUp() {
        setAction("none");
    }

    function onZoom(delta: number) {
        setScale((prevState) => Math.min(Math.max(prevState + delta, 0.1), 20));
    }

    return (
        <canvas
            ref={canvasRef}
            className={cn(" bg-slate-100 max-h-screen w-full", {
                "cursor-grab": action === "pan",
            })}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            Canvas
        </canvas>
    );
}
