'use client';

import { useState, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { upload } from '@vercel/blob/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Clapperboard, Camera } from 'lucide-react';
import Image from 'next/image';

export function CreatorSetup() {
  const { getAccessToken } = usePrivy();
  const [form, setForm] = useState({ handle: '', displayName: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
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
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/avatar',
        clientPayload: token ?? '',
      });
      setAvatarUrl(blob.url);
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
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const creator = await res.json();
      if (!res.ok) throw new Error(creator.error ?? 'Failed to create profile');

      if (avatarUrl) {
        const avatarRes = await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ avatarUrl }),
        });
        const avatarData = await avatarRes.json();
        if (!avatarRes.ok) throw new Error(avatarData.error ?? 'Failed to save profile picture');
      }

      window.location.assign('/app');
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cohora-shell flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md border-white/[0.10] bg-black/[0.72]">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full border border-white/[0.10] bg-white/[0.05] p-4">
              <Clapperboard className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle>Create your Cohora profile</CardTitle>
          <p className="text-sm text-white/[0.58]">
            Complete this profile before entering Cohora. It is used for your public creator page,
            content, products, and communities.
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
                className="relative group h-20 w-20 rounded-full overflow-hidden border-2 border-dashed border-white/[0.16] bg-white/[0.03] transition-colors hover:border-white/[0.48] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white/[0.56]" />
                    ) : (
                      <Camera className="h-5 w-5 text-white/[0.48] transition-colors group-hover:text-white" />
                    )}
                  </div>
                )}
                {avatarUrl && (
                  <div className="absolute inset-0 bg-black/[0.40] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                )}
              </button>
              <p className="text-xs text-white/[0.48]">Profile picture (optional, max 5 MB)</p>
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
              <div className="flex items-center rounded-md border border-white/[0.12] bg-black/[0.45] px-3 focus-within:ring-1 focus-within:ring-ring">
                <span className="text-sm text-white/[0.48]">@</span>
                <input
                  value={form.handle}
                  onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  placeholder="yourhandle"
                  required
                  minLength={3}
                  maxLength={32}
                  className="flex-1 bg-transparent py-2 pl-1 text-sm outline-none placeholder:text-white/[0.34]"
                />
              </div>
              <p className="text-xs text-white/[0.48]">Letters, numbers, _ and - only. Min 3 characters.</p>
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
              <label className="text-sm font-medium">Bio <span className="text-white/[0.48]">(optional)</span></label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell people about yourself..."
                rows={3}
                maxLength={500}
                className="w-full resize-none rounded-md border border-white/[0.12] bg-black/[0.45] px-3 py-2 text-sm placeholder:text-white/[0.34] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive rounded-md bg-destructive/[0.10] px-3 py-2">{error}</p>
            )}

            <Button type="submit" variant="cohora" className="w-full" disabled={saving || uploading}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
