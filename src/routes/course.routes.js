// Import necessary modules
import { Router } from "express"; 

// Import controller functions
import { 
    getAllCourses,
    getCourse,
    getAllLectures,
    getLecture,
    createCourse,
    createLecture,
    deleteAllCourses,
    deleteCourse,
    deleteAllLectures,
    deleteLecture
} from "../controllers/course.controller.js"; 

// Middleware for handling file uploads
import { upload } from "../middlewares/multer.middleware.js"; 

// Middleware for authentication
import { isLoggedIn, authorizeRoles } from "../middlewares/auth.middleware.js"; 

// Create a new router instance
const router = Router();

// Route to get all courses
router.get('/get-all-courses', getAllCourses);

// Route to get a specific course by its ID
router.get('/get-course/:courseId', isLoggedIn, getCourse);

// Route to get all the lectures of a course by that course ID
router.get('/get-all-lectures/:courseId', isLoggedIn, getAllLectures);

// Route to get a lectures of a course by that lecture ID
router.get('/get-lecture/:lectureId', isLoggedIn, getLecture);

// Route to create a new course
router.post('/create-course', isLoggedIn, authorizeRoles("ADMIN"), upload.single('course'), createCourse);

// Route to create a new lecture by that course ID
router.post('/:id', isLoggedIn, authorizeRoles("ADMIN"), upload.single('lecture'), createLecture);

// Route to delete all the course
router.delete('/delete-all-courses', isLoggedIn, authorizeRoles("ADMIN"), deleteAllCourses);

// Route to delete a course by that course ID
router.delete('/delete-course/:courseId', isLoggedIn, authorizeRoles("ADMIN"), deleteCourse);

// Route to delete all the lectures by that course ID
router.delete('/delete-all-lectures/:courseId', isLoggedIn, authorizeRoles("ADMIN"), deleteAllLectures);

// Route to delete a lecture by that lecture ID
router.delete('/delete-lecture/:lectureId', isLoggedIn, authorizeRoles("ADMIN"), deleteLecture);

// Export the router object
export default router;
