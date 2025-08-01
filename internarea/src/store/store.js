import { configureStore } from "@reduxjs/toolkit";
import userslice from "../Feature/Userslice";
import authSlice from "../Feature/AuthSlice";

export const store = configureStore({
  reducer: {
    user: userslice,
    auth: authSlice,
  },
});
