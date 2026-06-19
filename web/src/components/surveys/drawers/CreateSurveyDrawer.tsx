// region imports
import { OffCanvas } from "@/components/common/OffCanvas";
import { Button } from "@/components/ui/Button";
import type { QuestionFormState, SurveyRecord } from "@/types";
import type { Question } from "@/types/survey";
import { isValidSurveyDescription } from "@/utils/validations";
import { QuestionComposerCard } from "../forms/QuestionComposerCard";
import { SurveyBasicsStep } from "../wizard/SurveyBasicsStep";
import { SurveyBrandingStep } from "../wizard/SurveyBrandingStep";
import { SurveyPublishStep } from "../wizard/SurveyPublishStep";
import { SurveyQuestionsStep } from "../wizard/SurveyQuestionsStep";
import { SurveyTemplatesStep } from "../wizard/SurveyTemplatesStep";

// endregion

// region types
interface Props {
  isOpen: boolean;
  createStep: 0 | 1 | 2 | 3 | 4;
  activeSurvey: SurveyRecord | null;
  activeQuestions: Question[];
  surveyForm: {
    title: string;
    description: string;
    primaryColor: string;
    logoUrl: string;
  };
  surveyErrors: Record<string, string>;
  questionForm: QuestionFormState;
  questionErrors: Record<string, string>;
  questionMode: "create" | "edit";
  isQuestionComposerOpen: boolean;
  isSavingSurvey: boolean;
  isPublishingSurvey: boolean;
  isSavingQuestion: boolean;
  logoFileName: string;
  draggedQuestionId: string | null;
  onClose: () => void;
  onWizardNext: () => void;
  onWizardBack: () => void;
  onWizardFinish: () => void;
  onPublish: () => void;
  onSurveyFormChange: (field: string, value: string) => void;
  onSurveyErrorsChange: (errors: Record<string, string>) => void;
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
  endsAt?: string;
  onEndsAtChange: (value: string) => void;
  maxResponses?: string;
  onMaxResponsesChange: (value: string) => void;
  onManualClose: () => void;
  onCopySurveyLink: (slug: string) => void;
  onPreviewSurvey: (slug: string) => void;
  onSelectTemplate: (templateId: string) => void;
  onBlankSurvey: () => void;
}
// endregion

// region titles
const STEP_TITLES: Record<number, string> = {
  0: "Choose a template",
  1: "Create survey",
  2: "Add brand",
  3: "Add questions",
  4: "Publish & share",
};

const STEP_DESCRIPTIONS: Record<number, string> = {
  0: "Pick a template to get started quickly, or start blank.",
  1: "Start with the survey title and description.",
  2: "Add your brand color and logo.",
  3: "Add questions without leaving this drawer.",
  4: "Publish the survey and share the live link.",
};
// endregion

// region component
export const CreateSurveyDrawer = ({
  isOpen,
  createStep,
  activeSurvey,
  activeQuestions,
  surveyForm,
  surveyErrors,
  questionForm,
  questionErrors,
  questionMode,
  isQuestionComposerOpen,
  isSavingSurvey,
  isPublishingSurvey,
  isSavingQuestion,
  logoFileName,
  draggedQuestionId,
  onClose,
  onWizardNext,
  onWizardBack,
  onWizardFinish,
  onPublish,
  onSurveyFormChange,
  onSurveyErrorsChange,
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
  onCopySurveyLink,
  onPreviewSurvey,
  endsAt,
  onEndsAtChange,
  maxResponses,
  onMaxResponsesChange,
  onManualClose,
  onSelectTemplate,
  onBlankSurvey,
}: Props) => (
  <OffCanvas
    isOpen={isOpen}
    onClose={onClose}
    title={STEP_TITLES[createStep] ?? ""}
    description={STEP_DESCRIPTIONS[createStep] ?? ""}
    size="xl"
    footer={
      createStep === 0 ? undefined : (
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Button
            variant="tertiary"
            onClick={onWizardBack}
            disabled={createStep === 1}
          >
            Back
          </Button>

          {/* step indicator pills */}
          <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1.5">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  createStep === step
                    ? "bg-violet-600 text-white"
                    : "bg-white text-gray-500"
                }`}
              >
                {step}
              </span>
            ))}
          </div>

          {createStep < 4 ? (
            <Button
              variant="primary"
              onClick={onWizardNext}
              isLoading={isSavingSurvey}
              disabled={createStep === 1 ? !surveyForm.title.trim() : false}
            >
              Next
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onWizardFinish}>
                Done
              </Button>
              <Button
                variant="primary"
                onClick={onPublish}
                isLoading={isPublishingSurvey}
                disabled={
                  !activeSurvey ||
                  activeQuestions.length === 0 ||
                  activeSurvey.status === "published"
                }
              >
                {activeSurvey?.status === "published"
                  ? "Published"
                  : "Publish survey"}
              </Button>
            </div>
          )}
        </div>
      )
    }
  >
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
        {createStep === 0 && (
          <SurveyTemplatesStep
            onSelect={onSelectTemplate}
            onBlank={onBlankSurvey}
          />
        )}

        {createStep === 1 && (
          <SurveyBasicsStep
            title={surveyForm.title}
            description={surveyForm.description}
            error={surveyErrors?.title}
            descriptionError={surveyErrors?.description}
            onTitleChange={(value) => onSurveyFormChange("title", value)}
            onDescriptionChange={(value) =>
              onSurveyFormChange("description", value)
            }
            onTitleBlur={() => {
              const error =
                surveyForm.title.trim() === ""
                  ? "Survey title is required"
                  : "";
              onSurveyErrorsChange({ ...surveyErrors, title: error });
            }}
            onDescriptionBlur={() => {
              const trimmed = surveyForm.description.trim();
              const error =
                trimmed && !isValidSurveyDescription(trimmed)
                  ? "Description must be 5-100 characters"
                  : "";
              onSurveyErrorsChange({ ...surveyErrors, description: error });
            }}
          />
        )}

        {createStep === 2 && (
          <SurveyBrandingStep
            primaryColor={surveyForm.primaryColor}
            logoUrl={surveyForm.logoUrl}
            logoFileName={logoFileName}
            onColorChange={(value) => onSurveyFormChange("primaryColor", value)}
            onLogoUrlChange={(value) => onSurveyFormChange("logoUrl", value)}
            onLogoUpload={onLogoUpload}
            onLogoUrlBlur={() => {
              const error =
                surveyForm.logoUrl.trim() !== "" &&
                !surveyForm.logoUrl.startsWith("http")
                  ? "Invalid URL format"
                  : "";
              onSurveyErrorsChange({ ...surveyErrors, logoUrl: error });
            }}
          />
        )}

        {createStep === 3 && (
          <>
            <SurveyQuestionsStep
              surveyTitle={
                activeSurvey?.title || surveyForm.title || "Survey title"
              }
              surveyDescription={
                activeSurvey?.description || surveyForm.description || undefined
              }
              questions={activeQuestions}
              isDraggingQuestionId={draggedQuestionId}
              onAddQuestion={onAddQuestion}
              onEditQuestion={onEditQuestion}
              onDeleteQuestion={onDeleteQuestion}
              onQuestionDragStart={onQuestionDragStart}
              onQuestionDragOver={onQuestionDragOver}
              onQuestionDrop={onQuestionDrop}
              onQuestionDragEnd={onQuestionDragEnd}
            />

            <QuestionComposerCard
              isOpen={isQuestionComposerOpen}
              mode={questionMode}
              form={questionForm}
              errors={questionErrors}
              isSaving={isSavingQuestion}
              questions={activeQuestions}
              onClose={onCloseComposer}
              onSave={onSaveQuestion}
              onChange={onQuestionFormChange}
            />
          </>
        )}

        {createStep === 4 && (
          <SurveyPublishStep
            surveyTitle={
              activeSurvey?.title || surveyForm.title || "Survey title"
            }
            surveySlug={activeSurvey?.slug}
            isPublished={activeSurvey?.status === "published"}
            onCopyLink={() =>
              activeSurvey?.slug && onCopySurveyLink(activeSurvey.slug)
            }
            onPreview={() =>
              activeSurvey?.slug &&
              activeSurvey.status === "published" &&
              onPreviewSurvey(activeSurvey.slug)
            }
            isPublishing={isPublishingSurvey}
            endsAt={endsAt}
            onEndsAtChange={onEndsAtChange}
            maxResponses={maxResponses}
            onMaxResponsesChange={onMaxResponsesChange}
          />
        )}
      </div>
    </div>
  </OffCanvas>
);
// endregion
