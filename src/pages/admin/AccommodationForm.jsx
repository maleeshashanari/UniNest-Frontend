import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Banknote,
  BedDouble,
  Building2,
  Hash,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Save,
  Type,
} from "lucide-react";

import { addAccommodation, getAccommodation, updateAccommodation } from "../../api/accommodations";
import FormInput from "../../components/FormInput";
import MultiImageUpload from "../../components/MultiImageUpload";
import SelectInput from "../../components/SelectInput";
import UniversitySelect from "../../components/UniversitySelect";
import { AMENITIES, DEFAULT_IMAGE, SUITABLE_FOR, TYPES } from "../../data/accommodationOptions";
import { OTHERS, UNIVERSITIES } from "../../data/universities";
import { uploadAccommodationImage } from "../../utils/uploadImage";
import { isRealImage } from "../../utils/format";

const EMPTY = {
  accommodationId: "",
  title: "",
  description: "",
  type: "",
  suitableFor: "Any",
  monthlyRent: "",
  securityDeposit: "",
  address: "",
  city: "",
  district: "",
  totalRooms: "1",
  availableRooms: "1",
  contactNumber: "",
  isAvailable: true,
};

function Section({ title, hint, children }) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 sm:p-8">
      <h2 className="text-lg font-extrabold text-ink">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

// Wrapper: a different `key` resets the whole form when switching between add and edit
export default function AccommodationForm() {
  const { id } = useParams();
  return <FormBody key={id || "new"} id={id} />;
}

function FormBody({ id }) {
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loadState, setLoadState] = useState(isEdit ? "loading" : "ready");
  const [form, setForm] = useState(EMPTY);
  const [university, setUniversity] = useState("");
  const [customUniversity, setCustomUniversity] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // Load existing data when editing
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;

    getAccommodation(id)
      .then(({ accommodation: a }) => {
        if (cancelled) return;
        const knownUni = !a.university || UNIVERSITIES.includes(a.university);

        setForm({
          accommodationId: a.accommodationId || "",
          title: a.title || "",
          description: a.description || "",
          type: a.type || "",
          suitableFor: a.suitableFor || "Any",
          monthlyRent: String(a.monthlyRent ?? ""),
          securityDeposit: String(a.securityDeposit ?? ""),
          address: a.location?.address || "",
          city: a.location?.city || "",
          district: a.location?.district || "",
          totalRooms: String(a.totalRooms ?? 1),
          availableRooms: String(a.availableRooms ?? 0),
          contactNumber: a.contactNumber || "",
          isAvailable: Boolean(a.isAvailable),
        });
        setUniversity(knownUni ? a.university || "" : OTHERS);
        setCustomUniversity(knownUni ? "" : a.university);
        setAmenities(a.amenities || []);
        setImages(
          (a.images || []).filter(isRealImage).map((src) => ({
            id: crypto.randomUUID(),
            src,
            blob: null,
          }))
        );
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Rooms became available again, so list it again
      if (name === "availableRooms" && Number(value) > 0 && Number(prev.availableRooms) === 0) {
        next.isAvailable = true;
      }
      return next;
    });
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const generateId = () => {
    const code = `ACC-${Date.now().toString().slice(-6)}`;
    setForm((p) => ({ ...p, accommodationId: code }));
    setErrors((p) => ({ ...p, accommodationId: "" }));
  };

  const toggleAmenity = (name) =>
    setAmenities((list) => (list.includes(name) ? list.filter((a) => a !== name) : [...list, name]));

  const addCustomAmenity = () => {
    const value = customAmenity.trim();
    if (value && !amenities.some((a) => a.toLowerCase() === value.toLowerCase())) {
      setAmenities((list) => [...list, value]);
    }
    setCustomAmenity("");
  };

  const validate = () => {
    const e = {};
    if (!isEdit && !form.accommodationId.trim()) e.accommodationId = "Accommodation ID is required";
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.type) e.type = "Select a type";

    const rent = Number(form.monthlyRent);
    if (form.monthlyRent === "" || !Number.isFinite(rent) || rent <= 0)
      e.monthlyRent = "Enter a rent greater than 0";

    if (
      form.securityDeposit !== "" &&
      (!Number.isFinite(Number(form.securityDeposit)) || Number(form.securityDeposit) < 0)
    )
      e.securityDeposit = "Enter 0 or more";

    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";

    const total = Number(form.totalRooms);
    const avail = Number(form.availableRooms);
    if (!Number.isInteger(total) || total < 1) e.totalRooms = "At least 1 room";
    if (!Number.isInteger(avail) || avail < 0) e.availableRooms = "Enter 0 or more";
    else if (Number.isInteger(total) && avail > total) e.availableRooms = "Cannot exceed total rooms";

    if (!form.contactNumber.trim()) e.contactNumber = "Contact number is required";
    else if (!/^\+?[0-9\s-]{9,15}$/.test(form.contactNumber.trim()))
      e.contactNumber = "Enter a valid phone number";

    if (!university) e.university = "Please select the nearby university";
    else if (university === OTHERS && !customUniversity.trim())
    e.university = "Please enter the university name";

    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      setSaving(true);

      // 1) Upload new photos to Supabase (already uploaded ones keep their URL)
      const pending = images.filter((i) => i.blob).length;
      if (pending) setStatus(`Uploading ${pending} photo${pending > 1 ? "s" : ""}...`);

      let urls;
      try {
        urls = await Promise.all(
          images.map((i) => (i.blob ? uploadAccommodationImage(i.blob) : i.src))
        );
      } catch (err) {
        console.error("Supabase upload error:", err);
        toast.error(`Photo upload failed: ${err.message || "check your Supabase bucket policies"}`);
        return;
      }

      // 2) Send the accommodation to your backend
      setStatus("Saving...");
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        suitableFor: form.suitableFor,
        monthlyRent: Number(form.monthlyRent),
        securityDeposit: form.securityDeposit === "" ? 0 : Number(form.securityDeposit),
        location: {
          address: form.address.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
        },
        university: university === OTHERS ? customUniversity.trim() : university,
        totalRooms: Number(form.totalRooms),
        availableRooms: Number(form.availableRooms),
        amenities,
        images: urls.length ? urls : [DEFAULT_IMAGE],
        contactNumber: form.contactNumber.trim(),
      };

      if (isEdit) {
        payload.isAvailable = Number(form.availableRooms) > 0 && form.isAvailable;
        await updateAccommodation(id, payload);
        toast.success("Accommodation updated");
      } else {
        payload.accommodationId = form.accommodationId.trim();
        await addAccommodation(payload);
        toast.success("Accommodation added");
      }

      navigate("/admin/accommodations");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not save accommodation";
      toast.error(msg);
      if (err.response?.status === 409) setErrors({ accommodationId: msg });
    } finally {
      setSaving(false);
      setStatus("");
    }
  };

  if (loadState === "loading") {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center">
        <p className="font-bold text-ink">Could not load this accommodation</p>
        <Link
          to="/admin/accommodations"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600"
        >
          <ArrowLeft size={16} /> Back to list
        </Link>
      </div>
    );
  }

  const chips = [...AMENITIES, ...amenities.filter((a) => !AMENITIES.includes(a))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-3xl"
    >
      <Link
        to="/admin/accommodations"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={16} /> All accommodations
      </Link>

      <h1 className="mb-6 text-2xl font-extrabold text-ink sm:text-3xl">
        {isEdit ? "Edit accommodation" : "Add accommodation"}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Section title="Basic details">
          <FormInput
            icon={Hash}
            label="Accommodation ID"
            name="accommodationId"
            value={form.accommodationId}
            onChange={handleChange}
            placeholder="e.g. ACC-0001"
            disabled={isEdit}
            error={errors.accommodationId}
            right={
              !isEdit && (
                <button
                  type="button"
                  onClick={generateId}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700"
                >
                  Generate
                </button>
              )
            }
          />

          <FormInput
            icon={Type}
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Sunrise Boys Hostel"
            error={errors.title}
          />

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the place, rules, distance to campus..."
              className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-ink outline-none transition-all placeholder:text-slate-400 ${
                errors.description
                  ? "border-danger ring-4 ring-danger/10"
                  : "border-border hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs font-medium text-danger">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectInput
              icon={Building2}
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              error={errors.type}
            >
              <option value="">Select type</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Suitable for</label>
              <div className="flex gap-2">
                {SUITABLE_FOR.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, suitableFor: s }))}
                    className={`flex-1 rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${
                      form.suitableFor === s
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-border text-muted hover:border-primary-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Pricing & rooms">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              icon={Banknote}
              label="Monthly rent (Rs.)"
              type="number"
              min="0"
              name="monthlyRent"
              value={form.monthlyRent}
              onChange={handleChange}
              placeholder="15000"
              error={errors.monthlyRent}
            />
            <FormInput
              icon={Banknote}
              label="Security deposit (Rs.)"
              optional
              type="number"
              min="0"
              name="securityDeposit"
              value={form.securityDeposit}
              onChange={handleChange}
              placeholder="0"
              error={errors.securityDeposit}
            />
            <FormInput
              icon={BedDouble}
              label="Total rooms"
              type="number"
              min="1"
              name="totalRooms"
              value={form.totalRooms}
              onChange={handleChange}
              error={errors.totalRooms}
            />
            <FormInput
              icon={BedDouble}
              label="Available rooms"
              type="number"
              min="0"
              name="availableRooms"
              value={form.availableRooms}
              onChange={handleChange}
              error={errors.availableRooms}
            />
          </div>

          {isEdit && (
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span>
                <span className="block text-sm font-bold text-ink">Visible to students</span>
                <span className="block text-xs text-muted">
                  Turns off automatically when available rooms is 0.
                </span>
              </span>
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))}
                className="h-5 w-5 accent-primary-600"
              />
            </label>
          )}
        </Section>

        <Section title="Location & contact">
          <FormInput
            icon={MapPin}
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="No. 12, College Road"
            error={errors.address}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              icon={MapPin}
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Colombo"
              error={errors.city}
            />
            <FormInput
              icon={MapPin}
              label="District"
              optional
              name="district"
              value={form.district}
              onChange={handleChange}
              placeholder="Colombo"
            />
          </div>

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
            <p className="mt-1.5 text-xs text-muted">
              Required. The nearby university helps students find stays close to campus.
            </p>
          </div>

          <FormInput
            icon={Phone}
            label="Contact number"
            type="tel"
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="0771234567"
            error={errors.contactNumber}
          />
        </Section>

        <Section title="Amenities" hint="Tap to select everything this place offers.">
          <div className="flex flex-wrap gap-2">
            {chips.map((name) => {
              const on = amenities.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleAmenity(name)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    on
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-border text-muted hover:border-primary-300"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomAmenity();
                }
              }}
              placeholder="Add another amenity"
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
            />
            <button
              type="button"
              onClick={addCustomAmenity}
              className="flex shrink-0 items-center gap-1 rounded-xl bg-primary-50 px-4 text-sm font-bold text-primary-700 hover:bg-primary-100"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </Section>

        <Section
          title="Photos"
          hint="The first photo is the cover. Photos upload to Supabase when you click Save."
        >
          <MultiImageUpload items={images} onChange={setImages} />
        </Section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/accommodations"
            className="rounded-xl border border-border px-6 py-3.5 text-center text-sm font-bold text-ink hover:bg-slate-50"
          >
            Cancel
          </Link>
          <motion.button
            type="submit"
            disabled={saving}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 disabled:opacity-70"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" /> {status || "Saving..."}
              </>
            ) : (
              <>
                <Save size={18} /> {isEdit ? "Save changes" : "Add accommodation"}
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}