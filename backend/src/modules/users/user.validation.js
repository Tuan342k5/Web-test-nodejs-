export function validateUpdateRole(req) {
  const { role } = req.body;
  const allowed = ["MASTER_ADMIN", "ADMIN", "USER"];
  if (!role || !allowed.includes(role)) {
    return {
      isValid: false,
      message: `Vai trò không hợp lệ. Phải là một trong: ${allowed.join(", ")}`,
    };
  }
  return { isValid: true };
}

