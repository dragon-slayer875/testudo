import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ElementInfo } from "@/components/ui/Canvas/Canvas";
import rough from "roughjs/bin/rough";

type commanderStateInstancesType = {
    coordinates: { x: number; y: number };
    angle: number;
    color: string;
    drawingsIndex: number;
};

type commanderStateType = {
    commands: {
        coordinates: { x: number; y: number };
        angle: number;
        color: string;
        drawings: ElementInfo[];
        commanderStateInstances: commanderStateInstancesType[];
        drawingsIndex: number;
        instanceIndex: number;
    };
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

function giveNewCoordinates(
    x: number,
    y: number,
    angle: number,
    distance: number
): { x: number; y: number } {
    return {
        x: x - distance * Math.sin((angle * Math.PI) / 180),
        y: y - distance * Math.cos((angle * Math.PI) / 180),
    };
}

export const commandsSlice = createSlice({
    name: "commands",
    initialState: {
        coordinates: {
            x: 0,
            y: 0,
        },
        angle: 0,
        color: "black",
        drawings: [] as ElementInfo[],
        commanderStateInstances: [
            {
                coordinates: { x: 0, y: 0 },
                angle: 0,
                color: "black",
                drawingsIndex: 0,
            },
        ] as commanderStateInstancesType[],
        drawingsIndex: 0,
        instanceIndex: 0,
    },
    reducers: {
        forward: (state, action: PayloadAction<number>) => {
            const newCoordinates = giveNewCoordinates(
                state.coordinates.x,
                state.coordinates.y,
                state.angle,
                action.payload
            );
            state.drawings = state.drawings.slice(0, state.drawingsIndex);
            state.drawingsIndex += 1;
            state.drawings.push(
                createElement(
                    state.coordinates.x,
                    state.coordinates.y,
                    newCoordinates.x,
                    newCoordinates.y
                )
            );
            state.coordinates = newCoordinates;
            state.instanceIndex += 1;
            state.commanderStateInstances = state.commanderStateInstances.slice(
                0,
                state.instanceIndex
            );
            state.commanderStateInstances.push({
                coordinates: state.coordinates,
                angle: state.angle,
                color: state.color,
                drawingsIndex: state.drawingsIndex,
            });
        },
        backward: (state, action: PayloadAction<number>) => {
            const newCoordinates = giveNewCoordinates(
                state.coordinates.x,
                state.coordinates.y,
                state.angle + 180,
                action.payload
            );
            state.drawings = state.drawings.slice(0, state.drawingsIndex);
            state.drawingsIndex += 1;
            state.drawings.push(
                createElement(
                    state.coordinates.x,
                    state.coordinates.y,
                    newCoordinates.x,
                    newCoordinates.y
                )
            );
            state.coordinates = newCoordinates;
            state.commanderStateInstances.push({
                coordinates: state.coordinates,
                angle: state.angle,
                color: state.color,
                drawingsIndex: state.drawingsIndex,
            });
            state.instanceIndex += 1;
        },
        rotate: (state, action: PayloadAction<number>) => {
            state.angle += action.payload;
            state.commanderStateInstances.push({
                coordinates: state.coordinates,
                angle: state.angle,
                color: state.color,
                drawingsIndex: state.drawingsIndex,
            });
            state.instanceIndex += 1;
        },
        setCoordinates: (
            state,
            action: PayloadAction<{ x: number; y: number }>
        ) => {
            state.coordinates = action.payload;
        },
        undo: (state) => {
            state.instanceIndex -= 1;
            state.coordinates =
                state.commanderStateInstances[state.instanceIndex].coordinates;
            state.angle =
                state.commanderStateInstances[state.instanceIndex].angle;
            state.color =
                state.commanderStateInstances[state.instanceIndex].color;
            state.drawingsIndex =
                state.commanderStateInstances[
                    state.instanceIndex
                ].drawingsIndex;
        },
        redo: (state) => {
            state.instanceIndex += 1;
            state.coordinates =
                state.commanderStateInstances[state.instanceIndex].coordinates;
            state.angle =
                state.commanderStateInstances[state.instanceIndex].angle;
            state.color =
                state.commanderStateInstances[state.instanceIndex].color;
            state.drawingsIndex =
                state.commanderStateInstances[
                    state.instanceIndex
                ].drawingsIndex;
        },
    },
});

export const selectCommands = (state: commanderStateType) => state.commands;
export const { forward, backward, rotate, undo, redo, setCoordinates } =
    commandsSlice.actions;
export default commandsSlice.reducer;
