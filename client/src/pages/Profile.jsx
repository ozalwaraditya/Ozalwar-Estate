import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, updateUserFailure, updateUserStart, updateUserSuccess, signOutUserFailure, signOutUserSuccess, signOutUserStart } from "../redux/user/userSlice";
import axios from "axios";
import { url } from "../utils/constants.js";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2

const Profile = () => {
  const fileRef = useRef(null);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [userListings, setUserListings] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [showListingSection, setShowListingSection] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (file) handleFileUpload(file);
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      () => {
        setFileUploadError(true);
        toast.error("Image upload failed.");
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateUserStart());
    const toastId = toast.loading("Updating profile...");

    try {
      const res = await axios.post(
        `${url}/api/user/update/${currentUser._id}`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          avatar: formData.avatar,
        },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      dispatch(updateUserSuccess(res.data.user));
      toast.success("Profile updated", { id: toastId });
    } catch (err) {
      dispatch(updateUserFailure(err.response?.data?.message || err.message));
      toast.error("Failed to update profile", { id: toastId });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will delete your account permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete my account!",
    });

    if (result.isConfirmed) {
      try {
        dispatch(deleteUserStart());
        const res = await axios.delete(`${url}/api/user/delete/${currentUser._id}`, {
          withCredentials: true,
        });
        dispatch(deleteUserSuccess(res.data.message));
        toast.success("User deleted successfully!");
        navigate("/sign-in");
      } catch (err) {
        dispatch(deleteUserFailure(err.response?.data?.message || err.message));
        toast.error("Failed to delete account");
      }
    }
  };

  const handleSignOut = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, sign out",
    });

    if (result.isConfirmed) {
      try {
        dispatch(signOutUserStart());
        await axios.get(`${url}/api/auth/sign-out`, { withCredentials: true });
        dispatch(signOutUserSuccess());
        navigate("/sign-in");
      } catch (err) {
        dispatch(signOutUserFailure(err.message));
      }
    }
  };

  const handleShowListings = async () => {
    const toastId = toast.loading("Fetching your listings...");
    setShowListingSection(true);

    try {
      setShowListingsError(false);
      const res = await axios.get(`${url}/api/user/listings/${currentUser._id}`, {
        withCredentials: true,
      });
      setUserListings(res.data);
      toast.success("Listings loaded", { id: toastId });
    } catch (err) {
      console.error("Listing fetch failed:", err);
      setShowListingsError(true);
      toast.error("Failed to load listings", { id: toastId });
    }
  };

  const handleListingDelete = async (listingId) => {
    const toastId = toast.loading("Deleting listing...");

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this listing?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          `${url}/api/listing/delete/${listingId}`,
          {},
          { withCredentials: true }
        );

        toast.success("Listing deleted successfully!", { id: toastId });
        setUserListings(userListings.filter((listing) => listing._id !== listingId));
      } catch (error) {
        console.error("Delete failed", error);
        toast.error("Delete failed, please try again", { id: toastId });
      }
    } else {
      toast.dismiss(toastId); // Dismiss loading toast if canceled
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
            <span className="text-red-700">Image upload failed</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Upload complete!</span>
          ) : uploadSuccess ? (
            <span className="text-green-700">Upload success!</span>
          ) : null}
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
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to="/create-listing"
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-5">
        <span onClick={handleDelete} className="text-red-700 cursor-pointer">Delete account</span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">Sign out</span>
      </div>

      <button
        onClick={handleShowListings}
        className="text-green-700 w-full mt-4 hover:opacity-95 hover:cursor-pointer"
      >
        Show Listings
      </button>

      {showListingsError && (
        <p className="text-red-500 mt-5">There was an error fetching the listings.</p>
      )}

{showListingSection && userListings.length > 0 ? (
  userListings.map((listing) => (
    <div
      key={listing._id}
      className="border rounded-lg p-3 flex justify-between items-center gap-4"
    >
      <a href={`/listing/${listing._id}`}>
        <img
          src={listing.imageUrls?.[0] || "/placeholder.png"}
          alt={listing.name}
          className="h-16 w-16 object-contain"
        />
      </a>
      <a
        href={`/listing/${listing._id}`}
        className="text-slate-700 font-semibold hover:underline truncate flex-1"
      >
        <p>{listing.name}</p>
      </a>
      <div className="flex flex-col items-center">
        <button
          onClick={() => handleListingDelete(listing._id)}
          className="text-red-700 uppercase"
        >
          Delete
        </button>
        <a href={`/update-listing/${listing._id}`}>
          <button className="text-green-700 uppercase">Edit</button>
        </a>
      </div>
    </div>
  ))
) : showListingSection && userListings.length === 0 ? (
  <p className="text-slate-500 text-center">No listings found.</p>
) : null}

    </div>
  );
};

export default Profile;