import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getToken, removeToken, saveToken } from "../../services/token";

//register
export const userRegister = createAsyncThunk("user/register", async (user) => {
  try {
    let result = await axios.post(
      "http://localhost:5000/api/users/register",
      user
    );
    // console.log(result.data)
    return result.data;
  } catch (error) {
    console.log(error);
  }
});
//activate accounte
export const activateAccount = createAsyncThunk(
  "user/verify-account",
  async ({ token }) => {
    try {
      let result = axios.post(
        `http://localhost:5000/api/users/verify-account/${token}`
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  }
);
//login
export const userLogin = createAsyncThunk("user/login", async (user) => {
  try {
    let result = await axios.post(
      "http://localhost:5000/api/users/login",
      user
    );
    // console.log(result.data)
    return result.data;
  } catch (error) {
    console.log(error);
  }
});
//current user
export const userCurrent = createAsyncThunk("user/current", async () => {
  try {
    // Make sure you are passing the token properly
    const token = getToken(); // This should retrieve the token from localStorage or state
    if (!token) {
      throw new Error("No token found");
    }

    const result = await axios.get("http://localhost:5000/api/users/current", {
      headers: {
        Authorization: `Bearer ${token}`, // Ensure Bearer prefix is added
      },
    });

    return result.data;
  } catch (error) {
    console.log(error);
    throw error; // Make sure to throw the error so the action fails if something goes wrong
  }
});
export const getusers = createAsyncThunk("user/getall", async () => {
  try {
    let result = await axios.get(`http://localhost:5000/api/users/all`);
    console.log(result.data.users);
    return result?.data?.users;
    // console.log(result.data.data.users)
  } catch (error) {
    console.log(error);
  }
});

//forgot password
export const Forgot_password = createAsyncThunk(
  "user/forgot-password",
  async (email) => {
    try {
      let result = await axios.post(
        "http://localhost:5000/api/users/forgot-password",
        email
      );
      // console.log(result.data)
      return result.data;
    } catch (error) {
      console.log(error);
    }
  }
);
//reset password
export const resetpassword = createAsyncThunk(
  "user/reset-password",
  async ({ token, password }) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/users/reset-password/${token}`,
        { password }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw error; // Re-throw the error to propagate it to the Redux store
    }
  }
);

export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (googleUser) => {
    const res = await axios.post(
      "http://localhost:5000/api/users/google/callback",
      googleUser
    );
    const data = res.data;

    // Save token to localStorage
    localStorage.setItem("token", data.token);

    return data; // includes user + token
  }
);

const initialState = {
  user: null,
  status: null,
  users: null,
};
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state, action) => {
      state.user = null;
      removeToken();
    },
  },
  extraReducers: (builder) => {
    // register extra reducers
    builder
      .addCase(userRegister.pending, (state) => {
        state.status = "loading";
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(userRegister.rejected, (state) => {
        state.status = "fail";
      });
    // verify-account extra reducers
    builder
      .addCase(activateAccount.pending, (state) => {
        state.status = "loading";
      })
      .addCase(activateAccount.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(activateAccount.rejected, (state) => {
        state.status = "fail";
      });
    //forgot password
    builder
      .addCase(Forgot_password.pending, (state) => {
        state.status = "loading";
      })
      .addCase(Forgot_password.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(Forgot_password.rejected, (state) => {
        state.status = "fail";
      });

    // resetpassword extra reducers
    builder
      .addCase(resetpassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetpassword.fulfilled, (state, action) => {
        state.status = "success";
        state.resetStatus = action.payload.status;
        // localStorage.setItem("token", action.payload.token);
      })
      .addCase(resetpassword.rejected, (state) => {
        state.status = "fail";
      });
    // login extra reducers
    builder
      .addCase(userLogin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.status = "success";
        console.log("=========", action.payload);

        // Check if 'user' and 'token' properties exist in action.payload
        if (action.payload && action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          saveToken(action.payload.token);
        } else {
          console.error("Invalid payload structure:", action.payload);
          // Optionally handle the error or set state to an appropriate value
        }

        return state;
      })

      .addCase(userLogin.rejected, (state) => {
        state.status = "fail";
      });

    builder
      // current user cases
      .addCase(userCurrent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(userCurrent.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload?.user;
      })
      .addCase(userCurrent.rejected, (state) => {
        state.status = "fail";
      });

    builder
      // all  user
      .addCase(getusers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getusers.fulfilled, (state, action) => {
        state.status = "success";
        state.users = action.payload;
      })
      .addCase(getusers.rejected, (state) => {
        state.status = "fail";
      })
    
     .addCase(googleLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // 👈 Save user in Redux
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = "Google login failed";
      })
  },
});

// Action creators are generated for each case reducer function
export const { logout } = userSlice.actions;

export default userSlice.reducer;
