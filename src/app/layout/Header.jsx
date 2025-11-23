import useAuth from "../hooks/useAuth.js";
import {LoginOutlined, UserOutlined} from "@ant-design/icons";
import {Avatar, Dropdown} from "antd";
import {useNavigate} from "react-router-dom";

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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

    const handleClick = () => {
        if ("student" === user.role) {
            navigate(`/test/${test._id}`);
        } else {
            navigate("/menu")
        }
    };

    return (
        <header className="bg-white shadow-md py-4 px-6 flex justify-between cursor-pointer" onClick={handleClick}>
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
