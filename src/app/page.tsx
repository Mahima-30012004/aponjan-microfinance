import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold text-green-700">
            Aponjan
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#home"
              className="text-sm font-medium text-gray-700 hover:text-green-700"
            >
              Home
            </Link>

            <Link
              href="#loans"
              className="text-sm font-medium text-gray-700 hover:text-green-700"
            >
              Loans
            </Link>

            <Link
              href="#how-it-works"
              className="text-sm font-medium text-gray-700 hover:text-green-700"
            >
              How It Works
            </Link>

            <Link
              href="#about"
              className="text-sm font-medium text-gray-700 hover:text-green-700"
            >
              About Us
            </Link>

            <Link
              href="#contact"
              className="text-sm font-medium text-gray-700 hover:text-green-700"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="bg-green-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <p className="mb-4 font-semibold uppercase tracking-wide text-green-700">
              Simple • Transparent • Accessible
            </p>

            <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
              Financial support for your{" "}
              <span className="text-green-700">next step.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Aponjan provides simple and structured microfinance solutions
              designed to help individuals and groups manage their financial
              needs with confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white shadow-sm hover:bg-green-800"
              >
                Apply for a Loan
              </Link>

              <Link
                href="/login"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50"
              >
                Customer Login
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="rounded-2xl bg-green-700 p-8 text-white">
              <p className="text-sm font-medium text-green-100">
                Aponjan Microfinance
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                Manage your loan with clarity.
              </h2>

              <p className="mt-4 leading-7 text-green-50">
                Apply, track your loan, view your repayment schedule and stay
                informed about your payments from one place.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">Individual</p>
                  <p className="mt-1 text-sm text-green-100">Loan option</p>
                </div>

                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">Group</p>
                  <p className="mt-1 text-sm text-green-100">Loan option</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Types */}
      <section id="loans" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-semibold text-green-700">OUR LOAN OPTIONS</p>

            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Choose a loan that fits your needs
            </h2>

            <p className="mt-4 text-gray-600">
              Aponjan supports both individual borrowers and eligible groups
              through structured loan management.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl">
                👤
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                Individual Loans
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                A loan solution for individual customers based on their
                eligibility and approved loan product.
              </p>

              <Link
                href="/register"
                className="mt-6 inline-block font-semibold text-green-700 hover:text-green-800"
              >
                Get started →
              </Link>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl">
                👥
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                Group Loans
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                A structured group lending option where eligible members can
                manage their individual loans within a group.
              </p>

              <Link
                href="/register"
                className="mt-6 inline-block font-semibold text-green-700 hover:text-green-800"
              >
                Get started →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="font-semibold text-green-700">HOW IT WORKS</p>

            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Simple steps from application to repayment
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                1
              </div>

              <h3 className="mt-5 text-lg font-bold">Register</h3>

              <p className="mt-2 text-gray-600">
                Create your Aponjan customer account.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                2
              </div>

              <h3 className="mt-5 text-lg font-bold">Apply</h3>

              <p className="mt-2 text-gray-600">
                Submit your loan application with the required information.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                3
              </div>

              <h3 className="mt-5 text-lg font-bold">Approval</h3>

              <p className="mt-2 text-gray-600">
                Your application is reviewed by the authorized team.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                4
              </div>

              <h3 className="mt-5 text-lg font-bold">Repay</h3>

              <p className="mt-2 text-gray-600">
                Track your EMI schedule and repayment progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="font-semibold text-green-700">
                WHY APONJAN
              </p>

              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Built around clear loan management
              </h2>

              <p className="mt-5 leading-8 text-gray-600">
                Aponjan is designed to make the loan journey easier to
                understand and manage, from application through repayment.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-5">
                <h3 className="font-bold">Easy Application</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Apply through a simple digital process.
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <h3 className="font-bold">EMI Tracking</h3>
                <p className="mt-2 text-sm text-gray-600">
                  View your repayment schedule and payment status.
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <h3 className="font-bold">Loan Visibility</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Keep track of your active loans and outstanding amounts.
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <h3 className="font-bold">Structured Management</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Designed for customers and authorized Aponjan staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl rounded-3xl bg-green-700 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to get started?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-green-50">
            Create your Aponjan account and explore the available loan
            options.
          </p>

          <Link
            href="/register"
            className="mt-7 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-green-700 hover:bg-green-50"
          >
            Create an Account
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-bold">Contact Aponjan</h2>

          <p className="mt-2 text-gray-600">
            Contact information will be added once the company&apos;s official
            details are provided.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-6 py-8 text-gray-300">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row">
          <div>
            <p className="font-bold text-white">Aponjan</p>
            <p className="mt-1 text-sm">
              Microfinance Management Platform
            </p>
          </div>

          <p className="text-sm">
            © 2026 Aponjan. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}