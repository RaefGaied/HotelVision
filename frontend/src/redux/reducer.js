import { combineReducers } from "@reduxjs/toolkit";

import userSlice from "./userSlice"
import themeSlice from "./themeSlice"
import postSlice from "./postSlice"
import chatSlice from "./chatSlice"

const reducer = combineReducers({
    user: userSlice,
    theme: themeSlice,
    posts: postSlice,
    chat: chatSlice,
})

export { reducer };