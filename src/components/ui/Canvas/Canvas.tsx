"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

export default function Canvas(): JSX.Element {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        contextRef.current = canvas.getContext("2d");
        const ctx = contextRef.current;
        if (!ctx) return;
        ctx.fillStyle = "black";
        ctx.fillRect(window.innerWidth/2, innerHeight/2, 10, 10);
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full bg-slate-50" />;
}
