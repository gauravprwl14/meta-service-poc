const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const scriptExecutionService = require('../services/scriptExecutionService');
const setupSSE = require('../middleware/sseMiddleware');

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
 *     summary: Setup a new environment (non-streaming)
 *     description: Regular endpoint that returns final result after completion
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
 */

/**
 * @swagger
 * /api/environment/setup/stream:
 *   post:
 *     summary: Setup a new environment with real-time output streaming
 *     description: |
 *       **Note:** This endpoint uses Server-Sent Events (SSE) which requires special handling.
 *       
 *       To test with curl:
 *       ```bash
 *       curl -N -H "Accept: text/event-stream" \
 *            -H "Content-Type: application/json" \
 *            -d '{"envName": "test-env"}' \
 *            http://localhost:5000/api/environment/setup/stream
 *       ```
 *       
 *       To test with Postman:
 *       1. Set method to POST
 *       2. URL: http://localhost:5000/api/environment/setup/stream
 *       3. Headers:
 *          - Accept: text/event-stream
 *          - Content-Type: application/json
 *       4. Body (raw/JSON): {"envName": "test-env"}
 *       5. Disable "Automatically follow redirects" in Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - envName
 *             properties:
 *               envName:
 *                 type: string
 *                 pattern: ^[a-zA-Z0-9-_]+$
 *     responses:
 *       200:
 *         description: Stream of setup progress events
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   enum: [stdout, stderr, status, error, info]
 *                 phase:
 *                   type: string
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */

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

        // Execute plan command with streaming
        const planResult = await scriptExecutionService.executeScript('plan.sh', [envName, 'app'], 'Plan');

        // Execute apply command with streaming
        const applyResult = await scriptExecutionService.executeScript('apply.sh', [envName, 'app'], 'Apply');

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

router.post('/setup/stream', [
    body('envName')
        .trim()
        .notEmpty()
        .withMessage('Environment name is required')
        .matches(/^[a-zA-Z0-9-_]+$/)
        .withMessage('Environment name can only contain letters, numbers, hyphens, and underscores')
], setupSSE, async (req, res) => {
    let cleanup = null;

    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.sse({
                type: 'error',
                phase: 'Validation',
                message: 'Invalid input',
                errors: errors.array(),
                timestamp: new Date().toISOString()
            });
            return res.end();
        }

        const { envName } = req.body;

        // Setup event listeners
        const outputHandler = (data) => {
            res.sse(data);
        };

        // Store cleanup function
        cleanup = () => {
            scriptExecutionService.removeListener('output', outputHandler);
        };
        res.sseCleanup = cleanup;

        // Add event listener
        scriptExecutionService.on('output', outputHandler);

        // Execute environment setup
        await scriptExecutionService.executeEnvironmentSetup(envName);

        // Send completion message
        res.sse({
            type: 'status',
            phase: 'Complete',
            message: 'Environment setup completed successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Send error message
        res.sse({
            type: 'error',
            phase: 'Error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (cleanup) {
            cleanup();
        }
        res.end();
    }
});

module.exports = router; 