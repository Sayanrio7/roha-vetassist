const GI_PARASITES = [
  {
    name: "Strongylosis",
    treatmentGroup: "Anthelmintic",
    commonMedicines: ["Albendazole", "Fenbendazole", "Levamisole", "Ivermectin"],
  },
  {
    name: "Coccidiosis",
    treatmentGroup: "Antiprotozoal",
    commonMedicines: ["Toltrazuril", "Amprolium"],
  },
  {
    name: "Fasciolosis",
    treatmentGroup: "Flukicide",
    commonMedicines: ["Triclabendazole", "Closantel"],
  },
  {
    name: "Monieziasis",
    treatmentGroup: "Cestocide",
    commonMedicines: ["Praziquantel"],
  },
  {
    name: "Trichuriasis",
    treatmentGroup: "Anthelmintic",
    commonMedicines: ["Fenbendazole", "Albendazole"],
  },
  {
    name: "Paramphistomiasis",
    treatmentGroup: "Flukicide",
    commonMedicines: ["Oxyclozanide", "Niclosamide"],
  },
  {
    name: "Ascariasis",
    treatmentGroup: "Anthelmintic",
    commonMedicines: ["Piperazine", "Levamisole", "Fenbendazole"],
  },
];

export const INFECTION_NAMES = GI_PARASITES.map((p) => p.name);

export const getParasiteInfo = (infectionName) =>
  GI_PARASITES.find((p) => p.name === infectionName) || null;

export default GI_PARASITES;