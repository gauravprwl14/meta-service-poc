const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Todo = require('../models/Todo');
const { exec } = require('child_process');
const path = require('path');

// Validation middleware
const todoValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional().isISO8601().toDate()
];

// GET all todos
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET todo by ID
router.get('/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json(todo);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE new todo
router.post('/', todoValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const todo = new Todo({
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            priority: req.body.priority,
            dueDate: req.body.dueDate
        });

        const newTodo = await todo.save();
        res.status(201).json(newTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE todo
router.patch('/:id', todoValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        Object.keys(req.body).forEach(key => {
            if (req.body[key] != null) {
                todo[key] = req.body[key];
            }
        });
        todo.updatedAt = new Date();

        const updatedTodo = await todo.save();
        res.json(updatedTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE todo
router.delete('/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        await todo.deleteOne();
        res.json({ message: 'Todo deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET todos by status
router.get('/status/:status', async (req, res) => {
    try {
        const todos = await Todo.find({ status: req.params.status }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET todos by priority
router.get('/priority/:priority', async (req, res) => {
    try {
        const todos = await Todo.find({ priority: req.params.priority }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Utility function to execute shell commands
const executeCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({ stdout, stderr });
        });
    });
};

// Boot up new environment endpoint
router.post('/environment/setup', [
    body('envName')
        .trim()
        .notEmpty()
        .withMessage('Environment name is required')
        .matches(/^[a-zA-Z0-9-_]+$/)
        .withMessage('Environment name can only contain letters, numbers, hyphens, and underscores')
], async (req, res) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { envName } = req.body;

        // Use absolute path for scripts
        const scriptsPath = path.join(__dirname, '../scripts');

        // Execute plan command
        const planCommand = `${scriptsPath}/plan.sh ${envName} app`;
        const planResult = await executeCommand(planCommand);
        console.log('Plan executed:', planResult.stdout);

        // Execute apply command
        const applyCommand = `${scriptsPath}/apply.sh ${envName} app`;
        const applyResult = await executeCommand(applyCommand);
        console.log('Apply executed:', applyResult.stdout);

        // Ensure JSON response
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            success: true,
            message: 'Environment setup completed successfully',
            environment: envName,
            planOutput: planResult.stdout,
            applyOutput: applyResult.stdout
        });

    } catch (error) {
        console.error('Environment setup failed:', error);
        // Ensure JSON response for errors
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({
            success: false,
            message: 'Environment setup failed',
            error: error.message
        });
    }
});

module.exports = router; 