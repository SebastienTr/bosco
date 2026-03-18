export const messages = {
  meta: {
    notFoundTitle: "Sailor not found",
    title: (username: string) => `@${username} on Bosco`,
    description: (username: string) =>
      `Public sailing profile for ${username}`,
  },
  profile: {
    eyebrow: "Public profile",
    noBoatName: "Boat details coming soon",
    photoAlt: (username: string) => `${username}'s profile photo`,
    boatPhotoAlt: (name: string) => `${name}'s boat`,
  },
  voyages: {
    title: "Public voyages",
    emptyTitle: "No public voyages yet",
    emptyDescription:
      "This sailor has not shared any voyages publicly for now.",
    noDescription: "No description yet.",
    portLabel: (count: number) => (count === 1 ? "port" : "ports"),
    countryLabel: (count: number) => (count === 1 ? "country" : "countries"),
    coverAlt: (name: string) => `Cover image for ${name}`,
    linkLabel: (name: string) => `Open ${name}`,
  },
};
