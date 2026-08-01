import { ensureSessionLoaded, getSessionUser } from "./session";

export const auth = {
  get currentUser() {
    return getSessionUser();
  },
};

export const db = undefined as never;
export const storage = undefined as never;

export const authReady = ensureSessionLoaded().then(() => undefined);
