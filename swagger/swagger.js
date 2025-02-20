const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo API Documentation',
            version: '1.0.0',
            description: 'API documentation for Todo application with environment management',
            contact: {
                name: 'API Support',
                url: 'http://localhost:5000',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            schemas: {},
            securitySchemes: {},
        },
    },
    apis: ['./routes/*.js'], // Path to the API routes
};

module.exports = swaggerJsdoc(options); 