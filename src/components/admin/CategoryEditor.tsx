import type { FormEvent } from 'react';
import type { AdminCategory, CategoryInput } from '../../types/admin-catalog';

interface CategoryEditorProps {
  readonly category: AdminCategory | null;
  readonly busy: boolean;
  readonly onSave: (category: CategoryInput) => void;
  readonly onCancel: () => void;
}

export function CategoryEditor({
  category,
  busy,
  onSave,
  onCancel,
}: CategoryEditorProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    onSave({
      name: String(fields.get('name') ?? ''),
      description: String(fields.get('description') ?? ''),
    });
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-line bg-paper p-4 sm:p-6"
      aria-labelledby="category-form-title"
    >
      <h2 id="category-form-title" className="font-display text-2xl">
        {category ? 'Editar categoria' : 'Nova categoria'}
      </h2>
      <fieldset disabled={busy} className="mt-4 grid gap-4">
        <label className="grid gap-1 text-sm font-medium">
          Nome da categoria
          <input
            className="rounded-md border border-line bg-paper p-2"
            name="name"
            defaultValue={category?.name}
            required
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Descrição da categoria (opcional)
          <textarea
            className="rounded-md border border-line bg-paper p-2"
            name="description"
            defaultValue={category?.description}
            rows={2}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="button-secondary">
            {busy ? 'Salvando…' : 'Salvar categoria'}
          </button>
          <button type="button" className="button-secondary" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </fieldset>
    </form>
  );
}
