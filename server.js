const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const { customStyles, customScript } = require('./swagger/customization');
const path = require('path');
require('dotenv').config();

const todoRoutes = require('./routes/todoRoutes');
const environmentRoutes = require('./routes/environmentRoutes');

const app = express();

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5000', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Content-Type'],
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Configure Helmet but allow Swagger UI
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Force JSON responses for API routes
app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/environment', environmentRoutes);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: `
        .swagger-ui .topbar { display: none }
        ${customStyles}
    `,
    customJs: '/js/swagger-custom.js',
    swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
        displayRequestDuration: true,
    },
    customSiteTitle: "API Documentation",
    customfavIcon: "/favicon.ico"
}));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
}); 