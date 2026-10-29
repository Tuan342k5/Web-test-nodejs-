import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import Loading from "../../components/common/Loading.jsx";
import { setStoredToken } from "../../utils/auth.utils.js";
import { ROUTES } from "../../constants/routes.js";

export default function SsoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [statusMessage, setStatusMessage] = useState("Đang xử lý đăng nhập Google SSO...");

  useEffect(() => {
    async function processCallback() {
      const error = searchParams.get("error");
      if (error) {
        navigate(`${ROUTES.LOGIN}?error=${encodeURIComponent(error)}`, { replace: true });
        return;
      }

      const token = searchParams.get("token");
      if (token) {
        try {
          setStatusMessage("Đã nhận token xác thực Google. Đang chuyển hướng vào trang User...");
          setStoredToken(token);
          await refreshUser();
          // Chuyển hướng trực tiếp tới trang User theo yêu cầu
          navigate(ROUTES.USERS, { replace: true });
        } catch (err) {
          navigate(
            `${ROUTES.LOGIN}?error=${encodeURIComponent(
              err.message || "Không thể tải thông tin tài khoản sau khi đăng nhập Google."
            )}`,
            { replace: true }
          );
        }
      } else {
        navigate(ROUTES.LOGIN, { replace: true });
      }
    }

    processCallback();
  }, [searchParams, navigate, refreshUser]);

  return <Loading message={statusMessage} />;
}
