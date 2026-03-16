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
      hint: "3–20 characters. Lowercase letters, numbers, and hyphens. Used in your public URL.",
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
  },
  toast: {
    created: "Profile created",
    updated: "Profile updated",
    photoUploaded: "Photo uploaded",
    error: "Failed to save profile",
    photoError: "Failed to upload photo",
  },
  validation: {
    usernameRequired: "Username is required",
    usernameTooShort: "Username must be at least 3 characters",
    usernameTooLong: "Username must be at most 20 characters",
    invalidFormat:
      "Username must start with a letter and contain only lowercase letters, numbers, and hyphens",
    boatNameTooLong: "Boat name must be at most 100 characters",
    boatTypeTooLong: "Boat type must be at most 100 characters",
    bioTooLong: "Bio must be at most 500 characters",
    noFileProvided: "No file provided",
    invalidPhotoField: "Invalid photo field",
    imageTooLarge: "Image must be under 10 MB",
  },
};
