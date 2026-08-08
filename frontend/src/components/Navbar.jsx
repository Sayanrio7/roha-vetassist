import { Activity, Brain, ShieldCheck } from "lucide-react";

function Navbar() {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-xl border-b border-blue-700">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col lg:flex-row justify-between items-center gap-4">
        {/* Left */}
        <div>
          <h1 className="text-3xl font-bold tracking-wide">
            ROHA VetAssist AI
          </h1>

          <p className="text-blue-100 mt-1">
            Intelligent Veterinary Clinical Decision Support System
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <Brain size={18} />
            <span className="text-sm font-medium">AI Assisted Diagnosis</span>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <Activity size={18} />
            <span className="text-sm font-medium">GI Parasite Screening</span>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <ShieldCheck size={18} />
            <span className="text-sm font-semibold">
              Clinical Decision Support
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
