"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/lib/data/profiles";
import { validateImageFile, compressImage } from "@/lib/utils/image";
import { checkUsername, saveProfile, uploadPhoto } from "./actions";
import { messages } from "./messages";
import {
  USERNAME_MIN_LENGTH,
  getUsernameValidationError,
} from "./validation";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

interface ProfileFormProps {
  profile: Profile | null;
  isEdit: boolean;
}

export function ProfileForm({ profile, isEdit }: ProfileFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [usernameValue, setUsernameValue] = useState(profile?.username ?? "");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>(
    isEdit ? "available" : "idle",
  );
  const [usernameError, setUsernameError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    profile?.profile_photo_url ?? "",
  );
  const [boatPhotoUrl, setBoatPhotoUrl] = useState(
    profile?.boat_photo_url ?? "",
  );
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBoat, setUploadingBoat] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestUsernameValueRef = useRef(profile?.username ?? "");
  const usernameCheckRequestRef = useRef(0);

  function cancelPendingUsernameCheck() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    usernameCheckRequestRef.current += 1;
  }

  function handleUsernameChange(value: string) {
    setUsernameValue(value);
    latestUsernameValueRef.current = value;
    setUsernameError("");
    setFieldErrors((prev) => ({ ...prev, username: "" }));
    cancelPendingUsernameCheck();

    const normalizedValue = value.trim();

    if (!normalizedValue || normalizedValue.length < USERNAME_MIN_LENGTH) {
      setUsernameStatus("idle");
      return;
    }

    const validationError = getUsernameValidationError(value);
    if (validationError) {
      setUsernameStatus("invalid");
      setUsernameError(validationError);
      return;
    }

    const requestId = usernameCheckRequestRef.current;
    setUsernameStatus("checking");

    debounceRef.current = setTimeout(async () => {
      const formData = new FormData();
      formData.set("username", normalizedValue);
      const result = await checkUsername(formData);

      if (
        requestId !== usernameCheckRequestRef.current ||
        latestUsernameValueRef.current.trim() !== normalizedValue
      ) {
        return;
      }

      if (result.error) {
        setUsernameStatus("invalid");
        setUsernameError(result.error.message);
        return;
      }

      if (result.data.available) {
        setUsernameStatus("available");
        setUsernameError("");
      } else {
        setUsernameStatus("taken");
        setUsernameError(messages.fields.username.taken);
      }
    }, 300);
  }

  function handleUsernameBlur(value: string) {
    const normalizedValue = value.trim();

    if (normalizedValue !== value) {
      setUsernameValue(normalizedValue);
      latestUsernameValueRef.current = normalizedValue;
    }

    const validationError = getUsernameValidationError(normalizedValue);
    if (!validationError) {
      setFieldErrors((prev) => ({ ...prev, username: "" }));
      return;
    }

    cancelPendingUsernameCheck();
    setUsernameStatus("invalid");
    setUsernameError(validationError);
    setFieldErrors((prev) => ({ ...prev, username: validationError }));
  }

  async function handlePhotoUpload(
    file: File,
    field: "profile_photo_url" | "boat_photo_url",
  ) {
    const setUploading =
      field === "profile_photo_url" ? setUploadingProfile : setUploadingBoat;
    const setUrl =
      field === "profile_photo_url" ? setProfilePhotoUrl : setBoatPhotoUrl;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploading(true);

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.set("file", compressed);
      formData.set("field", field);

      const result = await uploadPhoto(formData);

      if (result.error) {
        toast.error(messages.toast.photoError);
        return;
      }

      setUrl(result.data.url);
      toast.success(messages.toast.photoUploaded);
    } catch {
      toast.error(messages.toast.photoError);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    cancelPendingUsernameCheck();
    setSubmitting(true);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const usernameValidationError = getUsernameValidationError(usernameValue);

    if (usernameValidationError) {
      setUsernameStatus("invalid");
      setUsernameError(usernameValidationError);
      setFieldErrors({ username: usernameValidationError });
      toast.error(messages.toast.error);
      setSubmitting(false);
      return;
    }

    const result = await saveProfile(formData);

    if (result.error) {
      if (result.error.code === "VALIDATION_ERROR") {
        setUsernameStatus(
          result.error.message === messages.fields.username.taken ? "taken" : "invalid",
        );
        setUsernameError(result.error.message);
        setFieldErrors({ username: result.error.message });
      }
      toast.error(messages.toast.error);
      setSubmitting(false);
      return;
    }

    toast.success(isEdit ? messages.toast.updated : messages.toast.created);
    router.push("/dashboard");
  }

  const usernameIndicator = () => {
    switch (usernameStatus) {
      case "checking":
        return (
          <span className="text-small text-mist">
            {messages.fields.username.checking}
          </span>
        );
      case "available":
        return (
          <span className="text-small text-success">
            ✓ {messages.fields.username.available}
          </span>
        );
      case "taken":
      case "invalid":
        return (
          <span className="text-small text-error">{usernameError}</span>
        );
      default:
        return null;
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-small font-semibold text-slate">
          {messages.fields.username.label}{" "}
          <span className="text-coral">*</span>
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={20}
          pattern="^[a-z][a-z0-9-]*$"
          placeholder={messages.fields.username.placeholder}
          value={usernameValue}
          className="min-h-[44px]"
          onChange={(e) => handleUsernameChange(e.target.value)}
          onBlur={(e) => handleUsernameBlur(e.target.value)}
          aria-invalid={
            usernameStatus === "taken" || usernameStatus === "invalid" || !!fieldErrors.username
          }
        />
        <div className="min-h-[20px]">
          {fieldErrors.username ? (
            <span className="text-small text-error">{fieldErrors.username}</span>
          ) : (
            usernameIndicator()
          )}
        </div>
        <p className="text-tiny text-mist">{messages.fields.username.hint}</p>
      </div>

      {/* Boat Name */}
      <div className="space-y-2">
        <Label htmlFor="boat_name" className="text-small font-semibold text-slate">
          {messages.fields.boatName.label}
        </Label>
        <Input
          id="boat_name"
          name="boat_name"
          type="text"
          maxLength={100}
          placeholder={messages.fields.boatName.placeholder}
          defaultValue={profile?.boat_name ?? ""}
          className="min-h-[44px]"
        />
      </div>

      {/* Boat Type */}
      <div className="space-y-2">
        <Label htmlFor="boat_type" className="text-small font-semibold text-slate">
          {messages.fields.boatType.label}
        </Label>
        <Input
          id="boat_type"
          name="boat_type"
          type="text"
          maxLength={100}
          placeholder={messages.fields.boatType.placeholder}
          defaultValue={profile?.boat_type ?? ""}
          className="min-h-[44px]"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-small font-semibold text-slate">
          {messages.fields.bio.label}
        </Label>
        <Textarea
          id="bio"
          name="bio"
          maxLength={500}
          rows={3}
          placeholder={messages.fields.bio.placeholder}
          defaultValue={profile?.bio ?? ""}
        />
      </div>

      {/* Profile Photo */}
      <div className="space-y-2">
        <Label className="text-small font-semibold text-slate">
          {messages.fields.profilePhoto.label}
        </Label>
        <div className="flex items-center gap-4">
          <Avatar className="size-16" size="lg">
            {profilePhotoUrl ? (
              <AvatarImage src={profilePhotoUrl} alt="Profile" />
            ) : null}
            <AvatarFallback className="bg-sand text-navy text-h3">
              ⚓
            </AvatarFallback>
          </Avatar>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploadingProfile}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file, "profile_photo_url");
              }}
            />
            <span className="inline-flex min-h-[36px] items-center rounded-[var(--radius-button)] border border-navy/20 px-4 py-2 text-small font-semibold text-navy transition-colors hover:bg-foam">
              {uploadingProfile
                ? messages.actions.saving
                : profilePhotoUrl
                  ? messages.fields.profilePhoto.change
                  : messages.fields.profilePhoto.upload}
            </span>
          </label>
        </div>
      </div>

      {/* Boat Photo */}
      <div className="space-y-2">
        <Label className="text-small font-semibold text-slate">
          {messages.fields.boatPhoto.label}
        </Label>
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-[var(--radius-button)] bg-sand">
            {boatPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={boatPhotoUrl} alt="Boat" className="size-full object-cover" />
            ) : (
              <span className="text-h3 text-navy">⛵</span>
            )}
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploadingBoat}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file, "boat_photo_url");
              }}
            />
            <span className="inline-flex min-h-[36px] items-center rounded-[var(--radius-button)] border border-navy/20 px-4 py-2 text-small font-semibold text-navy transition-colors hover:bg-foam">
              {uploadingBoat
                ? messages.actions.saving
                : boatPhotoUrl
                  ? messages.fields.boatPhoto.change
                  : messages.fields.boatPhoto.upload}
            </span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={
          submitting ||
          usernameStatus === "taken" ||
          usernameStatus === "invalid" ||
          usernameStatus === "checking"
        }
        className="w-full min-h-[44px] bg-coral text-white hover:bg-coral/90"
      >
        {submitting
          ? messages.actions.saving
          : isEdit
            ? messages.actions.update
            : messages.actions.save}
      </Button>
    </form>
  );
}
