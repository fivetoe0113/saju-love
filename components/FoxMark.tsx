export function FoxMark({ size = 30 }: { size?: number }) {
  const height = size * 0.87;
  const earBorder = size * 0.4;
  const faceInset = size * 0.1;

  return (
    <div className="relative shrink-0" style={{ width: size, height }} aria-hidden="true">
      <span
        className="absolute top-0 left-0"
        style={{
          width: 0,
          height: 0,
          borderLeft: `${earBorder / 2}px solid transparent`,
          borderRight: `${earBorder / 2}px solid transparent`,
          borderBottom: `${earBorder}px solid var(--rose)`,
          transform: "rotate(-14deg)",
        }}
      />
      <span
        className="absolute top-0 right-0"
        style={{
          width: 0,
          height: 0,
          borderLeft: `${earBorder / 2}px solid transparent`,
          borderRight: `${earBorder / 2}px solid transparent`,
          borderBottom: `${earBorder}px solid var(--rose)`,
          transform: "rotate(14deg)",
        }}
      />
      <span
        className="absolute rounded-[50%/46%] bg-rose"
        style={{
          top: size * 0.2,
          left: faceInset,
          width: size - faceInset * 2,
          height: height - size * 0.2,
        }}
      />
    </div>
  );
}
