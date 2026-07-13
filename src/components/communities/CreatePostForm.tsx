'use client';

import { useState, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { upload } from '@vercel/blob/client';
import { Button } from '@/components/ui/button';
import { Loader2, Paperclip, X } from 'lucide-react';

interface CreatePostFormProps {
  communityId: string;
}

export function CreatePostForm({ communityId }: CreatePostFormProps) {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const token = await getAccessToken();
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'file' | undefined;

      if (mediaFile) {
        setUploading(true);
        const blob = await upload(mediaFile.name, mediaFile, {
          access: 'public',
          handleUploadUrl: '/api/upload/media',
          multipart: true,
          clientPayload: token ?? '',
        });
        mediaUrl = blob.url;
        mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'file';
        setUploading(false);
      }

      const res = await fetch(`/api/communities/${communityId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body, mediaUrl, mediaType }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg ?? 'Failed to post');
      }

      setBody('');
      setMediaFile(null);
      queryClient.invalidateQueries({ queryKey: ['community-posts', communityId] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-medium">New Post</p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share something with your community..."
        rows={3}
        maxLength={5000}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
      />

      {mediaFile && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Paperclip className="h-4 w-4 shrink-0" />
          <span className="truncate">{mediaFile.name}</span>
          <button type="button" onClick={() => setMediaFile(null)} className="ml-auto shrink-0">
            <X className="h-4 w-4 hover:text-destructive" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive rounded-md bg-destructive/[0.10] px-3 py-2">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-sm text-muted-foreground hover:text-arc-400 flex items-center gap-1.5 transition-colors"
        >
          <Paperclip className="h-4 w-4" />
          Attach
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.zip,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
        />
        <Button type="submit" variant="arc" size="sm" disabled={submitting || uploading || !body.trim()}>
          {(submitting || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {uploading ? 'Uploading...' : submitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  );
}
