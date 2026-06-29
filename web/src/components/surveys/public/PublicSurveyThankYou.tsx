// region imports
import { CheckLargeIcon } from "@/utils/icons";
// endregion

// region types
interface PublicSurveyThankYouProps {
  brandColor: string;
}
// endregion

// region component
export const PublicSurveyThankYou = ({ brandColor }: PublicSurveyThankYouProps) => {
  return (
    <div className="py-12 text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          backgroundColor: `${brandColor}18`,
          color: brandColor,
        }}
      >
        <CheckLargeIcon />
      </div>
      <h2 className="text-3xl font-bold text-gray-900">Thank you</h2>
      <p className="mt-3 text-gray-600">
        Your response has been recorded successfully.
      </p>
    </div>
  );
};
// endregion
