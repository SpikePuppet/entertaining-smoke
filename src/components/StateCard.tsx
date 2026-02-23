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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
      <h2 className="text-base font-semibold text-white mb-2">{title}</h2>
      <p className="text-zinc-500 text-sm mb-5">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm px-4 py-2 rounded-md bg-zinc-800 text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
        >
          {actionLabel}
        </button>
      )}

      {actionLabel && !onAction && actionHref && (
        <Link
          href={actionHref}
          className="text-sm px-4 py-2 rounded-md bg-zinc-800 text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
