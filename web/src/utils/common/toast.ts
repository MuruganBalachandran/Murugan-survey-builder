// region types
export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;
}

type ToastOptions = {
  description?: string;
  duration?: number;
};

type ToastListener = (messages: ToastMessage[]) => void;
// endregion

// region internal state
let messages: ToastMessage[] = [];
const listeners = new Set<ToastListener>();
// endregion

// region helpers
const notify = () => {
  listeners.forEach((listener) => listener(messages));
};

const remove = (id: string) => {
  messages = messages.filter((message) => message.id !== id);
  notify();
};

const show = (
  variant: ToastVariant,
  title: string,
  options: ToastOptions = {},
) => {
  const message: ToastMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    variant,
    title,
    description: options.description,
    duration: options.duration ?? 4000,
  };
  messages = [...messages, message].slice(-5);
  notify();
  return message.id;
};
// endregion

// region toast api
export const toast = {
  success: (title: string, options?: ToastOptions) =>
    show("success", title, options),
  error: (title: string, options?: ToastOptions) =>
    show("error", title, options),
  warning: (title: string, options?: ToastOptions) =>
    show("warning", title, options),
  info: (title: string, options?: ToastOptions) => show("info", title, options),
  dismiss: remove,
};
// endregion

// region subscriptions
export const subscribeToToasts = (listener: ToastListener) => {
  listeners.add(listener);
  listener(messages);
  return () => {
    listeners.delete(listener);
  };
};
// endregion
