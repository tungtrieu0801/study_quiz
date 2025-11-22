import useAuth from "../hooks/useAuth.js";
import {LoginOutlined, UserOutlined} from "@ant-design/icons";
import {Avatar, Dropdown} from "antd";

export default function Header() {
    const { user, logout } = useAuth();

    const items = [
        {
            key: "logout",
            label: (
                <div className="flex items-center gap-2">
                    <LoginOutlined />
                    Đăng xuất
                </div>
            ),
            onClick: logout,
        }
    ];

    return (
        <header className="bg-white shadow-md py-4 px-6 flex justify-between">
            <h1 className="text-xl font-bold">Học Vui</h1>

            {user ? (
                <Dropdown menu={{items}} trigger={["click"]}>
                    <span className="flex cursor-pointer gap-2 items-center">
                        <Avatar icon={<UserOutlined /> }/>
                        <span className="font-medium">👋 {user.fullName}</span>
                    </span>
                </Dropdown>
            ) : (
                <span>Chưa đăng nhập</span>
            )}
        </header>
    );
}
