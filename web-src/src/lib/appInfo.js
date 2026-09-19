import { Capacitor, registerPlugin } from "@capacitor/core";

// Implemented in ios/App/App/AppInfoPlugin.swift. Other platforms show the
// fallback, which must match the iOS MARKETING_VERSION.
const AppInfo = registerPlugin("AppInfo");

export const FALLBACK_APP_VERSION = "1.1.0";

export function formatAppVersion(info) {
  if (!info?.version) return FALLBACK_APP_VERSION;
  return info.build ? `${info.version} (${info.build})` : info.version;
}

export async function getAppVersionLabel() {
  if (!Capacitor.isPluginAvailable("AppInfo")) return FALLBACK_APP_VERSION;

  try {
    return formatAppVersion(await AppInfo.getInfo());
  } catch {
    return FALLBACK_APP_VERSION;
  }
}
