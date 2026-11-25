import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
} from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import Storage from "expo-sqlite/kv-store";

const KEY_PREFIX = "katch.session-key.";
const VALUE_PREFIX = "katch.session.";

function secureStoreKey(key: string) {
  return KEY_PREFIX + key.replace(/[^A-Za-z0-9._-]/g, "_");
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getKey(key: string): Promise<AESEncryptionKey | null> {
  const encoded = await SecureStore.getItemAsync(secureStoreKey(key));
  return encoded ? AESEncryptionKey.import(encoded, "base64") : null;
}

export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    const [aesKey, sealed] = await Promise.all([
      getKey(key),
      Storage.getItemAsync(VALUE_PREFIX + key),
    ]);
    if (!aesKey || !sealed) return null;

    try {
      const plaintext = await aesDecryptAsync(
        AESSealedData.fromCombined(sealed),
        aesKey,
      );
      return decoder.decode(plaintext);
    } catch {
      await this.removeItem(key);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    const aesKey = await AESEncryptionKey.generate();
    const sealed = await aesEncryptAsync(encoder.encode(value), aesKey);

    await SecureStore.setItemAsync(
      secureStoreKey(key),
      await aesKey.encoded("base64"),
    );
    await Storage.setItemAsync(
      VALUE_PREFIX + key,
      await sealed.combined("base64"),
    );
  },

  async removeItem(key: string): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(secureStoreKey(key)),
      Storage.removeItemAsync(VALUE_PREFIX + key),
    ]);
  },
};
