const STORAGE_KEY = "app_master_key";

const getOrCreateKey = async (): Promise<CryptoKey> => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    const raw = Uint8Array.from(JSON.parse(stored));
    return crypto.subtle.importKey(
      "raw",
      raw,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(raw)));

  return key;
};

export const encryptMessage = async (plainText: string): Promise<string> => {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encoded = new TextEncoder().encode(plainText);

  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return btoa(JSON.stringify({
    cipher: Array.from(new Uint8Array(cipher)),
    iv: Array.from(iv),
  }));
};

export const decryptMessage = async (encodedCipher: string): Promise<string> => {
  const { cipher, iv } = JSON.parse(atob(encodedCipher));

  const key = await getOrCreateKey();

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    new Uint8Array(cipher)
  );

  return new TextDecoder().decode(decrypted);
};

export const clearEncryptionKey = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};