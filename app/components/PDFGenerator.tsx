"use client";

import { BlobProvider, Document, Font, Image, Page, PDFDownloadLink, StyleSheet, Text, View } from "@react-pdf/renderer";
import { COMPANY_INFO } from "../lib/company";
import { amountToWords, formatCurrency, formatDateTime, wrapSignatureId } from "../lib/format";
import { persistInvoiceRecord } from "../lib/storage";
import { InvoiceInput, SignatureInfo, Worker } from "../lib/types";

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

function createRecordId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `inv-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitizeFileSegment(value: string) {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-_.]/gu, "");
}

function buildInvoiceFileName(invoice: InvoiceInput, worker?: Worker) {
  const baseName = sanitizeFileSegment(invoice.invoiceNumber || "rachunek");

  const monthNumber = (() => {
    if (invoice.periodMode === "month" && invoice.periodMonth) {
      return invoice.periodMonth.split("-")[1];
    }
    if (invoice.periodFrom) {
      return invoice.periodFrom.split("-")[1];
    }
    if (invoice.issueDate) {
      return invoice.issueDate.split("-")[1];
    }
    return "miesiac";
  })();

  const tutorName = sanitizeFileSegment(worker?.fullName || "bez-korepetytora");

  return `${baseName}-${monthNumber}-${tutorName}.pdf`;
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
  logo: { width: 120, marginBottom: 8 },
  signatureStamp: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#9ca3af",
    padding: 6,
    borderRadius: 4,
    marginTop: 6,
    width: "100%",
    backgroundColor: "#f8fafc",
  },
  signatureLabel: { fontSize: 10, fontWeight: "bold", marginBottom: 2 },
  signatureMeta: { fontSize: 9, lineHeight: 1.4, wordBreak: "break-all" },
  signatureIdLabel: { fontSize: 9, marginTop: 2, marginBottom: 2, fontWeight: "bold" },
  signatureIdBox: {
    fontSize: 8,
    lineHeight: 1.35,
    wordBreak: "break-word",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1f2937",
    letterSpacing: 0.2,
  },
});

const paymentLabels: Record<string, string> = {
  transfer: "Forma płatności: Przelew",
  cash: "Forma płatności: Gotówka",
  mixed: "Forma płatności: Przelew / Gotówka",
};

export function InvoiceDocument({
  worker,
  invoice,
  grossTotal,
  signature,
}: {
  worker?: Worker;
  invoice: InvoiceInput;
  grossTotal: number;
  signature: SignatureInfo;
}) {
  ensureFontRegistered();
  const words = amountToWords(grossTotal || 0);
  const city = COMPANY_INFO.city || COMPANY_INFO.addressLine2;
  const issueDate = invoice.issueDate || "...............";
  const grossValue = formatCurrency(grossTotal);
  const signedAt = formatDateTime(new Date(signature.signedAtISO));
  const signatureIdWrapped = wrapSignatureId(signature.signatureId);

  // Pobierz odpowiednią etykietę dla PDF, domyślnie 'Przelew'
  const paymentLabel = paymentLabels[invoice.paymentMethod || "transfer"] || paymentLabels["transfer"];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          {invoice.logoDataUrl ? <Image style={styles.logo} src={invoice.logoDataUrl} /> : <View />}
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
          <Text>{worker?.pesel || "................................"}</Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.paragraph}>
            za wykonanie prac zgodnie z umową nr: {worker?.contractNumber || "........"} z dnia {worker?.contractDate || "......."} w okresie
            od {invoice.period || "........"}
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
            <View style={styles.signatureStamp}>
              <Text style={styles.signatureLabel}>Podpisano elektronicznie</Text>
              <Text style={styles.signatureMeta}>Przez: {signature.signerName}</Text>
              <Text style={styles.signatureIdLabel}>ID podpisu</Text>
              <Text style={styles.signatureIdBox} wrap>
                {signatureIdWrapped}
              </Text>
              <Text style={styles.signatureMeta}>Data: {signedAt}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          {/* Użycie dynamicznego tekstu metody płatności */}
          <Text style={styles.paragraph}>{paymentLabel}</Text>
          <View style={styles.dottedLine} />
        </View>
      </Page>
    </Document>
  );
}

export function PDFGenerator({
  worker,
  invoice,
  grossTotal,
  signature,
}: {
  worker?: Worker;
  invoice: InvoiceInput;
  grossTotal: number;
  signature: SignatureInfo | null;
}) {
  const handleSave = () => {
    if (!signature) return;
    persistInvoiceRecord({
      id: createRecordId(),
      createdAt: new Date().toISOString(),
      invoice,
      worker,
      grossTotal,
      signature,
    });
  };

  if (!signature) {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-300 text-white font-semibold shadow-sm disabled:opacity-70"
      >
        Generowanie podpisu...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<InvoiceDocument worker={worker} invoice={invoice} grossTotal={grossTotal} signature={signature} />}
      fileName={buildInvoiceFileName(invoice, worker)}
      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
      onClick={handleSave}
    >
      {({ loading, error }) => {
        if (error) return "Błąd generowania";
        if (loading) return "Przygotowywanie...";
        return "Pobierz PDF";
      }}
    </PDFDownloadLink>
  );
}

export function PDFPreview({
  worker,
  invoice,
  grossTotal,
  signature,
}: {
  worker?: Worker;
  invoice: InvoiceInput;
  grossTotal: number;
  signature: SignatureInfo | null;
}) {
  if (!signature) {
    return (
      <div className="card p-6 text-sm text-slate-700">
        <p>Trwa przygotowywanie podpisu do podglądu PDF...</p>
      </div>
    );
  }

  return (
    <BlobProvider document={<InvoiceDocument worker={worker} invoice={invoice} grossTotal={grossTotal} signature={signature} />}>
      {({ url, loading, error }) => {
        if (error) {
          return (
            <div className="card p-6 text-sm text-red-700">
              <p>Nie udało się przygotować podglądu PDF.</p>
            </div>
          );
        }

        if (loading || !url) {
          return (
            <div className="card p-6 text-sm text-slate-700">
              <p>Ładowanie podglądu PDF...</p>
            </div>
          );
        }

        return (
          <div className="card overflow-hidden border border-slate-200 bg-white shadow-sm">
            <iframe
              src={url}
              title="Podgląd wygenerowanego PDF"
              className="h-[1100px] w-full border-0"
            />
          </div>
        );
      }}
    </BlobProvider>
  );
}