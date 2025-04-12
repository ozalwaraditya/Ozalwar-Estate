import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase.js';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice.js';
import { url } from '../utils/constants.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const OAuth = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleClick = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const auth = getAuth(app);

        const result = await signInWithPopup(auth, provider);

        const response = await fetch( url + "/api/auth/google", {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            username: result.user.displayName,
            email: result.user.email,
            avatar: result.user.photoURL
        })
        });

        const data = await response.json();
        dispatch(signInSuccess(data.user));

        toast.success("Signed in successfully!");
        navigate("/");

    } catch (error) {
        toast.error("Google sign-in failed!");
        console.error("Google sign-in error:", error);
    }
    };

    return (
    <button
        type='button'
        onClick={handleGoogleClick}
        className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-90 hover:cursor-pointer'
    >
        Continue with Google
    </button>
    );
};

export default OAuth;