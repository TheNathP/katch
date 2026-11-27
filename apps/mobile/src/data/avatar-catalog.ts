import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

import { callEdgeFunction } from "@/data/edge-functions";

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
  const raw = await callEdgeFunction("get-avatar-catalog", { method: "GET", auth: "public", signal });
  const catalog = adaptAvatarCatalog(raw);

  if (signal.aborted) return catalog;
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(raw)).catch(() => {});
  // Fire and forget: images missing from the disk cache are downloaded now,
  // the others are already there.
  if (!signal.aborted) void Image.prefetch(
    catalog.avatars.map((avatar) => avatar.imageUrl),
    { cachePolicy: "memory-disk" },
  ).catch(() => {});

  return catalog;
}
