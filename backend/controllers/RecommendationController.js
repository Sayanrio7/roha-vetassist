const Cow = require("../models/Cow");
const History = require("../models/History");
const generateRecommendation = require("../services/geminiService");

module.exports = class RecommendationController {
  static generate = async (req, res) => {
    try {
      const { cowId, currentInfection, parasiteLoad, epg, symptoms } = req.body;

      if (!cowId || !currentInfection || !parasiteLoad || epg == null) {
        throw new Error(
          "Cow, Current Infection, Parasite Load and EPG are required.",
        );
      }

      const cow = await Cow.findById(cowId);

      if (!cow) {
        throw new Error("Cow not found.");
      }

      const history = await History.find({
        cow: cowId,
      }).sort({
        screeningDate: -1,
      });

      const formattedHistory = history
        .map(
          (item, index) => `
Case ${index + 1}

Date: ${item.screeningDate.toDateString()}

Season: ${item.season}

Infection: ${item.infection}

Parasite Load: ${item.parasiteLoad}

EPG (Eggs Per Gram): ${item.epg}

Symptoms:
${
  item.symptoms && item.symptoms.length
    ? item.symptoms.join(", ")
    : "Not Recorded"
}

Treatment Group: ${item.treatmentGroup}

Medicine Given: ${item.medicine}

Outcome: ${item.outcome}

Notes: ${item.notes || "No Notes"}

----------------------------------------
`,
        )
        .join("\n");

      const prompt = `
You are an experienced Veterinary Clinical Decision Support Assistant specializing in Gastrointestinal (GI) parasite infections in cattle.

Your task is to analyze the following cattle case and provide evidence-based treatment suggestions.

The recommendation must be based on the complete historical record of this cow, including previous GI parasite infections, parasite load, EPG values, symptoms, treatment response, seasonality, and geographical location. Explain how the historical evidence influenced your recommendation.

=========================
COW DETAILS
=========================

Cow Number: ${cow.cowNumber}
Cow Name: ${cow?.name || "Unknown"}
Breed: ${cow?.breed || "Unknown"}
Age: ${cow?.age || "Unknown"}
Gender: ${cow.gender}

Owner: ${cow.ownerName}

Village: ${cow?.village || "Unknown"}
District: ${cow?.district || "Unknown"}
State: ${cow.state}
Current Season:
${getSeason(new Date())}

=========================
CURRENT SCREENING
=========================

Screening Date:
${new Date().toDateString()}

Current Infection:
${currentInfection}

Parasite Load:
${parasiteLoad}

EPG:
${epg}

Symptoms:
${Array.isArray(symptoms) ? symptoms.join(", ") : symptoms || "Not Provided"}

=========================
PREVIOUS SCREENING HISTORY
=========================

${formattedHistory}

=========================
INSTRUCTIONS
=========================

Consider ALL of the following before recommending treatment:

1. Previous infection history.
2. Previous parasite load trends.
3. Previous EPG (Eggs Per Gram) values.
4. Previous symptoms and disease progression.
5. Previous medicines administered.
6. Previous treatment outcomes and clinical response.
7. Current infection.
8. Current parasite load.
9. Current EPG.
10. Current symptoms.
11. Seasonality.
12. Geographical location.

Decision Rules:

- Never prescribe medicines outside GI parasite treatment for cattle.
- When multiple treatment options are clinically appropriate, prioritize medicines that have previously produced successful outcomes for this specific cow under similar infection, parasite load, EPG, season, and geographical conditions.
- Avoid medicines that resulted in "Not Recovered" unless there is strong clinical justification.
- If parasite load or EPG is significantly higher than previous cases, recommend closer monitoring and follow-up.
- When comparing EPG values, compare them within the same infection type unless explicitly stating an overall comparison.
- Consider seasonality and geographical location when suggesting treatment.
- If historical evidence is insufficient, clearly state that.
- Never fabricate previous medical history.
- Return recommendations only as suggestions. The attending veterinarian has the final authority.

Set the confidence score between 0 and 100 based on:

- Similarity between the current case and previous history.
- Consistency of previous successful treatments.
- Availability of historical parasite load, EPG, symptoms, and recovery data.
- Confidence should be lower when historical evidence is limited or conflicting.
- If multiple treatment groups are appropriate, rank them from most suitable to least suitable based on the available historical evidence and explain the rationale for each recommendation.

Generate a "caseAssessment" section.

The "classification" must be one of the following:

- First Infection
- Likely Reinfection
- Recurrent Infection
- Persistent Infection
- New Infection Different From History

The "reason" should briefly explain why this classification was selected using the cow's historical records, parasite load trends, EPG trends, seasonality, treatment response, and current presentation.

Generate a "historicalStatistics" section using ONLY the previous screening history.

Rules:

- previousCases = Total number of previous screening records.
- sameInfectionCases = Number of previous records with the same infection as the current infection.
- averagePreviousEPG = Average EPG of previous cases with the same infection (rounded to nearest integer). If none exist, return 0.
- highestPreviousEPG = Highest recorded EPG among previous cases with the same infection. If none exist, return 0.
- previousSuccessfulMedicines = List all unique medicines previously used for the current infection where the outcome was "Recovered". Do not include medicines with "Improved" or "Not Recovered". Remove duplicates.
- mostCommonParasiteLoad = Most frequently observed parasite load among previous records with the same infection.

Generate a "clinicalSeverity" section.

Assign a clinical severity score between 1 and 10.

Use:

1-3 = Mild
4-6 = Moderate
7-8 = Severe
9-10 = Critical

The score should consider:

- Parasite Load
- EPG
- Clinical Symptoms
- Previous disease history
- Risk of complications

Generate a "differentialDiagnosis" section.

List 2–3 alternative GI parasite diseases that could present with similar symptoms.

For each disease, explain briefly why it is less likely than the primary diagnosis based on:

- Infection history
- Parasite Load
- EPG
- Symptoms
- Season

Generate a "preventiveMeasures" section.

Suggest practical preventive measures to reduce future GI parasite infections.

Examples include:

- Strategic deworming
- Rotational grazing
- Pasture hygiene
- Clean drinking water
- Nutritional supplementation
- Routine fecal examination

Generate a "referenceGuidelines" section.

Mention only widely accepted veterinary references or standard practices supporting the recommendation.

Examples:

- WAAVP Guidelines
- Merck Veterinary Manual
- Standard veterinary parasitology recommendations

Do not fabricate references.

Return ONLY valid JSON.

Do NOT use markdown.

Return EXACTLY this structure.

{
  "summary": "",

  "historicalComparison": "",

  "caseAssessment": {
    "classification": "",
    "reason": ""
  },

  "historicalStatistics": {
  "previousCases": 0,
  "sameInfectionCases": 0,
  "averagePreviousEPG": 0,
  "highestPreviousEPG": 0,
  "lowestPreviousEPG": 0,
  "mostCommonParasiteLoad": "",
  "previousSuccessfulMedicines": [],
  "previousFailedMedicines": []
}

"confidence": 0,

  "riskLevel": "",

  "clinicalSeverity": {
  "score": 0,
  "grade": ""
},

  "possibleCauses": [
    {
      "cause": "",
      "confidence": ""
    }
  ],

  "differentialDiagnosis": [
  {
    "disease": "",
    "whyLessLikely": ""
  }
],

  "treatmentGroups": [
  {
    "rank": 1,
    "group": "",
    "medicine": "",
    "dosage": "",
    "duration": "",
    "reason": "",
    "historicalEvidence": "",
    "expectedOutcome": ""
  }
],

  "monitoringAdvice": [
    {
      "advice": "",
      "timeline": ""
    }
  ],

  "preventiveMeasures": [],

  "followUp": "",

  "referenceGuidelines": [
  ""
],

  "doctorAdvice": ""
}
`;

      const recommendation = await generateRecommendation(prompt);

      return res.status(200).json({
        success: true,

        currentScreening: {
          screeningDate: new Date(),
          infection: currentInfection,
          parasiteLoad,
          epg,
          symptoms,
          season: getSeason(new Date()),
        },

        cow: {
          id: cow._id,
          cowNumber: cow.cowNumber,
          name: cow.name,
          breed: cow.breed,
          age: cow.age,
          gender: cow.gender,
          ownerName: cow.ownerName,
          village: cow.village,
          district: cow.district,
          state: cow.state,
        },

        history,

        recommendation,
      });
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
  };

  static generateRemarks = async (req, res) => {
    try {
      const {
        cow,
        history,
        currentScreening,
        recommendation,
        doctorRecommendation,
      } = req.body;

      if (!doctorRecommendation || !doctorRecommendation.length) {
        throw new Error("Doctor recommendation is required.");
      }

      const treatmentSummary = doctorRecommendation
        .map(
          (item, index) => `
Treatment ${index + 1}
Group: ${item.group}
Medicine: ${item.medicine}
Dosage: ${item.dosage}
Duration: ${item.duration}
Reason: ${item.reason}
`,
        )
        .join("\n");

      const historySummary =
        history && history.length
          ? history
              .map(
                (h) => `
Date: ${new Date(h.screeningDate).toDateString()}
Infection: ${h.infection}
Medicine: ${h.medicine}
Outcome: ${h.outcome}
EPG: ${h.epg}
`,
              )
              .join("\n")
          : "No previous history.";

      const prompt = `
You are an experienced veterinary clinician preparing the FINAL CLINICAL DECISION for an official veterinary clinical report.

IMPORTANT RULES

- This is NOT a treatment recommendation task.
- The treatment plan has already been reviewed and approved by the attending veterinarian.
- Do NOT recommend additional medicines.
- Do NOT change medicine names, dosages or durations.
- Do NOT suggest alternative therapies.
- Base your report only on the approved treatment plan, patient history and current screening findings.
- Do not fabricate information.
- If previous history is limited, mention that historical evidence is limited.

Patient Information
-------------------
Name: ${cow?.name || "Unknown"}
Breed: ${cow?.breed || "Unknown"}
Age: ${cow?.age || "Unknown"}
Village: ${cow?.village || "Unknown"}
District: ${cow?.district || "Unknown"}

Current Screening
-----------------
Infection: ${currentScreening.infection}
Parasite Load: ${currentScreening.parasiteLoad}
EPG: ${currentScreening.epg}

Symptoms:
${
  Array.isArray(currentScreening.symptoms) && currentScreening.symptoms.length
    ? currentScreening.symptoms.join(", ")
    : "No symptoms reported"
}

AI Clinical Summary
-------------------
${recommendation.summary}

Historical Comparison
---------------------
${recommendation.historicalComparison}

Previous Clinical History
-------------------------
${historySummary}

Approved Treatment Plan
-----------------------
${treatmentSummary}

The "RATIONALE FOR APPROVED TREATMENT" section must discuss ONLY the medicines listed above.

Never mention alternative medicines, substitute drugs, additional therapies, or optional treatment plans.

Write the report using EXACTLY the following section headings.

FINAL CLINICAL DECISION

DIAGNOSIS -

CLINICAL INTERPRETATION -

RATIONALE FOR APPROVED TREATMENT -

PROGNOSIS -

FOLLOW-UP ADVICE -

Requirements

DIAGNOSIS must be based only on:
- Current infection
- Current parasite load
- Current EPG
- Previous history

Do not exaggerate disease severity.

Do not invent a disease classification.

Do not use words such as:
- recurrent
- persistent
- chronic
- subclinical
- reinfection

unless they are explicitly supported by the supplied clinical history or already stated in the AI clinical summary.

Use professional veterinary terminology.

Explain how previous history influenced the clinical interpretation.

Explain only why the veterinarian-approved treatment is appropriate for this patient.

Do not compare it with other medicines.

Do not mention medicines that are not listed in the approved treatment plan.

Keep the report concise and suitable for inclusion in a clinical record.

FOLLOW-UP ADVICE must contain 3–5 numbered recommendations focused only on:

- Monitoring
- Re-evaluation
- Preventive management
- Husbandry practices

Do not prescribe or recommend additional medications.

Return ONLY plain text.

Do NOT return JSON.

Do NOT return Markdown.

Do NOT wrap the response inside quotation marks.

Do NOT include code blocks.
`;

      const remarks = await generateRecommendation(prompt, "text");

      return res.json({
        success: true,
        remarks,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };
};

function getSeason(date) {
  const month = new Date(date).getMonth() + 1;

  if (month >= 3 && month <= 5) return "Summer";

  if (month >= 6 && month <= 9) return "Monsoon";

  if (month >= 10 && month <= 11) return "Autumn";

  if (month === 12 || month <= 2) return "Winter";

  return "Unknown";
}
