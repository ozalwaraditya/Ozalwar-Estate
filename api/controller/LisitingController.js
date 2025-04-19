import Listing from '../models/Listing.Model.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);

    res.status(201).json({
      success: true,
      message: "Listing created successfully!",
      listing,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(ErrorHandler(404, 'Listing not found!'));
    }

    if (listing.userRef.toString() !== req.user.id) {
      return next(ErrorHandler(401, 'You can only delete your own listings'));
    }

    await listing.deleteOne();
    res.status(200).json({ message: 'Listing is deleted!' });
  } catch (error) {
    next(error);
  }
};


export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(ErrorHandler(404, 'Listing not found'));
    }

    if (listing.userRef.toString() !== req.user.id) {
      return next(ErrorHandler(403, 'You are not authorized to update this listing'));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing: updatedListing,
    });
  } catch (err) {
    next(err);
  }
};

export const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.status(200).json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getListings = async (req, res) => {
  try {
    const {
      searchTerm,
      type,
      parking,
      furnished,
      offer,
      sort,
      order,
    } = req.query;

    // Initialize the query object
    let query = {};

    // Handle search term if provided
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search
    }

    // Filter based on type, parking, furnished, and offer
    if (type && type !== 'all') {
      query.type = type;
    }

    if (parking !== undefined) {
      query.parking = parking === 'true'; // Convert to boolean
    }

    if (furnished !== undefined) {
      query.furnished = furnished === 'true'; // Convert to boolean
    }

    if (offer !== undefined) {
      query.offer = offer === 'true'; // Convert to boolean
    }

    // Sorting logic (based on provided field and order)
    const sortOptions = {};
    if (sort && order) {
      sortOptions[sort] = order === 'desc' ? -1 : 1; // 1 for ascending, -1 for descending
    }

    // Fetch listings from the database with applied filters and sorting
    const listings = await Listing.find(query).sort(sortOptions);

    // Return the filtered listings in the response
    res.json({
      listings,
      totalListings: listings.length,
      currentPage: 1,
      totalPages: 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

