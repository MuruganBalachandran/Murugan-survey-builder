import type { Question, SurveyResponse } from "@/types";

interface QuestionChartsProps {
  questions: Question[];
  responses: SurveyResponse[];
}

interface BarChartProps {
  data: { label: string; count: number }[];
  total: number;
  color: string;
}

// region bar chart
const BarChart = ({ data, total, color }: BarChartProps) => (
  <div className="space-y-2">
    {data.map(({ label, count }) => {
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return (
        <div key={label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700 truncate max-w-[70%]">
              {label}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {count}{" "}
              <span className="text-gray-400 font-normal">({pct}%)</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
        </div>
      );
    })}
  </div>
);
// endregion

// region question chart
const QuestionChart = ({
  question,
  responses,
  color,
}: {
  question: Question;
  responses: SurveyResponse[];
  color: string;
}) => {
  const answers = responses
    .flatMap((r) => r.answers.filter((a) => a.questionId === question.id))
    .map((a) => a.value);

  const total = answers.length;

  if (total === 0) {
    return <p className="text-sm text-gray-400 italic">No answers yet</p>;
  }

  // choice-based types — bar chart
  if (
    question.type === "multiple_choice" ||
    question.type === "checkbox_group" ||
    question.type === "dropdown" ||
    question.type === "yes_no" ||
    question.type === "rating"
  ) {
    const counts: Record<string, number> = {};

    for (const val of answers) {
      const keys = Array.isArray(val) ? val : [String(val)];
      for (const k of keys) {
        counts[k] = (counts[k] ?? 0) + 1;
      }
    }

    // for rating, sort numerically; others preserve option order
    const options =
      question.type === "rating"
        ? ["1", "2", "3", "4", "5"]
        : question.type === "yes_no"
          ? ["Yes", "No"]
          : (question.options ?? Object.keys(counts));

    const data = options
      .filter((o) => counts[o] !== undefined)
      .map((o) => ({ label: o, count: counts[o] ?? 0 }));

    const respondents =
      question.type === "checkbox_group"
        ? responses.filter((r) =>
            r.answers.some(
              (a) =>
                a.questionId === question.id &&
                Array.isArray(a.value) &&
                a.value.length > 0,
            ),
          ).length
        : total;

    return <BarChart data={data} total={respondents} color={color} />;
  }

  // text types — show last few answers as a list
  const textAnswers = answers
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(-5)
    .reverse();

  return (
    <ul className="space-y-1">
      {textAnswers.map((text, i) => (
        <li
          key={i}
          className="text-sm text-gray-700 rounded-lg bg-gray-50 px-3 py-2 truncate"
        >
          {text}
        </li>
      ))}
      {total > 5 && (
        <li className="text-xs text-gray-400 pl-1">
          +{total - 5} more responses
        </li>
      )}
    </ul>
  );
};
// endregion

// region component
export const QuestionCharts = ({
  questions,
  responses,
}: QuestionChartsProps) => {
  if (questions.length === 0 || responses.length === 0) return null;

  return (
    <div className="app-panel">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Question breakdown
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {questions.map((question, idx) => (
          <div
            key={question.id}
            className="rounded-xl border border-gray-200 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500 mb-1">
              Q{idx + 1}
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-4">
              {question.title}
            </p>
            <QuestionChart
              question={question}
              responses={responses}
              color="#6366f1"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
// endregion
