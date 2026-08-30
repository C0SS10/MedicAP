export function BackgroundBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-blush blur-3xl opacity-60 sm:-top-24 sm:-left-24 sm:h-96 sm:w-96" />
      <div className="absolute top-32 right-0 h-56 w-56 rounded-full bg-sky blur-3xl opacity-50 sm:top-40 sm:h-80 sm:w-80" />
      <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-olive blur-3xl opacity-40 sm:h-72 sm:w-72" />
    </div>
  );
}