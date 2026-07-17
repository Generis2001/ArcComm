'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users2 } from 'lucide-react';

export default function NewCommunityPage() {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    description: '',
    entryFeeUsdc: '1',
    revenueSplitPct: 50,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/studio/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          entryFeeUsdc: form.entryFeeUsdc,
          revenueSplitPct: form.revenueSplitPct,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create community');
      queryClient.invalidateQueries({ queryKey: ['studio-communities'] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      router.push('/app/studio/communities');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  }

  const memberSplit = 100 - form.revenueSplitPct;

  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-cohora-500/10 p-2.5">
              <Users2 className="h-5 w-5 text-cohora-400" />
            </div>
            <CardTitle>Create Community</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Set up a subscriber-only community. Members pay a one-time entry fee and share in revenue distributions every 7 days.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Community Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Inner Circle"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Description <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What will members get access to?"
                rows={3}
                maxLength={500}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Entry Fee (USDC)</label>
              <Input
                type="number"
                value={form.entryFeeUsdc}
                onChange={(e) => setForm({ ...form, entryFeeUsdc: e.target.value })}
                placeholder="1.00"
                min="0"
                step="0.01"
                required
              />
              <p className="text-xs text-muted-foreground">One-time fee to join. Set to 0 for free communities.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Revenue Split</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.revenueSplitPct}
                  onChange={(e) => setForm({ ...form, revenueSplitPct: Number(e.target.value) })}
                  className="flex-1 accent-cohora-500"
                />
                <span className="text-sm font-mono w-12 text-right">{form.revenueSplitPct}%</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
                <span>You receive: <strong className="text-foreground">{form.revenueSplitPct}%</strong></span>
                <span>Members share: <strong className="text-foreground">{memberSplit}%</strong></span>
              </div>
              <p className="text-xs text-muted-foreground">
                Every 7 days, accumulated entry fees are distributed according to this split.
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive rounded-md bg-destructive/[0.10] px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" variant="cohora" className="flex-1" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Community
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
