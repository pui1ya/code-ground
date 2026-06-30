exports.charge = async (req, res, next) => {
  try {
    res.json({ message: 'Billing action (stub)' });
  } catch (err) {
    next(err);
  }
};
