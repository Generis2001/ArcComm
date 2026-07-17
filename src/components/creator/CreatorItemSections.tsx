'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BuyButton } from '@/components/payments/BuyButton';
import { ItemMenu } from '@/components/ui/ItemMenu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, FileText, ShoppingBag } from 'lucide-react';
import { formatUsdc } from '@/lib/payments/usdc';
import type { ContentItem, ProductItem } from '@/types/creator';

// ── helpers ───────────────────────────────────────────────────────────────────
function useIsOwner(creatorHandle: string) {
  const { user, ready } = usePrivy();
  const { getAccessToken } = usePrivy();

  const { data: me } = useQuery({
    queryKey: ['me'],
    enabled: ready && !!user,
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
  });

  return me?.creator?.handle === creatorHandle;
}

// ── Content cards (purchasable + free) ────────────────────────────────────────
interface ContentSectionProps {
  creatorId: string;
  creatorHandle: string;
  purchasableContent: ContentItem[];
  freeContent: ContentItem[];
}

export function CreatorContentSection({
  creatorId,
  creatorHandle,
  purchasableContent,
  freeContent,
}: ContentSectionProps) {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const isOwner = useIsOwner(creatorHandle);

  // edit state
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  function openEdit(item: ContentItem) {
    setEditItem(item);
    setEditForm({ title: item.title, description: item.description ?? '' });
    setEditError('');
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    setEditSaving(true);
    setEditError('');
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/studio/content/${editItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editForm.title, description: editForm.description }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to save');
      // Invalidate the creator page data so it reflects the update
      queryClient.invalidateQueries({ queryKey: ['studio-content'] });
      setEditItem(null);
      // Refresh the page to show the updated title
      window.location.reload();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setEditSaving(false);
    }
  }

  async function deleteContent(id: string) {
    const token = await getAccessToken();
    await fetch(`/api/studio/content/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  }

  const allContent = [...purchasableContent, ...freeContent];
  if (allContent.length === 0) return null;

  return (
    <>
      {/* Purchasable */}
      {purchasableContent.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Content</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {purchasableContent.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                      {isOwner && (
                        <ItemMenu
                          onEdit={() => openEdit(item)}
                          onDelete={() => deleteContent(item.id)}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {item.salesCount} {item.salesCount === 1 ? 'sale' : 'sales'}
                    </p>
                    <BuyButton
                      creatorId={creatorId}
                      contentId={item.id}
                      priceUsdc={BigInt(item.priceUsdc!)}
                      label={item.title}
                      type="CONTENT_PURCHASE"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Free */}
      {freeContent.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Free Content</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {freeContent.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-xs">Free</Badge>
                      {isOwner && (
                        <ItemMenu
                          onEdit={() => openEdit(item)}
                          onDelete={() => deleteContent(item.id)}
                        />
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{item.views} views</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(v) => { if (!v) setEditItem(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit content</DialogTitle></DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Content title"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            {editError && (
              <p className="text-sm text-destructive rounded-md bg-destructive/[0.10] px-3 py-2">{editError}</p>
            )}
            <div className="flex gap-3 pt-1">
              <Button type="submit" variant="cohora" disabled={editSaving}>
                {editSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editSaving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Product cards ─────────────────────────────────────────────────────────────
interface ProductSectionProps {
  creatorId: string;
  creatorHandle: string;
  products: ProductItem[];
}

export function CreatorProductSection({
  creatorId,
  creatorHandle,
  products,
}: ProductSectionProps) {
  const { getAccessToken } = usePrivy();
  const isOwner = useIsOwner(creatorHandle);

  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', priceUsdc: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  function openEdit(product: ProductItem) {
    setEditProduct(product);
    const displayPrice = (Number(BigInt(product.priceUsdc)) / 1_000_000).toFixed(2);
    setEditForm({ name: product.name, description: product.description ?? '', priceUsdc: displayPrice });
    setEditError('');
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editProduct) return;
    setEditSaving(true);
    setEditError('');
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/studio/products/${editProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editForm.name, description: editForm.description, priceUsdc: editForm.priceUsdc }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to save');
      setEditProduct(null);
      window.location.reload();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setEditSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    const token = await getAccessToken();
    await fetch(`/api/studio/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  }

  if (products.length === 0) return null;

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Digital Store</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {products.map((product) => (
            <Card key={product.id}>
              {product.imageUrl && (
                <div
                  className="h-32 w-full rounded-t-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${product.imageUrl})` }}
                />
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  {isOwner && (
                    <ItemMenu
                      onEdit={() => openEdit(product)}
                      onDelete={() => deleteProduct(product.id)}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{product.totalSold} sold</p>
                  <BuyButton
                    creatorId={creatorId}
                    productId={product.id}
                    priceUsdc={BigInt(product.priceUsdc)}
                    label={product.name}
                    type="PRODUCT_PURCHASE"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Edit dialog */}
      <Dialog open={!!editProduct} onOpenChange={(v) => { if (!v) setEditProduct(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit product</DialogTitle></DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Product name" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Optional description" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Price (USDC)</label>
              <Input type="number" min="0.01" step="0.01" value={editForm.priceUsdc} onChange={(e) => setEditForm({ ...editForm, priceUsdc: e.target.value })} placeholder="e.g. 10.00" required />
            </div>
            {editError && (
              <p className="text-sm text-destructive rounded-md bg-destructive/[0.10] px-3 py-2">{editError}</p>
            )}
            <div className="flex gap-3 pt-1">
              <Button type="submit" variant="cohora" disabled={editSaving}>
                {editSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editSaving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
