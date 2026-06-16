/**
 * Home page constants
 */

export const HOME_HERO_TITLE = 'Create Beautiful Surveys in Minutes'
export const HOME_HERO_DESCRIPTION = 'Build, share, and analyze surveys without coding'

export const HOW_IT_WORKS_STEPS = [
  ['1', 'Create survey', 'Add questions and customize the look.'],
  ['2', 'Share public link', 'Send the survey anywhere respondents already are.'],
  ['3', 'Collect responses', 'Responses come in real-time with live analytics.'],
  ['4', 'Export & analyze', 'Download responses as CSV or view detailed reports.'],
] as const

export const FEATURES = [
  {
    title: 'Drag & Build',
    description: 'Intuitive drag-and-drop interface to create surveys effortlessly.',
    icon: 'BuilderIcon',
  },
  {
    title: 'Real-time Analytics',
    description: 'Get instant insights with live response tracking and analytics.',
    icon: 'AnalyticsIcon',
  },
  {
    title: 'Custom Branding',
    description: 'Add your logo and brand colors to personalize surveys.',
    icon: 'HomeSurveyIcon',
  },
] as const

export const FAQ_SECTIONS = [
  {
    title: 'General',
    items: [
      {
        question: 'What is Survey Builder?',
        answer:
          'Survey Builder is a platform for creating and distributing surveys online. It helps you collect feedback, conduct research, and gather insights from your audience.',
      },
      {
        question: 'Do I need technical skills?',
        answer:
          'No! Survey Builder is designed for everyone. Our intuitive drag-and-drop interface makes it easy to create professional surveys without any coding knowledge.',
      },
      {
        question: 'How much does it cost?',
        answer:
          'Survey Builder offers flexible pricing plans. Check our pricing page for details on free and premium options.',
      },
    ],
  },
  {
    title: 'Surveys',
    items: [
      {
        question: 'How many questions can I add?',
        answer:
          "You can add unlimited questions to your surveys. There's no limit on the number of questions per survey.",
      },
      {
        question: 'What question types are available?',
        answer:
          'We support multiple question types including short text, long text, multiple choice, checkboxes, dropdowns, ratings, and more.',
      },
      {
        question: 'Can I preview my survey before sharing?',
        answer:
          'Yes! You can preview your survey at any time to see how it looks to respondents before publishing.',
      },
    ],
  },
  {
    title: 'Response',
    items: [
      {
        question: 'How do I collect responses?',
        answer:
          'Share your survey link via email, social media, or embed it on your website. Responses are collected automatically.',
      },
      {
        question: 'Is there a limit on responses?',
        answer: 'No limit! You can collect as many responses as you need with our platform.',
      },
      {
        question: 'Can I export responses?',
        answer:
          'Yes! Export all your responses as CSV for further analysis in Excel or other tools.',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        question: 'How do I reset my password?',
        answer:
          'Click "Forgot Password" on the login page and follow the instructions to reset your password.',
      },
      {
        question: 'Can I delete my account?',
        answer:
          'Yes, you can delete your account from your account settings. This action cannot be undone.',
      },
      {
        question: 'Is my data secure?',
        answer:
          'Yes! We use industry-standard encryption and security measures to protect your data.',
      },
    ],
  },
] as const

export const FAQ_TAB_ORDER = ['General', 'Surveys', 'Response', 'Account'] as const

export const CTA_PRIMARY_TEXT = 'Get Started'
export const CTA_SIGNIN_TEXT = 'Sign In'
