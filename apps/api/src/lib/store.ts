// Temporary in-memory installation store. Lost on every restart — swap for a
// real database once this needs to survive across deploys / multiple users.

export interface InstallationRecord {
  installationId: string;
  accountLogin: string;
  userAccessToken: string;
  connectedAt: string;
}

const installations = new Map<string, InstallationRecord>();

export function saveInstallation(record: InstallationRecord): void {
  installations.set(record.installationId, record);
}

export function getInstallation(installationId: string): InstallationRecord | undefined {
  return installations.get(installationId);
}
