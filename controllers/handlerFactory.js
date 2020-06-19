const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');

exports.getAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    const docs = await Model.find();

    console.log('run');

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { data: docs },
    });
  });

exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

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

exports.addOne = (Model) =>
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
