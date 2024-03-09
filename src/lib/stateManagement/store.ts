import { configureStore } from "@reduxjs/toolkit";
import commandsReducer from "@/lib/stateManagement/commandsSlice";
import drawingsReducer from "@/lib/stateManagement/drawingsSlice";

export default configureStore({
    reducer: {
        commands: commandsReducer,
        drawables: drawingsReducer,
    },
});