const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { spawn } = require('child_process');
const path = require('path');

/**
 * @swagger
 * components:
 *   schemas:
 *     EnvironmentSetup:
 *       type: object
 *       required:
 *         - envName
 *       properties:
 *         envName:
 *           type: string
 *           description: Name of the environment to setup
 *           pattern: ^[a-zA-Z0-9-_]+$
 */

/**
 * @swagger
 * /api/environment/setup:
 *   post:
 *     summary: Setup a new environment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnvironmentSetup'
 *     responses:
 *       200:
 *         description: Environment setup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 plan:
 *                   type: object
 *                   properties:
 *                     output:
 *                       type: string
 *                     warnings:
 *                       type: string
 *                 apply:
 *                   type: object
 *                   properties:
 *                     output:
 *                       type: string
 *                     warnings:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

// Utility function to execute shell commands with real-time streaming
const executeCommandWithStream = (command, args, description) => {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 Starting ${description}:`, command, args.join(' '));

        const output = {
            stdout: [],
            stderr: []
        };

        const process = spawn(command, args);

        // Stream stdout in real-time
        process.stdout.on('data', (data) => {
            const message = data.toString();
            output.stdout.push(message);
            console.log(`\n✅ ${description} Output:`, message.trim());
        });

        // Stream stderr in real-time
        process.stderr.on('data', (data) => {
            const message = data.toString();
            output.stderr.push(message);
            console.warn(`\n⚠️ ${description} Warning:`, message.trim());
        });

        // Handle process completion
        process.on('close', (code) => {
            console.log(`\n🏁 ${description} completed with code:`, code);

            if (code === 0) {
                resolve({
                    stdout: output.stdout.join(''),
                    stderr: output.stderr.join('')
                });
            } else {
                reject(new Error(`${description} failed with code ${code}`));
            }
        });

        // Handle process errors
        process.on('error', (error) => {
            console.error(`\n❌ ${description} Error:`, error);
            reject(error);
        });
    });
};

// Setup new environment
router.post('/setup', [
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
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { envName } = req.body;
        const scriptsPath = path.join(__dirname, '../scripts');

        // Execute plan command with streaming
        const planResult = await executeCommandWithStream(
            `${scriptsPath}/plan.sh`,
            [envName, 'app'],
            'Plan Phase'
        );

        // Execute apply command with streaming
        const applyResult = await executeCommandWithStream(
            `${scriptsPath}/apply.sh`,
            [envName, 'app'],
            'Apply Phase'
        );

        // Format the response
        const response = {
            success: true,
            message: 'Environment setup completed successfully',
            environment: envName,
            plan: {
                output: planResult.stdout,
                warnings: planResult.stderr || null
            },
            apply: {
                output: applyResult.stdout,
                warnings: applyResult.stderr || null
            },
            timestamp: new Date().toISOString()
        };

        // Log success
        console.log('\n✨ Environment Setup Completed:', {
            environment: envName,
            timestamp: response.timestamp
        });

        res.status(200).json(response);

    } catch (error) {
        // Log error details
        console.error('\n💥 Environment Setup Failed:', {
            error: error.message,
            timestamp: new Date().toISOString()
        });

        res.status(500).json({
            success: false,
            message: 'Environment setup failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router; 