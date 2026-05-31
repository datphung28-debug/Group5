/**
 * Drug safety rules will be loaded from the database in phase 2.
 * Keep the result shape stable so prescription flows do not show simulated warnings.
 */
export const checkPrescriptionSafety = () => ({
  interactions: [],
  dosageWarnings: [],
});
