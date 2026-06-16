// region imports
import { OffCanvas } from "@/components/common/OffCanvas";
import { Button } from "@/components/ui/Button";
import { useCountdown } from "@/hooks/useCountdown";
import type { QuestionFormState, SurveyRecord } from "@/types";
import type { Question } from "@/types/survey";
import { statusLabel } from "@/utils/common/survey";
import { BrandingForm } from "../forms/BrandingForm";
import { QuestionComposerCard } from "../forms/QuestionComposerCard";
import { SurveyDetailsForm } from "../forms/SurveyDetailsForm";

// endregion

// region types
interface Props {
  isOpen: boolean;
  activeSurvey: SurveyRecord | null;
  activeQuestions: Question[];
  surveyForm: {
    title: string;
    description: string;
    primaryColor: string;
    logoUrl: string;
  };
  questionForm: QuestionFormState;
  questionErrors: Record<string, string>;
  questionMode: "create" | "edit";
  isQuestionComposerOpen: boolean;
  isSavingSurvey: boolean;
  isPublishingSurvey: boolean;
  isSavingQuestion: boolean;
  logoFileName: string;
  draggedQuestionId: string | null;
  hasEditChanges: boolean;
  endsAt?: string;
  onEndsAtChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onPublish: () => void;
  onManualClose: () => void;
  onSurveyFormChange: (field: string, value: string) => void;
  onLogoUpload: (file: File | null) => void;
  onAddQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (question: Question) => void;
  onQuestionDragStart: (questionId: string) => void;
  onQuestionDragOver: (event: React.DragEvent) => void;
  onQuestionDrop: (targetQuestionId: string) => void;
  onQuestionDragEnd: () => void;
  onQuestionFormChange: (
    updater: (current: QuestionFormState) => QuestionFormState,
  ) => void;
  onSaveQuestion: () => void;
  onCloseComposer: () => void;
}
// endregion

// region component
export const EditSurveyDrawer = ({
  isOpen,
  activeSurvey,
  activeQuestions,
  surveyForm,
  questionForm,
  questionErrors,
  questionMode,
  isQuestionComposerOpen,
  isSavingSurvey,
  isPublishingSurvey,
  isSavingQuestion,
  logoFileName,
  draggedQuestionId,
  hasEditChanges,
  endsAt,
  onEndsAtChange,
  onClose,
  onSave,
  onPublish,
  onManualClose,
  onSurveyFormChange,
  onLogoUpload,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onQuestionDragStart,
  onQuestionDragOver,
  onQuestionDrop,
  onQuestionDragEnd,
  onQuestionFormChange,
  onSaveQuestion,
  onCloseComposer,
}: Props) => {
  const countdown = useCountdown(endsAt)
  return (
  <OffCanvas
    isOpen={isOpen}
    onClose={onClose}
    title={activeSurvey?.title || "Survey editor"}
    description={
      activeSurvey
        ? "Edit details, brand, and questions from one drawer."
        : "Loading survey..."
    }
    size="xl"
    zIndex={70}
    footer={
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={onSave}
          isLoading={isSavingSurvey}
          disabled={!hasEditChanges}
        >
          Save changes
        </Button>
        {activeSurvey && activeSurvey.status === "published" && (
          <Button variant="danger" onClick={onManualClose}>
            Close survey
          </Button>
        )}
        {activeSurvey && activeSurvey.status !== "published" && (
          <Button
            variant="success"
            onClick={onPublish}
            isLoading={isPublishingSurvey}
            disabled={activeQuestions.length === 0}
          >
            Publish survey
          </Button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
          aria-label="Close drawer"
          title="Close drawer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    }
  >
    {!activeSurvey ? (
      <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
        Loading survey...
      </div>
    ) : (
      <div className="space-y-6">
        {/* basic info card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                Basic info
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                Survey details
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Update the title and description here.
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {statusLabel(activeSurvey.status)}
            </span>
          </div>
          <div className="mt-5">
            <SurveyDetailsForm
              title={surveyForm.title}
              description={surveyForm.description}
              onTitleChange={(value) => onSurveyFormChange("title", value)}
              onDescriptionChange={(value) =>
                onSurveyFormChange("description", value)
              }
            />
          </div>

          {/* response end date */}
          <div className="mt-5">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Response limit end date / time
            </label>
            <input
              type="datetime-local"
              value={endsAt ? endsAt.slice(0, 16) : ""}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) =>
                onEndsAtChange(
                  e.target.value ? new Date(e.target.value).toISOString() : "",
                )
              }
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            {countdown && (
              <p className={`mt-1.5 text-xs font-medium ${countdown === 'Ended' ? 'text-red-500' : 'text-violet-600'}`}>
                {countdown}
              </p>
            )}
          </div>
        </div>

        {/* branding card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                Brand info
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                Appearance
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Pick the color and logo shown to respondents.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <BrandingForm
              primaryColor={surveyForm.primaryColor}
              logoUrl={surveyForm.logoUrl}
              logoFileName={logoFileName}
              onColorChange={(value) =>
                onSurveyFormChange("primaryColor", value)
              }
              onLogoUrlChange={(value) => onSurveyFormChange("logoUrl", value)}
              onLogoUpload={onLogoUpload}
            />
          </div>
        </div>

        {/* questions card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                Questions
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                Builder content
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Add, remove, and reorder the survey questions.
              </p>
            </div>
            <Button variant="primary" onClick={onAddQuestion}>
              Add question
            </Button>
          </div>

          {activeQuestions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              No questions yet. Add the first one from the drawer.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {activeQuestions.map((question, index) => (
                <div
                  key={question.id}
                  draggable
                  onDragStart={() => onQuestionDragStart(question.id)}
                  onDragOver={onQuestionDragOver}
                  onDrop={() => onQuestionDrop(question.id)}
                  onDragEnd={onQuestionDragEnd}
                  className={`rounded-2xl border bg-gray-50 p-4 transition-all ${
                    draggedQuestionId === question.id
                      ? "border-violet-500 opacity-50"
                      : "border-gray-200 hover:border-violet-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="pt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                        ⋮
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-violet-600 shadow-sm">
                            Q{index + 1}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm">
                            {question.type}
                          </span>
                          {question.required && (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-base font-semibold text-gray-900">
                          {question.title}
                        </p>
                        {question.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {question.description}
                          </p>
                        )}
                        {question.type === "multiple_choice" &&
                        question.options?.length ? (
                          <div className="mt-3 space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={`${question.id}-${optionIndex}`}
                                className="text-sm text-gray-700"
                              >
                                • {option}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditQuestion(question)}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-violet-600 transition-colors hover:bg-violet-50"
                        title="Edit question"
                        aria-label="Edit question"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onDeleteQuestion(question)}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-red-600 transition-colors hover:bg-red-50"
                        title="Delete question"
                        aria-label="Delete question"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <QuestionComposerCard
            isOpen={isQuestionComposerOpen}
            mode={questionMode}
            form={questionForm}
            errors={questionErrors}
            isSaving={isSavingQuestion}
            onClose={onCloseComposer}
            onSave={onSaveQuestion}
            onChange={onQuestionFormChange}
          />
        </div>
      </div>
    )}
  </OffCanvas>
  )
}
// endregion
