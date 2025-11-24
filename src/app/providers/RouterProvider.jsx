// src/app/router/RouterProvider.jsx
import React from "react";
import { RouterProvider as RRProvider, createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import TestListPage from "../../features/test-list/pages/TestListPage.jsx";
import LoginPage from "../../features/auth/pages/LoginPage.jsx";
import HomePage from "../../features/home/page/HomePage.jsx";
import TestDetailPage from "../../features/home/page/TestDetailPage.jsx";
import MenuPage from "../../features/admin-management/pages/MenuPage.jsx";
import { useAuthContext } from "./AuthProvider.jsx"; // Sửa lại đường dẫn import đúng với file AuthProvider của bạn
import StudentListPages from "../../features/student-management/pages/StudentListPages.jsx";
import TagListPage from "../../features/tags/pages/TagListPage.jsx";
import QuestionListPage from "../../features/question/pages/QuestionListPage.jsx";
import TestManagementPage from "../../features/test-list/pages/TestManagementPage.jsx";

// --- IMPORT PAGE MỚI ---
// Lưu ý: Hãy đảm bảo đường dẫn này đúng với nơi bạn đã lưu file TestManagementPage.jsx

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
                // Route dành cho Học sinh làm bài
                path: "/test/:testId",
                element: <PrivateRoute element={<TestDetailPage />} />,
            },
            {
                // Route dành cho Admin quản lý bài thi (Thêm câu hỏi)
                path: "/admin/test/:testId",
                element: <PrivateRoute element={<TestManagementPage />} />,
            },
            {
                path: "menu",
                element: <PrivateRoute element={<MenuPage />} />,
            },
            {
                path: "/students",
                element: <PrivateRoute element={<StudentListPages />} />,
            },
            {
                path: "tags",
                element: <PrivateRoute element={<TagListPage />} />,
            },
            {
                path: "questions",
                element: <PrivateRoute element={<QuestionListPage />} />,
            }
        ],
    },
]);

export default function RouterProvider() {
    return <RRProvider router={router} />;
}