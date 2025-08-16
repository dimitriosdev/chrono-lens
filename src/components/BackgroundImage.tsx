import Image from "next/image";
import React from "react";

interface BackgroundImageProps {
  imageUrl: string;
  className?: string;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({
  imageUrl,
  className,
}) => (
  <div className={`fixed inset-0 w-full h-full z-0 ${className || ""}`}>
    <Image
      src={imageUrl}
      alt="Background Image"
      fill
      className="object-cover w-full h-full"
      priority
    />
  </div>
);

export default BackgroundImage;
