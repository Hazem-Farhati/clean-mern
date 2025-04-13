import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userRegister } from "../redux/userSlice/userSlice";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "../styles/Register.css";

const Register = ({ show, setShow }) => {
  const [register, setRegister] = useState({
    username: "",
    nom: "",
    prenom: "",
    email: "",
    password: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [lastnameError, setLastnameError] = useState("");
  const [firstnameError, setfirstnameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = async () => {
    // Validate input fields
    if (register.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
    } else {
      setPasswordError("");
    }
    if (register.username === "") {
      setUsernameError("Username is required.");
    } else {
      setUsernameError("");
    }
    if (register.prenom === "") {
      setLastnameError("Lastname is required.");
    } else {
      setLastnameError("");
    }
    if (register.nom === "") {
      setfirstnameError("Firstname is required.");
    } else {
      setfirstnameError("");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(register.email)) {
      setEmailError("Email is incorrect.");
    } else {
      setEmailError("");
    }

    if (
      register.password.length >= 6 &&
      register.username !== "" &&
      register.nom !== "" &&
      register.prenom !== "" &&
      emailRegex.test(register.email)
    ) {
      try {
        await dispatch(userRegister(register));
        navigate("/profile");
      } catch (error) {
        if (
          error.response &&
          error.response.data.message === "Email is already registered."
        ) {
          setEmailError("Email already exists. Please use another email.");
        } else {
          setEmailError("An error occurred. Please try again.");
        }
      }
    }
  };

  // Handle Google login response
  const handleGoogleLogin = async (response) => {
    try {
      const googleToken = response.credential;
      console.log(googleToken, "googleToken");
      // Decode the Google token to get user details (e.g., email, name)
      const decodedToken = jwtDecode(googleToken);
      const { email, name } = decodedToken;
      const [prenom, nom] = name.split(" "); // Split name into first and last name

      // Prepare user data with Google login info
      const googleUser = {
        username: email.split("@")[0], // Use email as username
        nom, // Last name from Google
        prenom, // First name from Google
        email, // Email from Google
        password: "defaultPassword123", // Set a default password or leave it empty
        authType: "google", // Mark as Google auth type
        isActivated: true,
      };

      // Send the data to the backend for registration
      try {
        await dispatch(userRegister(googleUser));
        navigate("/profile");
      } catch (error) {
        if (
          error.response &&
          error.response.data.message === "Email is already registered."
        ) {
          setEmailError("Email already exists. Please use another email.");
        } else {
          setEmailError(
            "An error occurred during Google login. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <div className="registerLogin_box">
      <form onSubmit={(e) => e.preventDefault()}>
        <h1>Create an account</h1>
        <label>
          Username: <label style={{ color: "red" }}>{usernameError}</label>
        </label>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) =>
            setRegister({
              ...register,
              username: e.target.value,
            })
          }
        />
        <label>
          FirstName: <label style={{ color: "red" }}>{firstnameError}</label>
        </label>
        <input
          type="text"
          placeholder="First Name"
          onChange={(e) =>
            setRegister({
              ...register,
              prenom: e.target.value,
            })
          }
        />
        <label>
          LastName: <label style={{ color: "red" }}>{lastnameError}</label>
        </label>
        <input
          type="text"
          placeholder="Last Name"
          onChange={(e) =>
            setRegister({
              ...register,
              nom: e.target.value,
            })
          }
        />
        <label>
          Email: <label style={{ color: "red" }}>{emailError}</label>
        </label>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setRegister({
              ...register,
              email: e.target.value,
            })
          }
        />
        <label>
          Password: <label style={{ color: "red" }}>{passwordError}</label>
        </label>
        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setRegister({
              ...register,
              password: e.target.value,
            })
          }
        />
        <button
          className="submit"
          onClick={handleRegister} // Handle regular registration
        >
          Register
        </button>

        <h5>
          You already have an account{" "}
          <span style={{ color: "#f39a36" }} onClick={() => setShow(!show)}>
            Sign in
          </span>
        </h5>

        {/* Google OAuth Button */}
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => console.log("Google Login Error")}
        />
      </form>
    </div>
  );
};

export default Register;
