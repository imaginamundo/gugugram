/**
 * Shared page sizes. `COMMENTS_PAGE_SIZE` lives in `utils` rather than in the
 * service because the UI needs the same number to work out which page to ask
 * for next, and a component may not import from the service layer at runtime.
 */
export const COMMENTS_PAGE_SIZE = 50;
