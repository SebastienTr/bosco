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
  stopoverSheet: {
    arrivedLabel: "Arrived",
    departedLabel: "Departed",
    durationLabel: "Duration",
    addNotePlaceholder: "Add a note...",
    closeLabel: "Close stopover details",
    nightsUnit: (n: number) => (n === 1 ? "1 night" : `${n} nights`),
    hoursUnit: (n: number) => (n === 1 ? "1 hour" : `${n} hours`),
    sheetAriaLabel: "Stopover details",
  },
  portsPanel: {
    header: "Ports of Call",
    ariaLabel: "Ports of call",
    closeLabel: "Close ports panel",
    emptyState: "No stopovers yet",
  },
  actionFab: {
    openLabel: "Open ports panel",
    closeLabel: "Close ports panel",
  },
};
