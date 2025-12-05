'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

const defaultAmounts = {
  item_1: 0,
  item_2: 0,
  item_3: 0,
  item_4: 0,
  item_5: 0,
  item_6: 0,
  item_7: 0,
};

const createDefaultAmounts = () => ({ ...defaultAmounts });

type Employee = {
  id: number;
  full_name: string;
  address: string;
  identifier: string;
};

type Flash = { type: 'success' | 'error'; message: string } | null;

type InvoiceForm = {
  employee_id: string;
  number: string;
  issue_date: string;
  period_start: string;
  period_end: string;
  payment_method: string;
  tasks_description: string;
  amounts: typeof defaultAmounts;
};

export default function Home() {
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [flash, setFlash] = useState<Flash>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ full_name: '', address: '', identifier: '' });
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm>({
    employee_id: '',
    number: `1/${dayjs().year()}`,
    issue_date: today,
    period_start: today,
    period_end: today,
    payment_method: 'Przelewem',
    tasks_description: '',
    amounts: createDefaultAmounts(),
  });

  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees))
      .catch(() => setFlash({ type: 'error', message: 'Nie udało się pobrać pracowników' }));
  }, []);

  const updateInvoiceAmount = (key: keyof typeof defaultAmounts, value: number) => {
    setInvoiceForm((prev) => ({
      ...prev,
      amounts: { ...prev.amounts, [key]: value },
    }));
  };

  const handleEmployeeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFlash(null);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Nie udało się zapisać');
      }
      setEmployees((prev) => [...prev, data.employee].sort((a, b) => a.full_name.localeCompare(b.full_name, 'pl')));
      setEmployeeForm({ full_name: '', address: '', identifier: '' });
      setFlash({ type: 'success', message: 'Pracownik zapisany' });
    } catch (error: any) {
      setFlash({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleInvoiceSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setDownloading(true);
    setFlash(null);
    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: Number(invoiceForm.employee_id),
          number: invoiceForm.number,
          issueDate: invoiceForm.issue_date,
          periodStart: invoiceForm.period_start,
          periodEnd: invoiceForm.period_end,
          paymentMethod: invoiceForm.payment_method,
          tasksDescription: invoiceForm.tasks_description,
          amounts: invoiceForm.amounts,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Nie udało się wygenerować PDF');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rachunek_${invoiceForm.number.replace(/\//g, '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      setFlash({ type: 'success', message: 'PDF wygenerowany i pobrany' });
    } catch (error: any) {
      setFlash({ type: 'error', message: error.message });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '1.2rem', alignItems: 'start' }}>
      <section className="card">
        <div className="inline" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2>Dodaj pracownika</h2>
            <p className="muted">Zapamiętani pracownicy będą widoczni poniżej.</p>
          </div>
          <span className="badge">🗂 {employees.length}</span>
        </div>
        {flash && flash.type === 'error' && <div className="flash error">{flash.message}</div>}
        {flash && flash.type === 'success' && <div className="flash success">{flash.message}</div>}
        <form onSubmit={handleEmployeeSubmit} className="grid" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <label htmlFor="full_name">Imię i nazwisko</label>
            <input
              id="full_name"
              name="full_name"
              required
              value={employeeForm.full_name}
              onChange={(e) => setEmployeeForm({ ...employeeForm, full_name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="address">Adres</label>
            <input
              id="address"
              name="address"
              required
              value={employeeForm.address}
              onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="identifier">PESEL / Nr dokumentu tożsamości</label>
            <input
              id="identifier"
              name="identifier"
              required
              value={employeeForm.identifier}
              onChange={(e) => setEmployeeForm({ ...employeeForm, identifier: e.target.value })}
            />
          </div>
          <div className="inline">
            <button type="submit" disabled={saving}>
              {saving ? 'Zapisywanie...' : 'Zapisz pracownika'}
            </button>
          </div>
        </form>

        <hr style={{ border: 'none', borderBottom: '1px solid #e5e7eb', margin: '1rem 0' }} />
        <h3>Twoi pracownicy</h3>
        <ul className="employees">
          {employees.length === 0 && <li className="muted">Brak pracowników – dodaj pierwszą osobę powyżej.</li>}
          {employees.map((emp) => (
            <li key={emp.id}>
              <strong>{emp.full_name}</strong>
              <br />
              <span className="muted">
                {emp.address} · {emp.identifier}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Wygeneruj rachunek</h2>
        <form onSubmit={handleInvoiceSubmit}>
          <label htmlFor="employee_id">Zleceniobiorca</label>
          <select
            id="employee_id"
            name="employee_id"
            required
            value={invoiceForm.employee_id}
            onChange={(e) => setInvoiceForm((prev) => ({ ...prev, employee_id: e.target.value }))}
          >
            <option value="">— wybierz —</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>

          <div className="grid" style={{ marginTop: '0.6rem' }}>
            <div>
              <label htmlFor="number">Numer rachunku</label>
              <input
                id="number"
                name="number"
                required
                value={invoiceForm.number}
                onChange={(e) => setInvoiceForm((prev) => ({ ...prev, number: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="issue_date">Data wystawienia</label>
              <input
                id="issue_date"
                name="issue_date"
                type="date"
                required
                value={invoiceForm.issue_date}
                onChange={(e) => setInvoiceForm((prev) => ({ ...prev, issue_date: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="period_start">Okres od</label>
              <input
                id="period_start"
                name="period_start"
                type="date"
                required
                value={invoiceForm.period_start}
                onChange={(e) => setInvoiceForm((prev) => ({ ...prev, period_start: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="period_end">Okres do</label>
              <input
                id="period_end"
                name="period_end"
                type="date"
                required
                value={invoiceForm.period_end}
                onChange={(e) => setInvoiceForm((prev) => ({ ...prev, period_end: e.target.value }))}
              />
            </div>
          </div>

          <label htmlFor="payment_method" style={{ marginTop: '0.6rem', display: 'block' }}>
            Sposób płatności
          </label>
          <select
            id="payment_method"
            name="payment_method"
            value={invoiceForm.payment_method}
            onChange={(e) => setInvoiceForm((prev) => ({ ...prev, payment_method: e.target.value }))}
          >
            <option>Przelewem</option>
            <option>Gotówką</option>
          </select>

          <h3 style={{ marginTop: '1rem' }}>Kwoty</h3>
          <div className="grid">
            {[
              '1. Kwota brutto',
              '2. Wynagrodzenie dodatkowe za przejazd służbowy',
              '3. Wynagrodzenie dodatkowe (np. koszty zamówienia)',
              '4. Koszty uzyskania przychodu',
              '5. Składka na ubezpieczenie zdrowotne',
              '6. Zaliczka na podatek dochodowy',
              '7. Wypłacono do Rąk własnych',
            ].map((label, index) => {
              const key = `item_${index + 1}` as const;
              return (
                <div key={key}>
                  <label htmlFor={key}>{label}</label>
                  <input
                    id={key}
                    name={key}
                    type="number"
                    step="0.01"
                    value={invoiceForm.amounts[key]}
                    onChange={(e) => updateInvoiceAmount(key, Number(e.target.value || 0))}
                  />
                </div>
              );
            })}
          </div>

          <label htmlFor="tasks_description" style={{ marginTop: '0.6rem', display: 'block' }}>
            Zestawienie wykonanych zleceń
          </label>
          <textarea
            id="tasks_description"
            name="tasks_description"
            placeholder="np. korepetycje z matematyki, przygotowanie materiałów dydaktycznych"
            value={invoiceForm.tasks_description}
            onChange={(e) => setInvoiceForm((prev) => ({ ...prev, tasks_description: e.target.value }))}
          />

          <div className="inline" style={{ marginTop: '0.8rem' }}>
            <button type="submit" disabled={downloading}>
              {downloading ? 'Generuję…' : 'Pobierz PDF'}
            </button>
            <span className="muted">Rachunek zostanie pobrany od razu po wciśnięciu przycisku.</span>
          </div>
        </form>
      </section>

      <footer>Stałe dane firmy: Koreptycje na już Oskar Skutnik, Traugutta 3a m 18, 16-020 Czarna Białostocka.</footer>
    </div>
  );
}
