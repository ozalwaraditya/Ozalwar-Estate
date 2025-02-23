import { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const SignIn = () => {
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
      const response = await axios.post('http://localhost:3000/api/auth/signin', formData, {
        withCredentials: true 
      });

      console.log('Sign-in successful:', response.data);
    } catch (error) {
      console.error('There was an error during sign-in:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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
  );
};

export default SignIn;
