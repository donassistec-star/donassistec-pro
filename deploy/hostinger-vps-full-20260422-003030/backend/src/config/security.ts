const FALLBACK_JWT_SECRET = "donassistec-secret-key-change-in-production";

let missingJwtWarningShown = false;

const getNodeEnv = () => process.env.NODE_ENV || "development";

export const isProduction = () => getNodeEnv() === "production";

export const getJwtSecret = () => {
  const configuredSecret = process.env.JWT_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (isProduction()) {
    throw new Error("JWT_SECRET é obrigatório em produção.");
  }

  if (!missingJwtWarningShown) {
    missingJwtWarningShown = true;
    console.warn(
      "JWT_SECRET não configurado. Usando segredo inseguro apenas para desenvolvimento."
    );
  }

  return FALLBACK_JWT_SECRET;
};

export const isAdminBootstrapEnabled = () => {
  const flag = (process.env.ENABLE_ADMIN_BOOTSTRAP || "").trim().toLowerCase();

  if (flag === "true") {
    return true;
  }

  if (flag === "false") {
    return false;
  }

  return !isProduction();
};
