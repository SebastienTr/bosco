export const messages = {
  meta: {
    title: "Bosco — Profile Setup",
    description: "Set up your sailor profile on Bosco.",
  },
  eyebrow: "Profile",
  titleCreate: "Create your profile",
  titleEdit: "Edit your profile",
  descriptionCreate:
    "Choose a unique username for your public URL and tell us about your boat.",
  descriptionEdit:
    "Update your sailor identity and boat information.",
  fields: {
    username: {
      label: "Username",
      placeholder: "your-username",
      hint: "3–20 characters. Letters, numbers, and hyphens. Used in your public URL.",
      available: "Available",
      taken: "This username is already taken",
      checking: "Checking availability...",
    },
    boatName: {
      label: "Boat name",
      placeholder: "e.g. Laurine",
    },
    boatType: {
      label: "Boat type",
      placeholder: "e.g. Laurin Koster 28",
    },
    bio: {
      label: "Bio",
      placeholder: "Tell us about yourself and your sailing adventures...",
    },
    profilePhoto: {
      label: "Profile photo",
      change: "Change photo",
      upload: "Upload photo",
    },
    boatPhoto: {
      label: "Boat photo",
      change: "Change photo",
      upload: "Upload photo",
    },
  },
  required: "Required",
  actions: {
    save: "Save profile",
    update: "Update profile",
    saving: "Saving...",
    signOut: "Sign out",
  },
  legal: {
    title: "Legal",
    description:
      "Review Bosco's privacy policy and terms of service before you share voyages publicly.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },
  danger: {
    title: "Delete account",
    description:
      "Permanently delete your Bosco account and the voyages, journal data, and media tied to it.",
    warning:
      "This action cannot be undone. Bosco will permanently delete your account, voyages, journal entries, and uploaded media.",
    trigger: "Delete my account",
    validationConfirmation: "Invalid account deletion request",
    dialog: {
      title: "Delete your Bosco account?",
      description:
        "Your account, voyages, journal data, and uploaded media will be permanently deleted. This action is irreversible.",
      cancel: "Keep account",
      confirm: "Delete account",
      deleting: "Deleting account...",
    },
  },
  toast: {
    created: "Profile created",
    updated: "Profile updated",
    photoUploaded: "Photo uploaded",
    error: "Failed to save profile",
    photoError: "Failed to upload photo",
    accountDeletedSuccess: "Your account has been permanently deleted",
    accountDeletedError: "Failed to delete your account",
  },
  validation: {
    usernameRequired: "Username is required",
    usernameTooShort: "Username must be at least 3 characters",
    usernameTooLong: "Username must be at most 20 characters",
    invalidFormat:
      "Username must start with a letter and contain only letters, numbers, and hyphens",
    boatNameTooLong: "Boat name must be at most 100 characters",
    boatTypeTooLong: "Boat type must be at most 100 characters",
    bioTooLong: "Bio must be at most 500 characters",
    noFileProvided: "No file provided",
    invalidPhotoField: "Invalid photo field",
    imageTooLarge: "Image must be under 18 MB",
  },
};
