/**
 * Home page constants
 */

export const HOME_HERO_TITLE = "Create Beautiful Surveys in Minutes";
export const HOME_HERO_DESCRIPTION =
  "Build, share, and analyze surveys without coding";

export const HOW_IT_WORKS_STEPS = [
  [
    "1",
    "Sign up",
    "Create a free account with your email and password in seconds.",
  ],
  [
    "2",
    "Build your survey",
    "Use the guided wizard to add questions, set details, and choose question types.",
  ],
  [
    "3",
    "Brand it",
    "Apply your logo and primary color so every survey feels on-brand.",
  ],
  [
    "4",
    "Publish & share",
    "Get a public link and send it anywhere — no login needed to respond.",
  ],
  [
    "5",
    "Collect responses",
    "Responses arrive in real-time as respondents submit the survey.",
  ],
  [
    "6",
    "Analyse results",
    "View all responses per survey in your dashboard and export as needed.",
  ],
] as const;

export const FEATURES = [
  {
    title: "Guided Survey Builder",
    description:
      "A 4-step wizard walks you through details, branding, questions, and publishing — no guesswork.",
    icon: "BuilderIcon",
  },
  {
    title: "7 Question Types",
    description:
      "Short text, long text, multiple choice, checkboxes, dropdown, rating, and yes/no — all supported out of the box.",
    icon: "HomeSurveyIcon",
  },
  {
    title: "Real-time Analytics",
    description:
      "Track responses as they come in. See completion rates, top surveys, and weekly activity at a glance.",
    icon: "AnalyticsIcon",
  },
  {
    title: "Custom Branding",
    description:
      "Set a primary color and logo URL per survey so every form matches your brand.",
    icon: "HomeSurveyIcon",
  },
  {
    title: "Instant Public Links",
    description:
      "Publish a survey and get a shareable URL instantly. Respondents need no account to submit.",
    icon: "BuilderIcon",
  },
  {
    title: "Smart Dashboard",
    description:
      "Search, filter by status and date, sort, and paginate your surveys — all server-side for speed.",
    icon: "AnalyticsIcon",
  },
] as const;

export const FAQ_SECTIONS = [
  {
    title: "General",
    items: [
      {
        question: "What is Survey Builder?",
        answer:
          "Survey Builder is a platform for creating and distributing surveys online. It helps you collect feedback, conduct research, and gather insights from your audience.",
      },
      {
        question: "Do I need technical skills?",
        answer:
          "No! Survey Builder is designed for everyone. Our intuitive drag-and-drop interface makes it easy to create professional surveys without any coding knowledge.",
      },
      {
        question: "How much does it cost?",
        answer:
          "Survey Builder offers flexible pricing plans. Check our pricing page for details on free and premium options.",
      },
    ],
  },
  {
    title: "Surveys",
    items: [
      {
        question: "How many questions can I add?",
        answer:
          "You can add unlimited questions to your surveys. There's no limit on the number of questions per survey.",
      },
      {
        question: "What question types are available?",
        answer:
          "We support multiple question types including short text, long text, multiple choice, checkboxes, dropdowns, ratings, and more.",
      },
      {
        question: "Can I preview my survey before sharing?",
        answer:
          "Yes! You can preview your survey at any time to see how it looks to respondents before publishing.",
      },
    ],
  },
  {
    title: "Response",
    items: [
      {
        question: "How do I collect responses?",
        answer:
          "Share your survey link via email, social media, or embed it on your website. Responses are collected automatically.",
      },
      {
        question: "Is there a limit on responses?",
        answer:
          "No limit! You can collect as many responses as you need with our platform.",
      },
      {
        question: "Can I export responses?",
        answer:
          "Yes! Export all your responses as CSV for further analysis in Excel or other tools.",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        question: "How do I reset my password?",
        answer:
          'Click "Forgot Password" on the login page and follow the instructions to reset your password.',
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes, you can delete your account from your account settings. This action cannot be undone.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes! We use industry-standard encryption and security measures to protect your data.",
      },
    ],
  },
] as const;

export const FAQ_TAB_ORDER = [
  "General",
  "Surveys",
  "Response",
  "Account",
] as const;

export const CTA_PRIMARY_TEXT = "Get Started";
export const CTA_SIGNIN_TEXT = "Sign In";
