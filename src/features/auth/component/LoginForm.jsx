import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import instance from "../../../shared/lib/axios.config";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../app/hooks/useAuth";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await instance.post("/auth/login", values);

            if (res.data.success) {
                await login(res.data.data);

                message.success("Đăng nhập thành công!");
                if ("admin" === res.data.data.user.role) {
                    navigate("/menu");
                } else {
                    navigate("/tests");
                }
            } else {
                message.error(res.data.message || "Sai tên đăng nhập hoặc mật khẩu!");
            }
        } catch (err) {
            message.error("Lỗi server, thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form layout="vertical" onFinish={onFinish} className="space-y-4">
            {/* UI giữ nguyên */}
            <Form.Item
                label={<span className="font-medium">Tên đăng nhập</span>}
                name="username"
                rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
            >
                <Input className="h-10" />
            </Form.Item>

            <Form.Item
                label={<span className="font-medium">Mật khẩu</span>}
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
                <Input.Password className="h-10" />
            </Form.Item>

            <Button
                type="primary"
                block
                htmlType="submit"
                loading={loading}
                className="!h-10 !text-base"
            >
                Đăng nhập
            </Button>
        </Form>
    );
}
