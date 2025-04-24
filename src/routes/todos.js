const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

// Get all todo tasks
router.get('/', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user._id });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific todo task
router.get('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id });
        if (!todo) return res.status(404).json({ message: 'Task not found' });
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Adding a new todo task
router.post('/', auth, async (req, res) => {
    try {
        const {task, description, date, completed} = req.body;
        const todo = new Todo({
            task,
            description,
            date: date || null,
            completed: completed || false,
            userId: req.user._id,
        });

        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a task
router.patch('/:id', auth, async (req, res) => {
    try {
        const {task, description, date, completed} = req.body;

        const updatedTodo = await Todo.findOneAndUpdate(
            { 
                _id: req.params.id, 
                userId: req.user._id 
            },
            { 
                task, 
                description, 
                date: date || null, 
                completed 
            },
            { new: true, runValidators: true }
        )

        if (!updatedTodo) return res.status(404).json({ message: 'Task not found' });

        res.json(updatedTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Deleting a todo task
router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deletedTodo) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Logout route to destroy the session
router.post('/logout', auth, (req, res) => {
    req.logout((error) => {
        if (error) return res.status(500).json({ message: 'Logout Failed.' });

        req.session.destroy((error) => {
            if (error) return res.status(500).json({ message: 'Session destruction failed.' });

            res.clearCookie('connect.sid', { path: '/' });
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            return res.json({ message: 'Logged out successfully' });
        });
    });
});

module.exports = router;