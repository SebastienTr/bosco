export const messages = {
  meta: {
    notFoundTitle: "Voyage not found",
    descriptionFallback: (username: string, totalDistanceNm: number) =>
      totalDistanceNm > 0
        ? `Sailing voyage by ${username} · ${totalDistanceNm.toFixed(1)} nm`
        : `Sailing voyage by ${username}`,
  },
  map: {
    ariaLabel: "Public sailing voyage map",
  },
  animation: {
    playing: "Route animation playing",
    complete: "Route animation complete",
  },
  stats: {
    sailedLabel: "SAILED",
    sailedUnit: "nm",
    daysLabel: "DAYS",
    portsLabel: "PORTS",
    countriesLabel: "COUNTRIES",
    sailedAriaLabel: (value: string) => `${value} nautical miles sailed`,
    daysAriaLabel: (value: number) => `${value} days at sea`,
    portsAriaLabel: (value: number) => `${value} ports of call`,
    countriesAriaLabel: (value: number) => `${value} countries visited`,
  },
  boatBadge: {
    expandLabel: "Show boat details",
    collapseLabel: "Hide boat details",
    profileLink: "View profile",
  },
};
