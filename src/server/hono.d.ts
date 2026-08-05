import type { SessionUser } from "../shared/contracts.js";

declare module "hono" {
  interface ContextVariableMap {
    user: SessionUser | undefined;
    requestId: string;
  }
}
