import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, children }) =>
  user ? children : <Navigate to="/login" replace />;

export default ProtectedRoute;
