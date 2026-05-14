const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { validate, sanitizeHtml } = require("../lib/validator");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const register = async (req, res, next) => {
  try {
    const { email, name, password, role } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, nombre y contraseña son requeridos",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una cuenta con ese email",
      });
    }

    const allowedRoles = ["USER", "ORGANIZER"];
    const userRole = allowedRoles.includes(role) ? role : "USER";

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: userRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "Cuenta creada exitosamente",
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log("[AUTH LOGIN] Datos recibidos:", { email, hasPassword: !!password });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
        code: "MISSING_CREDENTIALS",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("[AUTH LOGIN] Usuario encontrado:", user ? { id: user.id, role: user.role } : null);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
        code: "USER_NOT_FOUND",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("[AUTH LOGIN] Password válido:", isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
        code: "INVALID_PASSWORD",
      });
    }

    const token = generateToken(user.id);
    console.log("[AUTH LOGIN] Token generado para usuario:", user.id);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: "Sesión iniciada exitosamente",
      data: { user: userData, token },
    });
  } catch (error) {
    console.error("[AUTH LOGIN] Error:", error);
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { events: true, places: true, favorites: true, reviews: true },
        },
      },
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, phone, avatar } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const data = {};
    if (name !== undefined) data.name = sanitizeHtml(name.trim());
    if (bio !== undefined) data.bio = sanitizeHtml(bio.trim());
    if (phone !== undefined) data.phone = phone.trim();
    if (avatar !== undefined) data.avatar = avatar;

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      data: { user: updated },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Contraseña actual y nueva contraseña son requeridas",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: "Contraseña cambiada exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

const debugLogin = async (req, res) => {
  try {
    const { email, password } = req.query;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Usa ?email=X&password=Y",
        code: "MISSING_PARAMS",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, password: true },
    });

    if (!user) {
      return res.json({
        success: true,
        debug: true,
        message: "Debug mode",
        data: {
          found: false,
          reason: "Usuario no encontrado en DB",
          emails: "Revisa prisma/seed.js para ver emails disponibles",
        },
      });
    }

    const isValid = await bcrypt.compare(password, user.password);

    return res.json({
      success: true,
      debug: true,
      message: "Debug mode",
      data: {
        found: true,
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        passwordValid: isValid,
        hint: isValid ? "Credenciales correctas" : "Password incorrecto, usa el mismo que en seed.js",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Contraseña es requerida para eliminar la cuenta",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Contraseña incorrecta",
      });
    }

    await prisma.user.delete({ where: { id: userId } });

    res.json({
      success: true,
      message: "Cuenta eliminada exitosamente. Hasta pronto!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  deleteAccount,
  debugLogin,
};