export const messages = {
  meta: { title: "Bosco \u2014 Import Tracks" },
  filePicker: {
    label: "Select GPX file",
    accept: ".gpx",
    hint: "GPX 1.1 files up to 400 MB",
  },
  progress: {
    parsing: "Parsing tracks...",
    simplifying: "Simplifying...",
    detecting: "Detecting stopovers...",
    ready: "Preparing preview...",
    error: "Processing failed",
    retry: "Try again",
  },
  preview: {
    title: "Preview",
    selectAll: "Select all",
    mergeLabel: "Merge into single leg",
    noSelection: "Select at least one track",
    addToVoyage: "Add to voyage",
    importing: "Adding to your voyage...",
    trackFallbackName: "Track",
  },
  success: (count: number, voyageName: string) =>
    `${count} track(s) added to ${voyageName}`,
  error: {
    importFailed: "Import failed \u2014 please try again",
    voyageNotFound: "Voyage not found",
  },
};
