import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, Mail, Phone, Save, User } from "lucide-react";

import api from "../api/axios";
import FormInput from "../components/FormInput";
import ImageUpload from "../components/ImageUpload";
import UniversitySelect from "../components/UniversitySelect";
import { OTHERS, UNIVERSITIES } from "../data/universities";
import { getUser, saveSession } from "../utils/auth";

const DEFAULT_IMAGE = "/images/default-profile.png"; // same default your backend uses

export default function Profile() {
  const [stored] = useState(() => getUser() || {});

  // If the saved university is not in our list, show it under "Others"
  const knownUni = !stored.university || UNIVERSITIES.includes(stored.university);

  const [form, setForm] = useState({
    firstName: stored.firstName || "",
    lastName: stored.lastName || "",
    phone: stored.phone || "",
  });
  const [image, setImage] = useState(
    /^(https?:\/\/|data:image\/)/i.test(stored.image || "") ? stored.image : ""
  );
  const [imageChanged, setImageChanged] = useState(false);
  const [university, setUniversity] = useState(knownUni ? stored.university || "" : OTHERS);
  const [customUniversity, setCustomUniversity] = useState(knownUni ? "" : stored.university);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Backend accepts digits only (10-15), so strip spaces, dashes, + and brackets
    const phone = form.phone.replace(/[\s()+-]/g, "");

    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";

    if (!phone) errs.phone = "Phone number is required";
    else if (!/^\d{10,15}$/.test(phone)) errs.phone = "Enter 10 to 15 digits";

    if (!university) errs.university = "Please select your university";
    else if (university === OTHERS && !customUniversity.trim())
      errs.university = "Please enter your university name";

    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone,
      university: university === OTHERS ? customUniversity.trim() : university,
    };
    // Only send the image when the user changed it (removed = back to default)
    if (imageChanged) payload.image = image || DEFAULT_IMAGE;

    try {
      setLoading(true);
      const res = await api.put("/users/profile", payload);

      // Save only the user. The returned token embeds the image and can get
      // too large, and the current token is still valid.
      saveSession({ user: res.data.user });

      setImageChanged(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl"
    >
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-ink">My profile</h1>
          <p className="mt-1 text-sm text-muted">
            Your phone number and university are required so you can be contacted.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <ImageUpload
            value={image}
            onChange={(v) => {
              setImage(v);
              setImageChanged(true);
            }}
            name={`${form.firstName} ${form.lastName}`}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              icon={User}
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />
            <FormInput
              icon={User}
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
          </div>

          <FormInput
            icon={Mail}
            label="Email"
            value={stored.email || ""}
            disabled
            readOnly
          />

          <FormInput
            icon={Phone}
            label="Phone number"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="0771234567"
            autoComplete="tel"
            error={errors.phone}
          />

          <div className="relative z-20">
            <UniversitySelect
              optional={false}
              value={university}
              onChange={(v) => {
                setUniversity(v);
                setErrors((p) => ({ ...p, university: "" }));
              }}
              customValue={customUniversity}
              onCustomChange={(v) => {
                setCustomUniversity(v);
                setErrors((p) => ({ ...p, university: "" }));
              }}
              error={errors.university}
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={18} /> Save changes
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}