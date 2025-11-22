import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        // get user from local storage
        const saveUser = localStorage.getItem("user");
        return saveUser ? JSON.parse(saveUser) : null;
    });



    const login = async (apiResponseData) => {
        localStorage.setItem("authToken", apiResponseData.token);
        localStorage.setItem("user", JSON.stringify(apiResponseData.user));
        setUser(apiResponseData.user);

        return true;
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => useContext(AuthContext);
