import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import api, { SESSION_EXPIRED_EVENT } from "./api";
import Navbar from "./components/Navbar";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ChangePassword from "./pages/ChangePassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    const response = await api.post("/users/logout");
    if (response.data?.message !== "Logged out successfully") {
      throw new Error("The server did not confirm that you were logged out.");
    }
    setUser(null);
  };

  useEffect(() => {
    let isMounted = true;

    const handleSessionExpired = () => {
      if (isMounted) {
        setUser(null);
        setError("Your session has expired. Please sign in again.");
      }
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    const restoreSession = async () => {
      try {
        const response = await api.get("/users/me");
        if (isMounted) setUser(response.data);
      } catch (requestError) {
        if (isMounted) {
          setUser(null);
          if (!requestError.response) {
            setError("Unable to connect to the authentication server.");
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} error={error} />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Login setUser={setUser} setAppError={setError} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Register setUser={setUser} setAppError={setError} />
            )
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute user={user}>
              <ChangePassword user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
