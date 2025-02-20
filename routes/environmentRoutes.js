const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { exec } = require('child_process');
const path = require('path');
const util = require('util');

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

// Convert exec to promise and capture both stdout and stderr
const execPromise = util.promisify(exec);

// Utility function to execute shell commands with better logging
const executeCommand = async (command, description) => {
    console.log(`\n🚀 Executing ${description}:`, command);

    try {
        const { stdout, stderr } = await execPromise(command);

        if (stdout) {
            console.log(`\n✅ ${description} Output:`, stdout);
        }

        if (stderr) {
            console.warn(`\n⚠️ ${description} Warnings:`, stderr);
        }

        return { stdout, stderr };
    } catch (error) {
        console.error(`\n❌ ${description} Error:`, {
            message: error.message,
            code: error.code,
            stdout: error.stdout,
            stderr: error.stderr
        });
        throw error;
    }
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

        // Execute plan command with logging
        const planCommand = `${scriptsPath}/plan.sh ${envName} app`;
        const planResult = await executeCommand(planCommand, 'Plan Phase');

        // Execute apply command with logging
        const applyCommand = `${scriptsPath}/apply.sh ${envName} app`;
        const applyResult = await executeCommand(applyCommand, 'Apply Phase');

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
            code: error.code,
            timestamp: new Date().toISOString()
        });

        res.status(500).json({
            success: false,
            message: 'Environment setup failed',
            error: error.message,
            details: {
                code: error.code,
                stdout: error.stdout,
                stderr: error.stderr
            },
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router; 