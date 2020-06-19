const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');
const QueryFeatures = require('../utils/queryFeatures');

exports.getAll = (Model, populateObj) =>
  asyncHandler(async (req, res, next) => {
    // For getReviews route handler
    const filter = {};
    if (req.params.restaurantId) {
      filter.restaurant = req.params.restaurantId;
    }

    let query = Model.find(filter);

    // eslint-disable-next-line
    query = new QueryFeatures(query, req.query)
      .filter()
      .select()
      .sort()
      .paginate().query;

    if (populateObj) {
      query = query.populate(populateObj);
    }

    const docs = await query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { data: docs },
    });
  });

exports.getOne = (Model, populateObj) =>
  asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateObj) query = query.populate(populateObj);

    const doc = await query;

    if (!doc) {
      return next(
        new CustomError(`No resource found with id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new CustomError(`No resource found with id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new CustomError(`No resource found with id ${req.params.id}`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
