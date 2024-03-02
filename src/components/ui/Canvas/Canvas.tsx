"use client";
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Drawable } from "roughjs/bin/core";
import rough from "roughjs/bin/rough";
import { buffer } from "stream/consumers";

type ElementInfo = {
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
}

const generator = rough.generator();

function createElement(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): ElementInfo {
    const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    return { x1, y1, x2, y2, roughElement };
}

export default function Canvas(): JSX.Element {
    const [action, setAction] = useState<
        "draw" | "select" | "move" | "delete" | "pan" | "none"
    >("none");
    const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [scaleOffset, setScaleOffset] = useState<{}>({ x: 0, y: 0 });
    const [elements, setElements] = useState<ElementInfo[] | []>([]);
    const pressedKeys = usePressedKeys();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

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

        if (!ctx) return;
        contextRef?.current?.translate(panOffset.x, panOffset.y);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fillRect(50, 50, 100, 100);

        elements.forEach(({ roughElement }) => {
            roughCanvas.draw(roughElement);
        });
    }, [elements, panOffset, width, height]);

    useEffect(() => {
        const panHandler = (event: WheelEvent) => {
            setPanOffset((prevState) => ({
                x: prevState.x + event.deltaX,
                y: prevState.y + event.deltaY,
            }));
        };

        document.addEventListener("wheel", panHandler);
        return () => document.removeEventListener("wheel", panHandler);
    }, []);

    function getMouseCoordinates(
        event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
    ) {
        const clientX = event.clientX - panOffset.x;
        const clientY = event.clientY - panOffset.y;
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
            setElements((prevState) => [...prevState, element]);
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
        if (action == "draw") {
            const index = elements.length - 1;
            const { x1, y1 } = elements[index];
            const updatedElement = createElement(x1, y1, clientX, clientY);
            const elementsCopy = elements.slice();
            elementsCopy[index] = updatedElement;
            setElements(elementsCopy);
        }

        console.log({ clientX, clientY });
    }

    function handleMouseUp() {
        setAction("none");
    }

    return (
        <canvas
            ref={canvasRef}
            className=" bg-slate-100"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            Canvas
        </canvas>
    );
}
