import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [logoutSuccess, setLogoutSuccess] = useState("");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError("");
    setLogoutSuccess("");
    try {
      await onLogout();
      setLogoutSuccess("Logged out successfully.");
    } catch (error) {
      setLogoutError(
        error.response?.data?.message ||
          error.message ||
          "Logout failed. Your session was not confirmed as revoked.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-lg font-bold">
          MERN Auth
        </Link>
        <div>
          {user ? (
            <>
              <Link
                className="text-white mx-2 hover:underline"
                to="/change-password"
              >
                Change password
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600 disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link className="text-white mx-2 hover:underline" to="/login">
                Login
              </Link>
              <Link className="text-white mx-2 hover:underline" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      {logoutError && (
        <p role="alert" className="container mx-auto mt-2 text-sm text-red-200">
          {logoutError}
        </p>
      )}
      {logoutSuccess && (
        <p role="status" className="container mx-auto mt-2 text-sm text-green-200">
          {logoutSuccess}
        </p>
      )}
    </nav>
  );
};

export default Navbar;
