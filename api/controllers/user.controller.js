import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import MonthlyRefund from "../models/monthlyRefund.model.js";
import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
  res.json({ message: "API is working!" });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId && !req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }

  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
          firmName: req.body.firmName,
          municipality: req.body.municipality,
          firmOwner: req.body.firmOwner,
          details: req.body.details,
          amountOfAssistance: req.body.amountOfAssistance,
          refunds: req.body.refunds,
          changeDate: req.body.changeDate,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this user"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .populate("monthlyRefunds");

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const recordMonthlyRefund = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { refundPayment, arrears } = req.body;

    // Calculate the current month and day
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const currentDay = String(now.getDate()).padStart(2, "0");

    // Create the new MonthlyRefund document
    const newMonthlyRefund = new MonthlyRefund({
      user: userId,
      month: currentMonth,
      day: currentDay,
      refundPayment,
      arrears,
    });

    // Save the MonthlyRefund to the database
    const savedMonthlyRefund = await newMonthlyRefund.save();

    // Update the User model with the new MonthlyRefund reference
    await User.findByIdAndUpdate(userId, {
      $push: { monthlyRefunds: savedMonthlyRefund._id },
    });

    res.status(201).json(savedMonthlyRefund);
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
