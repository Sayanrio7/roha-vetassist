import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import CowSelector from "../components/CowSelector";
import AddCowForm from "../components/AddCowForm";
import CowDetails from "../components/CowDetails";
import HistoryTable from "../components/HistoryTable";
import AddHistoryForm from "../components/AddHistoryForm";
import CurrentScreeningForm from "../components/CurrentScreeningForm";
import RecommendationPanel from "../components/RecommendationPanel";
import DoctorRecommendation from "../components/DoctorRecommendation";
import ReportActions from "../components/ReportActions";

import api from "../services/api";

function Dashboard() {
  const [cows, setCows] = useState([]);
  const [selectedCow, setSelectedCow] = useState("");
  const [selectedCowData, setSelectedCowData] = useState(null);
  const [history, setHistory] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [currentScreening, setCurrentScreening] = useState(null);
  const [doctorRecommendation, setDoctorRecommendation] = useState([]);
  const [doctorRemarks, setDoctorRemarks] = useState("");
  const [generatedFiles, setGeneratedFiles] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCows();
  }, []);

  useEffect(() => {
    if (selectedCow) {
      fetchHistory();
    } else {
      setSelectedCowData(null);
      setHistory([]);
    }
  }, [selectedCow]);

  const fetchCows = async () => {
    try {
      const res = await api.get("/cows");
      setCows(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/history/${selectedCow}`);

      setHistory(res.data.data);

      const cow = cows.find((c) => c._id === selectedCow);

      setSelectedCowData(cow);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCowCreated = async (newCow) => {
    await fetchCows();
    setSelectedCow(newCow._id);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <CowSelector
          cows={cows}
          selectedCow={selectedCow}
          onChange={setSelectedCow}
        />

        <AddCowForm onCowCreated={handleCowCreated} />

        <CowDetails cow={selectedCowData} />

        <HistoryTable history={history} />

        <AddHistoryForm
          selectedCow={selectedCow}
          selectedCowData={selectedCowData}
          onHistoryCreated={fetchHistory}
        />

        <CurrentScreeningForm
          selectedCow={selectedCow}
          setRecommendation={setRecommendation}
          setCurrentScreening={setCurrentScreening}
          loading={loading}
          setLoading={setLoading}
        />

        <RecommendationPanel recommendation={recommendation} />

        <DoctorRecommendation
          recommendation={recommendation}
          doctorRecommendation={doctorRecommendation}
          setDoctorRecommendation={setDoctorRecommendation}
          doctorRemarks={doctorRemarks}
          setDoctorRemarks={setDoctorRemarks}
          currentScreening={currentScreening}
          selectedCowData={selectedCowData}
          history={history}
        />

        <ReportActions
          selectedCow={selectedCow}
          currentScreening={currentScreening}
          recommendation={recommendation}
          doctorRecommendation={doctorRecommendation}
          doctorRemarks={doctorRemarks}
          generatedFiles={generatedFiles}
          setGeneratedFiles={setGeneratedFiles}
        />
      </main>
    </div>
  );
}

export default Dashboard;
