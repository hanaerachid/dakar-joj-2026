import type { SessionUser } from "../../shared/contracts.js";

export type AppVars = {
  user?: SessionUser;
  requestId: string;
};