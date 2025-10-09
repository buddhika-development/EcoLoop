import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/src/lib/firebase";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        // (when you do EAS builds later, also provide iosClientId / androidClientId)
    });

    useEffect(() => {
        const go = async () => {
            if (response?.type === "success") {
                const { id_token } = response.params;
                const credential = GoogleAuthProvider.credential(id_token);
                await signInWithCredential(auth, credential);
            }
        };
        go();
    }, [response]);

    return { request, promptAsync };
}
