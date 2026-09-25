"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState, type ReactNode } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  author: string | null;
  category: string;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
};

type NewsForm = Omit<NewsItem, "id" | "createdAt" | "isFeatured" | "isActive" | "tags"> & {
  tags: string;
  isFeatured: boolean;
  isActive: boolean;
};

const emptyForm: NewsForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "",
  category: "اخبار مدرسه",
  tags: "",
  isFeatured: false,
  isActive: true,
};

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NewsForm>(emptyForm);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/news?activeOnly=false", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("خطا در دریافت اخبار");
      setNews(await response.json());
    } catch (error) {
      console.error(error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const filtered = news.filter((item) =>
    `${item.title} ${item.category}`.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      coverImage: item.coverImage ?? "",
      author: item.author ?? "",
      category: item.category,
      tags: item.tags.join(", "),
      isFeatured: item.isFeatured,
      isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) return;

    try {
      setSaving(true);
      const payload = {
        ...form,
        slug: form.slug.trim() || makeSlug(form.title) || `news-${Date.now()}`,
        coverImage: form.coverImage?.trim() || null,
        author: form.author?.trim() || null,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      };

      const response = await fetch(
        editId ? `/api/news/${editId}` : "/api/news",
        {
          method: editId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "ذخیره خبر انجام نشد.");

      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm);
      await loadNews();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "ذخیره خبر انجام نشد.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: NewsItem) => {
    if (!window.confirm(`خبر «${item.title}» حذف شود؟`)) return;

    const response = await fetch(`/api/news/${item.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      window.alert(data?.error || "حذف خبر انجام نشد.");
      return;
    }
    await loadNews();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">اخبار</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ایجاد، ویرایش و انتشار اخبار مدرسه
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#194342] px-4 py-2 text-sm font-medium text-white hover:bg-[#143938]"
        >
          <Plus className="h-4 w-4" />
          افزودن خبر
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی خبر..."
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#194342]/20"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right">عنوان</th>
                <th className="px-4 py-3 text-right">دسته‌بندی</th>
                <th className="px-4 py-3 text-right">وضعیت</th>
                <th className="px-4 py-3 text-right">ویژه</th>
                <th className="px-4 py-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">در حال دریافت...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">خبری پیدا نشد.</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="border-b border-border/30 last:border-0">
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${item.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {item.isActive ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.isFeatured ? <Star className="h-4 w-4 fill-current text-amber-500" /> : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <a href={`/news/${item.slug}`} target="_blank" rel="noreferrer" className="rounded-md p-2 hover:bg-muted" title="مشاهده">
                        <Eye className="h-4 w-4" />
                      </a>
                      <button type="button" onClick={() => openEdit(item)} className="rounded-md p-2 hover:bg-muted" title="ویرایش">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => remove(item)} className="rounded-md p-2 text-destructive hover:bg-destructive/10" title="حذف">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir="rtl">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-background p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editId ? "ویرایش خبر" : "افزودن خبر"}</h2>
              <button type="button" onClick={() => setDialogOpen(false)} className="text-muted-foreground">×</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="عنوان" className="md:col-span-2">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Slug">
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="مثلاً school-news" dir="ltr" className={inputClass} />
              </Field>
              <Field label="دسته‌بندی">
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
              </Field>
              <Field label="خلاصه" className="md:col-span-2">
                <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={3} className={inputClass} />
              </Field>
              <Field label="متن کامل" className="md:col-span-2">
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={9} className={inputClass} />
              </Field>
              <Field label="تصویر (URL)">
                <input value={form.coverImage ?? ""} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} dir="ltr" className={inputClass} />
              </Field>
              <Field label="نویسنده">
                <input value={form.author ?? ""} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inputClass} />
              </Field>
              <Field label="برچسب‌ها" className="md:col-span-2">
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="مدرسه، آموزشی، مسابقات" className={inputClass} />
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                خبر ویژه
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                نمایش در سایت
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDialogOpen(false)} className="rounded-lg border px-4 py-2 text-sm">انصراف</button>
              <button type="button" disabled={saving} onClick={save} className="rounded-lg bg-[#194342] px-5 py-2 text-sm font-medium text-white disabled:opacity-50">
                {saving ? "در حال ذخیره..." : "ذخیره خبر"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const inputClass = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#194342]/20";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
