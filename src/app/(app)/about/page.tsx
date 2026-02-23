import Breadcrumb from "@/components/Breadcrumb";

export default function AboutPage() {
  return (
    <div className="max-w-xl">
      <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "About" }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-fg mb-1">About</h1>
        <p className="text-fg-muted text-sm">
          Ground Karate is a BJJ training journal for tracking sessions,
          techniques, and belt promotions.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <div>
          <p className="text-xs text-fg-muted uppercase tracking-wider mb-1">
            Developer
          </p>
          <p className="text-sm text-fg font-medium">Rhys Johns</p>
        </div>

        <div>
          <p className="text-xs text-fg-muted uppercase tracking-wider mb-1">
            Website
          </p>
          <a
            href="https://spikepuppet.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-fg-secondary hover:text-fg transition-colors"
          >
            spikepuppet.io
          </a>
        </div>

        <div>
          <p className="text-xs text-fg-muted uppercase tracking-wider mb-1">
            GitHub
          </p>
          <a
            href="https://github.com/SpikePuppet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-fg-secondary hover:text-fg transition-colors"
          >
            SpikePuppet
          </a>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-fg-dim">
            &copy; 2026 Rhys Johns. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
