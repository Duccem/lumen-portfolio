import { createAuth } from "@portfolio/auth";
import { createDb } from "@portfolio/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
