const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');

class ScriptExecutionService extends EventEmitter {
    constructor() {
        super();
        this.scriptsPath = path.join(__dirname, '../scripts');
    }

    async executeScript(scriptName, args, phase) {
        return new Promise((resolve, reject) => {
            const command = path.join(this.scriptsPath, scriptName);
            const process = spawn(command, args);
            let output = { stdout: [], stderr: [] };

            process.stdout.on('data', (data) => {
                const message = data.toString();
                output.stdout.push(message);
                this.emit('output', {
                    type: 'stdout',
                    phase,
                    message: message.trim(),
                    timestamp: new Date().toISOString()
                });
            });

            process.stderr.on('data', (data) => {
                const message = data.toString();
                output.stderr.push(message);
                this.emit('output', {
                    type: 'stderr',
                    phase,
                    message: message.trim(),
                    timestamp: new Date().toISOString()
                });
            });

            process.on('close', (code) => {
                this.emit('output', {
                    type: 'status',
                    phase,
                    message: `Process completed with code: ${code}`,
                    timestamp: new Date().toISOString()
                });

                if (code === 0) {
                    resolve({
                        stdout: output.stdout.join(''),
                        stderr: output.stderr.join('')
                    });
                } else {
                    reject(new Error(`${phase} failed with code ${code}`));
                }
            });

            process.on('error', (error) => {
                this.emit('output', {
                    type: 'error',
                    phase,
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
                reject(error);
            });
        });
    }

    async executeEnvironmentSetup(envName) {
        try {
            // Execute plan phase
            this.emit('output', {
                type: 'info',
                phase: 'Setup',
                message: 'Starting environment setup process',
                timestamp: new Date().toISOString()
            });

            const planResult = await this.executeScript('plan.sh', [envName, 'app'], 'Plan');

            // Execute apply phase
            const applyResult = await this.executeScript('apply.sh', [envName, 'app'], 'Apply');

            return {
                success: true,
                plan: planResult,
                apply: applyResult
            };
        } catch (error) {
            this.emit('output', {
                type: 'error',
                phase: 'Setup',
                message: `Setup failed: ${error.message}`,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }
}

module.exports = new ScriptExecutionService(); 