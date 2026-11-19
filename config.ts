/**
 * Everything a site owner would want to change lives here.
 */
export const CONFIG = {
  /**
   * Where a click on a state should go. Jobboardly boards search with /jobs?place=<location>,
   * so on the real site this can stay relative.
   */
  jobsUrl: (_code: string, name: string): string =>
    `/jobs?place=${encodeURIComponent(name + ', United States')}`,

  /** States drawn in the accent color (e.g. compact / featured states). */
  highlighted: ['ND', 'NE', 'AZ', 'LA', 'SC'],

  /** Open job searches in a new tab. */
  openInNewTab: false,
};
