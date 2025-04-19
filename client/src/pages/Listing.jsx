import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useSelector } from 'react-redux';
import {
  FaBath, FaBed, FaChair, FaMapMarkerAlt, FaParking, FaShare,
} from 'react-icons/fa';
import Contact from '../components/Contact';
import { url } from '../utils/constants';
import 'swiper/css/bundle';

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);

  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`${url}/api/listing/get/${params.listingId}`);
        const data = await res.json();

        if (data.success === false) {
          setError(true);
        } else {
          setListing(data);
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.listingId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <p className='text-center my-7 text-2xl'>Loading...</p>;
  if (error || !listing) return <p className='text-center my-7 text-2xl'>Something went wrong!</p>;

  return (
    <main>
      <Swiper navigation>
        {listing.imageUrls.map((imgUrl) => (
          <SwiperSlide key={imgUrl}>
            <div
              className='h-[550px]'
              style={{
                background: `url(${imgUrl}) center no-repeat`,
                backgroundSize: 'cover',
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        onClick={handleShare}
        className='fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer'
      >
        <FaShare className='text-slate-500' />
      </div>

      {copied && (
        <p className='fixed top-[23%] right-[5%] z-10 bg-slate-100 px-3 py-1 rounded-md shadow'>
          Link copied!
        </p>
      )}

      <div className='flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4'>
        <p className='text-2xl font-semibold'>
          {listing.name} - ${' '}
          {listing.offer
            ? listing.discountPrice.toLocaleString()
            : listing.regularPrice.toLocaleString()}
          {listing.type === 'rent' && ' / month'}
        </p>

        <p className='flex items-center gap-2 text-slate-600 text-sm'>
          <FaMapMarkerAlt className='text-green-700' />
          {listing.address}
        </p>

        <div className='flex gap-4'>
          <span className='bg-red-900 text-white text-center p-1 rounded-md w-full max-w-[200px]'>
            {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          {listing.offer && (
            <span className='bg-green-900 text-white text-center p-1 rounded-md w-full max-w-[200px]'>
              ${listing.regularPrice - listing.discountPrice} OFF
            </span>
          )}
        </div>

        <p className='text-slate-800'>
          <span className='font-semibold text-black'>Description - </span>
          {listing.description}
        </p>

        <ul className='text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6'>
          <li className='flex items-center gap-1'>
            <FaBed className='text-lg' />
            {listing.bedrooms} {listing.bedrooms > 1 ? 'beds' : 'bed'}
          </li>
          <li className='flex items-center gap-1'>
            <FaBath className='text-lg' />
            {listing.bathrooms} {listing.bathrooms > 1 ? 'baths' : 'bath'}
          </li>
          <li className='flex items-center gap-1'>
            <FaParking className='text-lg' />
            {listing.parking ? 'Parking spot' : 'No Parking'}
          </li>
          <li className='flex items-center gap-1'>
            <FaChair className='text-lg' />
            {listing.furnished ? 'Furnished' : 'Unfurnished'}
          </li>
        </ul>

        {currentUser && listing.userRef !== currentUser._id && !contact && (
          <button
            onClick={() => setContact(true)}
            className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3 transition-opacity duration-200'
          >
            Contact landlord
          </button>
        )}

        {contact && <Contact listing={listing} />}
      </div>
    </main>
  );
}