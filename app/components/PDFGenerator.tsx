"use client";

import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { COMPANY_INFO } from "../lib/company";
import { amountToWords, formatCurrency } from "../lib/format";
import { InvoiceInput, Worker } from "../lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  section: { marginBottom: 12 },
  box: { border: 1, borderColor: "#1f2937", padding: 8, borderRadius: 4 },
  heading: { fontSize: 14, fontWeight: "bold", color: "#0f172a" },
  title: { fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1 },
  label: { fontSize: 9, color: "#475569", marginBottom: 2 },
  tableRow: { flexDirection: "row" },
  cell: { border: 1, borderColor: "#1f2937", padding: 6, fontSize: 9 },
});

function InvoiceDocument({ worker, invoice, grossTotal }: { worker?: Worker; invoice: InvoiceInput; grossTotal: number }) {
  const words = amountToWords(grossTotal || 0);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.section, styles.row]}>
          <View>
            <Text style={styles.title}>Rachunek do umowy zlecenie</Text>
            <Text style={styles.heading}>{invoice.invoiceNumber}</Text>
            <Text>Data wystawienia: {invoice.issueDate}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Kwota brutto</Text>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>{formatCurrency(grossTotal)}</Text>
            <Text style={{ fontSize: 8, color: "#6b7280", maxWidth: 200, textAlign: "right" }}>
              (słownie: {words})
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.row, { gap: 12 }]}>
          <View style={[styles.box, { flex: 1 }]}>
            <Text style={styles.title}>Zleceniodawca</Text>
            <Text style={{ fontWeight: "bold" }}>{COMPANY_INFO.name}</Text>
            <Text>{COMPANY_INFO.addressLine1}</Text>
            <Text>{COMPANY_INFO.addressLine2}</Text>
          </View>
          <View style={[styles.box, { flex: 1 }]}>
            <Text style={styles.title}>Zleceniobiorca</Text>
            <Text style={{ fontWeight: "bold" }}>{worker?.fullName || "Wybierz pracownika"}</Text>
            <Text>{worker?.address}</Text>
            <Text>PESEL: {worker?.pesel}</Text>
          </View>
        </View>

        <View style={[styles.section]}>
          <View style={[styles.tableRow]}>
            <Text style={[styles.cell, { flex: 6, backgroundColor: "#e2e8f0", fontWeight: "bold" }]}>Tytuł</Text>
            <Text style={[styles.cell, { flex: 2, backgroundColor: "#e2e8f0", fontWeight: "bold", textAlign: "right" }]}>Liczba godzin</Text>
            <Text style={[styles.cell, { flex: 2, backgroundColor: "#e2e8f0", fontWeight: "bold", textAlign: "right" }]}>Stawka</Text>
            <Text style={[styles.cell, { flex: 2, backgroundColor: "#e2e8f0", fontWeight: "bold", textAlign: "right" }]}>Kwota</Text>
          </View>
          <View style={[styles.tableRow]}>
            <Text style={[styles.cell, { flex: 6 }]}>
              {invoice.period || "Okres zlecenia"}
              {invoice.description ? `\n${invoice.description}` : ""}
            </Text>
            <Text style={[styles.cell, { flex: 2, textAlign: "right" }]}>{invoice.hours ? `${invoice.hours} h` : "-"}</Text>
            <Text style={[styles.cell, { flex: 2, textAlign: "right" }]}>
              {invoice.rate ? formatCurrency(invoice.rate) : "-"}
            </Text>
            <Text style={[styles.cell, { flex: 2, textAlign: "right", fontWeight: "bold" }]}>{formatCurrency(grossTotal)}</Text>
          </View>
          <View style={[styles.tableRow]}>
            <Text style={[styles.cell, { flex: 10, textAlign: "right", fontWeight: "bold", backgroundColor: "#f8fafc" }]}>Razem do wypłaty</Text>
            <Text style={[styles.cell, { flex: 2, textAlign: "right", fontWeight: "bold", backgroundColor: "#f8fafc" }]}>{formatCurrency(grossTotal)}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.row, { alignItems: "flex-start", gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Kwota słownie</Text>
            <View style={[styles.box, { marginTop: 6 }]}>
              <Text style={{ fontWeight: "bold" }}>{words}</Text>
            </View>
            <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 4 }}>
              Kwota obejmuje wynagrodzenie brutto za wskazany okres zlecenia.
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.row, { justifyContent: "space-around", marginTop: 32 }]}>
              <View style={{ alignItems: "center", gap: 6, width: "45%" }}>
                <View style={{ height: 24, borderBottomWidth: 1, borderColor: "#cbd5e1", width: "100%" }} />
                <Text style={{ fontSize: 9 }}>Zleceniobiorca</Text>
              </View>
              <View style={{ alignItems: "center", gap: 6, width: "45%" }}>
                <View style={{ height: 24, borderBottomWidth: 1, borderColor: "#cbd5e1", width: "100%" }} />
                <Text style={{ fontSize: 9 }}>Zleceniodawca</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export function PDFGenerator({ worker, invoice, grossTotal }: { worker?: Worker; invoice: InvoiceInput; grossTotal: number }) {
  return (
    <PDFDownloadLink
      document={<InvoiceDocument worker={worker} invoice={invoice} grossTotal={grossTotal} />}
      fileName={`${invoice.invoiceNumber || "rachunek"}.pdf`}
      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-slate-800"
    >
      Pobierz PDF
    </PDFDownloadLink>
  );
}
