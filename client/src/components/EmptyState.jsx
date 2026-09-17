export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-ink-line py-20 text-center">
      {Icon && (
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-ink-soft text-mist-dim">
          <Icon size={24} />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-mist">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-mist-dim">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
