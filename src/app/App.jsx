import { QueryProvider } from "./providers/QueryProvider";
import RouterProvider from "./providers/RouterProvider";
import {AuthProvider} from "./providers/AuthProvider.jsx";

export default function App() {
    return (
        // useAuth only work in Provider. Provider provide data and consumer (hook) use this.
        <AuthProvider>
            <QueryProvider>
                <RouterProvider />
            </QueryProvider>
        </AuthProvider>
    );
}
