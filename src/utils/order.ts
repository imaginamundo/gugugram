import { sql, type Column } from "drizzle-orm";

/**
 * `ORDER BY <column> DESC NULLS LAST`.
 *
 * Drizzle's `desc()` emits a bare `DESC`, which in Postgres means
 * `NULLS FIRST`. Every ordering index in `drizzle/0007_fk_indexes.sql` was
 * created `DESC NULLS LAST`, so a plain `desc()` does not match any of them and
 * the planner falls back to scanning and sorting the whole table. Ordering
 * through this helper is what makes those indexes reachable.
 */
export const descNullsLast = (column: Column) => sql`${column} DESC NULLS LAST`;
