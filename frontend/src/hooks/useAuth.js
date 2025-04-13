import { useSelector } from "react-redux";

const useAuth = () => {
  const { user, status } = useSelector((state) => state.user);
  const isAuthenticated = Boolean(user);
  return { user, status, isAuthenticated };
};

export default useAuth;
