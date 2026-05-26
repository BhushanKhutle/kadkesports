'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
  initial?: any;
  roleId?: string;
}

export function RoleForm({ initial, roleId }: Props) {
  const router = useRouter();
  const isEdit = !!roleId;
  const isSystem = initial?.isSystem ?? false;
  const isAdmin = initial?.name === 'ADMIN';

  const [saving, setSaving] = useState(false);
  const [allPerms, setAllPerms] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    permissions: initial?.permissions ?? [],
    isActive: initial?.isActive ?? true,
  });

  useEffect(() => {
    api.get('/roles/permissions').then(({ data }) => setAllPerms(Array.isArray(data) ? data : []));
  }, []);

  function toggle(p: string) {
    setForm((prev: any) => ({
      ...prev,
      permissions: prev.permissions.includes(p)
        ? prev.permissions.filter((x: string) => x !== p)
        : [...prev.permissions, p],
    }));
  }

  function toggleGroup(prefix: string, on: boolean) {
    const groupPerms = allPerms.filter(p => p.startsWith(prefix + '.'));
    setForm((prev: any) => ({
      ...prev,
      permissions: on
        ? [...new Set([...prev.permissions, ...groupPerms])]
        : prev.permissions.filter((p: string) => !groupPerms.includes(p)),
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim().toUpperCase(),
        description: form.description.trim(),
        permissions: form.permissions,
        isActive: form.isActive,
      };
      if (isEdit) await api.patch(`/roles/${roleId}`, payload);
      else await api.post('/roles', payload);
      toast.success(isEdit ? 'Role updated' : 'Role created');
      router.push('/admin/roles');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const groups: Record<string, string[]> = {};
  for (const p of allPerms) {
    const [g] = p.split('.');
    if (!groups[g]) groups[g] = [];
    groups[g].push(p);
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-3xl">
      {isAdmin && (
        <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm">
          ⚠️ ADMIN role is protected. Permissions and name cannot be changed.
        </div>
      )}

      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold">Basic info</h2>
        <div>
          <label className="text-xs tracking-widest text-ink-500">NAME *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value.toUpperCase()})}
            className="input mt-1 font-mono uppercase"
            placeholder="e.g. ACCOUNTANT"
            disabled={isAdmin || (isSystem && isEdit)}
          />
        </div>
        <div>
          <label className="text-xs tracking-widest text-ink-500">DESCRIPTION</label>
          <input
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            className="input mt-1"
            placeholder="What this role can do..."
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} disabled={isAdmin} />
          <span className="text-sm">Active</span>
        </label>
      </section>

      <section className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Permissions ({form.permissions.length} / {allPerms.length})</h2>
          {!isAdmin && (
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => setForm({...form, permissions: allPerms})} className="text-accent hover:underline">Select all</button>
              <span className="text-ink-300">·</span>
              <button type="button" onClick={() => setForm({...form, permissions: []})} className="text-accent hover:underline">Clear all</button>
            </div>
          )}
        </div>

        {Object.entries(groups).map(([groupName, groupPerms]) => {
          const selectedInGroup = groupPerms.filter(p => form.permissions.includes(p));
          const allSelected = selectedInGroup.length === groupPerms.length;
          return (
            <div key={groupName} className="space-y-2">
              <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-2">
                <h3 className="font-bold uppercase tracking-widest text-sm">{groupName}</h3>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleGroup(groupName, e.target.checked)}
                    disabled={isAdmin}
                  />
                  <span className="text-ink-500">{selectedInGroup.length}/{groupPerms.length}</span>
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {groupPerms.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-900 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(p)}
                      onChange={() => toggle(p)}
                      disabled={isAdmin}
                    />
                    <code className="text-xs">{p.split('.')[1]}</code>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <div className="flex gap-3 pb-10">
        <button type="submit" disabled={saving || isAdmin} className="btn-primary">
          {saving ? 'Saving...' : isEdit ? 'Update role' : 'Create role'}
        </button>
        <button type="button" onClick={() => router.push('/admin/roles')} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}
