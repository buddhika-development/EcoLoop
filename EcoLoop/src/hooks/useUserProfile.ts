import { useEffect, useState } from "react";
import { getMyProfile } from "@/src/services/profile";
import { useAuth } from "@/src/providers/AuthProvider";

export function useUserProfile() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const p = await getMyProfile();
                setProfile(p);
            } catch (e) {
                console.error("Failed to load profile:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    return { user, profile, loading: authLoading || loading };
}
