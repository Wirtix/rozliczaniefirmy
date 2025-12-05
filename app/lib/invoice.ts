import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
import { Employee, findEmployee } from './employees';
import { DEJAVU_SANS, DEJAVU_SANS_BOLD } from './fonts';

export type InvoicePayload = {
  employeeId: number;
  number: string;
  issueDate: string;
  periodStart: string;
  periodEnd: string;
  paymentMethod: string;
  tasksDescription: string;
  amounts: Record<string, number>;
};

const COMPANY = {
  city: 'Czarna Białostocka',
  name: 'Koreptycje na już Oskar Skutnik',
  address: 'Traugutta 3a m 18\n16-020 Czarna Białostocka',
  regon: '540581214',
  nip: '9661385512',
  phone: '531 567 262',
};

function currency(value: number) {
  return value
    .toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\s/g, ' ');
}

const getFontBuffer = (source: string) => Buffer.from(source, 'base64');

function headerRow(doc: PDFDocument, label: string, value: string) {
  doc.font('Body').fontSize(11).text(label, { continued: true, width: 200 });
  doc.font('BodyBold').text(value);
}

function dottedLine(doc: PDFDocument, label: string, width = 420) {
  const y = doc.y + 10;
  doc
    .moveTo(doc.x, y)
    .lineTo(doc.x + width, y)
    .dash(1, { space: 3 })
    .stroke();
  doc.undash();
  doc.moveDown(0.4);
  doc.text(label, { lineBreak: true });
}

export async function buildInvoice(payload: InvoicePayload): Promise<Buffer> {
  const employee: Employee | undefined = await findEmployee(payload.employeeId);
  if (!employee) {
    throw new Error('Pracownik nie istnieje');
  }

  const doc = new PDFDocument({ margin: 48, size: 'A4' });
  doc.registerFont('Body', getFontBuffer(DEJAVU_SANS));
  doc.registerFont('BodyBold', getFontBuffer(DEJAVU_SANS_BOLD));

  const buffers: Uint8Array[] = [];
  doc.on('data', buffers.push.bind(buffers));

  const issueDate = dayjs(payload.issueDate);
  const periodStart = dayjs(payload.periodStart);
  const periodEnd = dayjs(payload.periodEnd);

  doc.font('Body').fontSize(11).text(`${COMPANY.city}, dn. ${issueDate.format('DD.MM.YYYY')}`, {
    align: 'right',
  });

  doc.moveDown(0.6);
  doc.font('BodyBold').fontSize(16).text('RACHUNEK DO UMOWY ZLECENIE', { align: 'center' });
  doc.font('Body').fontSize(11).text(`nr ${payload.number} z dnia ${issueDate.format('DD.MM.YYYY')}`, {
    align: 'center',
  });

  doc.moveDown();
  doc.font('BodyBold').fontSize(13).text('Zleceniobiorca:');
  doc.moveDown(0.2);
  headerRow(doc, 'Zleceniobiorca:', employee.full_name);
  headerRow(doc, 'Adres:', employee.address);
  headerRow(doc, 'PESEL/Nr dok. tożsamości:', employee.identifier);

  doc.moveDown(0.4);
  doc.font('BodyBold').fontSize(13).text('Zleceniodawca:');
  doc.moveDown(0.2);
  headerRow(doc, 'Nazwa:', COMPANY.name);
  headerRow(doc, 'Adres:', COMPANY.address);
  headerRow(doc, 'REGON:', COMPANY.regon);
  headerRow(doc, 'NIP:', COMPANY.nip);
  headerRow(doc, 'Telefon:', COMPANY.phone);

  doc.moveDown(0.6);
  doc
    .font('Body')
    .fontSize(11)
    .text(
      `Za wykonanie prac zgodnie z umową zlecenie nr ${payload.number} z dn. ${issueDate.format('DD.MM.YYYY')} ` +
        `w okresie od ${periodStart.format('DD.MM.YYYY')} do ${periodEnd.format('DD.MM.YYYY')} płatnym do ${issueDate.format(
          'DD.MM.YYYY',
        )}.`,
      { lineGap: 2 },
    );

  doc.moveDown(0.5);
  doc.font('BodyBold').fontSize(13).text('ROZLICZENIE');
  doc.moveDown(0.2);
  doc.font('Body').fontSize(11);

  const labels = [
    'Kwota brutto:',
    'Wynagrodzenie dodatkowe za przejazd służbowy:',
    'Wynagrodzenie dodatkowe (np. koszty zamówienia):',
    'Koszty uzyskania przychodu:',
    'Składka na ubezpieczenie zdrowotne:',
    'Zaliczka na podatek dochodowy:',
    'Wypłacono do Rąk własnych',
  ];

  labels.forEach((label, index) => {
    const value = payload.amounts[`item_${index + 1}`] ?? 0;
    doc.font('Body').text(`${index + 1}.`, { continued: true, width: 20 });
    doc.text(label, { continued: true, width: 320 });
    doc.font('BodyBold').text(currency(Number(value)));
  });

  doc.moveDown(0.5);
  doc.font('Body').text(
    `Powyższą kwotę otrzymałam ${payload.paymentMethod.toLowerCase()} w wysokości: ${currency(
      Number(payload.amounts['item_1'] ?? 0),
    )}`,
  );

  doc.moveDown();
  const baseY = doc.y;
  dottedLine(doc, '(..........................................................)', 220);
  doc.font('Body').text('Podpis Zleceniobiorcy', baseY + 16, { continued: false });

  doc.moveTo(360, baseY).lineTo(360 + 220, baseY).dash(1, { space: 3 }).stroke();
  doc.undash();
  doc.text('(..........................................................)', 360, baseY + 12);
  doc.text('podpis Zleceniodawcy', 360, baseY + 24);

  doc.moveDown(2.2);
  doc.font('BodyBold').text('ZESTAWIENIE WYKONANYCH ZLECEŃ');
  doc.font('Body').text(payload.tasksDescription || '-', { lineGap: 2 });

  doc.end();
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(buffers.map((b) => Buffer.from(b)))));
    doc.on('error', reject);
  });
  return buffer;
}
