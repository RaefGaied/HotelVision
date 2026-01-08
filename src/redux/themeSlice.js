import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // The 'theme' property will store the selected theme for the application

    // Try to retrieve the 'theme' item from the browser's local storage and parse it as JSON.
    // If the 'theme' item doesn't exist or is null, the default value "light" will be used.
    theme: JSON.parse(window?.localStorage.getItem("theme")) ?? "light",
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme(state, action) {
            state.theme = action.payload;
            localStorage.setItem("theme", JSON.stringify(action.payload))
        }
    }
})


export default themeSlice.reducer;

// Define an action creator function called 'SetTheme'
export function SetTheme(value) {
    // Return a function that takes 'dispatch' as an argument
    return (dispatch) => {
        // Dispatch the 'setTheme' action from the themeSlice with the provided 'value'
        dispatch(themeSlice.actions.setTheme(value));
    };
}