import { createSlice } from "@reduxjs/toolkit";
import {user} from "../assets/data";


const initialState = {
  // The 'user' property will store user information retrieved from local storage, if available
  user: JSON.parse(window?.localStorage.getItem("user")) ?? {},
  
  // The 'edit' property represents whether the user is in edit mode
  edit: false,
};


const userSlice = createSlice({
  name: "user", 
  initialState, 
  reducers: {
    // Defined a reducer called 'login'
    login(state, action) {
      // Update the usr property in the state with the user data from the action payload
      state.user = action.payload;
      
      // Store the user data in the browser's local storage as a JSON string
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    
    // Define a reducer called 'logout'
    logout(state) {
      // Clear the user property in the state (user is logged out)
      state.user = null;
      
      // Remove the user item from local storage
      localStorage?.removeItem("user");
    },
    
    // Define a reducer called 'updateProfile'
    updateProfile(state, action) {
      // Update the edit property in the state with the value from th action payload
      state.edit = action.payload;
    },
  },
});


export default userSlice.reducer;

// Define an action creator function called 'UserLogin'
export function UserLogin(user) {
  // Return a function that takes 'dispatch' and 'getState' as arguments
  return (dispatch, getState) => {
    // Dispatch the 'login' action from the userSlice with the provided 'user' data
    dispatch(userSlice.actions.login(user));
  };
}

// Define an action creator function called 'UserLogout'
export function UserLogout() {
  // Return a function that takes 'dispatch' and 'getState' as arguments
  return (dispatch, getState) => {
    // Dispatch the 'logout' action from the userSlice
    dispatch(userSlice.actions.logout());
  };
}
export function updateProfile(val){
  return(dispatch, getState)=>{
    dispatch(userSlice.actions.updateProfile(val));
  }
}