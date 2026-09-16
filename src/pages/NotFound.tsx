import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <p className="text-6xl font-bold text-muted-foreground/20 mb-4">۴۰۴</p>
      <h1 className="text-xl font-bold text-foreground mb-2">صفحه یافت نشد</h1>
      <p className="text-sm text-muted-foreground mb-6">صفحه‌ای که دنبال آن هستید وجود ندارد.</p>
      <Link
        to="/"
        className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
