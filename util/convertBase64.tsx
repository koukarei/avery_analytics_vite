function base64ToBlob(base64: string, mime = 'image/png') {
  const binStr = atob(base64);
  const len = binStr.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; ++i) u8[i] = binStr.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

export { base64ToBlob };