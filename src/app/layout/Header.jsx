import React from "react";
import useAuth from "../hooks/useAuth.js"; // Đảm bảo đường dẫn import đúng
import { LoginOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Space } from "antd";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const items = [
        {
            key: "logout",
            label: (
                <div className="flex items-center gap-2" onClick={logout}>
                    <LoginOutlined />
                    Đăng xuất
                </div>
            ),
        }
    ];

    // Khi click vào Header (Logo), điều hướng về trang danh sách bài thi
    const handleClickLogo = () => {
        // console.log("--- DEBUG AUTH ---");
        // console.log("User Object:", user);
        // console.log("User Role:", user?.role);
        if (user?.role === "admin") {
            navigate("/menu"); // Hoặc đường dẫn trang chủ của admin
        } else {
            navigate("/");
        }
    };

    return (
        <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center sticky top-0 z-50">
            <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={handleClickLogo}
            >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                    H
                </div>
                <h1 className="text-xl font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Học Vui
                </h1>
            </div>

            {user ? (
                <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
                    <Space className="cursor-pointer hover:bg-slate-100 py-2 px-4 rounded-full transition-all border border-transparent hover:border-slate-200">
                        <Avatar
                            style={{ backgroundColor: user?.role === 'admin' ? '#87d068' : '#1890ff' }}
                            icon={<UserOutlined />}
                        />
                        <div className="flex flex-col items-start">
                            <span className="font-bold text-slate-700 text-sm leading-tight">
                                {user.fullName || user.username}
                            </span>
                            <span className="text-xs text-slate-400 uppercase font-semibold">
                                {user.role}
                            </span>
                        </div>
                    </Space>
                </Dropdown>
            ) : (
                <span className="text-slate-500 font-medium">Chưa đăng nhập</span>
            )}
        </header>
    );
}