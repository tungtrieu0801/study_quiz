import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer";

export default function MainLayout() {
    const location = useLocation();

    const isLoginPage = location.pathname === "/login";

    return (
        <div className="min-h-screen flex flex-col bg-gray-200">
            {!isLoginPage && <Header />}

            <main className={`flex-1 ${isLoginPage ? "" : "px-4 md:px-8 lg:px-35 py-6"}`}>
                <Outlet />
            </main>

            {!isLoginPage && <Footer />}
        </div>
    );
}
