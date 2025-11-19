import { RouterProvider as RRProvider, createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import TestListPage from "../../features/test-list/pages/TestListPage.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <TestListPage /> }
        ]
    }
]);

export default function RouterProvider() {
    return <RRProvider router={router} />;
}
