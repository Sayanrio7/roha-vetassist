function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-5 border-b pb-2">
        {title}
      </h2>

      {children}

    </div>
  );
}

export default SectionCard;