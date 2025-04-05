import "./App.css";
import { Route, Routes } from "react-router-dom";
import Profile from "./Pages/Profile";
import Register from "./Components/Register";
import { getusers, userCurrent } from "./redux/userSlice/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Verifyaccount from "./Pages/Verifyaccount";
import Forgotpassword from "./Pages/Forgotpassword";
import Reset_password from "./Pages/Reset_password";
import Registerlogin from "./Pages/Registerlogin";

// --------------------end importation------------------
function App() {
  //verify user is logged in
  const isAuth = localStorage.getItem("token");
  //declaration dipatch
  const dispatch = useDispatch();

  //useEffect & dispatch to get data
  useEffect(() => {
    if (isAuth) {
      dispatch(userCurrent());
    }
    dispatch(getusers());
  }, [dispatch]);
  const users = useSelector((state) => state.user?.users);
  console.log(users, "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
  return (
    <div>
      <div className="app">
        <Routes>
          {/* home route */}
          <Route path="/" element={<Registerlogin />} /> {/* Register route */}
          <Route path="/profile" element={<Profile />} /> {/* Profile route */}
          <Route path="/api/users/verify-account/:token" element={<Verifyaccount />} />
          {/*verification compte */}
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          {/* forgot password */}
          <Route path="/api/users/reset-password/:token" element={<Reset_password />} />
          {/* reset password */}
        </Routes>
      </div>
    </div>
  );
}

export default App;
