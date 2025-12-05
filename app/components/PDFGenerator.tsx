"use client";

import { Document, Font, Page, PDFDownloadLink, StyleSheet, Text, View } from "@react-pdf/renderer";
import { COMPANY_INFO } from "../lib/company";
import { amountToWords, formatCurrency } from "../lib/format";
import { InvoiceInput, Worker } from "../lib/types";

// Avoid double registration during Fast Refresh
let fontRegistered = false;

function ensureFontRegistered() {
  if (fontRegistered) return;

  Font.register({
    family: "NotoSans",
    fonts: [
      {
        // Use jsDelivr mirror of googlefonts/noto-fonts to prevent raw.githubusercontent 404/403 errors
        src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
        fontWeight: 400,
        format: "truetype",
      },
      {
        src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Bold.ttf",
        fontWeight: 700,
        format: "truetype",
      },
    ],
  });

  fontRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "NotoSans",
    color: "#1f2937",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  section: { marginBottom: 12 },
  heading: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginVertical: 6 },
  subheading: { fontSize: 11, textAlign: "center", marginBottom: 12 },
  label: { fontSize: 10, marginBottom: 2 },
  block: { marginBottom: 12 },
  paragraph: { fontSize: 10, lineHeight: 1.5 },
  dottedRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  dottedLine: { flex: 1, borderBottomWidth: 1, borderStyle: "dotted", marginHorizontal: 6, borderColor: "#1f2937" },
  value: { width: 100, textAlign: "right", fontWeight: "bold" },
  signatures: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  signBox: { alignItems: "center", width: "48%" },
  signLine: { width: "100%", borderBottomWidth: 1, borderColor: "#1f2937", marginBottom: 6, height: 16 },
  titleRight: { fontSize: 10, textAlign: "right" },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 4 },
});

function InvoiceDocument({ worker, invoice, grossTotal }: { worker?: Worker; invoice: InvoiceInput; grossTotal: number }) {
  ensureFontRegistered();
  const words = amountToWords(grossTotal || 0);
  const city = COMPANY_INFO.city || COMPANY_INFO.addressLine2;
  const issueDate = invoice.issueDate || "...............";
  const grossValue = formatCurrency(grossTotal);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 }}>
          <Text style={styles.titleRight}>
            {city}, dn. {issueDate}
          </Text>
        </View>

        <Text style={styles.heading}>RACHUNEK DO UMOWY ZLECENIE</Text>
        <Text style={styles.subheading}>nr {invoice.invoiceNumber || ".........."} z dnia {issueDate} r.</Text>

        <View style={styles.block}>
          <Text style={styles.label}>Zleceniodawca:</Text>
          <Text style={{ fontWeight: "bold" }}>{COMPANY_INFO.name}</Text>
          <Text>{COMPANY_INFO.addressLine1}</Text>
          <Text>{COMPANY_INFO.addressLine2}</Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Zleceniobiorca: {worker?.fullName || "........................................................"}</Text>
          <Text>{worker?.address || "..........................................................................................."}</Text>
          <Text>PESEL: {worker?.pesel || "................................"}</Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.paragraph}>
            za wykonanie prac zgodnie z umową nr: {invoice.invoiceNumber || "........"} w okresie od {invoice.period || "........"}
          </Text>
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={[styles.sectionTitle, { textAlign: "center" }]}>ROZLICZENIE</Text>
          <View style={styles.dottedRow}>
            <Text>1. Kwota brutto:</Text>
            <View style={styles.dottedLine} />
            <Text style={styles.value}>{grossValue}</Text>
          </View>
          <View style={styles.dottedRow}>
            <Text>2. Ubezpieczenie społeczne:</Text>
            <View style={styles.dottedLine} />
            <Text style={styles.value}>{formatCurrency(0)}</Text>
          </View>
          <View style={styles.dottedRow}>
            <Text>3. Ubezpieczenie zdrowotne:</Text>
            <View style={styles.dottedLine} />
            <Text style={styles.value}>{formatCurrency(0)}</Text>
          </View>
          <View style={styles.dottedRow}>
            <Text>4. Koszty uzyskania przychodu:</Text>
            <View style={styles.dottedLine} />
            <Text style={styles.value}>{formatCurrency(0)}</Text>
          </View>
          <View style={styles.dottedRow}>
            <Text>5. Podstawa opodatkowania:</Text>
            <View style={styles.dottedLine} />
            <Text style={styles.value}>{formatCurrency(0)}</Text>
          </View>
          <View style={styles.dottedRow}>
            <Text>6. Potrącenia:</Text>
            <View style={styles.dottedLine} />
            <Text style={styles.value}>{formatCurrency(0)}</Text>
          </View>
          <View style={styles.dottedRow}>
            <Text>7. Do wypłaty:</Text>
            <View style={styles.dottedLine} />
            <Text style={[styles.value, { fontWeight: "bold" }]}>{grossValue}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, marginBottom: 4 }}>Słownie: {words}</Text>
          <View style={styles.dottedLine} />
        </View>

        <View style={styles.signatures}>
          <View style={styles.signBox}>
            <View style={styles.signLine} />
            <Text style={{ fontSize: 10 }}>Zleceniobiorca</Text>
          </View>
          <View style={styles.signBox}>
            <View style={styles.signLine} />
            <Text style={{ fontSize: 10 }}>Zleceniodawca</Text>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.paragraph}>Upoważniony do odbioru wynagrodzenia przelewem:</Text>
          <View style={styles.dottedLine} />
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
      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {({ loading, error }) => {
        if (error) return "Błąd generowania";
        if (loading) return "Przygotowywanie...";
        return "Pobierz PDF";
      }}
    </PDFDownloadLink>
  );
}
