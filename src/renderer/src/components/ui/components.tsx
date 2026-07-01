import React, { useState, useRef, useEffect, ReactNode } from "react";
import { Icon, IconName } from "./icons";

/**
 * JK3DA PDF Studio — core widget library.
 * Tailwind v3 only (uses the token color names from tailwind.tokens.js:
 * chrome-900..500, canvas, primary/primary-hover, ink/ink-muted, success,
 * warning, danger, highlight). No external UI deps. German UI strings.
 *
 * Density: control height 36px (h-control), icons 18px, radius 6/8px.
 * Focus: 1.5px primary ring.
 */

const ring = "focus-visible:outline-none focus-visible:ring focus-visible:ring-primary";

/* ─────────────────────────────  Button  ───────────────────────────── */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconEnd?: IconName;
  loading?: boolean;
}

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover disabled:bg-chrome-600 disabled:text-ink-muted",
  secondary:
    "bg-chrome-600 text-ink hover:bg-chrome-500 active:bg-chrome-500 border border-white/5 disabled:text-ink-muted",
  ghost:
    "bg-transparent text-ink hover:bg-chrome-600 active:bg-chrome-500 disabled:text-ink-muted",
  danger:
    "bg-danger text-white hover:brightness-110 active:brightness-95 disabled:bg-chrome-600 disabled:text-ink-muted",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "secondary",
  size = "md",
  icon,
  iconEnd,
  loading,
  children,
  className = "",
  disabled,
  ...rest
}) => (
  <button
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-control font-medium text-ui
      ${size === "sm" ? "h-8 px-2.5" : "h-control px-3.5"}
      ${BTN_VARIANT[variant]} ${ring} transition-colors disabled:cursor-not-allowed select-none ${className}`}
    {...rest}
  >
    {loading ? <Spinner size={16} /> : icon ? <Icon name={icon} size={16} /> : null}
    {children && <span className="truncate">{children}</span>}
    {iconEnd && <Icon name={iconEnd} size={16} />}
  </button>
);

/* ───────────────────────────  IconButton  ─────────────────────────── */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string; // German tooltip / aria-label
  active?: boolean;
  size?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  active,
  size = 18,
  className = "",
  ...rest
}) => (
  <Tooltip label={label}>
    <button
      aria-label={label}
      aria-pressed={active}
      className={`grid place-items-center h-control w-control rounded-control transition-colors ${ring}
        ${active ? "bg-primary/15 text-primary" : "text-ink hover:bg-chrome-600 active:bg-chrome-500"}
        disabled:text-ink-muted disabled:hover:bg-transparent disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      <Icon name={icon} size={size} />
    </button>
  </Tooltip>
);

/* ─────────────────────────  SegmentedControl  ─────────────────────── */
export interface Segment {
  value: string;
  label?: string;
  icon?: IconName;
}
export const SegmentedControl: React.FC<{
  segments: Segment[];
  value: string;
  onChange: (v: string) => void;
}> = ({ segments, value, onChange }) => (
  <div role="tablist" className="inline-flex p-0.5 gap-0.5 rounded-control bg-chrome-700 border border-white/5">
    {segments.map((s) => {
      const on = s.value === value;
      return (
        <button
          key={s.value}
          role="tab"
          aria-selected={on}
          title={s.label}
          onClick={() => onChange(s.value)}
          className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[4px] text-ui font-medium transition-colors ${ring}
            ${on ? "bg-chrome-500 text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
        >
          {s.icon && <Icon name={s.icon} size={16} />}
          {s.label}
        </button>
      );
    })}
  </div>
);

/* ──────────────────────────────  Tabs  ────────────────────────────── */
export const Tabs: React.FC<{
  tabs: { id: string; label: string; icon?: IconName }[];
  active: string;
  onChange: (id: string) => void;
}> = ({ tabs, active, onChange }) => (
  <div role="tablist" className="flex items-center gap-1 border-b border-chrome-600 px-1">
    {tabs.map((t) => {
      const on = t.id === active;
      return (
        <button
          key={t.id}
          role="tab"
          aria-selected={on}
          onClick={() => onChange(t.id)}
          className={`inline-flex items-center gap-2 px-3 h-9 text-ui font-medium -mb-px border-b-2 transition-colors ${ring}
            ${on ? "border-primary text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}
        >
          {t.icon && <Icon name={t.icon} size={16} />}
          {t.label}
        </button>
      );
    })}
  </div>
);

/* ─────────────────────────────  Inputs  ───────────────────────────── */
const inputBase =
  "h-control w-full rounded-control bg-chrome-700 border border-chrome-600 px-2.5 text-ui text-ink " +
  "placeholder:text-ink-muted hover:border-chrome-500 focus:border-primary " +
  "focus:outline-none focus:ring focus:ring-primary disabled:opacity-50 transition-colors";

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({
  label,
  className = "",
  ...rest
}) => (
  <label className="block">
    {label && <span className="mb-1 block text-ui-sm text-ink-muted">{label}</span>}
    <input type="text" className={`${inputBase} ${className}`} {...rest} />
  </label>
);

export const SearchInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = "",
  placeholder = "Suchen…",
  ...rest
}) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted">
      <Icon name="search" size={16} />
    </span>
    <input type="search" placeholder={placeholder} className={`${inputBase} pl-8 ${className}`} {...rest} />
  </div>
);

export const NumberInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}> = ({ value, onChange, min, max, step = 1, suffix }) => {
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  return (
    <div className="inline-flex items-center h-control rounded-control bg-chrome-700 border border-chrome-600 focus-within:border-primary focus-within:ring focus-within:ring-primary">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="w-14 bg-transparent px-2.5 text-ui text-ink text-right outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:hidden"
      />
      {suffix && <span className="text-ui-sm text-ink-muted pr-1.5">{suffix}</span>}
      <div className="flex flex-col border-l border-chrome-600">
        <button onClick={() => onChange(clamp(value + step))} className="px-1.5 flex-1 text-ink-muted hover:text-ink hover:bg-chrome-600 rounded-tr-control">
          <Icon name="prev-page" size={12} />
        </button>
        <button onClick={() => onChange(clamp(value - step))} className="px-1.5 flex-1 text-ink-muted hover:text-ink hover:bg-chrome-600 rounded-br-control">
          <Icon name="next-page" size={12} />
        </button>
      </div>
    </div>
  );
};

export const Select: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[]; label?: string }
> = ({ options, label, className = "", ...rest }) => (
  <label className="block">
    {label && <span className="mb-1 block text-ui-sm text-ink-muted">{label}</span>}
    <div className="relative">
      <select className={`${inputBase} appearance-none pr-8 ${className}`} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-chrome-700">
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted">
        <Icon name="field-dropdown" size={14} />
      </span>
    </div>
  </label>
);

/* ──────────────────────  Checkbox / Radio / Switch  ───────────────── */
export const Checkbox: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string; indeterminate?: boolean }> = ({
  checked,
  onChange,
  label,
}) => (
  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-ui text-ink">
    <span
      onClick={() => onChange(!checked)}
      className={`grid place-items-center h-[18px] w-[18px] rounded-[5px] border transition-colors
        ${checked ? "bg-primary border-primary text-white" : "bg-chrome-700 border-chrome-500 hover:border-chrome-400"}`}
    >
      {checked && <Icon name="page-checkbox" size={13} />}
    </span>
    {label}
  </label>
);

export const Radio: React.FC<{ checked: boolean; onChange: () => void; label?: string }> = ({ checked, onChange, label }) => (
  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-ui text-ink">
    <span
      onClick={onChange}
      className={`grid place-items-center h-[18px] w-[18px] rounded-full border transition-colors
        ${checked ? "border-primary" : "border-chrome-500 hover:border-chrome-400"}`}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
    </span>
    {label}
  </label>
);

export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string }> = ({ checked, onChange, label }) => (
  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none text-ui text-ink">
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition-colors ${ring} ${checked ? "bg-primary" : "bg-chrome-500"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
    </button>
    {label}
  </label>
);

/* ─────────────────────────────  Slider  ───────────────────────────── */
export const Slider: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 appearance-none rounded-full cursor-pointer bg-chrome-600
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow
        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary"
      style={{ background: `linear-gradient(to right, #3b82f6 ${pct}%, #363d48 ${pct}%)` }}
    />
  );
};

/* ─────────────────────────────  Badge  ────────────────────────────── */
type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger";
const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: "bg-chrome-600 text-ink",
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};
export const Badge: React.FC<{ tone?: BadgeTone; children: ReactNode }> = ({ tone = "neutral", children }) => (
  <span className={`inline-flex items-center h-5 px-2 rounded-full text-ui-sm font-medium ${BADGE_TONE[tone]}`}>{children}</span>
);

/* ──────────────────────────  ShortcutChip  ────────────────────────── */
export const ShortcutChip: React.FC<{ keys: string[] }> = ({ keys }) => (
  <span className="inline-flex items-center gap-1">
    {keys.map((k) => (
      <kbd key={k} className="min-w-[20px] h-5 px-1.5 grid place-items-center rounded bg-chrome-900 border border-chrome-600 text-[11px] font-medium text-ink-muted">
        {k}
      </kbd>
    ))}
  </span>
);

/* ───────────────────────────  DragHandle  ─────────────────────────── */
export const DragHandle: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = "", ...rest }) => (
  <span className={`cursor-grab active:cursor-grabbing text-ink-muted hover:text-ink ${className}`} {...rest}>
    <Icon name="drag-handle" size={16} />
  </span>
);

/* ─────────────────────────────  Spinner  ──────────────────────────── */
export const Spinner: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <span className="inline-block animate-spin text-current">
    <Icon name="spinner" size={size} />
  </span>
);

/* ────────────────────────────  Progress  ──────────────────────────── */
export const Progress: React.FC<{ value: number; label?: string }> = ({ value, label }) => (
  <div>
    {label && (
      <div className="mb-1 flex justify-between text-ui-sm text-ink-muted">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
    )}
    <div className="h-1.5 w-full rounded-full bg-chrome-600 overflow-hidden">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
    </div>
  </div>
);

/* ───────────────────────────  EmptyState  ─────────────────────────── */
export const EmptyState: React.FC<{ icon?: IconName; title: string; hint?: string; action?: ReactNode }> = ({
  icon = "open",
  title,
  hint,
  action,
}) => (
  <div className="flex flex-col items-center justify-center text-center gap-2 p-8 text-ink-muted">
    <span className="grid place-items-center h-12 w-12 rounded-full bg-chrome-700">
      <Icon name={icon} size={24} />
    </span>
    <p className="text-ui-lg font-medium text-ink">{title}</p>
    {hint && <p className="text-ui max-w-[34ch]">{hint}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

/* ────────────────────────────  Tooltip  ───────────────────────────── */
export const Tooltip: React.FC<{ label: string; children: ReactNode }> = ({ label, children }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      {children}
      {show && (
        <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-control bg-chrome-900 px-2 py-1 text-ui-sm text-ink shadow-menu border border-chrome-600">
          {label}
        </span>
      )}
    </span>
  );
};

/* ──────────────────────  Dropdown / Context menu  ─────────────────── */
export interface MenuItem {
  id: string;
  label: string;
  icon?: IconName;
  shortcut?: string[];
  danger?: boolean;
  divider?: boolean;
  disabled?: boolean;
}
export const Menu: React.FC<{ items: MenuItem[]; onSelect: (id: string) => void; className?: string }> = ({
  items,
  onSelect,
  className = "",
}) => (
  <div className={`min-w-[200px] rounded-panel bg-chrome-700 border border-chrome-600 shadow-menu py-1 ${className}`}>
    {items.map((it, i) =>
      it.divider ? (
        <div key={`d${i}`} className="my-1 h-px bg-chrome-600" />
      ) : (
        <button
          key={it.id}
          disabled={it.disabled}
          onClick={() => onSelect(it.id)}
          className={`flex w-full items-center gap-2.5 px-2.5 h-8 text-ui text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed
            ${it.danger ? "text-danger hover:bg-danger/10" : "text-ink hover:bg-chrome-600"}`}
        >
          {it.icon && <Icon name={it.icon} size={16} />}
          <span className="flex-1 truncate">{it.label}</span>
          {it.shortcut && <ShortcutChip keys={it.shortcut} />}
        </button>
      )
    )}
  </div>
);

export const Dropdown: React.FC<{ trigger: ReactNode; items: MenuItem[]; onSelect: (id: string) => void; align?: "left" | "right" }> = ({
  trigger,
  items,
  onSelect,
  align = "left",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative inline-flex">
      <span onClick={() => setOpen((o) => !o)}>{trigger}</span>
      {open && (
        <div className={`absolute top-full z-50 mt-1 ${align === "right" ? "right-0" : "left-0"}`}>
          <Menu
            items={items}
            onSelect={(id) => {
              onSelect(id);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────  Modal  ────────────────────────────── */
export const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }> = ({
  open,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4" onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-panel bg-chrome-800 border border-chrome-600 shadow-menu"
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-chrome-600">
          <h2 className="text-ui-lg font-semibold text-ink">{title}</h2>
          <IconButton icon="close" label="Schließen" onClick={onClose} size={16} />
        </div>
        <div className="p-4 text-ui text-ink">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-4 py-3 border-t border-chrome-600">{footer}</div>}
      </div>
    </div>
  );
};

/* ─────────────────────────────  Toast  ────────────────────────────── */
type ToastTone = "info" | "success" | "warning" | "danger";
const TOAST_ICON: Record<ToastTone, IconName> = {
  info: "about",
  success: "permissions",
  warning: "error-banner",
  danger: "confirm-destructive",
};
const TOAST_ACCENT: Record<ToastTone, string> = {
  info: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};
export const Toast: React.FC<{ tone?: ToastTone; title: string; message?: string; onClose?: () => void }> = ({
  tone = "info",
  title,
  message,
  onClose,
}) => (
  <div className="flex items-start gap-3 w-80 rounded-panel bg-chrome-700 border border-chrome-600 shadow-menu p-3">
    <span className={`mt-0.5 ${TOAST_ACCENT[tone]}`}>
      <Icon name={TOAST_ICON[tone]} size={18} />
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-ui font-medium text-ink">{title}</p>
      {message && <p className="text-ui-sm text-ink-muted mt-0.5">{message}</p>}
    </div>
    {onClose && <IconButton icon="close" label="Schließen" onClick={onClose} size={14} />}
  </div>
);

/* ──────────────────  ColorSwatch / ColorPicker popover  ───────────── */
export const ColorSwatch: React.FC<{ color: string; active?: boolean; onClick?: () => void; title?: string }> = ({
  color,
  active,
  onClick,
  title,
}) => (
  <button
    title={title}
    onClick={onClick}
    className={`h-6 w-6 rounded-[5px] border transition-transform hover:scale-110 ${active ? "ring ring-primary border-white/20" : "border-black/30"}`}
    style={{ background: color }}
  />
);

const PALETTE = ["#e11d2a", "#f59e0b", "#ffd400", "#15a34a", "#3b82f6", "#7c3aed", "#1b1f24", "#ffffff"];
export const ColorPicker: React.FC<{ value: string; onChange: (c: string) => void; swatches?: string[] }> = ({
  value,
  onChange,
  swatches = PALETTE,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 h-control px-2 rounded-control bg-chrome-700 border border-chrome-600 hover:border-chrome-500 ${ring}`}
      >
        <span className="h-5 w-5 rounded-[4px] border border-black/30" style={{ background: value }} />
        <Icon name="field-dropdown" size={14} />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 p-2.5 rounded-panel bg-chrome-700 border border-chrome-600 shadow-menu">
          <div className="grid grid-cols-4 gap-2">
            {swatches.map((c) => (
              <ColorSwatch
                key={c}
                color={c}
                active={c.toLowerCase() === value.toLowerCase()}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
              />
            ))}
          </div>
          <label className="mt-2.5 flex items-center gap-2 text-ui-sm text-ink-muted">
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-6 w-6 rounded bg-transparent cursor-pointer" />
            Eigene Farbe…
          </label>
        </div>
      )}
    </div>
  );
};

/* ───────────────────────  Toolbar / StatusBar / Panel  ────────────── */
export const Toolbar: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`flex items-center gap-1 h-toolbar px-2 bg-chrome-800 shadow-toolbar ${className}`}>{children}</div>
);

export const ToolbarDivider: React.FC = () => <div className="mx-1 h-6 w-px bg-chrome-600" />;

export const Panel: React.FC<{ title?: string; children: ReactNode; actions?: ReactNode; className?: string }> = ({
  title,
  children,
  actions,
  className = "",
}) => (
  <section className={`flex flex-col bg-chrome-800 ${className}`}>
    {title && (
      <header className="flex items-center justify-between h-9 px-3 border-b border-chrome-600">
        <h3 className="text-ui-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
        {actions}
      </header>
    )}
    <div className="flex-1 overflow-auto">{children}</div>
  </section>
);

export const StatusBar: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-3 h-7 px-3 bg-chrome-900 border-t border-chrome-600 text-ui-sm text-ink-muted">
    {children}
  </div>
);

/* ─────────────────────────  ErrorBanner  ──────────────────────────── */
export const ErrorBanner: React.FC<{ message: string; onRetry?: () => void; onDismiss?: () => void }> = ({
  message,
  onRetry,
  onDismiss,
}) => (
  <div className="flex items-center gap-3 px-3 h-10 bg-danger/12 border border-danger/30 rounded-control text-ui text-ink">
    <span className="text-danger">
      <Icon name="error-banner" size={18} />
    </span>
    <span className="flex-1">{message}</span>
    {onRetry && (
      <Button variant="ghost" size="sm" onClick={onRetry}>
        Erneut versuchen
      </Button>
    )}
    {onDismiss && <IconButton icon="close" label="Schließen" onClick={onDismiss} size={14} />}
  </div>
);
