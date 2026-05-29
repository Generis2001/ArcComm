'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Clapperboard, Camera, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function CreatorSetup() {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const [form, setForm] = useState({ handle: '', displayName: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const token = await getAccessToken();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setAvatarUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create profile');
      setSuccess(true);
      setTimeout(() => router.refresh(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full bg-arc-500/10 p-4">
              <Clapperboard className="h-8 w-8 text-arc-400" />
            </div>
          </div>
          <CardTitle>Set Up Your Creator Profile</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create your public profile to start publishing content and earning.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar picker */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="relative group h-20 w-20 rounded-full overflow-hidden border-2 border-dashed border-input hover:border-arc-400 transition-colors bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <Camera className="h-5 w-5 text-muted-foreground group-hover:text-arc-400 transition-colors" />
                    )}
                  </div>
                )}
                {avatarUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                )}
              </button>
              <p className="text-xs text-muted-foreground">Profile picture (optional, max 5 MB)</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Handle</label>
              <div className="flex items-center rounded-md border border-input bg-background px-3 focus-within:ring-1 focus-within:ring-ring">
                <span className="text-muted-foreground text-sm">@</span>
                <input
                  value={form.handle}
                  onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  placeholder="yourhandle"
                  required
                  minLength={3}
                  maxLength={32}
                  className="flex-1 bg-transparent py-2 pl-1 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">Letters, numbers, _ and - only. Min 3 characters.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Display Name</label>
              <Input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Your Name"
                required
                maxLength={80}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Bio <span className="text-muted-foreground">(optional)</span></label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell people about yourself..."
                rows={3}
                maxLength={500}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
            )}

            {success && (
              <p className="text-sm text-green-400 rounded-md bg-green-500/10 px-3 py-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Profile created successfully! Redirecting...
              </p>
            )}

            <Button type="submit" variant="arc" className="w-full" disabled={saving || uploading || success}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {success ? 'Profile Created!' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
