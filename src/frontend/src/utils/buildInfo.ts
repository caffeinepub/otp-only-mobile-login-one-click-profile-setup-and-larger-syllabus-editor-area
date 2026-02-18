/**
 * Build metadata for tracking draft versions
 */
export const BUILD_INFO = {
  draftVersion: 64,
  buildDate: new Date().toISOString(),
} as const;

export function getBuildVersion(): string {
  return `Draft Version ${BUILD_INFO.draftVersion}`;
}
