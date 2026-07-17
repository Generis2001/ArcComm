'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Download, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import type { CommunityPost } from '@/hooks/useCommunity';

interface PostCardProps {
  post: CommunityPost;
  communityId: string;
  canInteract: boolean;
}

export function PostCard({ post, communityId, canInteract }: PostCardProps) {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{ id: string; body: string; author: { username: string | null; avatarUrl: string | null }; createdAt: string }[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function toggleLike() {
    if (!canInteract) return;
    const token = await getAccessToken();
    const prev = liked;
    setLiked(!liked);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      await fetch(`/api/communities/${communityId}/posts/${post.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setLiked(prev);
      setLikeCount((c) => c + (liked ? 1 : -1));
    }
  }

  async function loadComments() {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/communities/${communityId}/posts/${post.id}/comments`);
      if (res.ok) setComments(await res.json());
    } finally {
      setLoadingComments(false);
    }
  }

  async function toggleComments() {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) await loadComments();
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !canInteract) return;
    setSubmitting(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/communities/${communityId}/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body: commentText }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setCommentText('');
        queryClient.invalidateQueries({ queryKey: ['community-posts', communityId] });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        {post.creator.user.avatarUrl ? (
          <Image src={post.creator.user.avatarUrl} alt="" width={32} height={32} className="rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-cohora-500/20 flex items-center justify-center text-xs font-bold text-cohora-400">
            {post.creator.displayName[0]}
          </div>
        )}
        <div>
          <p className="text-sm font-medium">{post.creator.displayName}</p>
          <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <p className="text-sm whitespace-pre-wrap">{post.body}</p>

      {post.mediaUrl && post.mediaType === 'image' && (
        <div className="relative rounded-lg overflow-hidden aspect-video bg-muted">
          <Image src={post.mediaUrl} alt="Post media" fill className="object-cover" />
        </div>
      )}

      {post.mediaUrl && post.mediaType === 'file' && (
        <a
          href={post.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-cohora-400 hover:underline"
        >
          <Download className="h-4 w-4" />
          Download attachment
        </a>
      )}

      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={toggleLike}
          disabled={!canInteract}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-rose-400 transition-colors disabled:opacity-50"
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-rose-400 text-rose-400' : ''}`} />
          {likeCount}
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-cohora-400 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {post.commentCount}
          {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {showComments && (
        <div className="space-y-2 pt-1 border-t border-border">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 text-sm">
              <span className="font-medium shrink-0">{c.author.username ?? 'User'}</span>
              <span className="text-muted-foreground">{c.body}</span>
            </div>
          ))}
          {loadingComments && <p className="text-xs text-muted-foreground">Loading...</p>}
          {canInteract && (
            <form onSubmit={submitComment} className="flex gap-2 pt-1">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button type="submit" size="sm" variant="cohora" disabled={submitting || !commentText.trim()}>
                Post
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
