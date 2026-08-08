import { useEffect, useMemo, useState } from "react";
import {
  Bug,
  Thermometer,
  Activity,
  Pill,
  Stethoscope,
  CalendarDays,
  FilePenLine,
  Plus,
  X,
  LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import SectionCard from "./SectionCard";
import api from "../services/api";
import { INFECTION_NAMES, getParasiteInfo } from "../utils/giParasites";

const symptomOptions = [
  "Weight Loss",
  "Diarrhea",
  "Anemia",
  "Poor Appetite",
  "Weakness",
  "Bottle Jaw",
  "Rough Coat",
  "Dehydration",
];

const emptyForm = {
  screeningDate: "",
  infection: "",
  parasiteLoad: "",
  epg: "",
  symptoms: [],
  treatmentGroup: "",
  medicine: "",
  outcome: "Recovered",
  notes: "",
};

function AddHistoryForm({ selectedCow, selectedCowData, onHistoryCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // When the infection changes, prefill the treatment group and offer
  // the standard medicines for it (still editable — this is a suggestion,
  // not a restriction).
  const suggestedMedicines = useMemo(() => {
    const info = getParasiteInfo(form.infection);
    return info?.commonMedicines || [];
  }, [form.infection]);

  useEffect(() => {
    const info = getParasiteInfo(form.infection);
    if (info) {
      setForm((f) => ({ ...f, treatmentGroup: info.treatmentGroup }));
    }
  }, [form.infection]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleSymptom = (symptom) => {
    setForm((f) =>
      f.symptoms.includes(symptom)
        ? { ...f, symptoms: f.symptoms.filter((s) => s !== symptom) }
        : { ...f, symptoms: [...f.symptoms, symptom] },
    );
  };

  const resetAndClose = () => {
    setForm(emptyForm);
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCow) {
      toast.error("Please select a cow first.");
      return;
    }

    if (
      !form.screeningDate ||
      !form.infection ||
      !form.parasiteLoad ||
      !form.epg ||
      !form.treatmentGroup ||
      !form.medicine
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (!form.symptoms.length) {
      toast.error("Please select at least one symptom.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/history/create", {
        cow: selectedCow,
        screeningDate: form.screeningDate,
        infection: form.infection,
        parasiteLoad: form.parasiteLoad,
        epg: Number(form.epg),
        symptoms: form.symptoms,
        treatmentGroup: form.treatmentGroup,
        medicine: form.medicine,
        outcome: form.outcome,
        notes: form.notes,
      });

      toast.success("Past screening record added.");

      resetAndClose();

      onHistoryCreated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to add record.");
    } finally {
      setSaving(false);
    }
  };

  if (!selectedCow) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 text-blue-700 rounded-xl p-4 hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer"
      >
        <Plus size={20} />
        <span className="font-semibold">
          Add Screening Record{selectedCowData?.name ? ` for ${selectedCowData.name}` : ""}
        </span>
      </button>
    );
  }

  return (
    <SectionCard title="Add Past Screening Record">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <CalendarDays size={18} />
              Screening Date *
            </label>
            <input
              type="date"
              name="screeningDate"
              value={form.screeningDate}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <Bug size={18} />
              Infection *
            </label>
            <select
              name="infection"
              value={form.infection}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 cursor-pointer"
            >
              <option value="">Select Infection</option>
              {INFECTION_NAMES.map((infection) => (
                <option key={infection}>{infection}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <Thermometer size={18} />
              Parasite Load *
            </label>
            <select
              name="parasiteLoad"
              value={form.parasiteLoad}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 cursor-pointer"
            >
              <option value="">Select Load</option>
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <Activity size={18} />
              EPG (Eggs Per Gram) *
            </label>
            <input
              type="number"
              min="0"
              name="epg"
              value={form.epg}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <Stethoscope size={18} />
              Treatment Group *
            </label>
            <input
              name="treatmentGroup"
              value={form.treatmentGroup}
              onChange={handleChange}
              placeholder="e.g. Anthelmintic"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <Pill size={18} />
              Medicine Given *
            </label>
            <input
              list="medicine-suggestions"
              name="medicine"
              value={form.medicine}
              onChange={handleChange}
              placeholder="e.g. Albendazole"
              className="w-full border rounded-xl p-3"
            />
            <datalist id="medicine-suggestions">
              {suggestedMedicines.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="font-medium block mb-2">Outcome</label>
            <select
              name="outcome"
              value={form.outcome}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 cursor-pointer"
            >
              <option>Recovered</option>
              <option>Improved</option>
              <option>Not Recovered</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-medium block mb-3">Clinical Symptoms *</label>
          <div className="flex flex-wrap gap-3">
            {symptomOptions.map((symptom) => (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={`px-4 py-2 rounded-full border transition ${
                  form.symptoms.includes(symptom)
                    ? "bg-blue-600 text-white border-blue-600 cursor-pointer"
                    : "bg-white hover:bg-gray-100 cursor-pointer"
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 font-medium mb-2">
            <FilePenLine size={18} />
            Notes
          </label>
          <textarea
            rows={3}
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any additional clinical notes for this past screening..."
            className="w-full border rounded-xl p-3 resize-none"
          />
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
                Save Screening Record
              </>
            )}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

export default AddHistoryForm;
