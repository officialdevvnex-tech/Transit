export default function Loading() {
  return (
    <div className="wrap flex min-h-[100svh] flex-col justify-end gap-6 pb-24 pt-40" role="status" aria-label="Loading the next altitude">
      <div className="skeleton h-3 w-40" />
      <div className="skeleton h-[18vw] max-h-[260px] w-[70%]" />
      <div className="skeleton h-[18vw] max-h-[260px] w-[48%]" />
      <div className="skeleton mt-6 h-4 w-72" />
      <p className="label">Descending…</p>
    </div>
  );
}
