"use client";

import { useState } from "react";
import { Worker } from "../lib/types";
import { WorkerForm } from "./WorkerForm";

export type WorkerListProps = {
  workers: Worker[];
  onChange: (workers: Worker[]) => void;
  onSelect?: (worker: Worker) => void;
};

export function WorkerList({ workers, onChange, onSelect }: WorkerListProps) {
  const [editing, setEditing] = useState<Worker | null>(null);

  const handleSave = (updated: Worker) => {
    const exists = workers.some((w) => w.id === updated.id);
    const next = exists
      ? workers.map((w) => (w.id === updated.id ? updated : w))
      : [...workers, updated];
    onChange(next);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    onChange(workers.filter((w) => w.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-title">Lista pracowników</p>
            <h2 className="text-lg font-semibold text-primary">Zapisani pracownicy</h2>
          </div>
          <span className="text-xs text-slate-500">{workers.length} zapisanych</span>
        </div>
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {workers.length === 0 ? (
            <p className="text-sm text-slate-500">Brak zapisanych pracowników.</p>
          ) : (
            workers.map((worker) => (
              <div
                key={worker.id}
                className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-primary">{worker.fullName}</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{worker.address}</p>
                  <p className="text-xs text-slate-500">PESEL: {worker.pesel}</p>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  {onSelect ? (
                    <button
                      onClick={() => onSelect(worker)}
                      className="px-3 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100"
                    >
                      Wybierz
                    </button>
                  ) : null}
                  <button
                    onClick={() => setEditing(worker)}
                    className="px-3 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDelete(worker.id)}
                    className="px-3 py-1 rounded-md text-red-600 border border-red-200 hover:bg-red-50"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="card p-4">
        <p className="section-title">Dodaj pracownika</p>
        <h2 className="text-lg font-semibold text-primary mb-4">
          {editing ? "Edytuj dane" : "Nowy pracownik"}
        </h2>
        <WorkerForm
          initial={editing}
          onSubmit={handleSave}
          onCancel={() => setEditing(null)}
        />
      </div>
    </div>
  );
}
