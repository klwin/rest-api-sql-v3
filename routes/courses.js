'use strict';

const express = require('express');
const { asyncHandler } = require('../middleware/async-handler');
const { Course } = require('../models');
const { authenticateUser } = require('../middleware/auth-user');

// Construct a router instance.
const router = express.Router();

// Route that returns all courses.
router.get('/', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({ attributes: {exclude: ['createdAt','updatedAt']} });
    res.json(courses);
}));

// Route that returns the specific course.
router.get('/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, { attributes: {exclude: ['createdAt','updatedAt']} });
    res.json(course);
}));

// Route that creates a course.
router.post('/', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    try {
        await Course.create(req.body);
        res.status(201).json({ "message": "Course successfully created!" });
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
        }
    }
}));

// Route that returns the specific course.
router.put('/:id', authenticateUser, asyncHandler(async (req, res) => {
    let course;
    try {
        course = await Course.findByPk(req.params.id);
        if(course) {
            await course.update(req.body);
        } else {
            res.status(404).json({ "message": "Course " + req.params.id + " does not exit" })
        }
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
        }
    }
}));

// Route that deletes the specific course.
router.delete('/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (course) {
        await course.destroy();
    } else {
        res.status(404).json({ "message": "Course " + req.params.id + " does not exit" })
    }
}));

module.exports = router;