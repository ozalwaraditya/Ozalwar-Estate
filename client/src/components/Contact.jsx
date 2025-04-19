import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { url } from '../utils/constants';

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await axios.get(`${url}/api/user/${listing.userRef}`);
        setLandlord(res.data);
      } catch (error) {
        console.error('Failed to fetch landlord', error);
      }
    };

    if (listing?.userRef) {
      fetchLandlord();
    }
  }, [listing?.userRef]);

  const handleChange = (e) => setMessage(e.target.value);

  return landlord ? (
    <div className='flex flex-col gap-2 mt-4'>
      <p>
        Contact <span className='font-semibold'>{landlord.username}</span> about{' '}
        <span className='font-semibold'>{listing.name.toLowerCase()}</span>
      </p>
      <textarea
        id='message'
        rows='3'
        value={message}
        onChange={handleChange}
        placeholder='Enter your message here...'
        className='w-full border p-3 rounded-lg resize-none'
      />
      <Link
        to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${encodeURIComponent(
          message
        )}`}
        className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95 transition-opacity duration-200'
      >
        Send Message
      </Link>
    </div>
  ) : null;
}