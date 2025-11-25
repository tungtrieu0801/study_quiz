import { createContext, useContext, useState, useMemo, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // 1. Thêm state này để báo hiệu đã load xong
    const [isInitialized, setIsInitialized] = useState(false);

    const [user, setUser] = useState(() => {
        // Thêm try-catch để an toàn, tránh lỗi crash app nếu JSON hỏng
        try {
            const saveUser = localStorage.getItem("user");
            return saveUser ? JSON.parse(saveUser) : null;
        } catch (error) {
            console.error("Lỗi đọc user từ LocalStorage:", error);
            return null;
        }
    });

    // 2. Dùng useEffect để bật cờ isInitialized = true ngay sau khi mount
    useEffect(() => {
        setIsInitialized(true);
    }, []);

    const login = async (apiResponseData) => {
        // Kiểm tra kỹ cấu trúc dữ liệu trả về
        const token = apiResponseData.token;
        const userData = apiResponseData.user;

        if (token) localStorage.setItem("authToken", token);
        if (userData) localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        return true;
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setUser(null);
    };

    // 3. Đưa isInitialized vào context value và dùng useMemo để tối ưu
    const contextValue = useMemo(() => ({
        user,
        login,
        logout,
        isInitialized, // <--- QUAN TRỌNG: Phải có cái này
    }), [user, isInitialized]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => useContext(AuthContext);