'use strict';

const express = require('express');
const { asyncHandler } = require('../middleware/async-handler');
const { Course } = require('../models');
const { User } = require('../models');
const { authenticateUser } = require('../middleware/auth-user');
const { restart } = require('nodemon');

// Construct a router instance.
const router = express.Router();

// Route that returns all courses.
router.get('/', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({ 
        include: [{ model: User, as: 'userInfo', attributes: {exclude: ['password,createdAt','updatedAt']} }], 
        attributes: {exclude: ['createdAt','updatedAt']} });
    res.json(courses);
}));

// Route that returns the specific course.
router.get('/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        include : [{ model: User, as: 'userInfo', attributes: {exclude: ['password','createdAt','updatedAt']} }],
        attributes: {exclude: ['createdAt','updatedAt']} });
    res.json(course);
}));

// Route that creates a course.
router.post('/', authenticateUser, asyncHandler(async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).location(`/api/courses/${course.id}`).end();
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
    try {
        const course = await Course.findByPk(req.params.id);
        if(course) {
            if (course.userId === req.currentUser.id) {
                await course.update(req.body);
                res.status(204).json({ "message": "Course successfully updated!" })
            } else {
                res.status(403).json({ "message": "Not authorized to update the course!" })
            }
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
router.delete('/:id', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (course) {
        if (course.userId === req.currentUser.id) {
            await course.destroy();
            res.status(204).json( {"message": "Course sucessfully deleted"} )
        } else {
            res.status(403).json({ "message": "Not authorized to delete the course!" })
        }
    } else {
        res.status(404).json({ "message": "Course " + req.params.id + " does not exit" })
    }
}));

module.exports = router;