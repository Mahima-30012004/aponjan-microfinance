import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ecfdf5] text-slate-800 flex flex-col font-sans">
      {/* Navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tight text-[#065f46]">
          Aponjan
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-[#065f46] transition">Home</Link>
          <Link href="#loans" className="hover:text-[#065f46] transition">Loans</Link>
          <Link href="#how-it-works" className="hover:text-[#065f46] transition">How It Works</Link>
          <Link href="#about" className="hover:text-[#065f46] transition">About Us</Link>
          <Link href="#contact" className="hover:text-[#065f46] transition">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium border border-[#047857] text-[#047857] rounded-lg hover:bg-white transition bg-transparent"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-medium bg-[#047857] text-white rounded-lg hover:bg-[#065f46] transition shadow-sm"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl">
          <div className="text-xs font-bold tracking-widest text-[#047857] uppercase mb-4">
            Simple • Transparent • Accessible
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0f172a] tracking-tight leading-tight mb-6">
            Financial support <br />
            for your <span className="text-[#059669]">next step.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
            Aponjan provides simple and structured microfinance solutions designed
            to help individuals and groups manage their financial needs with confidence.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard/apply-loan"
              className="px-6 py-3.5 bg-[#047857] hover:bg-[#065f46] text-white font-medium rounded-lg shadow-sm transition"
            >
              Apply for a Loan
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-sm transition"
            >
              Customer Login
            </Link>
          </div>
        </div>

        {/* Right Green Card */}
        <div className="flex-1 w-full max-w-md lg:max-w-lg">
          <div className="bg-[#059669] text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-500/20">
            <div className="text-sm font-medium text-emerald-100 mb-2">
              Aponjan Microfinance
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Manage your loan with clarity.
            </h2>
            <p className="text-sm text-emerald-50/90 leading-relaxed mb-8">
              Apply, track your loan, view your repayment schedule and stay
              informed about your payments from one place.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#047857] p-4 rounded-xl border border-emerald-500/30">
                <div className="font-semibold text-base mb-1">Individual</div>
                <div className="text-xs text-emerald-200">Loan option</div>
              </div>
              <div className="bg-[#047857] p-4 rounded-xl border border-emerald-500/30">
                <div className="font-semibold text-base mb-1">Group</div>
                <div className="text-xs text-emerald-200">Loan option</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}