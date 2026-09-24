"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type ScanResult = {
  type: "success" | "error" | "info";
  message: string;
  member?: {
    name?: string;
    memberCode?: string;
    plan?: string | null;
    status?: string;
    checkinAt?: string;
  };
};

export default function ScanAttendancePage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const runningRef = useRef(false);
  const processingRef = useRef(false);

  const [scannerReady, setScannerReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult>({
    type: "info",
    message: "Ready to scan a member QR code.",
  });

  async function stopScanner() {
    const scanner = scannerRef.current;

    if (!scanner || !runningRef.current) {
      setScanning(false);
      return;
    }

    try {
      await scanner.stop();
    } catch (error) {
      console.error("Failed to stop scanner:", error);
    }

    runningRef.current = false;
    setScanning(false);
  }

  async function handleScan(decodedText: string) {
    if (processingRef.current) return;

    processingRef.current = true;

    setResult({
      type: "info",
      message: "Verifying member...",
    });

    await stopScanner();

    try {
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrToken: decodedText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          type: "error",
          message: data.error ?? "Check-in failed.",
          member: data.member,
        });

        return;
      }

      setResult({
        type: "success",
        message: data.message ?? "Check-in successful.",
        member: {
          name: data.member?.name,
          memberCode: data.member?.memberCode,
          plan: data.member?.plan,
          status: data.member?.status,
          checkinAt: data.attendance?.checkinAt,
        },
      });
    } catch (error) {
      console.error("Check-in request failed:", error);

      setResult({
        type: "error",
        message: "Could not contact the attendance server.",
      });
    } finally {
      processingRef.current = false;
    }
  }

  async function startScanner() {
    setResult({
      type: "info",
      message: "Starting camera...",
    });

    try {
      let scanner = scannerRef.current;

      if (!scanner) {
        scanner = new Html5Qrcode("dchamps-qr-reader");
        scannerRef.current = scanner;
      }

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 260,
            height: 260,
          },
          aspectRatio: 1,
        },
        (decodedText) => {
          void handleScan(decodedText);
        },
        () => {
          // Ignore normal frames where no QR is detected.
        }
      );

      runningRef.current = true;
      setScanning(true);
      setScannerReady(true);

      setResult({
        type: "info",
        message: "Camera active. Point it at the member QR code.",
      });
    } catch (error) {
      console.error("Camera start failed:", error);

      setScanning(false);

      setResult({
        type: "error",
        message:
          "Camera could not be started. Check browser camera permission and make sure the site is using HTTPS or localhost.",
      });
    }
  }

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner && runningRef.current) {
        void scanner.stop().catch(() => {});
      }

      scannerRef.current = null;
      runningRef.current = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
          Attendance
        </p>

        <h1 className="mt-1 font-display text-3xl tracking-wide text-white">
          SCAN MEMBER QR
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Use the reception device camera to scan a member&apos;s secure QR
          code and record today&apos;s attendance.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="card-dark">
          <div
            id="dchamps-qr-reader"
            className="mx-auto w-full max-w-lg overflow-hidden rounded-xl"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            {!scanning ? (
              <button
                type="button"
                onClick={startScanner}
                className="btn-gold"
              >
                {scannerReady ? "SCAN AGAIN" : "START SCANNER"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  void stopScanner();

                  setResult({
                    type: "info",
                    message: "Scanner stopped.",
                  });
                }}
                className="btn-outline"
              >
                STOP SCANNER
              </button>
            )}
          </div>
        </div>

        <div className="card-dark">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
            Check-in result
          </p>

          <div
            className={`mt-4 rounded-xl border p-4 ${
              result.type === "success"
                ? "border-green-800 bg-green-950/40"
                : result.type === "error"
                  ? "border-red-800 bg-red-950/40"
                  : "border-neutral-800 bg-neutral-950"
            }`}
          >
            <p
              className={`text-sm ${
                result.type === "success"
                  ? "text-green-300"
                  : result.type === "error"
                    ? "text-red-300"
                    : "text-neutral-300"
              }`}
            >
              {result.message}
            </p>

            {result.member && (
              <div className="mt-5 space-y-3 border-t border-neutral-800 pt-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-500">
                    Member
                  </p>
                  <p className="font-semibold text-white">
                    {result.member.name ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-500">
                    Member code
                  </p>
                  <p className="font-mono text-sm text-gold">
                    {result.member.memberCode ?? "—"}
                  </p>
                </div>

                {result.member.plan && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500">
                      Membership
                    </p>
                    <p className="text-white">
                      {result.member.plan}
                    </p>
                  </div>
                )}

                {result.member.checkinAt && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500">
                      Check-in time
                    </p>
                    <p className="text-white">
                      {new Date(
                        result.member.checkinAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-neutral-500">
            Only authorized staff and administrators can use this scanner.
            The server verifies the QR token and membership before recording
            attendance.
          </p>
        </div>
      </div>
    </div>
  );
}