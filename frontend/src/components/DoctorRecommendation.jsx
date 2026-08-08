import { useEffect, useState } from "react";

import {
  Stethoscope,
  Pill,
  Syringe,
  Clock3,
  FilePenLine,
  Plus,
  Trash2,
  BrainCircuit,
} from "lucide-react";

import api from "../services/api";
import toast from "react-hot-toast";
import SectionCard from "./SectionCard";

function DoctorRecommendation({
  recommendation,
  doctorRecommendation,
  setDoctorRecommendation,
  doctorRemarks,
  setDoctorRemarks,
  currentScreening,
  selectedCowData,
  history,
}) {
  const [generatingRemarks, setGeneratingRemarks] = useState(false);
  useEffect(() => {
    if (!recommendation?.treatmentGroups) return;

    const mapped = recommendation.treatmentGroups.map((item) => ({
      rank: item.rank || 1,
      group: item.group,
      medicine: item.medicine,
      dosage: item.dosage,
      duration: item.duration,
      reason: item.reason,
    }));

    setDoctorRecommendation(mapped);
  }, [recommendation]);

  const updateField = (index, field, value) => {
    const updated = [...doctorRecommendation];

    updated[index][field] = value;

    setDoctorRecommendation(updated);
  };

  const addTreatment = () => {
    setDoctorRecommendation([
      ...doctorRecommendation,
      {
        rank: doctorRecommendation.length + 1,
        group: "",
        medicine: "",
        dosage: "",
        duration: "",
        reason: "",
      },
    ]);
  };

  const removeTreatment = (index) => {
    const ok = window.confirm("Remove this treatment recommendation?");

    if (!ok) return;

    const updated = doctorRecommendation.filter((_, i) => i !== index);

    setDoctorRecommendation(updated);
  };

  const generateDoctorRemarks = async () => {
    try {
      setGeneratingRemarks(true);

      const res = await api.post("/recommendations/generate-remarks", {
        cow: selectedCowData,
        history,
        currentScreening,
        recommendation,
        doctorRecommendation,
      });

      setDoctorRemarks(res.data.remarks);

      toast.success("AI clinical decision generated.");
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message || "Unable to generate AI remarks.",
      );
    } finally {
      setGeneratingRemarks(false);
    }
  };

  if (!recommendation) {
    return (
      <SectionCard title="Doctor Recommendation">
        <div className="py-12 text-center">
          <BrainCircuit size={60} className="mx-auto text-blue-500 mb-5" />

          <h2 className="text-2xl font-bold">AI Recommendation Required</h2>

          <p className="text-gray-500 mt-3">
            Generate the AI recommendation first. The suggested treatment groups
            will appear here for veterinary review.
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Doctor Recommendation">
      <div className="space-y-8">
        {/* Header */}

        <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="text-blue-700" size={24} />

            <h2 className="text-xl font-bold text-blue-700">
              Veterinary Review
            </h2>
          </div>

          <p className="text-gray-700 leading-7">
            Review the AI suggested treatment groups, modify medicines if
            required, add new treatments, or remove recommendations before
            generating the final clinical report and prescription.
          </p>
        </div>

        {/* Treatment Cards */}

        <div className="space-y-6">
          {doctorRecommendation.map((item, index) => (
            <div
              key={index}
              className="bg-white border-l-4 border-blue-600 rounded-xl shadow-sm border p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">
                    Treatment #{index + 1}
                  </span>

                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap">
                    AI Suggested
                  </span>
                </div>

                <button
                  onClick={() => removeTreatment(index)}
                  className="w-full md:w-auto flex justify-center items-center gap-2 text-red-600 border border-red-300 rounded-lg px-4 py-2 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 size={18} />
                  Remove
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="font-medium flex items-center gap-2 mb-2">
                    <Stethoscope size={18} />
                    Treatment Group
                  </label>

                  <input
                    value={item.group}
                    onChange={(e) =>
                      updateField(index, "group", e.target.value)
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="font-medium flex items-center gap-2 mb-2">
                    <Pill size={18} />
                    Medicine
                  </label>

                  <input
                    value={item.medicine}
                    onChange={(e) =>
                      updateField(index, "medicine", e.target.value)
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="font-medium flex items-center gap-2 mb-2">
                    <Syringe size={18} />
                    Dosage
                  </label>

                  <input
                    value={item.dosage}
                    onChange={(e) =>
                      updateField(index, "dosage", e.target.value)
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="font-medium flex items-center gap-2 mb-2">
                    <Clock3 size={18} />
                    Duration
                  </label>

                  <input
                    value={item.duration}
                    onChange={(e) =>
                      updateField(index, "duration", e.target.value)
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="font-medium flex items-center gap-2 mb-2">
                  <FilePenLine size={18} />
                  Doctor's Clinical Reason
                </label>

                <textarea
                  rows={4}
                  value={item.reason}
                  onChange={(e) => updateField(index, "reason", e.target.value)}
                  placeholder="Explain why this treatment was approved or modified..."
                  className="w-full border rounded-xl p-4 resize-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add Treatment */}

        <button
          type="button"
          onClick={addTreatment}
          className="w-full md:w-auto flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition cursor-pointer"
        >
          <Plus size={18} />
          Add Another Treatment
        </button>

        {/* Doctor Remarks */}

        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-5">
            <div>
              <div className="flex items-center gap-3">
                <FilePenLine className="text-green-700" size={22} />

                <h2 className="text-xl font-bold text-green-700">
                  Final Clinical Decision
                </h2>
              </div>

              <p className="text-gray-600 mt-2">
                Review the approved treatments and prepare the final veterinary
                clinical decision.
              </p>
            </div>

            <button
              type="button"
              onClick={generateDoctorRemarks}
              disabled={generatingRemarks}
              className={`w-full lg:w-auto flex justify-center items-center gap-3 px-5 py-3 rounded-lg font-semibold text-white transition ${
                generatingRemarks
                  ? "bg-green-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 cursor-pointer"
              }`}
            >
              {generatingRemarks ? (
                <>
                  <span
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />

                  <span>Generating with AI...✨</span>
                </>
              ) : (
                <>
                  <span>✨ Generate with AI</span>
                </>
              )}
            </button>
          </div>

          {generatingRemarks && (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-white border border-green-200 px-4 py-3 text-sm text-green-700">
              <span
                className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />

              <span>
                AI is analyzing the screening data, medical history, and
                approved treatments to prepare the clinical decision...
              </span>
            </div>
          )}

          <textarea
            rows={8}
            value={doctorRemarks}
            onChange={(e) => setDoctorRemarks(e.target.value)}
            disabled={generatingRemarks}
            placeholder={
              generatingRemarks
                ? "AI is preparing the final clinical decision..."
                : "Write the final veterinary clinical decision..."
            }
            className={`w-full border rounded-xl p-4 resize-none bg-white ${
              generatingRemarks
                ? "bg-gray-50 cursor-not-allowed opacity-70"
                : ""
            }`}
          />

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => setDoctorRemarks("")}
              className="text-red-600 hover:underline cursor-pointer"
            >
              Clear
            </button>

            <span className="text-sm text-gray-500">
              {doctorRemarks.length} characters
            </span>
          </div>
        </div>

        {/* Information */}

        <div className="rounded-xl bg-yellow-50 border border-yellow-300 p-5">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Clinical Decision Support Notice:
          </h3>

          <p className="text-gray-700 leading-7">
            This AI system provides evidence-based treatment suggestions using
            historical screening records and the current examination. The
            attending veterinarian is responsible for reviewing, modifying and
            approving all treatments and the final clinical decision before
            generating the official report and prescription.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

export default DoctorRecommendation;
