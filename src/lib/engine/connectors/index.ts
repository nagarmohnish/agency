// Connector factory. Given an account + platform, hand back the right
// connector. Agents and the gate use this; they never import a platform file.

import type { EngineAccount, Platform } from "../types";
import type { AdConnector } from "./types";
import { GoogleConnector } from "./google";
import { MetaConnector } from "./meta";

export function connectorFor(account: EngineAccount, platform: Platform): AdConnector {
  switch (platform) {
    case "google":
      return new GoogleConnector(account);
    case "meta":
      return new MetaConnector(account);
  }
}

/** Which platforms this account has identifiers configured for. */
export function configuredPlatforms(account: EngineAccount): Platform[] {
  const out: Platform[] = [];
  if (account.google_customer_id) out.push("google");
  if (account.meta_ad_account_id) out.push("meta");
  return out;
}

export type { AdConnector };
