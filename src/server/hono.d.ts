import type { SessionUser } from "../shared/contracts";

declare module "hono" {
  interface ContextVariableMap {
    user: SessionUser | undefined;
    requestId: string;
  }
}
