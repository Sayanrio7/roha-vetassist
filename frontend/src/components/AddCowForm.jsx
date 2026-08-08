import { useState } from "react";
import {
  PawPrint,
  Plus,
  X,
  Hash,
  User,
  Phone,
  MapPin,
  Calendar,
  LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import SectionCard from "./SectionCard";
import api from "../services/api";

const emptyForm = {
  cowNumber: "",
  name: "",
  breed: "",
  age: "",
  gender: "Female",
  ownerName: "",
  ownerPhone: "",
  village: "",
  district: "",
  state: "West Bengal",
};

function AddCowForm({ onCowCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetAndClose = () => {
    setForm(emptyForm);
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.cowNumber ||
      !form.name ||
      !form.breed ||
      !form.age ||
      !form.ownerName ||
      !form.village ||
      !form.district
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      const res = await api.post("/cows/create", {
        ...form,
        age: Number(form.age),
      });

      toast.success("Cow registered successfully.");

      resetAndClose();

      onCowCreated?.(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to add cow.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 text-blue-700 rounded-xl p-4 hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer"
      >
        <Plus size={20} />
        <span className="font-semibold">Register New Cattle</span>
      </button>
    );
  }

  return (
    <SectionCard title="Register New Cattle">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <Hash size={18} />
              Cow Number *
            </label>
            <input
              name="cowNumber"
              value={form.cowNumber}
              onChange={handleChange}
              placeholder="e.g. COW005"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <PawPrint size={18} />
              Cow Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="font-medium block mb-2">Breed *</label>
            <input
              name="breed"
              value={form.breed}
              onChange={handleChange}
              placeholder="e.g. Jersey, Sahiwal"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <Calendar size={18} />
              Age (Years) *
            </label>
            <input
              type="number"
              min="0"
              name="age"
              value={form.age}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="font-medium block mb-2">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 cursor-pointer"
            >
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <User size={18} />
              Owner Name *
            </label>
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <Phone size={18} />
              Owner Phone
            </label>
            <input
              name="ownerPhone"
              value={form.ownerPhone}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <MapPin size={18} />
              Village *
            </label>
            <input
              name="village"
              value={form.village}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <MapPin size={18} />
              District *
            </label>
            <input
              name="district"
              value={form.district}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <MapPin size={18} />
              State
            </label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={resetAndClose}
            className="flex items-center justify-center gap-2 border rounded-xl px-5 py-3 hover:bg-gray-50 cursor-pointer"
          >
            <X size={18} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition ${
              saving
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800 cursor-pointer"
            }`}
          >
            {saving ? (
              <>
                <LoaderCircle className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Plus size={18} />
                Save Cattle Record
              </>
            )}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

export default AddCowForm;
