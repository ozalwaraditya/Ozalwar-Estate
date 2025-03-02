import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { signInStart, signInSuccess, signInFailure } from "../redux/user/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { FaCheckCircle } from 'react-icons/fa';

const SignIn = () => {
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();  

  const { currentUser, loading, error } = useSelector((state) => state.user);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(signInStart());

      const response = await axios.post('http://localhost:3000/api/auth/signin', formData, {
        withCredentials: true
      });

      dispatch(signInSuccess(response.data)); 
      console.log('Sign-in successful:', response.data);
    } catch (error) {
      console.error('There was an error during sign-in:', error.response ? error.response.data : error.message);
      dispatch(signInFailure(error.response ? error.response.data : error.message)); 
    }
  };

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  return (
    <div className="relative">
      {/* Full-screen overlay and background blur effect when loading */}
      {loading && (
        <div className="overlay absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center z-10">
          <div className="loader"></div>
        </div>
      )}

      <div className={`p-3 max-w-lg mx-auto ${loading ? 'blur-sm' : ''}`}>
        <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>

        {/* Display error message */}
        {error && (
          <div className="text-red-500 text-center mb-4">
            {error} {/* Show the error message */}
          </div>
        )}

        {/* Success message with a checkmark */}
        {currentUser && !loading && !error && (
          <div className="text-green-500 text-center mb-4 flex justify-center items-center">
            <FaCheckCircle className="text-3xl mr-2" />
            <span>Sign-in Successful!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            onChange={handleChange}
            type='email'
            placeholder='Email'
            className='border p-3 rounded-lg'
            id='email'
            value={formData.email} // Controlled input for email
          />
          <input
            onChange={handleChange}
            type='password'
            placeholder='Password'
            className='border p-3 rounded-lg'
            id='password'
            value={formData.password} // Controlled input for password
          />
          <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'>
            Sign In
          </button>
        </form>

        <div className='flex gap-2 mt-5'>
          <p>Don't have an account?</p>
          <Link to={'/sign-up'}>
            <span className='text-blue-700'>Sign up</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
