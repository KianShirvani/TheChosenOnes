import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const isLoggedIn = Boolean(localStorage.getItem("userToken"));
  const userRole = localStorage.getItem("role");

  return isLoggedIn && userRole === "admin" ? children : <Navigate to="/" />;
};

export default AdminRoute;
