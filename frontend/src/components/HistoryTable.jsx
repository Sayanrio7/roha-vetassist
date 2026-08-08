import {
  History,
  CalendarDays,
  Pill,
  Activity,
  ShieldAlert,
} from "lucide-react";
import SectionCard from "./SectionCard";

function loadBadge(load) {
  switch (load) {
    case "High":
      return "bg-red-100 text-red-700";

    case "Moderate":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-green-100 text-green-700";
  }
}

function outcomeBadge(outcome) {
  switch (outcome) {
    case "Recovered":
      return "bg-green-600";

    case "Improved":
      return "bg-yellow-500";

    default:
      return "bg-red-600";
  }
}

function HistoryTable({ history }) {
  return (
    <SectionCard title="Previous Screening History">
      {history.length === 0 ? (
        <div className="py-10 text-center">
          <History size={55} className="mx-auto text-gray-400 mb-4" />

          <h3 className="text-xl font-semibold">No Previous Records</h3>

          <p className="text-gray-500 mt-2">
            Select a cow to view historical screening records.
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}

          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <History className="text-blue-600" size={20} />
                Clinical History
              </h3>

              <p className="text-sm text-gray-500">
                {history.length} previous screening records found.
              </p>
            </div>

            <div className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold">
              Total Cases: {history.length}
            </div>
          </div>

          {/* Table */}

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr className="text-left">
                  <th className="px-5 py-4">Date</th>

                  <th className="px-5 py-4">Infection</th>

                  <th className="px-5 py-4">Load</th>

                  <th className="px-5 py-4">Eggs per Gram (EPG)</th>

                  <th className="px-5 py-4">Medicine</th>

                  <th className="px-5 py-4">Outcome</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-blue-50 transition"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-gray-500" />

                        {new Date(item.screeningDate).toLocaleDateString("en-GB")}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={16} className="text-red-500" />

                        {item.infection}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${loadBadge(
                          item.parasiteLoad,
                        )}`}
                      >
                        {item.parasiteLoad}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-blue-600" />

                        <span className="font-semibold">{item.epg}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Pill size={16} className="text-green-600" />

                        {item.medicine}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${outcomeBadge(
                          item.outcome,
                        )}`}
                      >
                        {item.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </SectionCard>
  );
}

export default HistoryTable;
