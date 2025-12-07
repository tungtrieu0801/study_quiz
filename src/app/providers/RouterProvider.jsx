import React from "react";
import { RouterProvider as RRProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthProvider.jsx";

import MainLayout from "../layout/MainLayout";
import LoginPage from "../../features/auth/pages/LoginPage.jsx";
import TestListPage from "../../features/test-list/pages/TestListPage.jsx";
import MenuPage from "../../features/admin-management/pages/MenuPage.jsx";
import StudentListPages from "../../features/student-management/pages/StudentListPages.jsx";
import TagListPage from "../../features/tags/pages/TagListPage.jsx";
import QuestionListPage from "../../features/question/pages/QuestionListPage.jsx";
import TestManagementPage from "../../features/test-list/pages/admin/TestManagementPage.jsx";
import TestDetailPage from "../../features/test-list/pages/TestDetailPage.jsx";

// PrivateRoute
const PrivateRoute = ({ element }) => {
    const { user } = useAuthContext();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return element;
};

// Role redirect
const RoleRedirect = () => {
    const { user } = useAuthContext();

    if (!user) return <Navigate to="/login" replace />;

    if (user.role === "teacher") {
        return <Navigate to="/menu" replace />;
    }

    return <Navigate to="/tests" replace />;
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
                element: <PrivateRoute element={<RoleRedirect />} />,
            },
            {
                path: "tests",
                element: <PrivateRoute element={<TestListPage />} />,
            },
            {
                path: "test/:testId",
                element: <PrivateRoute element={<TestDetailPage />} />,
            },
            {
                path: "teacher/test/:testId",
                element: <PrivateRoute element={<TestManagementPage />} />,
            },
            {
                path: "menu",
                element: <PrivateRoute element={<MenuPage />} />,
            },
            {
                path: "students",
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

// ⬇️ Đây là phần bạn bị thiếu — gây lỗi
export default function RouterProvider() {
    return <RRProvider router={router} />;
}
