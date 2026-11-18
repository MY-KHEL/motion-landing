export function Orbit() {
  return (
    <div className="orbit-stage aspect-[4/3] md:aspect-[16/8.2]" aria-hidden="true">
      <div className="orbit-ring orbit-ring-b" />
      <div className="orbit-ring orbit-ring-a" />
      <div className="orbit-spin">
        <span className="orbit-dot top-[6%] left-[58%] h-2.5 w-2.5 bg-blue-soft" />
      </div>
      <div className="orbit-spin orbit-spin-slow">
        <span className="orbit-dot right-[6%] bottom-[22%] h-2 w-2 bg-coral" />
      </div>
      <div className="orbit-disc" />
      <span className="orbit-core" />
    </div>
  );
}
