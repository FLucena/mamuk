import { ScreenshotHelper } from '@/components/ScreenshotHelper';
import HomePage from '@/app/page';

export default function DesktopHomeScreenshot() {
  return (
    <ScreenshotHelper type="desktop">
      <HomePage />
    </ScreenshotHelper>
  );
} 