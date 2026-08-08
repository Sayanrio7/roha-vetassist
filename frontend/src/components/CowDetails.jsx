import { BadgeInfo, User, MapPin, Phone, Calendar, PawPrint } from "lucide-react";
import SectionCard from "./SectionCard";

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <p className="font-semibold text-gray-800 text-lg">{value || "-"}</p>
    </div>
  );
}

function CowDetails({ cow }) {
  if (!cow) return null;

  return (
    <SectionCard title="Cattle Information">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{cow.name}</h2>

          <p className="text-gray-500">
            {cow.cowNumber} • {cow.breed}
          </p>
        </div>

        <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold">
          Active Record
        </div>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5">
        <InfoCard
          icon={<BadgeInfo size={18} />}
          label="Cow Number"
          value={cow.cowNumber}
        />

        <InfoCard
          icon={<User size={18} />}
          label="Owner"
          value={cow.ownerName}
        />

        <InfoCard
          icon={<Phone size={18} />}
          label="Contact Number"
          value={cow.ownerPhone}
        />

        <InfoCard icon={<PawPrint size={18} />} label="Breed" value={cow.breed} />

        <InfoCard
          icon={<Calendar size={18} />}
          label="Age"
          value={`${cow.age} Years`}
        />

        <InfoCard
          icon={<BadgeInfo size={18} />}
          label="Gender"
          value={cow.gender}
        />

        <InfoCard
          icon={<MapPin size={18} />}
          label="Village"
          value={cow.village}
        />

        <InfoCard
          icon={<MapPin size={18} />}
          label="District"
          value={cow.district}
        />

        <InfoCard icon={<MapPin size={18} />} label="State" value={cow.state} />
      </div>
    </SectionCard>
  );
}

export default CowDetails;
