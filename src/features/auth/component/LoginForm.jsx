import React, { useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import instance from "../../../shared/lib/axios.config";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await instance.post("/auth/login", values);

            if (res.data.success) {
                localStorage.setItem("authToken", res.data.data.token);
                message.success("Đăng nhập thành công!");
                navigate("/");
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

            {/*<Form.Item name="remember" valuePropName="checked">*/}
            {/*    <Checkbox>Nhớ tôi</Checkbox>*/}
            {/*</Form.Item>*/}

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
