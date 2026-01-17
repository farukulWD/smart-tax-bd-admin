import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  user: null as any,
  role: null as string | null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.role = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
