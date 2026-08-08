function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      
      {/* Subtle AI ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative flex flex-col items-center px-6 text-center">

        {/* ================================================== */}
        {/* BRAND */}
        {/* ================================================== */}

        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ROHA VetAssist
            </span>
          </h1>

          <p className="mt-3 text-sm font-medium tracking-wide text-slate-500 sm:text-base">
            Veterinary Clinical Decision Support System
          </p>
        </div>

        {/* ================================================== */}
        {/* AI PROCESSING CORE */}
        {/* ================================================== */}

        <div className="relative flex h-28 w-28 items-center justify-center">

          {/* Ambient pulse */}
          <div className="absolute inset-0 animate-ping rounded-full border border-blue-200 opacity-20" />

          {/* Outer static ring */}
          <div className="absolute inset-2 rounded-full border border-blue-100" />

          {/* Rotating AI ring */}
          <div className="absolute inset-3 animate-spin rounded-full border-[3px] border-transparent border-t-blue-600 border-r-indigo-500" />

          {/* Inner glow */}
          <div className="absolute inset-7 rounded-full bg-blue-50 shadow-lg shadow-blue-100/70" />

          {/* AI Core */}
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-300/40">

            {/* Core pulse */}
            <div className="h-3 w-3 animate-pulse rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />

          </div>

          {/* ================================================== */}
          {/* ORBITING NODES */}
          {/* ================================================== */}

          <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 animate-pulse rounded-full bg-blue-500 shadow-md shadow-blue-300" />

          <div className="absolute bottom-1 right-2 h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-500 shadow-md shadow-indigo-300" />

          <div className="absolute bottom-1 left-2 h-2.5 w-2.5 animate-pulse rounded-full bg-blue-400 shadow-md shadow-blue-200" />
        </div>

        {/* ================================================== */}
        {/* STATUS */}
        {/* ================================================== */}

        <div className="mt-9">

          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

            <p className="text-sm font-semibold text-slate-700 sm:text-base">
              Initializing VetAssist
            </p>
          </div>

          <p className="mt-2 text-xs text-slate-400 sm:text-sm">
            Preparing your AI-assisted clinical workspace
          </p>

        </div>

        {/* ================================================== */}
        {/* AI ENGINE STATUS */}
        {/* ================================================== */}

        <div className="mt-6 flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-5 py-2.5 shadow-sm shadow-blue-100/50 backdrop-blur-sm">

          <span className="text-xs font-medium text-slate-500">
            AI Clinical Engine
          </span>

          <span className="h-1 w-1 rounded-full bg-blue-400" />

          <span className="text-xs font-semibold text-blue-600">
            Initializing
          </span>

        </div>

      </div>
    </div>
  );
}

export default Loading;