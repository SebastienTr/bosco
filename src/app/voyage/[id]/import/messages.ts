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
    importFailed: "Import failed — please try again",
    voyageNotFound: "Voyage not found",
    notGpx: {
      title: "This file isn't GPX format",
      description:
        "Bosco works with GPX files exported from navigation apps like Navionics.",
      helpLink: "Need help exporting from Navionics?",
      helpHref: "/help/navionics-export",
    },
    tooLarge: {
      title: (sizeMb: number) => `This file is too large (${sizeMb} MB)`,
      description: "Maximum file size is 400 MB. Try exporting fewer tracks.",
    },
    networkError: {
      title: "Upload interrupted — no connection",
      description: "Check your internet connection and try again.",
    },
    processingFailed: {
      title: "Something went wrong processing this file",
      description: "Please try again or use a different file.",
    },
  },
};
