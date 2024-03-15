// Importing required modules

// Importing the Course model
import Course from '../models/course.model.js';
// Utility functions for handling errors, responses, and asynchronous operations
import { ApiError } from '../utils/apiError.util.js';
import { ApiResponse } from '../utils/apiResponse.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
// Importing utility functions for handling Cloudinary operations - upload and remove
import { 
    uploadOnCloudinary,        
    removeFromCloudinary 
} from "../utils/cloudinary.util.js";

/*
    Retrieves all courses.

    @param {Request} req - Express request object.
    @param {Response} res - Express response object.
    @returns {Object} - JSON response indicating the success or failure of the course creation.
*/
const getAllCourses = asyncHandler(async (req, res) => {
    // Retrieve all courses from the database
    const courses = await Course.find();

    // Check if there are no courses found
    if (courses.length === 0) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "No courses found."));
    }

    // Send a success response with the retrieved courses data
    return res
        .status(200)
        .json(new ApiResponse(200, courses, "All courses retrieved successfully."));
});

/*
    Retrieves a single course by ID.

    @param {Request} req - Express request object.
    @param {Response} res - Express response object.
    @returns {Object} - JSON response indicating the success or failure of the course creation.
*/
const getCourse = asyncHandler(async (req, res) => {
    
    // Extracting the course ID from request parameters
    const { courseId } = req.params;

    // Retrieving the course from the database by its ID
    const course = await Course.findById(courseId);

    // If the lecture is not found, throw a 404 error
    if (!course) {
        throw new ApiError(404, "Course not found.");
    }

    // Send a success response with the retrieved course data
    return res
        .status(200)
        .json(new ApiResponse(200, course, "Course has been retrieved successfully."));
});

/*
    Retrieves all the lectures for a specific course.

    @param {Request} req - Express request object.
    @param {Response} res - Express response object.
    @returns {Object} - JSON response indicating the success or failure of the course creation.
*/
const getAllLectures = asyncHandler(async (req, res) => {
    // Extracting the course ID from request parameters
    const { courseId } = req.params;

    // Retrieving the course from the database by its ID
    const course = await Course.findById(courseId);

    // If the course is not found, throw a 404 error
    if (!course) {
        throw new ApiError(404, "Course not found.");
    }

    // Retrieve lectures for the course
    const lectures = course?.lectures;

    // Send a success response with the retrieved lectures data
    return res
        .status(200)
        .json(new ApiResponse(200, lectures, "Lectures have been retrieved successfully."));
});

/*
    Retrieves a lecture for a specific course.

    @param {Request} req - Express request object.
    @param {Response} res - Express response object.
    @returns {Object} - JSON response indicating the success or failure of the course creation.
*/
const getLecture = asyncHandler(async (req, res) => {
    // Extracting the lecture ID from request parameters
    const { lectureId } = req.params;

    // Retrieving all courses from the database
    const courses = await Course.find();

    // Loop through each course to find the lecture with the given ID
    let lecture;
    for (const course of courses) {
        lecture = course.lectures.find(lecture => lecture._id == lectureId);
        if (lecture) {
            // If the lecture is found, break the loop
            break;
        }
    }

    // If the lecture is not found, throw a 404 error
    if (!lecture) {
        throw new ApiError(404, "Lecture not found.");
    }

    // Send a success response with the retrieved lecture data
    return res
        .status(200)
        .json(new ApiResponse(200, lecture, "Lecture has been retrieved successfully."));
});

/*
    Creates a new course.

    @param {Request} req - Express request object.
    @param {Response} res - Express response object.
    @returns {Object} - JSON response indicating the success or failure of the course creation.
*/
const createCourse = asyncHandler(async (req, res) => {
    // Extract data from request body
    const { title, description, category, createdBy } = req.body;

    // Check if required fields are missing
    if (!title || !description || !category || !createdBy) {
        throw new ApiError(400, "All fields must be filled.");
    }

    // Get the local file path of the course thumbnail, if any
    const courseLocalFile = req.file?.path;

    // Check if course thumbnail file is missing
    if (!courseLocalFile) {
        throw new ApiError(400, "Course thumbnail file is required.");
    }

    // Upload the course thumbnail to Cloudinary
    const courseThumbnail = await uploadOnCloudinary(courseLocalFile);

    // Check if the upload to Cloudinary was successful
    if (!courseThumbnail) {
        throw new ApiError(400, "Error uploading to Cloudinary.");
    }

    // Create the course in the database
    const course = await Course.create({
        course: courseThumbnail.url,
        title,
        description,
        category,
        createdBy
    });

    // Send success response
    return res
        .status(201)
        .json(new ApiResponse(201, course, `Course created successfully by ${course.createdBy}.`)); 
});

/*
    Creates a new lecture.

    @param {Request} req - Express request object.
    @param {Response} res - Express response object.
    @returns {Object} - JSON response indicating the success or failure of the lecture creation.
*/
const createLecture = asyncHandler(async (req, res) => {
    // Extract data from request parameters and body
    const { id } = req.params;
    const { title, description } = req.body;

    // Check if required fields are missing
    if (!title || !description) {
        throw new ApiError(400, "All fields must be filled.");
    }

    // Find the course by its ID
    const course = await Course.findById(id);

    // Check if the course exists
    if (!course) {
        throw new ApiError(400, "Invalid course ID or Course not found.");
    }

    // Get the local file path of the lecture, if any
    const lectureLocalFile = req.file?.path;

    // Check if lecture file is missing
    if (!lectureLocalFile) {
        throw new ApiError(400, "Lecture file is required.");
    }

    // Upload the lecture file to Cloudinary
    const lectureFile = await uploadOnCloudinary(lectureLocalFile);

    // Check if the upload to Cloudinary was successful
    if (!lectureFile) {
        throw new ApiError(400, "Error uploading to Cloudinary.");
    }

    // Create a new lecture object
    const newLecture = {
        lecture: lectureFile.url,
        title,
        description
    };

    // Push the new lecture into the lectures array of the course
    course.lectures.push(newLecture);

    // Update the number of lectures in the course
    course.numberOfLectures = course.lectures.length;

    // Save the updated course data
    const lectureData = await course.save();

    // Send success response
    return res
        .status(201)
        .json(new ApiResponse(201, lectureData, "Lecture added successfully to the course."));
});

/*
    Deletes all the course.

    @param {Request} req - Express request object.
    @param {Response} res - Express response object.
    @returns {Object} - JSON response indicating the success or failure of the lecture creation.
*/
const deleteAllCourses = asyncHandler(async (req, res) => {   
    // Deleting all courses from the database
    const deleteResult = await Course.deleteMany({});

    // If no courses were deleted, throw a 404 error
    if (!deleteResult || deleteResult.deletedCount === 0) {
        throw new ApiError(404, "No courses found to delete.");
    }

    // Send a success response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "All the courses deleted successfully."));
});

/*
    Deletes a course by its ID.

    @param {Request} req - Express request object.
    @param {Response} res - Express response object.
    @returns {Object} - JSON response indicating the success or failure of the lecture creation.
*/
const deleteCourse = asyncHandler(async (req, res) => {
    // Extracting the course ID from request parameters
    const { courseId } = req.params;

    // Deleting the course from the database by its ID
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    // If the course is not found, throw a 404 error
    if (!deletedCourse) {
        throw new ApiError(404, "Couldn't find course with this ID. Please try again.");
    }

    // Send a success response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Course deleted successfully."));
});

/*
    Deletes all the lectures for a specific course ID.

    @param {Request} req - Express request object.
    @param {Response} res - Express response object.
    @returns {Object} - JSON response indicating the success or failure of the lecture creation.
*/
const deleteAllLectures = asyncHandler(async (req, res) => {
    // Extracting the course ID from request parameters
    const { courseId } = req.params;

    // Retrieving the course from the database by its ID
    const course = await Course.findById(courseId);

    // If the course is not found, throw a 404 error
    if (!course) {
        throw new ApiError(404, "Couldn't find course with this ID. Please try again.");
    }

    // Delete all lectures associated with the course
    course.lectures = [];

    // Update the number of lectures in the course
    course.numberOfLectures = course.lectures.length;

    // Save the updated course data
    await course.save();

    // Send a success response
    return res
        .status(200)
        .json(new ApiResponse(200, course, "All the lectures deleted successfully."));
});

/*
    Deletes a lecture by its ID.

    @param {Request} req - Express request object.
    @param {Response} res - Express response object.
    @returns {Object} - JSON response indicating the success or failure of the lecture creation.
*/
const deleteLecture = asyncHandler(async (req, res) => {
    // Extracting the lecture ID from request parameters
    const { lectureId } = req.params;

    // Find the course containing the lecture
    const course = await Course.findOneAndUpdate(
        { 'lectures._id': lectureId },
        { $pull: { lectures: { _id: lectureId } } },
        { new: true }
    );

    // If the course is not found, or lecture is not found within the course, throw a 404 error
    if (!course) {
        throw new ApiError(404, "Couldn't find lecture with this ID. Please try again.");
    }

    // Update the number of lectures in the course
    course.numberOfLectures = course.lectures.length;

    // Save the updated course data
    await course.save();

    // Send a success response
    return res
        .status(200)
        .json(new ApiResponse(200, course, "Lecture deleted successfully."));
});


export { getAllCourses, getCourse, getAllLectures, getLecture, createCourse, createLecture, deleteAllCourses, deleteCourse, deleteAllLectures, deleteLecture };
