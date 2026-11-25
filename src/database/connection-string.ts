import { existsSync } from "node:fs";

export function connectionStringForRuntime(connectionString: string): string {
  const match = connectionString.match(/(?:^|[?&])sslrootcert=([^&]*)/);
  if (!match) {
    return connectionString;
  }

  let certPath = match[1];
  try {
    certPath = decodeURIComponent(certPath);
  } catch {
    certPath = match[1];
  }

  if (existsSync(certPath)) {
    return connectionString;
  }

  const withoutCert = connectionString
    .replace(/([?&])sslrootcert=[^&]*&/, "$1")
    .replace(/[?&]sslrootcert=[^&]*$/, "");

  if (/(?:^|[?&])sslmode=/.test(withoutCert)) {
    return withoutCert.replace(/([?&]sslmode=)[^&]*/, "$1no-verify");
  }

  const separator = withoutCert.includes("?") ? "&" : "?";
  return `${withoutCert}${separator}sslmode=no-verify`;
}
