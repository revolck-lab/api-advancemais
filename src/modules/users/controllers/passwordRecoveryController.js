const recoveryService = require("../services/passwordRecoveryService");
const userModel = require("../models/userModel");
const companyModel = require("../models/companyModel");
const loginValidation = require("../validators/loginValidator");
const bcrypt = require("bcrypt");

const recoveryController = {
  requestPasswordRecovery: async (req, res) => {
    try {
      const loginSchema = loginValidation.fork(["password"], (field) =>
        field.optional()
      );
      const { error } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { login } = req.body;

      const user =
        login.length > 11
          ? await companyModel.findByCnpj(login)
          : await userModel.findByCpf(login);

      if (!user) {
        return res.status(404).json({ message: "Invalid credentials" });
      }

      const emailResult = await recoveryService(login, user.email);

      return res
        .status(200)
        .json({
          message: "Recovery email sent successfully.",
          details: emailResult,
        });
    } catch (error) {
      console.error("Password recovery error:", error.message);
      return res
        .status(500)
        .json({
          message: "Error requesting password recovery.",
          error: error.message,
        });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { id } = req.user;
      const { newPassword } = req.body;
      
      if (!newPassword) {
        return res.status(400).json({ message: "Password required." });
      }

      if (!id) {
        return res.status(400).json({ message: "Invalid token." });
      }

      const user = await userModel.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: "The new password cannot be the same as the old one." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await userModel.updatePassword(id, hashedPassword);

      return res
        .status(200)
        .json({ message: "Password changed successfully." });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Expired token" });
      }
      console.error("Reset password error:", error.message);
      return res.status(500).json({ message: "Internal error server.", error: error.message });
    }
  },
};

module.exports = recoveryController;
