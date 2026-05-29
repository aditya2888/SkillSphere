// JSON structured logging middleware (suitable for Azure Monitor / log ingestion)

function requestLogger(req, res, next) {
    const start = Date.now();
    const { method, originalUrl } = req;
    const userId = req.user?.id || null;

    res.on('finish', () => {
        const duration = Date.now() - start;
        const entry = {
            timestamp: new Date().toISOString(),
            level: 'info',
            type: 'http',
            method,
            route: originalUrl,
            status: res.statusCode,
            duration_ms: duration,
            userId,
        };
        console.log(JSON.stringify(entry));
    });

    next();
}

function errorLogger(err, req, res, next) {
    const entry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        type: 'error',
        message: err.message,
        stack: err.stack,
        route: req.originalUrl,
        userId: req.user?.id || null,
    };
    console.error(JSON.stringify(entry));
    next(err);
}

module.exports = { requestLogger, errorLogger };
