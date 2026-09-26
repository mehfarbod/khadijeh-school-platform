"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Clock3, Loader2, X } from "lucide-react";

type AdmissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface AcademicYear {
  id: string;
  title: string;
}

interface AdmissionApplication {
  id: string;

  studentFirstName: string;
  studentLastName: string;
  birthDate: string | null;
  nationalId: string;
  birthCertificateSerial: string | null;
  requestedGrade: string;
  studentMobile: string;

  fatherFirstName: string;
  fatherLastName: string;
  fatherNationalId: string | null;
  fatherJob: string | null;
  fatherEducation: string | null;
  fatherMobile: string | null;

  motherFirstName: string;
  motherLastName: string;
  motherNationalId: string | null;
  motherJob: string | null;
  motherEducation: string | null;
  motherMobile: string | null;

  address: string;
  landline: string | null;
  description: string | null;

  academicYearId: string;
  status: AdmissionStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;

  createdAt: string;
  updatedAt: string;

  academicYear: AcademicYear;
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function getStatusLabel(status: AdmissionStatus) {
  switch (status) {
    case "PENDING":
      return "در انتظار بررسی";
    case "APPROVED":
      return "تأیید شده";
    case "REJECTED":
      return "رد شده";
    case "CANCELLED":
      return "لغو شده";
    default:
      return status;
  }
}

function getStatusClassName(status: AdmissionStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "APPROVED":
      return "bg-green-50 text-green-700 border-green-200";

    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";

    case "CANCELLED":
      return "bg-gray-50 text-gray-600 border-gray-200";

    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export default function AdminAdmissionApplications() {
  const [applications, setApplications] = useState<
    AdmissionApplication[] | null
  >(null);

  const [selectedApplication, setSelectedApplication] =
    useState<AdmissionApplication | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  // خطاهای مربوط به دریافت لیست
  const [error, setError] = useState<string | null>(null);

  // خطای مربوط به عملیات داخل Modal
  const [actionError, setActionError] = useState<string | null>(null);

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadApplications = async () => {
    try {
      setError(null);

      const response = await fetch(
        "/api/admission-applications?status=PENDING",
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت درخواست‌های پیش‌ثبت‌نام");
      }

      const data = await response.json();

      setApplications(data);
    } catch (error) {
      console.error("Failed to load admission applications:", error);

      setApplications([]);
      setError("دریافت درخواست‌های پیش‌ثبت‌نام با خطا مواجه شد.");
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async () => {
    if (!selectedApplication) return;

    const confirmed = window.confirm(
      `آیا از تأیید پیش‌ثبت‌نام ${selectedApplication.studentFirstName} ${selectedApplication.studentLastName} مطمئن هستید؟`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setActionError(null);

      const response = await fetch(
        `/api/admission-applications/${selectedApplication.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "APPROVED",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "تأیید درخواست با خطا مواجه شد.");
      }

      setSelectedApplication(null);
      setActionError(null);

      await loadApplications();
    } catch (error) {
      console.error("Failed to approve application:", error);

      setActionError(
        error instanceof Error
          ? error.message
          : "تأیید درخواست با خطا مواجه شد.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;

    const reason = rejectionReason.trim();

    if (!reason) {
      setActionError("برای رد درخواست، وارد کردن دلیل الزامی است.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);

      const response = await fetch(
        `/api/admission-applications/${selectedApplication.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "REJECTED",
            rejectionReason: reason,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "رد درخواست با خطا مواجه شد.");
      }

      setSelectedApplication(null);
      setShowRejectForm(false);
      setRejectionReason("");
      setActionError(null);

      await loadApplications();
    } catch (error) {
      console.error("Failed to reject application:", error);

      setActionError(
        error instanceof Error ? error.message : "رد درخواست با خطا مواجه شد.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    if (actionLoading) return;

    setSelectedApplication(null);
    setShowRejectForm(false);
    setRejectionReason("");
    setActionError(null);
  };

  const openApplication = (application: AdmissionApplication) => {
    setSelectedApplication(application);
    setShowRejectForm(false);
    setRejectionReason("");
    setActionError(null);
  };

  return (
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">پیش‌ثبت‌نام مدرسه</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          بررسی و مدیریت درخواست‌های پیش‌ثبت‌نام دانش‌آموزان
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  دانش‌آموز
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  پایه درخواستی
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  موبایل
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  سال تحصیلی
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  تاریخ درخواست
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  وضعیت
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  جزئیات
                </th>
              </tr>
            </thead>

            <tbody>
              {!applications ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="border-b border-border/30">
                    {Array.from({ length: 7 }).map((_, cell) => (
                      <td key={cell} className="px-4 py-4">
                        <div className="h-4 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Clock3 className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <p className="font-medium text-foreground">
                        درخواست جدیدی وجود ندارد
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        در حال حاضر پیش‌ثبت‌نامی در انتظار بررسی نیست.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-border/30 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {application.studentFirstName}{" "}
                          {application.studentLastName}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          کد ملی: {application.nationalId}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">{application.requestedGrade}</td>

                    <td className="px-4 py-4">{application.studentMobile}</td>

                    <td className="px-4 py-4">
                      {application.academicYear?.title || "—"}
                    </td>

                    <td className="px-4 py-4">
                      {formatDate(application.createdAt)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                          application.status,
                        )}`}
                      >
                        {getStatusLabel(application.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => openApplication(application)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        مشاهده
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <h2 className="font-bold text-foreground">
                  جزئیات پیش‌ثبت‌نام
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedApplication.studentFirstName}{" "}
                  {selectedApplication.studentLastName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-145px)] overflow-y-auto p-5">
              <div className="grid gap-6 md:grid-cols-2">
                <section>
                  <h3 className="mb-3 text-sm font-bold text-foreground">
                    اطلاعات دانش‌آموز
                  </h3>

                  <div className="space-y-2 text-sm">
                    <InfoRow
                      label="نام و نام خانوادگی"
                      value={`${selectedApplication.studentFirstName} ${selectedApplication.studentLastName}`}
                    />

                    <InfoRow
                      label="کد ملی"
                      value={selectedApplication.nationalId}
                    />

                    <InfoRow
                      label="تاریخ تولد"
                      value={formatDate(selectedApplication.birthDate)}
                    />

                    <InfoRow
                      label="سریال شناسنامه"
                      value={selectedApplication.birthCertificateSerial}
                    />

                    <InfoRow
                      label="پایه درخواستی"
                      value={selectedApplication.requestedGrade}
                    />

                    <InfoRow
                      label="شماره تلفن همراه"
                      value={selectedApplication.studentMobile}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-bold text-foreground">
                    اطلاعات تحصیلی
                  </h3>

                  <div className="space-y-2 text-sm">
                    <InfoRow
                      label="سال تحصیلی"
                      value={selectedApplication.academicYear?.title}
                    />

                    <InfoRow
                      label="تاریخ درخواست"
                      value={formatDate(selectedApplication.createdAt)}
                    />

                    <InfoRow
                      label="وضعیت"
                      value={getStatusLabel(selectedApplication.status)}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-bold text-foreground">
                    اطلاعات پدر
                  </h3>

                  <div className="space-y-2 text-sm">
                    <InfoRow
                      label="نام"
                      value={`${selectedApplication.fatherFirstName} ${selectedApplication.fatherLastName}`}
                    />

                    <InfoRow
                      label="کد ملی"
                      value={selectedApplication.fatherNationalId}
                    />

                    <InfoRow
                      label="شغل"
                      value={selectedApplication.fatherJob}
                    />

                    <InfoRow
                      label="تحصیلات"
                      value={selectedApplication.fatherEducation}
                    />

                    <InfoRow
                      label="موبایل"
                      value={selectedApplication.fatherMobile}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-bold text-foreground">
                    اطلاعات مادر
                  </h3>

                  <div className="space-y-2 text-sm">
                    <InfoRow
                      label="نام"
                      value={`${selectedApplication.motherFirstName} ${selectedApplication.motherLastName}`}
                    />

                    <InfoRow
                      label="کد ملی"
                      value={selectedApplication.motherNationalId}
                    />

                    <InfoRow
                      label="شغل"
                      value={selectedApplication.motherJob}
                    />

                    <InfoRow
                      label="تحصیلات"
                      value={selectedApplication.motherEducation}
                    />

                    <InfoRow
                      label="موبایل"
                      value={selectedApplication.motherMobile}
                    />
                  </div>
                </section>

                <section className="md:col-span-2">
                  <h3 className="mb-3 text-sm font-bold text-foreground">
                    اطلاعات تماس و آدرس
                  </h3>

                  <div className="space-y-2 text-sm">
                    <InfoRow
                      label="تلفن ثابت"
                      value={selectedApplication.landline}
                    />

                    <InfoRow label="آدرس" value={selectedApplication.address} />

                    <InfoRow
                      label="توضیحات"
                      value={selectedApplication.description}
                    />
                  </div>
                </section>
              </div>

              {actionError && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                      <X className="h-3.5 w-3.5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        عملیات انجام نشد
                      </p>

                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {actionError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showRejectForm && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50/60 p-4">
                  <label
                    htmlFor="rejectionReason"
                    className="mb-2 block text-sm font-medium text-red-800"
                  >
                    دلیل رد درخواست
                  </label>

                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(event) => {
                      setRejectionReason(event.target.value);
                      setActionError(null);
                    }}
                    rows={4}
                    placeholder="دلیل رد درخواست را وارد کنید..."
                    className="w-full resize-none rounded-lg border border-red-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              )}
            </div>

            {selectedApplication.status === "PENDING" && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 px-5 py-4">
                {showRejectForm ? (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionReason("");
                        setActionError(null);
                      }}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      انصراف
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleReject}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      ثبت رد درخواست
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        setShowRejectForm(true);
                        setActionError(null);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      رد درخواست
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleApprove}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      تأیید و ثبت دانش‌آموز
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex gap-3 rounded-lg bg-muted/30 px-3 py-2">
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>

      <span className="min-w-0 flex-1 break-words font-medium text-foreground">
        {value || "—"}
      </span>
    </div>
  );
}
