import { useState } from "react";
import toast from "react-hot-toast";
import {
  FileText,
  FileCheck,
  CheckCircle2,
  LoaderCircle,
  Download,
  ClipboardCheck,
} from "lucide-react";

import SectionCard from "./SectionCard";
import api from "../services/api";

const API_URL = "http://localhost:5000";

function ReportActions({
  selectedCow,
  currentScreening,
  recommendation,
  doctorRecommendation,
  doctorRemarks,
  generatedFiles,
  setGeneratedFiles,
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const generateReport = async () => {
    if (!selectedCow) return toast.error("Please select a cow.");

    if (!currentScreening)
      return toast.error("Generate AI recommendation first.");

    if (!recommendation) return toast.error("AI recommendation missing.");

    if (!doctorRecommendation.length)
      return toast.error("Doctor recommendation is required.");

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        cowId: selectedCow,

        currentInfection: currentScreening.infection,
        parasiteLoad: currentScreening.parasiteLoad,
        epg: currentScreening.epg,
        symptoms: currentScreening.symptoms,

        aiRecommendation: recommendation,

        doctorRecommendation,

        doctorRemarks,
      };

      const res = await api.post("/report/generate", payload);

      setGeneratedFiles(res.data.files);

      setMessage(res.data.message);

      toast.success("Clinical Report Generated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Generate Final Report">
      <div className="space-y-8">
        {/* Header */}

        <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <ClipboardCheck className="text-blue-700" size={24} />

            <h2 className="text-xl font-bold text-blue-700">
              Final Clinical Report
            </h2>
          </div>

          <p className="text-gray-700 leading-7">
            Review all recommendations before generating the official Clinical
            Report and Veterinary Prescription.
          </p>
        </div>

        {/* Checklist */}

        <div className="rounded-xl border p-5">
          <h3 className="font-semibold text-lg mb-4">Readiness Checklist</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2
                className={selectedCow ? "text-green-600" : "text-gray-400"}
              />

              <span>Cow Selected</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2
                className={
                  currentScreening ? "text-green-600" : "text-gray-400"
                }
              />

              <span>Current Screening Completed</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2
                className={recommendation ? "text-green-600" : "text-gray-400"}
              />

              <span>AI Recommendation Generated</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2
                className={
                  doctorRecommendation.length
                    ? "text-green-600"
                    : "text-gray-400"
                }
              />

              <span>Doctor Recommendation Ready</span>
            </div>
          </div>
        </div>

        {/* Button */}

        <div className="flex justify-center">
          <button
            onClick={generateReport}
            disabled={loading}
            className={`inline-flex items-center gap-3 px-7 py-4 rounded-lg font-semibold text-white transition

    ${
      loading
        ? "bg-gray-500 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700 cursor-pointer"
    }`}
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={24} />
                Generating Clinical Report...
              </>
            ) : (
              <>
                <FileCheck size={24} />
                Generate Clinical Report
              </>
            )}
          </button>
        </div>

        {/* Success */}

        {message && (
          <div className="rounded-xl bg-green-50 border border-green-300 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600" />

              <p className="font-semibold text-green-700">{message}</p>
            </div>
          </div>
        )}

        {/* Files */}

        {generatedFiles && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Generated Documents</h2>

            {/* Clinical Report */}

            <div className="border rounded-xl p-5 bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <FileText size={40} className="text-red-600 flex-shrink-0" />

                  <div className="min-w-0">
                    <h3 className="font-bold">Clinical Report</h3>

                    <p className="text-sm text-gray-500 break-all">
                      {generatedFiles.clinicalReport}
                    </p>
                  </div>
                </div>

                <a
                  href={`${API_URL}/uploads/reports/${generatedFiles.clinicalReport}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full md:w-auto flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
                >
                  <Download size={18} />
                  View PDF
                </a>
              </div>
            </div>

            {/* Prescription */}

            <div className="border rounded-xl p-5 bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <FileText
                    size={40}
                    className="text-green-600 flex-shrink-0"
                  />

                  <div className="min-w-0">
                    <h3 className="font-bold">Veterinary Prescription</h3>

                    <p className="text-sm text-gray-500 break-all">
                      {generatedFiles.prescription}
                    </p>
                  </div>
                </div>

                <a
                  href={`${API_URL}/uploads/prescriptions/${generatedFiles.prescription}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full md:w-auto flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
                >
                  <Download size={18} />
                  View PDF
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

export default ReportActions;
