import { useMemo, useState } from "react";
import {
  Activity,
  Bug,
  Thermometer,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import SectionCard from "./SectionCard";
import api from "../services/api";
import { INFECTION_NAMES } from "../utils/giParasites";

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

function CurrentScreeningForm({
  selectedCow,
  setRecommendation,
  setCurrentScreening,
  loading,
  setLoading,
}) {
  const [form, setForm] = useState({
    currentInfection: "",
    parasiteLoad: "",
    epg: "",
    symptoms: [],
    otherSymptoms: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const toggleSymptom = (symptom) => {
    if (form.symptoms.includes(symptom)) {
      setForm({
        ...form,
        symptoms: form.symptoms.filter((s) => s !== symptom),
      });
    } else {
      setForm({
        ...form,
        symptoms: [...form.symptoms, symptom],
      });
    }
  };

  const epgStatus = useMemo(() => {
    const epg = Number(form.epg);

    if (!epg) return null;

    if (epg < 500)
      return {
        text: "Low",
        color: "text-green-600",
      };

    if (epg < 1500)
      return {
        text: "Moderate",
        color: "text-yellow-600",
      };

    return {
      text: "High",
      color: "text-red-600",
    };
  }, [form.epg]);

  const generateRecommendation = async () => {
    if (!selectedCow) return toast.error("Please select a cow first.");

    if (!form.currentInfection || !form.parasiteLoad || !form.epg)
      return toast.error("Please complete all required fields.");

    try {
      setLoading(true);

      const payload = {
        cowId: selectedCow,
        currentInfection: form.currentInfection,
        parasiteLoad: form.parasiteLoad,
        epg: Number(form.epg),
        symptoms: [
          ...form.symptoms,
          ...form.otherSymptoms
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        ],
      };

      const res = await api.post("/recommendations/generate", payload);

      setRecommendation(res.data.recommendation);
      setCurrentScreening(res.data.currentScreening);

      toast.success("AI Recommendation Generated");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to generate recommendation.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Current Clinical Screening">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Current Infection Assessment</h3>

        <p className="text-sm text-gray-500 mt-1">
          Enter the latest laboratory findings and clinical observations.
        </p>
      </div>

      <fieldset disabled={!selectedCow || loading} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-2 font-medium mb-2">
              <Bug size={18} />
              Infection
            </label>

            <select
              name="currentInfection"
              value={form.currentInfection}
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
              Parasite Load
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
              Egg Per Gram (EPG)
            </label>

            <input
              type="number"
              name="epg"
              value={form.epg}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />

            {epgStatus && (
              <p className={`mt-2 text-sm font-semibold ${epgStatus.color}`}>
                EPG Severity : {epgStatus.text}
              </p>
            )}
          </div>

          <div>
            <label className="font-medium block mb-2">
              Additional Symptoms
            </label>

            <input
              name="otherSymptoms"
              value={form.otherSymptoms}
              onChange={handleChange}
              placeholder="Fever, Dehydration..."
              className="w-full border rounded-xl p-3"
            />
          </div>
        </div>

        <div>
          <label className="font-medium block mb-3">Clinical Symptoms</label>

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

        <button
          type="button"
          onClick={generateRecommendation}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer"
        >
          {loading ? (
            <>
              <LoaderCircle className="animate-spin" size={18} />
              Analysing...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate AI Recommendation
            </>
          )}
        </button>
      </fieldset>
    </SectionCard>
  );
}

export default CurrentScreeningForm;
