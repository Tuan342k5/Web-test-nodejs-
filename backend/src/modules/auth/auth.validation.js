export function validateLogin(req) {
  const { email, password } = req.body || {};
  if (!email || typeof email !== "string" || !email.trim()) {
    return { isValid: false, message: "Email là bắt buộc." };
  }
  if (!password || typeof password !== "string") {
    return { isValid: false, message: "Mật khẩu là bắt buộc." };
  }
  return { isValid: true };
}

export function validateSSO(req) {
  const { email, credential } = req.body || {};
  if (!email && !credential) {
    return { isValid: false, message: "Email hoặc credential Google là bắt buộc." };
  }
  return { isValid: true };
}

