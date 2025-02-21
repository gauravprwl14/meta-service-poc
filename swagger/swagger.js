const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo API Documentation',
            version: '1.0.0',
            description: 'API documentation for Todo application with environment management',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            schemas: {
                EnvironmentSetup: {
                    type: 'object',
                    required: ['envName'],
                    properties: {
                        envName: {
                            type: 'string',
                            description: 'Name of the environment to setup',
                            pattern: '^[a-zA-Z0-9-_]+$'
                        }
                    }
                }
            }
        },
        'x-stream-options': {
            supportedContentTypes: ['text/event-stream'],
            responseFormat: 'eventStream'
        }
    },
    apis: ['./routes/*.js'], // Path to the API routes
};

module.exports = swaggerJsdoc(options); 