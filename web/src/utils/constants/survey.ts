// Form defaults
const oneDayFromNow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString();
};

export const DEFAULT_SURVEY_FORM = () => ({
  title: "",
  description: "",
  primaryColor: "#6366F1",
  logoUrl: "",
  endsAt: oneDayFromNow(),
  maxResponses: "1000",
});

export const DEFAULT_QUESTION_FORM = {
  type: "short_text" as const,
  uiType: "input" as const,
  title: "",
  description: "",
  required: false,
  options: ["", ""],
  minLength: "",
  maxLength: "",
  visibleIf: null,
};

// Brand color swatches
export const BRAND_SWATCHES = [
  "#111827",
  "#4B5563",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#F3F4F6",
  "#DC2626",
  "#EA580C",
  "#D97706",
  "#059669",
  "#2563EB",
  "#7C3AED",
] as const;

// Color picker preset colors
export const COLOR_PICKER_PRESETS = [
  "#0EA5E9", // sky
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#D946EF", // fuchsia
  "#EC4899", // pink
  "#F43F5E", // rose
  "#F97316", // orange
  "#FBBF24", // amber
  "#84CC16", // lime
  "#22C55E", // green
  "#10B981", // emerald
  "#14B8A6", // teal
] as const;

// Share options
export const SHARE_OPTIONS = [
  {
    label: "WhatsApp",
    icon: "WhatsAppIcon",
    className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    shareUrl: (surveyUrl: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${surveyUrl}`)}`,
  },
  {
    label: "Email",
    icon: "MailShareIcon",
    className: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    shareUrl: (surveyUrl: string, title: string, text: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${surveyUrl}`)}`,
  },
  {
    label: "LinkedIn",
    icon: "LinkedInIcon",
    className: "bg-sky-50 text-sky-700 hover:bg-sky-100",
    shareUrl: (surveyUrl: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(surveyUrl)}`,
  },
] as const;

// Survey page filter options
export const SURVEY_DATE_RANGE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
] as const;

export const SURVEY_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A to Z" },
  { value: "responses", label: "Most responses" },
] as const;

// Pagination
export const SURVEY_PAGE_SIZE = 6;

// Navigation links
export const NAVIGATION_LINKS = [
  { path: "/dashboard", label: "Dashboard", icon: "HomeIcon" },
  { path: "/surveys", label: "Surveys", icon: "NavSurveyIcon" },
] as const;

// Question types
export const QUESTION_TYPES = [
  {
    value: "short_text",
    label: "Short text",
    description: "input",
    uiType: "input" as const,
  },
  {
    value: "long_text",
    label: "Long text",
    description: "textarea",
    uiType: "textarea" as const,
  },
  {
    value: "multiple_choice",
    label: "Multiple choice",
    description: "radio",
    uiType: "radio" as const,
    supportsOptions: true,
  },
  {
    value: "checkbox_group",
    label: "Checkbox",
    description: "checkbox group",
    uiType: "checkbox_group" as const,
    supportsOptions: true,
  },
  {
    value: "dropdown",
    label: "Dropdown",
    description: "select",
    uiType: "select" as const,
    supportsOptions: true,
  },
  {
    value: "rating",
    label: "Rating",
    description: "1–5 buttons",
    uiType: "buttons" as const,
  },
  {
    value: "yes_no",
    label: "Yes / No",
    description: "toggle / radio",
    uiType: "toggle" as const,
  },
] as const;

export const RATING_SCALES = [5, 10] as const;

export const MAX_RESPONSES_MIN = 1;
export const MAX_RESPONSES_MAX = 10000;

export const SURVEY_STATUSES = [
  { id: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
  { id: "published", label: "Published", color: "bg-green-100 text-green-800" },
  { id: "closed", label: "Closed", color: "bg-yellow-100 text-yellow-800" },
] as const;
