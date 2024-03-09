import { configureStore } from "@reduxjs/toolkit";
import commandsReducer from "@/stateManagement/commandsSlice";
import drawingsReducer from "@/stateManagement/drawingsSlice";

export default configureStore({
    reducer: {
        commands: commandsReducer,
        drawables: drawingsReducer,
    },
});