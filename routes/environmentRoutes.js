const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { exec } = require('child_process');
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
 *                 planOutput:
 *                   type: string
 *                 applyOutput:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

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

        res.status(200).json({
            success: true,
            message: 'Environment setup completed successfully',
            environment: envName,
            planOutput: planResult.stdout,
            applyOutput: applyResult.stdout
        });

    } catch (error) {
        console.error('Environment setup failed:', error);
        res.status(500).json({
            success: false,
            message: 'Environment setup failed',
            error: error.message
        });
    }
});

module.exports = router; 