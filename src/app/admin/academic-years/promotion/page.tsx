"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

type Year = { id: string; title: string; isCurrent: boolean };
type Outcome = "PROMOTE" | "REPEAT" | "NEEDS_DECISION" | "EXISTING";
type Row = { studentId: string; firstName: string; lastName: string; sourceGrade: string; sourceClassName: string | null; outcome: Outcome; targetGrade: string | null; targetClassId: string | null; targetClassName: string | null };
type SchoolClass = { id: string; name: string; grade: string; isActive: boolean };
type Preview = { rows: Row[] };
const gradeLabels: Record<string, string> = { "10": "دهم", "11": "یازدهم", "12": "دوازدهم" };

export default function PromotionPage() {
  const [years, setYears] = useState<Year[]>([]);
  const [source, setSource] = useState(""); const [target, setTarget] = useState("");
  const [grade, setGrade] = useState(""); const [className, setClassName] = useState("");
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null); const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [classesLoading, setClassesLoading] = useState(false); const [saving, setSaving] = useState(false); const [result, setResult] = useState<{created:number;promoted:number;repeated:number}|null>(null);

  useEffect(() => { fetch("/api/academic-years", { cache: "no-store" }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setYears(d); }).catch(() => setError("دریافت سال‌های تحصیلی انجام نشد.")); }, []);

  useEffect(() => {
    setClasses([]); setRows([]); setPreview(null); setGrade(""); setClassName(""); setResult(null);
    if (!target) return;
    setClassesLoading(true);
    fetch(`/api/admin/classes?academicYearId=${encodeURIComponent(target)}&activeOnly=true`, { cache: "no-store" })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setClasses(Array.isArray(d.classes) ? d.classes : []); })
      .catch((e) => setError(e instanceof Error ? e.message : "دریافت کلاس‌های سال مقصد انجام نشد."))
      .finally(() => setClassesLoading(false));
  }, [target]);

  const sourceClasses = useMemo(() => Array.from(new Set(rows.map((row) => row.sourceClassName).filter((value): value is string => Boolean(value)))).sort(), [rows]);
  const visibleRows = useMemo(() => rows.filter((row) => (!grade || row.sourceGrade === grade) && (!className || row.sourceClassName === className)), [rows, grade, className]);
  const readyRows = visibleRows.filter((row) => row.outcome === "PROMOTE" || row.outcome === "REPEAT");
  const needsDecision = visibleRows.filter((row) => row.outcome === "NEEDS_DECISION").length;
  const existing = visibleRows.filter((row) => row.outcome === "EXISTING").length;

  async function loadPreview() {
    setError(""); setResult(null); setPreview(null); setRows([]);
    if (!source || !target || source === target) { setError("سال مبدأ و مقصد را به‌صورت متفاوت انتخاب کنید."); return; }
    setLoading(true);
    try { const r = await fetch(`/api/admin/academic-years/promotion/preview?sourceAcademicYearId=${encodeURIComponent(source)}&targetAcademicYearId=${encodeURIComponent(target)}`, { cache: "no-store" }); const d = await r.json(); if (!r.ok) throw new Error(d.error); setPreview(d); setRows(d.rows); setGrade(""); setClassName(""); } catch (e) { setError(e instanceof Error ? e.message : "پیش‌نمایش ارتقا آماده نشد."); } finally { setLoading(false); }
  }
  function updateRow(studentId: string, update: Partial<Row>) { setRows((current) => current.map((row) => row.studentId === studentId ? { ...row, ...update } : row)); }
  function availableClasses(targetGrade: string | null) { return classes.filter((item) => item.isActive && item.grade === targetGrade); }
  async function confirm() {
    if (!preview || !readyRows.length || needsDecision) return;
    const invalid = readyRows.filter((row) => !row.targetClassId || !availableClasses(row.targetGrade).some((item) => item.id === row.targetClassId));
    if (invalid.length) { setError("برای همه دانش‌آموزان قابل ثبت، کلاس مقصد معتبر انتخاب کنید."); return; }
    setSaving(true); setError("");
    try { const r = await fetch("/api/admin/academic-years/promotion/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourceAcademicYearId: source, targetAcademicYearId: target, decisions: readyRows.map((row) => ({ studentId: row.studentId, outcome: row.outcome, targetClassId: row.targetClassId })) }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error); setResult(d); } catch (e) { setError(e instanceof Error ? e.message : "ثبت ارتقا انجام نشد."); } finally { setSaving(false); }
  }
  return <AdminLayout><div className="mx-auto max-w-7xl space-y-6" dir="rtl">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-medium text-[#B86F5B]">مدیریت سال‌های تحصیلی</p><h1 className="mt-1 text-2xl font-bold">ارتقای دانش‌آموزان</h1><p className="mt-2 text-sm text-muted-foreground">ثبت‌نام سال مقصد با کلاس‌های تعریف‌شده توسط مدیریت انجام می‌شود و سابقه سال مبدأ بدون تغییر می‌ماند.</p></div><Button asChild variant="outline"><Link href="/admin/academic-years"><ArrowRight className="ml-2 h-4 w-4"/>بازگشت به سال‌های تحصیلی</Link></Button></div>
    <section className="rounded-2xl border bg-white p-5"><div className="grid gap-4 md:grid-cols-4"><label className="text-sm">سال مبدأ<select value={source} onChange={(e)=>setSource(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3"><option value="">انتخاب کنید</option>{years.map((y)=><option key={y.id} value={y.id}>{y.title}{y.isCurrent?" — جاری":""}</option>)}</select></label><label className="text-sm">سال مقصد<select value={target} onChange={(e)=>setTarget(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3"><option value="">انتخاب کنید</option>{years.map((y)=><option key={y.id} value={y.id}>{y.title}{y.isCurrent?" — جاری":""}</option>)}</select></label><div className="flex items-end"><Button onClick={loadPreview} disabled={loading || classesLoading || !classes.length} className="w-full bg-[#194342]">{loading?<RefreshCw className="ml-2 h-4 w-4 animate-spin"/>:null}{classesLoading?"در حال دریافت کلاس‌ها...":"نمایش پیش‌نمایش"}</Button></div></div>{target && !classesLoading && classes.length === 0?<p className="mt-3 text-sm text-[#A45F4D]">برای سال مقصد هنوز کلاس فعالی تعریف نشده است. ابتدا از بخش «مدیریت کلاس‌ها» کلاس‌های مقصد را ایجاد کنید.</p>:null}</section>
    {error?<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>:null}
    {result?<section className="rounded-2xl border border-[#D5DECB] bg-[#F1F5E8] p-5"><div className="flex items-center gap-2 font-semibold text-[#194342]"><CheckCircle2 className="h-5 w-5"/>ارتقا با موفقیت انجام شد.</div><p className="mt-2 text-sm">ثبت‌شده: {result.created} · ارتقا: {result.promoted} · تکرار پایه: {result.repeated}</p></section>:null}
    {preview?<><section className="rounded-2xl border bg-white p-5"><div className="grid gap-3 sm:grid-cols-4"><div><p className="text-xs text-muted-foreground">تعداد کل</p><p className="text-xl font-bold">{visibleRows.length}</p></div><div><p className="text-xs text-muted-foreground">قابل ثبت</p><p className="text-xl font-bold text-[#27745A]">{readyRows.length}</p></div><div><p className="text-xs text-muted-foreground">از قبل ثبت‌شده</p><p className="text-xl font-bold">{existing}</p></div><div><p className="text-xs text-muted-foreground">نیازمند تصمیم</p><p className="text-xl font-bold text-[#B86F5B]">{needsDecision}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm">پایه<select value={grade} onChange={(e)=>setGrade(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3"><option value="">همه</option>{["10","11","12"].map((v)=><option key={v} value={v}>{gradeLabels[v]}</option>)}</select></label><label className="text-sm">کلاس مبدأ<select value={className} onChange={(e)=>setClassName(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3"><option value="">همه</option>{sourceClasses.map((v)=><option key={v} value={v}>{v}</option>)}</select></label></div></section>
    <section className="overflow-hidden rounded-2xl border bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead className="bg-muted/40"><tr><th className="px-4 py-3 text-right">دانش‌آموز</th><th className="px-4 py-3 text-right">مبدأ</th><th className="px-4 py-3 text-right">وضعیت پیشنهادی</th><th className="px-4 py-3 text-right">پایه مقصد</th><th className="px-4 py-3 text-right">کلاس مقصد</th></tr></thead><tbody>{visibleRows.map((row)=><tr key={row.studentId} className="border-t"><td className="px-4 py-3 font-medium">{row.firstName} {row.lastName}</td><td className="px-4 py-3">{gradeLabels[row.sourceGrade]??row.sourceGrade} · {row.sourceClassName??"—"}</td><td className="px-4 py-3">{row.outcome === "EXISTING"?<span className="rounded-full bg-muted px-2 py-1 text-xs">از قبل ثبت شده</span>:<select value={row.outcome} onChange={(e)=>{const outcome=e.target.value as Outcome; const targetGrade = outcome === "NEEDS_DECISION" ? null : outcome === "REPEAT" ? row.sourceGrade : row.sourceGrade === "10" ? "11" : "12"; updateRow(row.studentId,{outcome,targetGrade,targetClassId: null});}} className="h-9 rounded border bg-background px-2 text-xs"><option value="PROMOTE" disabled={row.sourceGrade === "12"}>ارتقا</option><option value="REPEAT">تکرار پایه</option>{row.sourceGrade === "12"?<option value="NEEDS_DECISION">نیاز به تصمیم</option>:null}</select>}</td><td className="px-4 py-3">{row.targetGrade ? gradeLabels[row.targetGrade] : "—"}</td><td className="px-4 py-3">{row.outcome === "EXISTING" || row.outcome === "NEEDS_DECISION" ? "—" : <select value={row.targetClassId ?? ""} onChange={(e)=>updateRow(row.studentId,{targetClassId:e.target.value||null})} className="h-9 min-w-40 rounded border bg-background px-2" disabled={!availableClasses(row.targetGrade).length}><option value="">{availableClasses(row.targetGrade).length ? "انتخاب کلاس" : "کلاسی برای این پایه نیست"}</option>{availableClasses(row.targetGrade).map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select>}</td></tr>)}</tbody></table></div></section>
    {!result?<Button onClick={confirm} disabled={saving || !readyRows.length || needsDecision > 0 || readyRows.some((row) => !row.targetClassId)} className="bg-[#B86F5B]">{saving?"در حال ثبت...":"تأیید و ثبت ارتقا"}</Button>:null}{needsDecision>0?<p className="text-xs text-[#A45F4D]">برای ادامه، وضعیت دانش‌آموزان نیازمند تصمیم را مشخص کنید.</p>:null}</>:null}
  </div></AdminLayout>;
}
