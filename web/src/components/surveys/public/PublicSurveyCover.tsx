// region imports
import { Button } from "@/components/ui/Button";
import { ProgressIcon } from "@/utils/icons";
// endregion

// region types
interface PublicSurveyCoverProps {
  survey: {
    title: string;
    description?: string | null;
    logoUrl?: string | null;
  };
  brandColor: string;
  questionsCount: number;
  isClosed: boolean;
  onStart: () => void;
}
// endregion

// region component
export const PublicSurveyCover = ({
  survey,
  brandColor,
  questionsCount,
  isClosed,
  onStart,
}: PublicSurveyCoverProps) => {
  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        {survey.logoUrl ? (
          <img
            src={survey.logoUrl}
            alt="Survey logo"
            className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-sm"
          />
        ) : (
          <div
            className="mx-auto h-16 w-16 rounded-2xl shadow-sm"
            style={{ backgroundColor: brandColor }}
          />
        )}
        <div
          className="mx-auto h-1.5 w-24 rounded-full"
          style={{ backgroundColor: brandColor }}
        />
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {survey.title}
        </h1>
        {survey.description && (
          <p className="mx-auto max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
            {survey.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: brandColor }}
          />
          {questionsCount} questions
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
          <ProgressIcon />
          One question at a time
        </span>
      </div>

      <div className="flex justify-center pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={onStart}
          disabled={isClosed}
          style={
            isClosed
              ? undefined
              : {
                  background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
                }
          }
        >
          {isClosed ? "Survey closed" : "Start Survey"}
        </Button>
      </div>
      {isClosed && (
        <p className="text-sm font-medium text-red-500">
          <strong>{survey.title}</strong> is no longer accepting responses.
        </p>
      )}
    </div>
  );
};
// endregion
