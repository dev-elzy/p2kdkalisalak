"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface ActiveQRCodeProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export const ActiveQRCode: React.FC<ActiveQRCodeProps> = ({
  value,
  size = 80,
  className = "",
  darkColor = "#000000",
  lightColor = "#ffffff",
}) => {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    if (!value) return;

    QRCode.toDataURL(value, {
      width: size * 2, // High resolution for sharp printing
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error("Error generating QR code:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, darkColor, lightColor]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 animate-pulse rounded border border-slate-300 flex items-center justify-center text-[8px] text-slate-400 font-mono ${className}`}
      >
        QR
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={`QR Code: ${value}`}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`block object-contain ${className}`}
    />
  );
};
