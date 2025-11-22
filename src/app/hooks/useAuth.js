import { useAuthContext } from "../providers/AuthProvider";

export default function useAuth() {
    return useAuthContext();
}
