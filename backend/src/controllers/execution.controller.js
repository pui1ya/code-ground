exports.run = async (req, res, next) => {
  try {
    res.json({ message: 'Execution started (stub)' });
  } catch (err) {
    next(err);
  }
};
