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