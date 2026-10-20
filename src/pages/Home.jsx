import React from "react";
import { Link } from "react-router-dom";

const Home = ({ user, error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg text-center">
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {user ? (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Welcome, {user.username}
            </h2>
            <p className="text-gray-600">Email: {user.email}</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Welcome!</h2>
            <p className="text-2xl font-bold mb-6 text-gray-800">
              Please log in or register
            </p>
            <div className="flex flex-col space-y-4">
              <Link
                className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 font-medium"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="w-full bg-gray-200 text-gray-800 p-3 rounded-md hover:bg-gray-300 font-medium"
                to="/register"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
