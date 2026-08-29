
import { GitHubCredentialModel } from "@repo/db";

export interface InstallationRecord {
  installationId: string;
  /** Platform user (Google `sub`) this installation belongs to. */
  userId: string;
  accountLogin: string;
  connectedAt: string;
}


export async function saveInstallation(record: InstallationRecord): Promise<void> {
  await GitHubCredentialModel.updateOne(
    { installationId: record.installationId },
    {
      $set: {
        userId: record.userId,
        accountLogin: record.accountLogin,
        connectedAt: record.connectedAt,
      },
      $setOnInsert: { _id: crypto.randomUUID() },
    },
    { upsert: true },
  );
}

export async function listInstallationsForUser(userId: string): Promise<InstallationRecord[]> {
  const rows = await GitHubCredentialModel.find({ userId }).lean();
  return rows.map((row) => ({
    installationId: row.installationId,
    userId: row.userId,
    accountLogin: row.accountLogin,
    connectedAt: row.connectedAt ?? "",
  }));
}

export async function userOwnsInstallation(
  userId: string,
  installationId: string,
): Promise<boolean> {
  const match = await GitHubCredentialModel.exists({ userId, installationId });
  return match !== null;
}
