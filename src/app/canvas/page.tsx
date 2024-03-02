import Commander from "@/components/ui/Commander";
import Canvas from "@/components/ui/Canvas/Canvas";

export default function Page(): JSX.Element {
    return (
        <main className="overflow-hidden">
            <Commander />
            <Canvas />
        </main> 
    );
}
