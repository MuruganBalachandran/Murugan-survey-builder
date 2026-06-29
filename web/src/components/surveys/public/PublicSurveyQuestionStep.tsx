// region imports
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { StarRating } from "@/components/ui/StarRating";
import { CharCounter } from "@/components/ui/CharCounter";
import { ArrowLeftIcon, CheckLargeIcon } from "@/utils/icons";
import type { Question } from "@/types";
// endregion

// region types
interface PublicSurveyQuestionStepProps {
  currentIndex: number;
  questionsCount: number;
  currentQuestion: Question;
  currentAnswer: any;
  currentUiType: string | undefined;
  progress: number;
  brandColor: string;
  canGoNext: boolean;
  submitting: boolean;
  stepInputRef: React.RefObject<any>;
  onAnswerChange: (questionId: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}
// endregion

// region component
export const PublicSurveyQuestionStep = ({
  currentIndex,
  questionsCount,
  currentQuestion,
  currentAnswer,
  currentUiType,
  progress,
  brandColor,
  canGoNext,
  submitting,
  stepInputRef,
  onAnswerChange,
  onNext,
  onPrevious,
}: PublicSurveyQuestionStepProps) => {
  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: brandColor }}
            >
              Question {currentIndex + 1} of {questionsCount}
            </p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              {currentQuestion.title}
            </h2>
            {currentQuestion.description && (
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {currentQuestion.description}
              </p>
            )}
          </div>
          {/* desktop progress bar */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2 w-36 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: brandColor,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {progress}%
            </span>
          </div>
        </div>

        {/* mobile progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 sm:hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: brandColor,
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {currentUiType === "input" && (
          <>
            <Input
              ref={stepInputRef}
              value={String(currentAnswer || "")}
              onChange={(event) =>
                onAnswerChange(currentQuestion.id, event.target.value)
              }
              placeholder="Your answer..."
              autoFocus
            />
            {currentQuestion.maxLength && (
              <CharCounter
                value={String(currentAnswer || "")}
                max={currentQuestion.maxLength}
                min={currentQuestion.minLength}
              />
            )}
          </>
        )}

        {currentUiType === "textarea" && (
          <>
            <Textarea
              ref={stepInputRef}
              value={String(currentAnswer || "")}
              onChange={(event) =>
                onAnswerChange(currentQuestion.id, event.target.value)
              }
              placeholder="Your answer..."
              rows={6}
              autoFocus
            />
            {currentQuestion.maxLength && (
              <CharCounter
                value={String(currentAnswer || "")}
                max={currentQuestion.maxLength}
                min={currentQuestion.minLength}
              />
            )}
          </>
        )}

        {currentUiType === "radio" && (
          <div className="grid gap-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                  currentAnswer === option
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  checked={currentAnswer === option}
                  onChange={() => onAnswerChange(currentQuestion.id, option)}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                  autoFocus={option === currentQuestion.options?.[0]}
                />
                <span className="text-sm font-medium text-gray-800">
                  {option}
                </span>
              </label>
            ))}
          </div>
        )}

        {currentUiType === "checkbox_group" && (
          <div className="grid gap-3">
            {currentQuestion.options?.map((option) => {
              const selected = Array.isArray(currentAnswer)
                ? currentAnswer.includes(option)
                : false;
              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                    selected
                      ? "border-violet-500 bg-violet-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => {
                      const current = Array.isArray(currentAnswer)
                        ? currentAnswer
                        : [];
                      if (event.target.checked) {
                        onAnswerChange(currentQuestion.id, [...current, option]);
                      } else {
                        onAnswerChange(
                          currentQuestion.id,
                          current.filter((item) => item !== option),
                        );
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {currentUiType === "select" && (
          <select
            ref={stepInputRef}
            value={typeof currentAnswer === "string" ? currentAnswer : ""}
            onChange={(event) =>
              onAnswerChange(currentQuestion.id, event.target.value)
            }
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
            autoFocus
          >
            <option value="" disabled>
              Select an option
            </option>
            {currentQuestion.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {currentUiType === "buttons" && (
          <StarRating
            value={typeof currentAnswer === "number" ? currentAnswer : 0}
            color={brandColor}
            size={36}
            interactive
            onChange={(rating) => onAnswerChange(currentQuestion.id, rating)}
          />
        )}

        {currentUiType === "toggle" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {["Yes", "No"].map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                  currentAnswer === option
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  checked={currentAnswer === option}
                  onChange={() => onAnswerChange(currentQuestion.id, option)}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                  autoFocus={option === "Yes"}
                />
                <span className="text-sm font-medium text-gray-800">
                  {option}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="tertiary"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          icon={<ArrowLeftIcon />}
        >
          Previous
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            {currentIndex + 1} / {questionsCount}
          </span>
          <Button
            variant="primary"
            onClick={onNext}
            isLoading={submitting}
            disabled={!canGoNext}
            icon={currentIndex < questionsCount - 1 ? undefined : <CheckLargeIcon />}
            style={{
              background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
            }}
          >
            {currentIndex < questionsCount - 1 ? "Next" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};
// endregion
