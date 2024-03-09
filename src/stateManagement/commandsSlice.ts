import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ElementInfo } from "@/components/ui/Canvas/Canvas";
import rough from "roughjs/bin/rough";

type commanderStateType = {
    commands: {
        lastCoordinates: { x: number; y: number };
        angle: {
            last: number;
            current: number;
        };
        color: {
            last: string;
            current: string;
        };
        commanderDrawings: ElementInfo[];
        commanderStateIndex: number;
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
        lastCoordinates: {
            x: 0,
            y: 0,
        },
        angle: {
            last: 0,
            current: 0,
        },
        color: {
            last: "black",
            current: "black",
        },
        commanderDrawings: [] as ElementInfo[],
        commanderStateIndex: -1,
    },
    reducers: {
        forward: (state, action: PayloadAction<number>) => {
            const newCoordinates = giveNewCoordinates(
                state.lastCoordinates.x,
                state.lastCoordinates.y,
                state.angle.current,
                action.payload
            );
            // if (state.commanderStateIndex === -1)
            //     state.commanderStateIndex += 1;
            // else {
            //     state.commanderDrawings = state.commanderDrawings.slice(
            //         state.commanderStateIndex + 1
            //     );
            //     state.commanderStateIndex += 1
            // }
            state.commanderDrawings.push(
                createElement(
                    state.lastCoordinates.x,
                    state.lastCoordinates.y,
                    newCoordinates.x,
                    newCoordinates.y
                )
            );
            state.lastCoordinates = newCoordinates;
        },
        backward: (state, action: PayloadAction<number>) => {
            const newCoordinates = giveNewCoordinates(
                state.lastCoordinates.x,
                state.lastCoordinates.y,
                state.angle.current + 180,
                action.payload
            );
            // if (state.commanderStateIndex === -1)
            //     state.commanderStateIndex += 1;
            // else {
            //     state.commanderDrawings = state.commanderDrawings.slice(
            //         state.commanderStateIndex + 1
            //     );
            // }
            state.commanderDrawings.push(
                createElement(
                    state.lastCoordinates.x,
                    state.lastCoordinates.y,
                    newCoordinates.x,
                    newCoordinates.y
                )
            );
            state.lastCoordinates = newCoordinates;
        },
        rotate: (state, action: PayloadAction<number>) => {
            state.angle.current += action.payload;
        },
        setCoordinates: (
            state,
            action: PayloadAction<{ x: number; y: number }>
        ) => {
            state.lastCoordinates = action.payload;
        },
        undo: (state) => {
            state.commanderStateIndex -= 1;
        },
        redo: (state) => {
            state.commanderStateIndex += 1;
        },
    },
});

export const selectCommands = (state: commanderStateType) => state.commands;
export const { forward, backward, rotate, undo, redo, setCoordinates } =
    commandsSlice.actions;
export default commandsSlice.reducer;
