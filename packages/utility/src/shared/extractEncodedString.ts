import { looksLikeJson, FireError } from '../index';

export function extractEncodedString(data?: string) {
  if (!data) {
    return undefined;
  }
  let failedJsonParse = false;
  if (looksLikeJson(data)) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // ignore and try BASE64
      failedJsonParse = true;
    }
  }
  try {
    const buffer = Buffer.from(data, 'base64');
    return JSON.parse(buffer.toString());
  } catch (e) {
    if (failedJsonParse) {
      throw new FireError(
        `Failed to parse the passed in encoded string; it appeared to be a JSON string but both JSON and Base64 decoding failed!`,
        `parse-failed`
      );
    } else {
      throw new FireError(
        `Failed to parse the passed in the Base64 encoded string`,
        `parse-failed`
      );
    }
  }
}
