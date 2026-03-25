export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}

export function normalizePlayerName(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9 ]+/g, '').slice(0, 16);
}

export function isValidPlayerName(name: string): boolean {
  return /^[A-Za-z0-9 ]{2,16}$/.test(name.trim());
}
