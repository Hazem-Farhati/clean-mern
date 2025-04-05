import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Forgot_password } from "../redux/userSlice/userSlice";
import { Navigate } from "react-router-dom";
import "../styles/Forgotpassword.css";
const Forgotpassword = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleForgotPassword = async () => {
    try {
      await dispatch(Forgot_password({ email }));
      setConfirm(true);
      setError(false);
    } catch (error) {
      setError(true);
      setConfirm(false);
    }
  };

  return (
    <div className="forgotpassword">
      <div className="forgot-Content">
        {!confirm && (
          <>
            <label>Please provide your email address.</label>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleForgotPassword}>Reset password</button>
          </>
        )}
        {error && <p style={{ color: "red" }}>Account does not exist</p>}{" "}
        {confirm && (
          <div className="msgconfirm">
            <p style={{ color: "green" }}>
              Please check your email to recover your password.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forgotpassword;
