import Link from "next/link";

type StateCardProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export default function StateCard({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: StateCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-8 text-center">
      <h2 className="text-base font-semibold text-fg mb-2">{title}</h2>
      <p className="text-fg-muted text-sm mb-5">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm px-4 py-2 rounded-md bg-active text-fg hover:bg-hover transition-colors border border-border-strong"
        >
          {actionLabel}
        </button>
      )}

      {actionLabel && !onAction && actionHref && (
        <Link
          href={actionHref}
          className="text-sm px-4 py-2 rounded-md bg-active text-fg hover:bg-hover transition-colors border border-border-strong"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
