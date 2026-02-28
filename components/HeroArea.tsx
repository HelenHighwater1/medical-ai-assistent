export default function HeroArea() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl tracking-tight text-moss-900 sm:text-4xl">
          Prepare for your next appointment
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-warm-gray-500">
          Upload a medical document or use a mock data example - no need to drop in your own PDF. Get a clear summary with questions to bring to your doctor.
        </p>
      </div>

      <div
        className="mx-auto mt-5 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-3"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm leading-relaxed text-amber-800/90">
            <span className="font-semibold">This is a demo project</span> - not
            a real medical tool. Do not enter real patient information. Not HIPAA
            compliant.
          </p>
        </div>
      </div>
    </section>
  );
}
