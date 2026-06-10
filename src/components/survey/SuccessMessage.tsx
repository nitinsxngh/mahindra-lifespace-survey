export function SuccessMessage() {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center sm:p-10">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg
          className="h-8 w-8 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-charcoal-800">
        Thank you!
      </h2>
      <p className="mt-3 text-charcoal-600">
        Your choices have been submitted successfully. We appreciate you sharing
        your amenity preferences with us.
      </p>
      <p className="mt-4 rounded-xl bg-charcoal-50 px-4 py-3 text-sm text-charcoal-500">
        This survey is now closed for your mobile number. You will not be able
        to submit again.
      </p>
    </div>
  );
}
