"use client";
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Drawable } from "roughjs/bin/core";
import rough from "roughjs/bin/rough";

type ElementInfo = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    roughElement: Drawable;
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
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [elements, setElements] = useState<ElementInfo[] | []>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        contextRef.current = canvas.getContext("2d");
        const ctx = contextRef.current;
        const roughCanvas = rough.canvas(canvas);
        if (!ctx) return;
        elements.forEach(({ roughElement }) => {
            roughCanvas.draw(roughElement);
        });
    }, [elements]);

    function handleMouseDown(
        event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
    ) {
        setIsDrawing(true);
        const { clientX, clientY } = event;
        const element = createElement(clientX, clientY, clientX, clientY);
        setElements((prevState) => [...prevState, element]);
    }

    function handleMouseMove(
        event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
    ) {
        if (!isDrawing) return;
        const { clientX, clientY } = event;
        const index = elements.length - 1;
        const { x1, y1 } = elements[index];
        const updatedElement = createElement(x1, y1, clientX, clientY);
        const elementsCopy = elements.slice();
        elementsCopy[index] = updatedElement;
        setElements(elementsCopy);
        console.log({clientX, clientY});
        
    }

    function handleMouseUp() {
        setIsDrawing(false);
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
