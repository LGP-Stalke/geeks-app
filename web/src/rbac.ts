export const FEATURE = {
  PLANNING_ME: "planning:me",
  PLANNING_TEAM: "planning:team",
  INTERVENTIONS_MINE: "interventions:mine",
  INTERVENTIONS_ALL: "interventions:all",
  USERS_ADMIN: "users:admin",
  BILLING: "billing:*",
  STOCK: "inventory:*",
} as const;
type FeatureKey = typeof FEATURE[keyof typeof FEATURE];
type Role = "admin"|"manager"|"technician"|"sales"|"viewer";

export const ROLE_FEATURES: Record<Role, FeatureKey[]> = {
  technician: [FEATURE.PLANNING_ME, FEATURE.INTERVENTIONS_MINE],
  manager: [FEATURE.PLANNING_TEAM, FEATURE.INTERVENTIONS_ALL, FEATURE.STOCK],
  admin: [FEATURE.PLANNING_TEAM, FEATURE.INTERVENTIONS_ALL, FEATURE.USERS_ADMIN, FEATURE.BILLING, FEATURE.STOCK],
  sales: [FEATURE.BILLING],
  viewer: [],
};
export const can = (role:Role, f:FeatureKey)=> ROLE_FEATURES[role]?.includes(f) ?? false;

