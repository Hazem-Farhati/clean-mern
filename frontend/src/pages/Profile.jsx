import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/userSlice/userSlice";
import "../styles/Profile.css";
const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //get current user with selector
  const user = useSelector((state) => state.user?.user);
  console.log(user?.isActivated);
  return (
    <>
      {user?.isActivated == true ? (
        <div className="profile">
          Profile
          <h1>username: {user?.username}</h1>
          <h1>{user?.nom}</h1>
          <h1>{user?.prenom}</h1>
          <h1>{user?.email}</h1>
          <h4
            onClick={() => {
              dispatch(logout());
              navigate("/");
            }}
          >
            Logout
          </h4>
        </div>
      ) : (
        <div className="validateaccount">
          <div className="validate-content">
          Your account is currently inactive. Please check your email for
          instructions on how to activate it.
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
