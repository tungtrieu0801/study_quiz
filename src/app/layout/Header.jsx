import useAuth from "../hooks/useAuth.js";

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="bg-white shadow-md py-4 px-6 flex justify-between">
            <h1 className="text-xl font-bold">My App</h1>

            {user ? (
                <span className="font-medium">👋 {user.fullName}</span>
            ) : (
                <span>Chưa đăng nhập</span>
            )}
        </header>
    );
}
