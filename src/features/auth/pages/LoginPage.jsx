import React from "react";
import LoginForm from "../component/LoginForm.jsx";

export default function LoginPage() {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    Đăng nhập
                </h2>

                <LoginForm />
            </div>
        </div>
    );
}
