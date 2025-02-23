import { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const SignUp = () => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/auth/signup', formData);

      console.log('Sign-up successful:', response.data);
    } catch (error) {
      console.error('There was an error during sign-up:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={handleChange}
          type='text'
          placeholder='Username'
          className='border p-3 rounded-lg'
          id='username'
        />
        <input
          onChange={handleChange}
          type='email'
          placeholder='Email'
          className='border p-3 rounded-lg'
          id='email'
        />
        <input
          onChange={handleChange}
          type='password'
          placeholder='Password'
          className='border p-3 rounded-lg'
          id='password'
        />

        <button
          // disabled={loading}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
        >
          {/* {loading ? 'Loading...' : 'Sign Up'} */}
          Sign Up
        </button>
      </form>
      <div className='flex gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to={'/sign-in'}>
          <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
