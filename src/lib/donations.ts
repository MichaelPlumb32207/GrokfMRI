/** Public tip handles for GrokfMRI (same family as Smooth support). */
export const DONATIONS = {
  btc: "bc1qvh99yk40uhw9atsxlfgu6z6zveur7c23n4m2xj",
  lightning: "four_plums@strike.me",
  cashApp: "$mep32207",
} as const;

export const DONATION_LINKS = {
  btcUri: `bitcoin:${DONATIONS.btc}`,
  lightningUri: `lightning:${DONATIONS.lightning}`,
  cashAppUrl: `https://cash.app/${DONATIONS.cashApp}`,
} as const;
