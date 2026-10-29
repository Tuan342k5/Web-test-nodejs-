import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import Loading from "../../components/common/Loading.jsx";
import { getDefaultRouteForRole, ROUTES } from "../../constants/routes.js";

export default function SsoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [statusMessage, setStatusMessage] = useState("Đang xử lý đăng nhập Google SSO...");
  const processedRef = useRef(false);

  useEffect(() => {
    // Ngăn chặn chạy lặp lại callback nhiều lần
    if (processedRef.current) return;
    processedRef.current = true;

    async function processCallback() {
      const error = searchParams.get("error");
      if (error) {
        navigate(`${ROUTES.LOGIN}?error=${encodeURIComponent(error)}`, { replace: true });
        return;
      }

      const token = searchParams.get("token");
      if (token) {
        try {
          setStatusMessage("Đã nhận token xác thực Google. Đang chuyển hướng vào trang vai trò của bạn...");
          // Thiết lập đồng thời token và user trong AuthContext
          const userData = await loginWithToken(token);
          
          // Điều hướng chính xác theo vai trò hiện tại của tài khoản trong CSDL (ADMIN, USER, MASTER_ADMIN)
          const targetRoute = getDefaultRouteForRole(userData?.role);
          navigate(targetRoute, { replace: true });
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
  }, [searchParams, navigate, loginWithToken]);

  return <Loading message={statusMessage} />;
}
