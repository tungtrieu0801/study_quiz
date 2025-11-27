import { QueryProvider } from "./providers/QueryProvider";
import RouterProvider from "./providers/RouterProvider";
import {AuthProvider} from "./providers/AuthProvider.jsx";
import {ChatProvider} from "./providers/ChatProvider.jsx";
import {ToastContainer} from "react-toastify";

export default function App() {
    return (
        // useAuth only work in Provider. Provider provide data and consumer (hook) use this.
        <AuthProvider>
            <ChatProvider>
                <QueryProvider>
                    <RouterProvider />
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                </QueryProvider>
            </ChatProvider>
        </AuthProvider>
    );
}
