const stripHtml = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "").trim();
};

const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  password: (value) => {
    return typeof value === "string" && value.length >= 6;
  },
  string: (value) => {
    return typeof value === "string" && value.trim().length > 0;
  },
  minLength: (value, min) => {
    return typeof value === "string" && value.length >= min;
  },
  maxLength: (value, max) => {
    return typeof value === "string" && value.length <= max;
  },
  number: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  integer: (value) => {
    return Number.isInteger(Number(value));
  },
  latitude: (value) => {
    const lat = parseFloat(value);
    return !isNaN(lat) && lat >= -90 && lat <= 90;
  },
  longitude: (value) => {
    const lng = parseFloat(value);
    return !isNaN(lng) && lng >= -180 && lng <= 180;
  },
  rating: (value) => {
    const r = parseInt(value);
    return Number.isInteger(r) && r >= 1 && r <= 5;
  },
  in: (value, options) => {
    return options.includes(value);
  },
  url: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  phone: (value) => {
    if (!value) return true;
    const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
    return phoneRegex.test(value);
  },
};

const validate = (fields, schema) => {
  const errors = [];

  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = fields[fieldName];
    const fieldLabel = rules.label || fieldName;

    for (const rule of rules.rules || []) {
      const { type, params, message } = rule;

      let isValid = true;
      let errorMsg = message || `${fieldLabel} es inválido`;

      switch (type) {
        case "required":
          if (value === undefined || value === null || value === "") {
            errors.push({ field: fieldName, message: `${fieldLabel} es requerido` });
            isValid = false;
          }
          break;

        case "email":
          if (value && !validators.email(value)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe ser un email válido` });
            isValid = false;
          }
          break;

        case "password":
          if (value && !validators.password(value)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe tener al menos 6 caracteres` });
            isValid = false;
          }
          break;

        case "string":
          if (value && !validators.string(value)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe ser un texto válido` });
            isValid = false;
          }
          break;

        case "minLength":
          if (value && !validators.minLength(value, params)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe tener al menos ${params} caracteres` });
            isValid = false;
          }
          break;

        case "maxLength":
          if (value && !validators.maxLength(value, params)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe tener máximo ${params} caracteres` });
            isValid = false;
          }
          break;

        case "number":
          if (value !== undefined && value !== null && value !== "" && !validators.number(value)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe ser un número válido` });
            isValid = false;
          }
          break;

        case "integer":
          if (value !== undefined && value !== null && value !== "" && !validators.integer(value)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe ser un número entero` });
            isValid = false;
          }
          break;

        case "latitude":
          if (value !== undefined && value !== null && value !== "" && !validators.latitude(value)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe ser una latitud válida (-90 a 90)` });
            isValid = false;
          }
          break;

        case "longitude":
          if (value !== undefined && value !== null && value !== "" && !validators.longitude(value)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe ser una longitud válida (-180 a 180)` });
            isValid = false;
          }
          break;

        case "rating":
          if (value !== undefined && value !== null && value !== "" && !validators.rating(value)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe ser un rating entre 1 y 5` });
            isValid = false;
          }
          break;

        case "in":
          if (value && !validators.in(value, params)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe ser uno de: ${params.join(", ")}` });
            isValid = false;
          }
          break;

        case "url":
          if (value && !validators.url(value)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe ser una URL válida` });
            isValid = false;
          }
          break;

        case "phone":
          if (value && !validators.phone(value)) {
            errors.push({ field: fieldName, message: `${fieldLabel} debe ser un teléfono válido` });
            isValid = false;
          }
          break;
      }

      if (!isValid && type !== "required") {
        const alreadyHasError = errors.some(e => e.field === fieldName);
        if (!alreadyHasError) {
          errors.push({ field: fieldName, message: errorMsg });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const sanitizeHtml = (obj) => {
  if (typeof obj === "string") {
    return stripHtml(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeHtml);
  }
  if (obj && typeof obj === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeHtml(value);
    }
    return sanitized;
  }
  return obj;
};

module.exports = {
  validate,
  sanitizeHtml,
  stripHtml,
  validators,
};