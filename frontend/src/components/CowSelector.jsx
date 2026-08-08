import { Search, PawPrint } from "lucide-react";
import SectionCard from "./SectionCard";

function CowSelector({ cows, selectedCow, onChange }) {
  return (
    <SectionCard title="Select Cattle">
      <div className="space-y-5">
        {/* Top */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <PawPrint className="text-blue-600" size={22} />
              Cattle Selection
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Select a registered cow to review its clinical history and
              generate AI-assisted recommendations.
            </p>
          </div>

          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">
            {cows.length} Registered
          </div>
        </div>

        {/* Dropdown */}

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <select
            value={selectedCow}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="">Select a Cow...</option>

            {cows.map((cow) => (
              <option key={cow._id} value={cow._id}>
                {cow.cowNumber} • {cow.name} ({cow.breed})
              </option>
            ))}
          </select>
        </div>

        {!selectedCow && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-700">
              Select a cow to load its medical history and begin AI-assisted
              clinical analysis.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

export default CowSelector;