export type WeightEntry = {
  id: string;
  /** Local calendar day, YYYY-MM-DD. */
  dateISO: string;
  /** Body weight in pounds. */
  weightLb: number;
  loggedAt: string;
};
