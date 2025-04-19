import { useEffect, useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { url } from '../utils/constants';

export default function EditListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { listingId } = useParams();

  const [formData, setFormData] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await axios.get(`${url}/api/listing/get/${listingId}`, {
          withCredentials: true,
        });
        setFormData(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch listing');
      }
    };
    fetchListing();
  }, [listingId]);

  const handleImageUpload = async () => {
    if (files.length + formData.imageUrls.length > 6) {
      const msg = 'You can only upload up to 6 images';
      toast.error(msg);
      setImageUploadError(msg);
      return;
    }

    const toastId = toast.loading('Uploading images...');
    setUploading(true);
    setImageUploadError('');

    try {
      const urls = await Promise.all([...files].map((file) => storeImage(file)));
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...urls],
      }));
      toast.success('Images uploaded successfully!', { id: toastId });
    } catch {
      const msg = 'Image upload failed (max 2MB per image)';
      toast.error(msg, { id: toastId });
      setImageUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const storeImage = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
        }
      );
    });
  };

  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;
    if (id === 'sale' || id === 'rent') {
      setFormData((prev) => ({ ...prev, type: id }));
    } else if (['parking', 'furnished', 'offer'].includes(id)) {
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const toastId = toast.loading('Updating listing...');
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${url}/api/listing/update/${listingId}`,
        {
          ...formData,
          userRef: currentUser._id,
        },
        { withCredentials: true }
      );

      toast.success('Listing updated!', { id: toastId });
      navigate(`/listing/${data.listing._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed', { id: toastId });
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return <p className="text-center mt-10">Loading listing data...</p>;

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Edit Listing</h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-6">
        {/* Left section */}
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            id="name"
            placeholder="Name"
            className="border p-3 rounded-lg"
            required
            maxLength="62"
            minLength="10"
            value={formData.name}
            onChange={handleChange}
          />
          <textarea
            id="description"
            placeholder="Description"
            className="border p-3 rounded-lg"
            required
            value={formData.description}
            onChange={handleChange}
          />
          <input
            type="text"
            id="address"
            placeholder="Address"
            className="border p-3 rounded-lg"
            required
            value={formData.address}
            onChange={handleChange}
          />
          <div className="flex flex-wrap gap-4">
            {['sale', 'rent', 'parking', 'furnished', 'offer'].map((id) => (
              <label key={id} className="flex items-center gap-2 capitalize">
                <input
                  type="checkbox"
                  id={id}
                  checked={formData[id] || formData.type === id}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                {id}
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border rounded-lg"
                value={formData.bedrooms}
                onChange={handleChange}
              />
              <span>Beds</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border rounded-lg"
                value={formData.bathrooms}
                onChange={handleChange}
              />
              <span>Baths</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="10000000"
                required
                className="p-3 border rounded-lg"
                value={formData.regularPrice}
                onChange={handleChange}
              />
              <div>
                <p>Regular Price</p>
                {formData.type === 'rent' && <small>($ / month)</small>}
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  required
                  className="p-3 border rounded-lg"
                  value={formData.discountPrice}
                  onChange={handleChange}
                />
                <div>
                  <p>Discounted Price</p>
                  {formData.type === 'rent' && <small>($ / month)</small>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="text-gray-600 ml-2 text-sm">First image is the cover (max 6)</span>
          </p>
          <div className="flex gap-4">
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border rounded w-full"
            />
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={uploading}
              className="p-3 border text-green-700 border-green-700 rounded hover:shadow-lg disabled:opacity-70"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {imageUploadError && <p className="text-red-700 text-sm">{imageUploadError}</p>}

          {formData.imageUrls.map((url, i) => (
            <div key={url} className="flex justify-between items-center p-3 border rounded">
              <img src={url} alt="listing" className="w-20 h-20 object-cover rounded" />
              <button
                type="button"
                onClick={() => handleRemoveImage(i)}
                className="text-red-700 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg hover:opacity-90 disabled:opacity-70"
          >
            {loading ? 'Updating...' : 'Update Listing'}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}