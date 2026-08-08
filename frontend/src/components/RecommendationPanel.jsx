import SectionCard from "./SectionCard";
import {
  ClipboardList,
  Activity,
  ShieldAlert,
  TrendingUp,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Pill,
  Stethoscope,
  FlaskConical,
  CalendarClock,
  BookOpen,
} from "lucide-react";

function StatCard({ title, value, color = "blue" }) {
  const styles = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    red: "bg-red-50 border-red-200 text-red-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${styles[color]}`}>
      <p className="text-sm font-medium">{title}</p>

      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
}

function RecommendationPanel({ recommendation }) {
  if (!recommendation)
    return (
      <SectionCard title="AI Clinical Recommendation">
        <div className="py-14 text-center">
          <Stethoscope size={60} className="mx-auto text-blue-500 mb-5" />

          <h2 className="text-2xl font-bold text-gray-700">
            No Recommendation Generated
          </h2>

          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Select a cow, complete the current screening, and click{" "}
            <strong>Generate Recommendation </strong>
            to receive an AI-assisted clinical assessment.
          </p>
        </div>
      </SectionCard>
    );

  const stats = recommendation.historicalStatistics || {};

  return (
    <SectionCard title="AI Clinical Recommendation">
      <div className="space-y-8">
        {/* Clinical Summary */}

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="text-blue-600" />
            <h2 className="text-xl font-bold text-blue-700">
              Clinical Summary
            </h2>
          </div>

          <p className="leading-8 text-gray-700">{recommendation.summary}</p>
        </div>

        {/* Historical Comparison */}

        <div className="rounded-xl border bg-gray-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-blue-600" />

            <h2 className="text-xl font-bold">Historical Comparison</h2>
          </div>

          <p className="leading-8 text-gray-700">
            {recommendation.historicalComparison}
          </p>
        </div>

        {/* Case Assessment */}

        {recommendation.caseAssessment && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="text-indigo-600" />

              <h2 className="text-xl font-bold text-indigo-700">
                Case Assessment
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Classification</p>

                <h3 className="text-2xl font-bold mt-2">
                  {recommendation.caseAssessment.classification}
                </h3>
              </div>

              <div>
                <p className="text-sm text-gray-500">Clinical Reason</p>

                <p className="mt-2 leading-7">
                  {recommendation.caseAssessment.reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Clinical Assessment */}

        <div>
          <div className="flex items-center gap-3 mb-5">
            <HeartPulse className="text-red-500" />

            <h2 className="text-xl font-bold">Clinical Assessment</h2>
          </div>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5">
            <StatCard
              title="Confidence"
              value={`${recommendation.confidence}%`}
              color="green"
            />

            <StatCard
              title="Risk Level"
              value={recommendation.riskLevel}
              color={
                recommendation.riskLevel === "High"
                  ? "red"
                  : recommendation.riskLevel === "Moderate"
                    ? "yellow"
                    : "green"
              }
            />

            <StatCard
              title="Classification"
              value={recommendation.caseAssessment?.classification || "-"}
              color="blue"
            />

            <StatCard
              title="Severity"
              value={recommendation.clinicalSeverity?.grade || "-"}
              color="red"
            />
          </div>
        </div>

        {/* Historical Statistics */}

        {recommendation.historicalStatistics && (
          <div className="rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-green-600" />

              <h2 className="text-xl font-bold">Historical Statistics</h2>
            </div>

            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5">
              <StatCard
                title="Previous Cases"
                value={stats.previousCases}
                color="blue"
              />

              <StatCard
                title="Same Infection"
                value={stats.sameInfectionCases}
                color="purple"
              />

              <StatCard
                title="Average EPG"
                value={stats.averagePreviousEPG}
                color="green"
              />

              <StatCard
                title="Highest EPG"
                value={stats.highestPreviousEPG}
                color="red"
              />

              <StatCard
                title="Lowest EPG"
                value={stats.lowestPreviousEPG}
                color="yellow"
              />

              <StatCard
                title="Common Parasite Load"
                value={stats.mostCommonParasiteLoad}
                color="blue"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                  <CheckCircle2 className="text-green-600" />
                  Previously Successful Medicines
                </h3>

                {stats.previousSuccessfulMedicines?.length ? (
                  <div className="flex flex-wrap gap-3">
                    {stats.previousSuccessfulMedicines.map(
                      (medicine, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium"
                        >
                          ✓ {medicine}
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <p>No successful medicine history.</p>
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-red-500" />
                  Previously Failed Medicines
                </h3>

                {stats.previousFailedMedicines?.length ? (
                  <div className="flex flex-wrap gap-3">
                    {stats.previousFailedMedicines.map((medicine, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-full bg-red-100 text-red-700 font-medium"
                      >
                        ✕ {medicine}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-600">
                    No failed treatment recorded.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Possible Causes */}

        {recommendation.possibleCauses?.length > 0 && (
          <div className="rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-5">
              <FlaskConical className="text-red-500" />

              <h2 className="text-xl font-bold">Possible Causes</h2>
            </div>

            <div className="space-y-4">
              {recommendation.possibleCauses.map((item, index) => (
                <div key={index} className="rounded-xl border bg-gray-50 p-5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{item.cause}</h3>

                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                      {item.confidence}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Differential Diagnosis */}

        {recommendation.differentialDiagnosis?.length > 0 && (
          <div className="rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-5">
              <Stethoscope className="text-purple-600" />

              <h2 className="text-xl font-bold">Differential Diagnosis</h2>
            </div>

            <div className="space-y-5">
              {recommendation.differentialDiagnosis.map((item, index) => (
                <div key={index} className="rounded-xl border bg-purple-50 p-5">
                  <h3 className="font-bold text-lg">{item.disease}</h3>

                  <p className="mt-3 leading-7 text-gray-700">
                    {item.whyLessLikely}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggested Treatments */}

        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Pill className="text-green-600" />

            <h2 className="text-xl font-bold">AI Suggested Treatment Plan</h2>
          </div>

          <div className="space-y-6">
            {recommendation.treatmentGroups?.map((item) => (
              <div
                key={item.rank}
                className="rounded-xl border bg-gradient-to-r from-green-50 to-white p-6 shadow-sm"
              >
                <div className="flex justify-between items-center mb-5">
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold">
                    Rank #{item.rank}
                  </span>

                  <span className="font-bold text-green-700">{item.group}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-sm">Medicine</p>

                    <h3 className="font-bold text-xl">{item.medicine}</h3>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Dosage</p>

                    <h3 className="font-semibold">{item.dosage}</h3>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Duration</p>

                    <h3>{item.duration}</h3>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Expected Outcome</p>

                    <h3>{item.expectedOutcome}</h3>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-blue-700">
                    Clinical Reason
                  </h4>

                  <p className="mt-2 leading-7">{item.reason}</p>
                </div>

                <div className="mt-5 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 mb-2">
                    Historical Evidence
                  </h4>

                  <p className="leading-7">{item.historicalEvidence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monitoring Advice */}

        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-5">
            <Activity className="text-orange-500" />

            <h2 className="text-xl font-bold">Monitoring Advice</h2>
          </div>

          <div className="space-y-4">
            {recommendation.monitoringAdvice?.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center rounded-xl bg-orange-50 border border-orange-200 p-5"
              >
                <div>
                  <h3 className="font-semibold">{item.advice}</h3>
                </div>

                <span className="font-bold text-orange-700">
                  {item.timeline}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Preventive Measures */}

        {recommendation.preventiveMeasures?.length > 0 && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6">
            <div className="flex items-center gap-3 mb-5">
              <ShieldAlert className="text-green-600" />

              <h2 className="text-xl font-bold text-green-700">
                Preventive Measures
              </h2>
            </div>

            <div className="space-y-3">
              {recommendation.preventiveMeasures.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <CheckCircle2 size={20} className="text-green-600 mt-1" />

                  <p className="leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow Up */}

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CalendarClock className="text-blue-600" />

            <h2 className="text-xl font-bold text-blue-700">
              Follow-up Recommendation
            </h2>
          </div>

          <p className="leading-8">{recommendation.followUp}</p>
        </div>

        {/* Reference Guidelines */}

        {recommendation.referenceGuidelines?.length > 0 && (
          <div className="rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-5">
              <BookOpen className="text-indigo-600" />

              <h2 className="text-xl font-bold">Reference Guidelines</h2>
            </div>

            <ul className="space-y-3 list-disc list-inside">
              {recommendation.referenceGuidelines.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Doctor Advisory */}

        <div className="rounded-xl border border-red-300 bg-red-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-600" />

            <h2 className="text-xl font-bold text-red-700">Doctor Advisory</h2>
          </div>

          <p className="leading-8 text-gray-700">
            {recommendation.doctorAdvice}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

export default RecommendationPanel;
