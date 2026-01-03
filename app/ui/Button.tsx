import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "ghost";

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
};

type NativeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export type ButtonProps = AnchorProps | NativeButtonProps;

export function Button(props: ButtonProps) {
  const { variant = "primary", className } = props;
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    ghost: "bg-transparent text-foreground hover:bg-surface",
  };

  const classes = [base, variants[variant], className]
    .filter(Boolean)
    .join(" ");

  if ("href" in props) {
    const { variant: _variant, className: _className, ...anchorProps } = props;
    return <a className={classes} {...anchorProps} />;
  }

  const { variant: _variant, className: _className, ...buttonProps } = props;
  return <button className={classes} {...buttonProps} />;
}
