import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Header from './components/Header';
import { Toaster } from 'react-hot-toast';
import PrivateRouter from './components/PrivateRouter';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';


const App = () => {
  return (
    <>
      <BrowserRouter>
        <Toaster position="top-right" reverseOrder={false} />
        <Header/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/sign-up' element={<SignUp/>}/>
          <Route path='/sign-in' element={<SignIn/>}/>
          <Route element={<PrivateRouter />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-listing" element={<CreateListing/>} />
          <Route path="/update-listing/:listingId" element={<EditListing/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App