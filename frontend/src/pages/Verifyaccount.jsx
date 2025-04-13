import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { activateAccount } from "../redux/userSlice/userSlice";

const Verifyaccount = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const dispatch = useDispatch();
 useEffect(() => {
   if (token) {
  console.log(token, "hhhhh");
    
    // saveToken(toke n);  // Save the token to localStorage or Redux
    dispatch(activateAccount({ token }));  // Optionally, update Redux state
            localStorage.setItem("token",token);

    setTimeout(() => {
      navigate("/");  // Redirect to profile after successful verification
    }, 1000);
  }
}, [token, dispatch, navigate]);

  return <div>Verifyaccount</div>;
};

export default Verifyaccount;
