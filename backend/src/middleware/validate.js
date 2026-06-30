module.exports = (schema) => (req, res, next) => {
  // simple stub: in real apps use Joi/Zod
  const valid = true;
  if (!valid) return res.status(400).json({ error: 'Validation failed' });
  next();
};
