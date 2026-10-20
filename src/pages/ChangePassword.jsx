import React, { useState } from "react";
import api from "../api";
import { validateNewPassword } from "../utils/passwordValidation";

const ChangePassword = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const passwordError = validateNewPassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await api.patch("/users/change-password", formData);
      if (!response.data?.user) {
        throw new Error(
          "The server returned an invalid password-change response.",
        );
      }
      setUser(response.data.user);
      setFormData({ currentPassword: "", newPassword: "" });
      setSuccess("Your password has been changed.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to change your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Change password
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Update the password for {user.email}.
        </p>
        {error && (
          <p role="alert" className="text-red-500 mb-4 text-sm">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="text-green-700 mb-4 text-sm">
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="current-password"
              className="block text-gray-600 text-sm font-medium mb-1"
            >
              Current password
            </label>
            <input
              id="current-password"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none focus:border-blue-400"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="new-password"
              className="block text-gray-600 text-sm font-medium mb-1"
            >
              New password
            </label>
            <input
              id="new-password"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none focus:border-blue-400"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <span className="mt-1 block text-xs text-gray-500">
              At least 8 characters and no more than 72 UTF-8 bytes.
            </span>
          </div>
          <button
            className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 font-medium cursor-pointer disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating password..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
