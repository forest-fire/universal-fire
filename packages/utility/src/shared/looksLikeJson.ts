export function looksLikeJson(data: string) {
  return data.trim().slice(0, 1) === '{' && data.trim().slice(-1) === '}'
    ? true
    : false;
}
