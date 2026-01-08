import { combineReducers } from "@reduxjs/toolkit";

import userSlice from "./userSlice"
import themeSlice from "./themeSlice"
import postSlice from "./postSlice"

const reducer = combineReducers({
    user: userSlice,
    theme: themeSlice,
    posts: postSlice,
})

export {reducer};