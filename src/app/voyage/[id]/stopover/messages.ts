export const stopoverMessages = {
  panel: {
    title: "Stopovers",
    toggle: (count: number) => `Stopovers (${count})`,
    close: "Close stopover list",
  },
  marker: {
    ariaLabel: (name: string, country: string | null) =>
      `Stopover: ${[name, country].filter(Boolean).join(", ") || "Unnamed"}`,
    unnamed: "Unnamed",
    clickToRename: "Click to rename",
    deleteAction: "Delete stopover",
    saveButton: "OK",
  },
  actions: {
    renameFailed: "Failed to rename stopover",
    deleteFailed: "Failed to delete stopover",
    repositionFailed: "Failed to reposition stopover",
    mergeFailed: "Failed to merge stopovers",
  },
  list: {
    unknownCountry: "Unknown",
  },
};
