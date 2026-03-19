import Image from 'next/image';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ProfilePhotoProps {
  photoUrl: string | null;
  name: string;
  size?: Size;
}

const SIZE_MAP: Record<Size, { px: number; text: string }> = {
  sm: { px: 32, text: 'text-xs' },
  md: { px: 48, text: 'text-base' },
  lg: { px: 64, text: 'text-xl' },
  xl: { px: 96, text: 'text-3xl' },
};

export function ProfilePhoto({ photoUrl, name, size = 'md' }: ProfilePhotoProps) {
  const { px, text } = SIZE_MAP[size];
  const initial = name?.trim()?.[0]?.toUpperCase() || '?';

  if (photoUrl) {
    return (
      <div
        className="rounded-full overflow-hidden shrink-0"
        style={{ width: px, height: px }}
      >
        <Image
          src={photoUrl}
          alt={name}
          width={px}
          height={px}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 bg-[var(--tss-navy)]`}
      style={{ width: px, height: px }}
    >
      <span className={text}>{initial}</span>
    </div>
  );
}
