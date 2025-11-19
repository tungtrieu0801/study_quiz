import { QueryProvider } from "./providers/QueryProvider";
import RouterProvider from "./providers/RouterProvider";

export default function App() {
    return (
        <QueryProvider>
            <RouterProvider />
        </QueryProvider>
    );
}
