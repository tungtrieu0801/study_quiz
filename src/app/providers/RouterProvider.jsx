// src/app/router/RouterProvider.jsx
import React from "react";
import { RouterProvider as RRProvider, createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import TestListPage from "../../features/test-list/pages/TestListPage.jsx";
import LoginPage from "../../features/auth/pages/LoginPage.jsx";
import HomePage from "../../features/home/page/HomePage.jsx";
import TestDetailPage from "../../features/home/page/TestDetailPage.jsx";
import MenuPage from "../../features/menu-test-question/pages/MenuPage.jsx";
import {useAuthContext} from "./AuthProvider.jsx";

// Hook giả lập kiểm tra đăng nhập dựa trên token localStorage
const useAuth = () => {
    const token = localStorage.getItem("authToken");
    return { isAuthenticated: !!token };
};

// PrivateRoute redirect nếu chưa login
const PrivateRoute = ({ element }) => {
    const { user } = useAuthContext();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return element;
};

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <PrivateRoute element={<HomePage />} />,
            },
            {
                path: "tests",
                element: <PrivateRoute element={<TestListPage />} />,
            },
            {
                path: "/test/:testId",
                element: <PrivateRoute element={<TestDetailPage />} />,
            },
            {
                path: "menu",
                element: <PrivateRoute element={<MenuPage />} />,
            }
        ],
    },
]);

export default function RouterProvider() {
    return <RRProvider router={router} />;
}
