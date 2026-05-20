module.exports = async (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "Webhook route works"
  });
};
