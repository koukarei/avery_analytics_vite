import { btoa } from 'js-base64';

const createBase64 = (arrayBuffer: ArrayBuffer) => {
  const buffer = arrayBuffer // APIで取得したデータ
  const bytes = new Uint8Array(buffer);

  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Data = btoa(binary);

  return base64Data;
}

export default createBase64;