export function capitalizeFirstLetter(str: string): string {
  if (!str) {
    return str; // Handles empty or null strings
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}