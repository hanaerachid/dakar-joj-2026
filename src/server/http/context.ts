import type { SessionUser } from "../../shared/contracts";

export type AppVars = {
  user?: SessionUser;
  requestId: string;
};