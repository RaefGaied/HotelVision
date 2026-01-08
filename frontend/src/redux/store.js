import { configureStore } from "@reduxjs/toolkit";
import {reducer} from "./reducer";


const store  = configureStore({
    reducer,
})

const {dispatch} = store;

export {store, dispatch};