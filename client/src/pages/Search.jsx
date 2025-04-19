import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url } from '../utils/constants';

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    searchTerm: '',
    type: '',
    parking: null,
    furnished: null,
    offer: null,
    sort: 'created_at',
    order: 'desc',
  });

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Load initial data from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTerm = urlParams.get('searchTerm') || '';
    const type = urlParams.get('type') || '';
    const parking = urlParams.get('parking') === 'true' ? true : null;
    const furnished = urlParams.get('furnished') === 'true' ? true : null;
    const offer = urlParams.get('offer') === 'true' ? true : null;
    const sort = urlParams.get('sort') || 'created_at';
    const order = urlParams.get('order') || 'desc';

    setFormData({ searchTerm, type, parking, furnished, offer, sort, order });

    const fetchListings = async () => {
      try {
        setLoading(true);
        setShowMore(false);

        const res = await axios.get(`${url}/api/listing/get?${urlParams.toString()}`);
        const data = res.data;

        if (data && Array.isArray(data.listings)) {
          setListings(data.listings); // Extract listings from the response
        } else {
          console.error('Listings data not found or not in expected format:', data);
          setListings([]); // Default to an empty array if the format is unexpected
        }

        setShowMore(data.listings.length > 8);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setListings([]); // Default to an empty array in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  // Handle input changes
  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;

    if (id === 'searchTerm') {
      setFormData((prev) => ({ ...prev, searchTerm: value }));
    } else if (['rent', 'sale', 'all'].includes(id)) {
      setFormData((prev) => ({ ...prev, type: id === 'all' ? '' : id }));
    } else if (id === 'sort_order') {
      const [sort, order] = value.split('_');
      setFormData((prev) => ({ ...prev, sort, order }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: checked ? true : null }));
    }
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();

    if (formData.searchTerm) searchParams.set('searchTerm', formData.searchTerm);
    if (formData.type) searchParams.set('type', formData.type);
    if (formData.parking) searchParams.set('parking', true);
    if (formData.furnished) searchParams.set('furnished', true);
    if (formData.offer) searchParams.set('offer', true);
    if (formData.sort) searchParams.set('sort', formData.sort);
    if (formData.order) searchParams.set('order', formData.order);

    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          {/* Search Term */}
          <div className="flex items-center gap-2">
            <label className="font-semibold whitespace-nowrap">Search Term:</label>
            <input
              type="text"
              id="searchTerm"
              className="border rounded-lg p-3 w-full"
              placeholder="Search..."
              value={formData.searchTerm}
              onChange={handleChange}
            />
          </div>

          {/* Type Selection */}
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Type:</label>
            {['all', 'rent', 'sale'].map((typeOption) => (
              <div key={typeOption} className="flex items-center gap-1">
                <input
                  type="radio"
                  id={typeOption}
                  name="type"
                  className="w-4 h-4"
                  onChange={handleChange}
                  checked={formData.type === (typeOption === 'all' ? '' : typeOption)}
                />
                <span className="capitalize">{typeOption}</span>
              </div>
            ))}
          </div>

          {/* Amenities */}
          <div className="flex gap-4 flex-wrap items-center">
            <label className="font-semibold">Amenities:</label>
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="parking"
                className="w-4 h-4"
                checked={formData.parking === true}
                onChange={handleChange}
              />
              <span>Parking</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="furnished"
                className="w-4 h-4"
                checked={formData.furnished === true}
                onChange={handleChange}
              />
              <span>Furnished</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="offer"
                className="w-4 h-4"
                checked={formData.offer === true}
                onChange={handleChange}
              />
              <span>Offer</span>
            </div>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <select
              id="sort_order"
              className="border rounded-lg p-3"
              value={`${formData.sort}_${formData.order}`}
              onChange={handleChange}
            >
              <option value="regularPrice_desc">Price high to low</option>
              <option value="regularPrice_asc">Price low to high</option>
              <option value="created_at_desc">Latest</option>
              <option value="created_at_asc">Oldest</option>
            </select>
          </div>

          <button type="submit" className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
            Search
          </button>
        </form>
      </div>

      {/* Listings Area */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b p-3 text-slate-700 mt-5">Listing Results:</h1>
        <div className="p-4 flex flex-wrap gap-4 justify-center">
          {loading && <p>Loading...</p>}
          {!loading && (!Array.isArray(listings) || listings.length === 0) && <p>No listings found.</p>}
          {!loading && Array.isArray(listings) && listings.map((listing) => (
            <div key={listing._id} className="border rounded-lg p-4 shadow w-full md:w-80">
              <img
                src={listing.imageUrls?.[0]}
                alt={listing.name}
                className="w-full h-40 object-cover rounded"
              />
              <h2 className="text-xl font-semibold mt-2">{listing.name}</h2>
              <p className="text-gray-600">{listing.description?.slice(0, 60)}...</p>
              <p className="font-semibold mt-1">₹{listing.regularPrice}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;