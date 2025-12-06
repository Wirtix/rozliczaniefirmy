"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkerList } from "../components/WorkerList";
import { loadWorkers, persistWorkers } from "../lib/storage";
import { Worker } from "../lib/types";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    let mounted = true;
    loadWorkers().then((data) => {
      if (mounted) setWorkers(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = async (updated: Worker[]) => {
    setWorkers(updated);
    await persistWorkers(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-title">Pracownicy</p>
          <h2 className="text-2xl font-semibold text-primary">Zarządzaj danymi zleceniobiorców</h2>
          <p className="text-slate-600 max-w-2xl mt-1">
            Dodawaj, edytuj i usuwaj pracowników. Dane są teraz przechowywane w pliku po stronie serwera aplikacji.
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
        >
          Wystaw rachunek
        </Link>
      </div>

      <WorkerList workers={workers} onChange={handleChange} />
    </div>
  );
}
