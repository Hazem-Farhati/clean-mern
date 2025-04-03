const errorHandler = (res, error, statusCode = 500) => {
  console.error("Error:", error.message || error);
  res
    .status(statusCode)
    .json({ error: error.message || "Internal Server Error" });
};

module.exports = errorHandler;
