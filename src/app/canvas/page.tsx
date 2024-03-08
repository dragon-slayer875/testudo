"use client";
import Commander from "@/components/ui/Commander";
import Canvas from "@/components/ui/Canvas/Canvas";
import CanvasStore from "@/stateManagement/store";
import { Provider } from "react-redux";

export default function Page(): JSX.Element {
    return (
        <Provider store={CanvasStore}>
            <main className="overflow-hidden">
                <Commander />
                <Canvas />
            </main>
        </Provider>
    );
}
