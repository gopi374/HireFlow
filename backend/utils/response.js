// Response formatting & pagination utilities
export const sendSuccess = (res, data = {}, message = "Success", statusCode = 200, meta = null) => {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

export const sendError = (res, message = "An error occurred", statusCode = 500, code = "SERVER_ERROR", details = []) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: Array.isArray(details) ? details : [details],
    },
    requestId: res.req?.id || undefined,
  });
};

export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
