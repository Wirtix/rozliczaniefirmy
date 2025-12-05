from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from datetime import date
from io import BytesIO
from pathlib import Path
from typing import List, Optional

from flask import Flask, flash, redirect, render_template, request, send_file, url_for
from fpdf import FPDF


DATA_PATH = Path("data/employees.json")
COMPANY_CITY = "Czarna Białostocka"
COMPANY_NAME = "Koreptycje na już Oskar Skutnik"
COMPANY_ADDRESS = "Traugutta 3a m 18\n16-020 Czarna Białostocka"
COMPANY_REGON = "540581214"
COMPANY_NIP = "9661385512"
COMPANY_PHONE = "531 567 262"


@dataclass
class Employee:
    id: int
    full_name: str
    address: str
    identifier: str


class EmployeeStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self.path.write_text("[]", encoding="utf-8")
        self._employees = self._load()

    def _load(self) -> List[Employee]:
        raw = json.loads(self.path.read_text(encoding="utf-8"))
        return [Employee(**item) for item in raw]

    def _save(self) -> None:
        self.path.write_text(
            json.dumps([asdict(emp) for emp in self._employees], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def add(self, full_name: str, address: str, identifier: str) -> Employee:
        new_id = max([emp.id for emp in self._employees], default=0) + 1
        employee = Employee(id=new_id, full_name=full_name, address=address, identifier=identifier)
        self._employees.append(employee)
        self._save()
        return employee

    def all(self) -> List[Employee]:
        return sorted(self._employees, key=lambda e: e.full_name.lower())

    def get(self, employee_id: int) -> Optional[Employee]:
        return next((emp for emp in self._employees if emp.id == employee_id), None)


app = Flask(__name__)
app.secret_key = "rachunek-demo-secret"
employees = EmployeeStore(DATA_PATH)


def currency(value: float) -> str:
    return f"{value:,.2f}".replace(",", " ").replace(".", ",")


def _header_row(pdf: FPDF, label: str, value: str) -> None:
    pdf.set_font("Helvetica", size=11)
    pdf.cell(60, 8, label)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(120, 8, value, ln=1)


def _dotted_line(pdf: FPDF, label: str, width: int = 160) -> None:
    pdf.set_draw_color(0)
    x = pdf.get_x()
    y = pdf.get_y() + 6
    pdf.dashed_line(x, y, x + width, y, 1, 2)
    pdf.set_y(y + 2)
    pdf.cell(0, 10, label, ln=1)


def build_invoice(
    employee: Employee,
    number: str,
    issue_date: date,
    period_start: date,
    period_end: date,
    tasks_description: str,
    amounts: dict,
    payment_method: str,
) -> BytesIO:
    pdf = FPDF(format="A4")
    pdf.add_page()
    pdf.set_auto_page_break(auto=False, margin=15)

    pdf.set_font("Helvetica", size=11)
    pdf.cell(0, 10, f"{COMPANY_CITY}, dn. {issue_date.strftime('%d.%m.%Y')}", align="R", ln=1)

    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 12, "RACHUNEK DO UMOWY ZLECENIE", align="C", ln=1)

    pdf.set_font("Helvetica", size=11)
    pdf.cell(0, 8, f"nr {number} z dnia {issue_date.strftime('%d.%m.%Y')}", align="C", ln=1)
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Zleceniodawca:")
    pdf.ln(8)

    _header_row(pdf, "Zleceniobiorca:", employee.full_name)
    _header_row(pdf, "Adres:", employee.address)
    _header_row(pdf, "PESEL/Nr dok. tożsamości:", employee.identifier)
    pdf.ln(2)

    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Zleceniodawca:")
    pdf.ln(8)

    _header_row(pdf, "Nazwa:", COMPANY_NAME)
    _header_row(pdf, "Adres:", COMPANY_ADDRESS)
    _header_row(pdf, "REGON:", COMPANY_REGON)
    _header_row(pdf, "NIP:", COMPANY_NIP)
    _header_row(pdf, "Telefon:", COMPANY_PHONE)
    pdf.ln(4)

    pdf.set_font("Helvetica", size=11)
    pdf.multi_cell(
        0,
        8,
        f"Za wykonanie prac zgodnie z umową zlecenie nr {number} z dn. {issue_date.strftime('%d.%m.%Y')} "
        f"w okresie od {period_start.strftime('%d.%m.%Y')} do {period_end.strftime('%d.%m.%Y')} płatnym do {issue_date.strftime('%d.%m.%Y')}.",
    )

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "ROZLICZENIE", ln=1)

    pdf.set_font("Helvetica", size=11)
    labels = [
        "Kwota brutto:",
        "Wynagrodzenie dodatkowe za przejazd służbowy:",
        "Wynagrodzenie dodatkowe (np. koszty zamówienia):",
        "Koszty uzyskania przychodu:",
        "Składka na ubezpieczenie zdrowotne:",
        "Zaliczka na podatek dochodowy:",
        "Wypłacono do Rąk własnych",
    ]

    for index, label in enumerate(labels, start=1):
        amount = currency(float(amounts.get(f"item_{index}", 0) or 0))
        pdf.cell(10, 8, f"{index}.")
        pdf.cell(120, 8, label)
        pdf.cell(0, 8, amount, ln=1)

    pdf.ln(4)
    pdf.multi_cell(0, 8, f"Powyższą kwotę otrzymałam {payment_method} w wysokości: {currency(float(amounts.get('item_1', 0) or 0))}")

    pdf.ln(8)
    sign_y = pdf.get_y()
    pdf.set_font("Helvetica", size=11)
    pdf.cell(0, 6, ".............................................................", ln=1)
    pdf.cell(0, 6, "(..........................................................)")
    pdf.set_y(sign_y)
    pdf.set_x(125)
    pdf.cell(0, 6, ".............................................................", ln=1)
    pdf.set_x(125)
    pdf.cell(0, 6, "(..........................................................)")

    pdf.ln(12)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Podpis Zleceniobiorcy", ln=1)
    pdf.ln(2)
    _dotted_line(pdf, "(..........................................................)")

    pdf.ln(10)
    pdf.set_font("Helvetica", size=11)
    pdf.multi_cell(0, 8, f"Przyjęto do zapłaty {payment_method}:")
    pdf.ln(4)
    _dotted_line(pdf, "(..........................................................)")
    pdf.cell(0, 8, "podpis Zleceniodawcy", ln=1)

    pdf.ln(6)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 8, "ZESTAWIENIE WYKONANYCH ZLECEŃ", ln=1)
    pdf.set_font("Helvetica", size=11)
    pdf.multi_cell(0, 8, tasks_description or "-", ln=1)

    output = BytesIO()
    pdf.output(output)
    output.seek(0)
    return output


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        address = request.form.get("address", "").strip()
        identifier = request.form.get("identifier", "").strip()
        if not full_name or not address or not identifier:
            flash("Uzupełnij wszystkie pola pracownika", "error")
        else:
            employees.add(full_name=full_name, address=address, identifier=identifier)
            flash("Pracownik zapisany", "success")
        return redirect(url_for("index"))

    return render_template("index.html", employees=employees.all(), today=date.today())


@app.route("/invoice", methods=["POST"])
def invoice():
    employee_id = request.form.get("employee_id")
    if not employee_id:
        flash("Wybierz pracownika", "error")
        return redirect(url_for("index"))

    employee = employees.get(int(employee_id))
    if not employee:
        flash("Nie znaleziono pracownika", "error")
        return redirect(url_for("index"))

    number = request.form.get("number", "1/2024")
    issue_date = request.form.get("issue_date", date.today().isoformat())
    period_start = request.form.get("period_start", issue_date)
    period_end = request.form.get("period_end", issue_date)
    payment_method = request.form.get("payment_method", "Przelewem")
    tasks_description = request.form.get("tasks_description", "")

    amounts = {key: request.form.get(key, "0") for key in request.form if key.startswith("item_")}

    pdf_buffer = build_invoice(
        employee=employee,
        number=number,
        issue_date=date.fromisoformat(issue_date),
        period_start=date.fromisoformat(period_start),
        period_end=date.fromisoformat(period_end),
        tasks_description=tasks_description,
        amounts=amounts,
        payment_method=payment_method,
    )

    filename = f"rachunek_{number.replace('/', '_')}.pdf"
    return send_file(pdf_buffer, as_attachment=True, download_name=filename, mimetype="application/pdf")


if __name__ == "__main__":
    app.run(debug=True)
