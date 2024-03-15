// Import necessary modules

// Schema and model objects from Mongoose for MongoDB interactions
import { Schema, model } from "mongoose"; 

/*
    Course Schema definition
*/
const courseSchema = new Schema(
    {
        course: {
            type: 'String'
        },
        title: {
            type: 'String',
            required: [true, 'Title is required.'],
            minlength: [8, 'Title must be at least 8 characters long.'],
            maxlength: [50, 'Title should be less than 50 characters long.'],
            lowercase: true,
            trim: true
        },
        description: {
            type: 'String',
            required: [true, 'Description is required.'],
            minlength: [20, 'Description must be at least 20 characters long.']
        },
        category: {
            type: 'String',
            required: [true, 'Category is required.']
        },
        lectures: [{
            lecture: {
                type: 'String' 
            },
            title: {
                type: 'String'
            },
            description: {
                type: 'String'
            }
        }],
        numberOfLectures: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: 'String',
            required: [true, 'Teacher name is required.'],
        }
    }, { timestamps: true }
);

/*
    Course Model definition
*/
const courseProfile = model('Course', courseSchema);


// Exporting the course object as the default export.
export default courseProfile;
