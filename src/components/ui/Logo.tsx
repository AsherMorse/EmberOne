/** Logo component combining SVG and text */

import Image from 'next/image';
import type { ReactElement } from 'react';

interface LogoProps {
  /** Optional class name for styling */
  className?: string;
  /** Size of the logo in pixels */
  size?: number;
}

/** Logo component that combines the EmberOne SVG with text */
export default function Logo({ className = '', size = 32 }: LogoProps): ReactElement {
  // Calculate text size based on logo size
  const textSize = Math.max(size * 0.8, 16); // 80% of logo size, minimum 16px

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image src="/flame.svg" alt="EmberOne Logo" width={size} height={size} />
      <span
        className="font-bold text-foreground mt-2"
        style={{ fontSize: `${textSize}px`, lineHeight: 1 }}
      >
        EmberOne
      </span>
    </div>
  );
}
