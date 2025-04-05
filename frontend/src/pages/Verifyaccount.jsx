import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { activateAccount } from "../redux/userSlice/userSlice";

const Verifyaccount = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const dispatch = useDispatch();
  console.log(token, "hhhhh");
  useEffect(() => {
    dispatch(activateAccount({ token: token }));
    setTimeout(() => {
      navigate("/");
    }, 1000);
  }, []);
  return <div>Verifyaccount</div>;
};

export default Verifyaccount;
