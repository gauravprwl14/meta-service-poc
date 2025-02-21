const setupSSE = (req, res, next) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

    // Handle client disconnection
    req.on('close', () => {
        if (res.sseCleanup) {
            res.sseCleanup();
        }
    });

    // Initialize SSE stream
    res.flushHeaders();
    res.write(':\n\n'); // Send initial comment to establish connection

    // Helper function to send SSE data
    res.sse = (data) => {
        if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify(data)}\n\n`);

            // Try to flush if the method exists (depends on the Node.js environment)
            if (typeof res.flush === 'function') {
                res.flush();
            }
        }
    };

    next();
};

module.exports = setupSSE; 