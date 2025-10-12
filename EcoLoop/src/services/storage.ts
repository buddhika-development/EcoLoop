import { storage } from "@/src/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { LocalFile } from "@/src/types/media";

export async function uploadLocalFile(
    file: LocalFile,
    path: string
): Promise<string> {
    // path example: `users/${uid}/items/${itemId}/images/${file.name}`
    const r = ref(storage, path);
    // iOS/Android: fetch blob from file URI
    const resp = await fetch(file.uri);
    const blob = await resp.blob();
    await uploadBytes(r, blob, { contentType: file.mime });
    return getDownloadURL(r);
}
