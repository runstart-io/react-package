import * as React from "react";

/**
 * Hook simple para contar.
 */
export function useCounter(initialValue = 0) {
  const [count, setCount] = React.useState(initialValue);

  const increment = React.useCallback(() => setCount((c) => c + 1), []);
  const decrement = React.useCallback(() => setCount((c) => c - 1), []);
  const reset = React.useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}

/**
 * Función utilitaria de ejemplo.
 */
export function greet(name: string): string {
  return `Hola, ${name}! 👋`;
}

/**
 * Constante exportada para verificar imports.
 */
export const VERSION = "1.0.0";

/**
 * Componente React escrito sin JSX (válido en .ts)
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function Button(props: ButtonProps) {
  return React.createElement(
    "button",
    {
      ...props,
      style: {
        backgroundColor: "#008F8E",
        color: "white",
        padding: "8px 16px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        ...(props.style || {}),
      },
    },
    props.label
  );
}

// Export default opcional
export default {
  useCounter,
  greet,
  VERSION,
  Button,
};
