"use client";
import React, { useRef, useState } from "react";

interface DragWrapperProps {
    children: React.ReactNode;
}

function DragWrapper({ children }: DragWrapperProps): JSX.Element {
    const dragRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    function handleDragStart(event: React.DragEvent<HTMLDivElement>): void {
        setIsDragging(true);
        // Add any additional logic you need when the drag starts
    }

    function handleDrag(event: React.DragEvent<HTMLDivElement>) {
        if (dragRef.current) {
            setPosition({
                x: event.clientX - dragRef.current.offsetWidth / 2,
                y: event.clientY - dragRef.current.offsetHeight / 2,
            });
        }
    }

    function handleDragEnd(event: React.DragEvent<HTMLDivElement>): void {
        setIsDragging(false);
        // Add any additional logic you need when the drag ends
    }

    return (
        <div
            ref={dragRef}
            draggable
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{
                opacity: isDragging ? 0.5 : 1,
                position: "absolute",
                top: position.y,
                left: position.x,
            }}
        >
            <div className="cursor-move bg-emerald-600 p-4 rounded-md flex items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                </svg>
            {children}
            </div>
        </div>
    );
}

export default DragWrapper;
