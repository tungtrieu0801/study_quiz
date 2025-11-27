// src/app/hooks/useAuth.js (Hoặc đường dẫn tương ứng)
import { useAuthContext } from "../providers/AuthProvider";

export default function useAuth() {
    // 1. Lấy toàn bộ context data
    const context = useAuthContext();
    if (!context) {
        throw new Error("useAuth phải được dùng bên trong AuthProvider");
    }

    const { user, login, logout, isInitialized } = context;

    // 2. Tính toán role an toàn (Fix lỗi viết hoa/thường)
    const rawRole = user?.role || user?.data?.role || "guest";
    const role = String(rawRole).toLowerCase();

    // 3. Tạo biến isAdmin
    const isAdmin = role === "admin";

    // 4. Trả về object đã tính toán
    return {
        user,
        role,
        isAdmin,
        isInitialized,
        login,
        logout
    };
}