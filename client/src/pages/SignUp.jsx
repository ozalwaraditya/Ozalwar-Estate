import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";

import { signInStart, signInSuccess, signInFailure } from "../redux/User/userSlice"

const SignUp = () => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    dispatch(signInStart());

    try {
      const response = await axios.post("http://localhost:4000/api/auth/sign-up", formData);

      if (!response.data.success) {
        setError(response.data.message);
        dispatch(signInFailure(response.data.message));
      } else {
        setSuccessMessage("Signup successful! Redirecting to login...");
        dispatch(signInSuccess(response.data.user));
        setTimeout(() => navigate("/sign-in"), 2000);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred.";
      setError(errorMessage);
      dispatch(signInFailure(errorMessage));
    }

    setLoading(false);
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={handleChange}
          type="text"
          placeholder="Username"
          className="border p-3 rounded-lg"
          id="username"
          required
        />
        <input
          onChange={handleChange}
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          id="email"
          required
        />
        <input
          onChange={handleChange}
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          id="password"
          required
        />
        <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-90 hover:cursor-pointer">
          {loading ? "Loading..." : "Sign Up"}
        </button>
      </form>

      {successMessage && <p className="text-green-500 mt-3">{successMessage}</p>}
      {error && <p className="text-red-500 mt-3">{error}</p>}

      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to="/sign-in">
          <span className="text-blue-700 hover:underline">Sign in</span>
        </Link>
      </div>
    </div>
  );
};

export default SignUp;