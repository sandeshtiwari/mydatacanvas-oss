import { createHash } from "crypto";

export function sha256(input: string | Buffer): string {
  const hash = createHash("sha256");
  hash.update(input);
  return hash.digest("hex");
}
