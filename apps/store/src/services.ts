import { createAuth } from "./lib/auth/auth-server";
import { createDb } from "./lib/database";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
