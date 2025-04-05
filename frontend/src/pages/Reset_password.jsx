import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetpassword } from "../redux/userSlice/userSlice";
import "../styles/Reset_password.css";
const Reset_password = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [err, seterr] = useState(false);
  const [err1, seterr1] = useState(false);

  const [password, setpassword] = useState("");
  const [password2, setpassword2] = useState("");
  const { token } = useParams();
  const [show, setshow] = useState(false);
  const [msg, setmsg] = useState(false);

  const confirmation = async () => {
    try {
      if (password === password2) {
        seterr(false);
      }
      if (password !== password2 || password == "") {
        seterr(true);
        seterr1(false);
      } else {
        const response = await dispatch(
          resetpassword({ token: token, password: password })
        );

        if (response.payload.success) {
        }
        setmsg(true);

        seterr1(false);
      }
    } catch (error) {
      seterr1(true);
    }
  };

  return (
    <div className="resetPassword">
      {!msg || err ? (
        <div className="restContent">
          <h4>Please provide the new password you would like to use.</h4>
          <div className="inputdiv">
            <input
              type={show ? "text" : "password"}
              placeholder="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
            />
            {!show ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-eye-fill"
                viewBox="0 0 16 16"
                onClick={() => setshow(!show)}
              >
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-eye-slash-fill"
                viewBox="0 0 16 16"
                onClick={() => setshow(!show)}
              >
                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
              </svg>
            )}
          </div>
          <div className="inputdiv">
            <input
              type={show ? "text" : "password"}
              placeholder="confirm password"
              value={password2}
              onChange={(e) => setpassword2(e.target.value)}
            />
          </div>

          <button onClick={confirmation}>Change password</button>
          {err && (
            <p style={{ color: "red" }}>
              The passwords you entered do not match or the password is less
              than 6 characters.
            </p>
          )}
          {err1 && (
            <p style={{ color: "red" }}>
              You are unable to change the password at this time. Please try
              again to change the password.{" "}
              <Link to="/forgotpassword" style={{ color: "#f39a36" }}>
                Reset password
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className="confirmMssg">
          <p>Password successfully changed</p>
          <Link to="/" className="sign">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

export default Reset_password;
