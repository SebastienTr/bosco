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
  },
  voyages: {
    title: "Public voyages",
    emptyTitle: "No public voyages yet",
    emptyDescription:
      "This sailor has not shared any voyages publicly for now.",
    noDescription: "No description yet.",
    portLabel: (count: number) => (count === 1 ? "port" : "ports"),
    linkLabel: (name: string) => `Open ${name}`,
  },
};
