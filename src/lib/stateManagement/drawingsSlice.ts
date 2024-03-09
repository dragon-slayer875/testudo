import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ElementInfo } from "@/lib/types";

type drawingsStateType = {
    drawables: {
        drawables: ElementInfo[];
    };
};

export const drawingsSlice = createSlice({
    name: "drawables",
    initialState: {
        drawables: [] as ElementInfo[],
    },
    reducers: {
        addDrawable: (state, action: PayloadAction<ElementInfo> ) => {
            state.drawables.push(action.payload);
        },
        updateLastDrawable: (state, action: PayloadAction<ElementInfo>) => {
            state.drawables[state.drawables.length - 1] = action.payload;
        },
        removeDrawable: (state, action) => {
            state.drawables = state.drawables.filter(
                (drawable) => drawable !== action.payload
            );
        },
    },
});

export const selectDrawings = (state: drawingsStateType) => state.drawables.drawables;
export const { addDrawable, updateLastDrawable, removeDrawable } = drawingsSlice.actions;
export default drawingsSlice.reducer;