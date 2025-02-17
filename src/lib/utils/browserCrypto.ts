/**
 * Browser-compatible encryption utilities using Web Crypto API
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

async function getKey(): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  )
  return keyMaterial
}

/**
 * Encrypts data using AES-GCM
 */
export async function encrypt(data: string): Promise<string> {
  const key = await getKey()
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encodedData = new TextEncoder().encode(data)

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    encodedData
  )

  // Export key for later decryption
  const exportedKey = await window.crypto.subtle.exportKey('raw', key)

  // Combine IV, key, and encrypted data
  const combined = new Uint8Array(iv.length + exportedKey.byteLength + encryptedData.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(exportedKey), iv.length)
  combined.set(new Uint8Array(encryptedData), iv.length + exportedKey.byteLength)

  return arrayBufferToBase64(combined.buffer)
}

/**
 * Decrypts data using AES-GCM
 */
export async function decrypt(encryptedData: string): Promise<string> {
  const combined = new Uint8Array(base64ToArrayBuffer(encryptedData))

  const iv = combined.slice(0, IV_LENGTH)
  const keyData = combined.slice(IV_LENGTH, IV_LENGTH + KEY_LENGTH / 8)
  const data = combined.slice(IV_LENGTH + KEY_LENGTH / 8)

  // Import the key
  const key = await window.crypto.subtle.importKey('raw', keyData, ALGORITHM, true, [
    'encrypt',
    'decrypt',
  ])

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    data
  )

  return new TextDecoder().decode(decryptedData)
}
