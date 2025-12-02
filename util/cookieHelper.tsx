
// Cookie helpers
function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name: string): string | null {
  const encodedName = encodeURIComponent(name) + "=";
  const parts = document.cookie ? document.cookie.split('; ') : [];
  const match = parts.find((p) => p.startsWith(encodedName));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export { setCookie, getCookie };