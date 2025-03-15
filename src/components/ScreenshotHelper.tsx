import React, { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

type ScreenshotHelperProps = {
  type: 'desktop' | 'mobile';
};

export const ScreenshotHelper = ({ type }: ScreenshotHelperProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const takeScreenshot = async () => {
      if (!contentRef.current) return;

      try {
        const canvas = await html2canvas(contentRef.current);
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
          }, 'image/png');
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}-screenshot.png`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error taking screenshot:', error);
      }
    };

    const timer = setTimeout(takeScreenshot, 2000);
    return () => clearTimeout(timer);
  }, [type]);

  const dimensions = type === 'desktop' ? { width: 1920, height: 1080 } : { width: 750, height: 1334 };

  return (
    <div 
      ref={contentRef}
      data-testid="screenshot-helper"
      className="relative bg-white"
      style={dimensions}
    >
      <div className="absolute top-4 left-4 text-sm text-gray-500">
        Taking screenshot in 2 seconds...
        <br />
        Dimensions: {dimensions.width}x{dimensions.height}
      </div>
    </div>
  );
}; 