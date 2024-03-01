"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

export default function Canvas(): JSX.Element {
    const cellSize = 50;
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const [scale, setScale] = useState(1);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [touchMode, setTouchMode] = useState<"single" | "double">("single");
    const [prevTouch, setPrevTouch] = useState<[Touch | null, Touch | null]>([
        null,
        null,
    ]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    function toVirtualX(xReal: number, offsetX: number, scale: number): number {
        return (xReal + offsetX) * scale;
    }

    function toVirtualY(yReal: number, offsetY: number, scale: number): number {
        return (yReal + offsetY) * scale;
    }

    function toRealX(xVirtual: number, offsetX: number, scale: number): number {
        return xVirtual / scale - offsetX;
    }

    function toRealY(yVirtual: number, offsetY: number, scale: number): number {
        return yVirtual / scale - offsetY;
    }

    function virtualHeight(clientHeight: number, scale: number): number {
        return clientHeight / scale;
    }

    function virtualWidth(clientWidth: number, scale: number): number {
        return clientWidth / scale;
    }

    function offsetLeft(amount: number) {
        setOffsetX(offsetX - amount);
    }

    function offsetRight(amount: number) {
        setOffsetX(offsetX + amount);
    }

    function offsetUp(amount: number) {
        setOffsetY(offsetY - amount);
    }

    function offsetDown(amount: number) {
        setOffsetY(offsetY + amount);
    }

    function pan(
        scaleAmount: number,
        [touch0X, touch0Y]: [number, number],
        [prevTouch0X, prevTouch0Y]: [number, number],
        [touch1X, touch1Y]: [number, number],
        [prevTouch1X, prevTouch1Y]: [number, number]
    ): void {
        // get midpoints
        const midX = (touch0X + touch1X) / 2;
        const midY = (touch0Y + touch1Y) / 2;
        const prevMidX = (prevTouch0X + prevTouch1X) / 2;
        const prevMidY = (prevTouch0Y + prevTouch1Y) / 2;

        // Calculate how many pixels the midpoints have moved in the x and y direction
        const panX = midX - prevMidX;
        const panY = midY - prevMidY;

        // Scale this movement based on the zoom level
        setOffsetX(offsetX + panX / scale);
        setOffsetY(offsetY + panY / scale);

        // Get the relative position of the middle of the zoom.
        // 0, 0 would be top left.
        // 0, 1 would be top right etc.
        const zoomRatioX = midX / (canvasRef.current?.clientWidth ?? 1);
        const zoomRatioY = midY / (canvasRef.current?.clientHeight ?? 1);

        // calculate the amounts zoomed from each edge of the screen
        const unitsZoomedX =
            virtualWidth(document.body.clientWidth, scale) * scaleAmount;
        const unitsZoomedY =
            virtualHeight(document.body.clientHeight, scale) * scaleAmount;

        const unitsAddLeft = unitsZoomedX * zoomRatioX;
        const unitsAddTop = unitsZoomedY * zoomRatioY;

        setOffsetX(offsetX + unitsAddLeft);
        setOffsetY(offsetY + unitsAddTop);
    }

    function _zoom(
        [touch0X, touch0Y]: [number, number],
        [prevTouch0X, prevTouch0Y]: [number, number],
        [touch1X, touch1Y]: [number, number],
        [prevTouch1X, prevTouch1Y]: [number, number]
    ): number {
        const hypot = Math.sqrt(
            Math.pow(touch0X - touch1X, 2) + Math.pow(touch0Y - touch1Y, 2)
        );

        const prevHypot = Math.sqrt(
            Math.pow(prevTouch0X - prevTouch1X, 2) +
                Math.pow(prevTouch0Y - prevTouch1Y, 2)
        );

        const zoomAmount = hypot / prevHypot;
        zoom(zoomAmount);

        const scaleAmount = 1 - zoomAmount;
        return scaleAmount;
    }

    function zoom(amount: number) {
        setScale(scale * amount);
    }

    function onTouchMove(touches: TouchList) {
        const touch0X = touches[0].pageX;
        const touch0Y = touches[0].pageY;
        const prevTouch0X = prevTouch[0]!.pageX;
        const prevTouch0Y = prevTouch[0]!.pageY;

        if (touchMode === "single") {
            // Single touch (drawing 🎨)
        } else if (touchMode === "double") {
            const touch1X = touches[1].pageX;
            const touch1Y = touches[1].pageY;
            const prevTouch1X = prevTouch[1]!.pageX;
            const prevTouch1Y = prevTouch[1]!.pageY;

            /* Call here `zoom`, `pan`, and `draw` (read next paragraphs 👇) */
            const scaleAmount = _zoom(
                [touch0X, touch0Y],
                [prevTouch0X, prevTouch0Y],
                [touch1X, touch1Y],
                [prevTouch1X, prevTouch1Y]
            );

            pan(
                scaleAmount,
                [touch0X, touch0Y],
                [prevTouch0X, prevTouch0Y],
                [touch1X, touch1Y],
                [prevTouch1X, prevTouch1Y]
            );
        }

        /* Update previous touches for next interaction */
        setPrevTouch([touches[0], touches[1]]);
    }

    function onTouchStart(touches: TouchList) {
        if (touches.length == 1) {
            setTouchMode("single");
        } else if (touches.length >= 2) {
            setTouchMode("double");
        }

        setPrevTouch([touches[0], touches[1]]);

        onTouchMove(touches);
    }

    function draw(): void {
        if (canvasRef.current && contextRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            contextRef.current.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );
            drawGrid();
        }
    }

    function drawGrid(): void {
        if (canvasRef.current && contextRef.current) {
            contextRef.current.strokeStyle = "rgb(229,231,235)";
            contextRef.current.lineWidth = 1;
            contextRef.current.font = "10px serif";
            contextRef.current.beginPath();

            const width = canvasRef.current.clientWidth;
            const height = canvasRef.current.clientHeight;

            for (
                let x = (offsetX % cellSize) * scale;
                x <= width;
                x += cellSize * scale
            ) {
                const source = x;
                contextRef.current.moveTo(source, 0);
                contextRef.current.lineTo(source, height);

                contextRef.current.fillText(
                    `${toVirtualX(source, offsetX, scale).toFixed(0)}`,
                    source,
                    10
                );
            }

            for (
                let y = (offsetY % cellSize) * scale;
                y <= height;
                y += cellSize * scale
            ) {
                const destination = y;
                contextRef.current.moveTo(0, destination);
                contextRef.current.lineTo(width, destination);

                contextRef.current.fillText(
                    `${toVirtualY(destination, offsetY, scale).toFixed(0)}`,
                    0,
                    destination
                );
            }
            contextRef.current.stroke();
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        window.addEventListener("resize", () => draw());
        canvas.addEventListener("touchstart", (event) =>
            onTouchStart(event.touches)
        );
        canvas.addEventListener("touchmove", (event) =>
            onTouchMove(event.touches)
        );
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        contextRef.current = canvas.getContext("2d");
        const ctx = contextRef.current;
        if (!ctx) return;
        ctx.moveTo(50, 50);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 10, 10);
        draw();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full bg-slate-50" />;
}
