import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 1. Lấy trạng thái từ LocalStorage hoặc mặc định là false (Sáng)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    // 2. Effect: Đồng bộ class 'dark' cho Tailwind & Lưu LocalStorage
    useEffect(() => {
        const html = document.documentElement;
        if (isDarkMode) {
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            html.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {/* 3. Bọc ConfigProvider ở đây để Antd nhận diện Dark Mode */}
            <ConfigProvider
                theme={{
                    // Đây là chìa khóa: Chuyển đổi thuật toán theme của Antd
                    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    token: {
                        // Tùy chỉnh thêm màu nếu muốn nó khớp hoàn toàn với Tailwind
                        colorPrimary: '#2563eb', // blue-600
                        colorBgContainer: isDarkMode ? '#242526' : '#ffffff',
                        colorBgElevated: isDarkMode ? '#242526' : '#ffffff', // Màu nền Modal/Dropdown
                    },
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);