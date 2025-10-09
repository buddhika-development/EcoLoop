import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { View, ActivityIndicator } from "react-native";

type Ctx = { user: User | null; loading: boolean; logout: () => Promise<void>; };
const C = createContext<Ctx>({ user: null, loading: true, logout: async () => { } });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
        return unsub;
    }, []);

    const logout = async () => { await signOut(auth); };

    const value = useMemo(() => ({ user, loading, logout }), [user, loading]);
    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }
    return <C.Provider value={value}>{children}</C.Provider>;
}

export const useAuth = () => useContext(C);
