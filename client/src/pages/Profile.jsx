import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDownloadURL,  getStorage,  ref,  uploadBytesResumable,} from "firebase/storage";
import { app } from "../firebase";
import {  deleteUserFailure,  deleteUserStart,  deleteUserSuccess,  updateUserFailure,  updateUserStart,  updateUserSuccess, signOutUserFailure, signOutUserSuccess, signOutUserStart} from "../redux/user/userSlice";
import axios from "axios";
import { url } from "../utils/constants.js";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Profile = () => {
  const fileRef = useRef(null);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
        toast.error("Image upload failed. Try again or use a smaller file.");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
          setUploadSuccess(true);
          toast.success("Image uploaded successfully!");
        });
      }
    );
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      dispatch(deleteUserStart());
  
      const response = await axios.delete(`${url}/api/user/delete/${currentUser._id}`, {
        withCredentials: true,
      });
  
      dispatch(deleteUserSuccess(response.data.message));
      toast.success("User deleted successfully");
  
      navigate('/sign-in')
  
    } catch (error) {
      dispatch(deleteUserFailure(error.response?.data?.message || error.message));
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };
  
  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      dispatch(signOutUserStart());
  
      const response = await axios.get(`${url}/api/auth/sign-out`, null, {
        withCredentials: true,
      });
  
      dispatch(signOutUserSuccess());
      navigate("/sign-in");
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateUserStart());
    const toastId = toast.loading("Updating profile...");
  
    try {
      const response = await axios.post(
        `${url}/api/user/update/${currentUser._id}`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          avatar: formData.avatar,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
  
      dispatch(updateUserSuccess(response.data.user));
      toast.success("Profile updated successfully!", { id: toastId });
  
    } catch (error) {
      dispatch(updateUserFailure(error.response?.data?.message || error.message));
      toast.error(
        `Error: ${error.response?.data?.message || error.message}`,
        { id: toastId }
      );
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          hidden
          accept="image/*"
          ref={fileRef}
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar || "/default-avatar.png"}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />

        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">
              Error: Image must be less than 2MB
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image uploaded!</span>
          ) : uploadSuccess ? (
            <span className="text-green-700">Upload successful!</span>
          ) : (
            ""
          )}
        </p>

        <input
          type="text"
          id="username"
          placeholder="Username"
          className="border p-3 rounded-lg"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <input
          type="email"
          id="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <input
          type="password"
          id="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <button
          type="submit"
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95"
        >
          Update
        </button>

        <Link
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
          to={'/create-listing'}
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-5">
        <span onClick={handleDelete} className="text-red-700 cursor-pointer">Delete account</span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">Sign out</span>
      </div>

      <button className="text-green-700 w-full mt-4">Show Listings</button>

      <div className="flex flex-col gap-4">
        <h1 className="text-center mt-7 text-2xl font-semibold">
          Your Listings
        </h1>

        <div className="border rounded-lg p-3 flex justify-between items-center gap-4">
          <a href="/listing/123">
            <img
              src="https://via.placeholder.com/100"
              alt="listing"
              className="h-16 w-16 object-contain"
            />
          </a>
          <a
            href="/listing/123"
            className="text-slate-700 font-semibold hover:underline truncate flex-1"
          >
            <p>Sample Listing</p>
          </a>
          <div className="flex flex-col items-center">
            <button className="text-red-700 uppercase">Delete</button>
            <a href="/update-listing/123">
              <button className="text-green-700 uppercase">Edit</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;