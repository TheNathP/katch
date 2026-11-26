import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

import {
  adaptAvatarCatalog,
  type AvatarCatalog,
} from "@/data/adapters/avatar-catalog.adapters";

// The catalog (ids, image URLs, colors) is kept on the device once loaded, and
// the images themselves in expo-image's disk cache, so the picker shows up
// instantly and keeps working offline. The network refresh only updates them.
const CACHE_KEY = "katch:avatar-catalog";

/** The last catalog loaded from the server, or null if none is stored yet. */
export async function getCachedAvatarCatalog(): Promise<AvatarCatalog | null> {
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY);
    return stored ? adaptAvatarCatalog(JSON.parse(stored)) : null;
  } catch {
    // Unreadable or outdated cache: ignore it, the refresh will replace it.
    return null;
  }
}

/** Loads the catalog from the server, then stores it and its images locally. */
export async function refreshAvatarCatalog(
  signal: AbortSignal,
): Promise<AvatarCatalog> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase configuration");

  const response = await fetch(`${url}/functions/v1/get-avatar-catalog`, {
    headers: { apikey: key },
    signal,
  });
  if (!response.ok) throw new Error("Could not load the avatar catalog");

  const raw: unknown = await response.json();
  const catalog = adaptAvatarCatalog(raw);

  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(raw)).catch(() => {});
  // Fire and forget: images missing from the disk cache are downloaded now,
  // the others are already there.
  Image.prefetch(
    catalog.avatars.map((avatar) => avatar.imageUrl),
    { cachePolicy: "memory-disk" },
  ).catch(() => {});

  return catalog;
}
