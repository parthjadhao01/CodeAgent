// Temporary in-memory installation store. Lost on every restart — swap for a
// real database once this needs to survive across deploys / multiple users.
// The persisted shape is already modelled as GitHubCredential in packages/db.

export interface InstallationRecord {
  installationId: string;
  /** Platform user (Google `sub`) this installation belongs to. */
  userId: string;
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

export function listInstallationsForUser(userId: string): InstallationRecord[] {
  return [...installations.values()].filter((record) => record.userId === userId);
}

export function userOwnsInstallation(userId: string, installationId: string): boolean {
  return getInstallation(installationId)?.userId === userId;
}
