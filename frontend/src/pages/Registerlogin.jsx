import React, { useState } from "react";
import "../styles/Registerlogin.css";
import Register from "../Components/Register";
import Login from "../Components/Login";
const Registerlogin = () => {
  const [show, setShow] = useState(false);
  return (
    <div className="Registerlogin">
      <div className="registerLgin-Content">
        <div className={show ? "imageanime1" : "imageanime"}>
          <img
            src="https://img.freepik.com/photos-gratuite/coup-moyen-homme-travaillant-tard-dans-nuit_23-2150171016.jpg?t=st=1709634217~exp=1709637817~hmac=3ba3412fb1ec2af1ac589fc99b81e1cd907a4e0146417534bbb81f29c0696a00&w=360"
            alt=""
          />
        </div>
        <div className="registerLgincontainer">
          <Login setShow={setShow} show={show} />
        </div>
        <div className="registerLgincontainer">
          <Register setShow={setShow} show={show} />
        </div>
      </div>
    </div>
  );
};

export default Registerlogin;
