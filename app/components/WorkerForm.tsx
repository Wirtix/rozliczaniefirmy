"use client";

import { useEffect, useState } from "react";
import { Worker } from "../lib/types";

const empty: Worker = {
  id: "",
  fullName: "",
  address: "",
  pesel: "",
};

export type WorkerFormProps = {
  initial?: Worker | null;
  onSubmit: (worker: Worker) => void;
  onCancel?: () => void;
};

export function WorkerForm({ initial, onSubmit, onCancel }: WorkerFormProps) {
  const [worker, setWorker] = useState<Worker>(initial || empty);

  useEffect(() => {
    setWorker(initial || empty);
  }, [initial]);

  const handleChange = (field: keyof Worker) => (value: string) => {
    setWorker((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ ...worker, id: worker.id || crypto.randomUUID() });
    setWorker(empty);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="field-label">Imię i nazwisko</label>
        <input
          required
          value={worker.fullName}
          onChange={(e) => handleChange("fullName")(e.target.value)}
          className="field-input"
          placeholder="np. Anna Kowalska"
        />
      </div>
      <div className="space-y-1">
        <label className="field-label">Adres</label>
        <textarea
          required
          value={worker.address}
          onChange={(e) => handleChange("address")(e.target.value)}
          className="field-input min-h-[72px]"
          placeholder="Ulica, numer, kod, miasto"
        />
      </div>
      <div className="space-y-1">
        <label className="field-label">Numer PESEL</label>
        <input
          required
          value={worker.pesel}
          onChange={(e) => handleChange("pesel")(e.target.value)}
          className="field-input"
          placeholder="00000000000"
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Anuluj
          </button>
        ) : null}
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent text-white font-semibold shadow-sm hover:bg-sky-500"
        >
          {initial ? "Zapisz zmiany" : "Dodaj pracownika"}
        </button>
      </div>
    </form>
  );
}
