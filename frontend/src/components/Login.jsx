import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { userLogin, googleLogin } from "../redux/userSlice/userSlice"; // Import your googleLogin action
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google"; // Import GoogleLogin component

const Login = ({ show, setShow }) => {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle regular login with email and password
  const handleLogin = async () => {
    try {
      setError("");

      const response = await dispatch(userLogin(login));

      if (response.payload.token) {
        navigate("/profile");
      }
    } catch (error) {
      setError("Email or password incorrect.");
      console.error("Login error:", error);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async (response) => {
    try {
      const googleToken = response.credential;
      const googleUser = { token: googleToken };

      const googleResponse = await dispatch(googleLogin(googleUser));

      if (googleResponse.payload.token) {
        navigate("/profile");
      }
    } catch (error) {
      setError("Google login failed. Please try again.");
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="registerLogin_box">
      <form onSubmit={(e) => e.preventDefault()}>
        <h1>SIGN IN</h1>
        {error && <label style={{ color: "red" }}>{error}</label>}

        <label>Email:</label>
        <input
          type="email"
          placeholder="EMAIL"
          value={login.email}
          onChange={(e) => setLogin({ ...login, email: e.target.value })}
        />

        <label>Password:</label>
        <input
          type="password"
          placeholder="PASSWORD"
          value={login.password}
          onChange={(e) => setLogin({ ...login, password: e.target.value })}
        />

        <button className="submit" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <h5>
          You don't have an account?{" "}
          <span style={{ color: "#f39a36" }} onClick={() => setShow(!show)}>
            Sign up
          </span>
        </h5>

        <h5>
          Forgot your password?{" "}
          <Link
            to="/forgotpassword"
            style={{ color: "#f39a36", textDecoration: "none" }}
          >
            Reset password
          </Link>
        </h5>

        {/* Google OAuth Button */}
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setError("Google Login failed. Please try again.")}
        />
      </form>
    </div>
  );
};

export default Login;
