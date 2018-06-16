const LaunchEmailModel = require('../model/launchEmailModel');

module.exports = {
  save: async (req, res) => {
    const existingUser = await LaunchEmailModel.findOne({
      email: req.body.email
    });
    console.log(req.body, existingUser);

    if (existingUser) {
      res.status(500).json({ error: 'User already exists' });
    } else {
      const launchEmail = new LaunchEmailModel({
        email: req.body.email,
        checkbox: req.body.checkbox,
        createdAt: new Date()
      });
      launchEmail.save();
      res.status(200).json(launchEmail);
    }
  }
};
