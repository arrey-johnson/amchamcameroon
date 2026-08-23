export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-14 sm:px-6" aria-busy="true" aria-live="polite">
      <div className="mb-8 h-10 w-2/3 max-w-md rounded-md bg-navy/10" />
      <div className="mb-4 h-4 w-full max-w-2xl rounded bg-navy/5" />
      <div className="mb-10 h-4 w-full max-w-xl rounded bg-navy/5" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="aspect-[16/10] rounded-xl bg-navy/5" />
        <div className="aspect-[16/10] rounded-xl bg-navy/5" />
        <div className="aspect-[16/10] rounded-xl bg-navy/5" />
      </div>
    </div>
  );
}
