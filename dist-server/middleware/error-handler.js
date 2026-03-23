export function errorHandler(error, _req, res, _next) {
    const fullError = [
        error?.status,
        error?.code,
        error?.error?.message || error?.message,
    ]
        .filter(Boolean)
        .join(' | ');
    res.status(error?.status || 500).json({
        error: fullError || String(error),
    });
}
