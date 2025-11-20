import { useState, useEffect } from "react";

// Giả sử chúng ta lưu trạng thái đăng nhập trong localStorage hoặc cookie
const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken"); // Giả sử token lưu trong localStorage
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    return { isAuthenticated };
};

export { useAuth };
