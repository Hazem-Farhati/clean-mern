import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userLogin } from "../redux/userSlice/userSlice"; // Your user login action
import { saveToken } from "../services/token"; // Utility to save token

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token"); // Extract the token from the URL

    if (token) {
      // Save the token in localStorage (or in Redux state)
      saveToken(token);

      // Dispatch the login action with the token to store user data
      dispatch(userLogin({ token })).then(() => {
        navigate("/profile"); // Redirect to profile page
      });
    } else {
      console.error("No token found in URL.");
    }
  }, [dispatch, navigate]);

  return (
    <div>
      <h1>Logging you in...</h1>
      <p>Redirecting to your profile...</p>
    </div>
  );
};

export default OAuthSuccess;
