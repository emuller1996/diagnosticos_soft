import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DEFAULTS = {
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
  margin: 15,
  headerFill: [30, 64, 175],
  headerText: [255, 255, 255],
  mutedText: [107, 114, 128],
  borderColor: [209, 213, 219],
};

export class PdfDocument {
  constructor(options = {}) {
    const config = { ...DEFAULTS, ...options };
    this.doc = new jsPDF({
      orientation: config.orientation,
      unit: config.unit,
      format: config.format,
    });
    this.config = config;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.marginX = config.margin;
    this.marginY = config.margin;
    this.headerSpace = config.headerSpace || 0;
    this.cursorY = this.marginY + this.headerSpace;
    this.contentWidth = this.pageWidth - 2 * this.marginX;
  }

  ensureSpace(needed) {
    if (this.cursorY + needed > this.pageHeight - this.marginY) {
      this.doc.addPage();
      this.cursorY = this.marginY + this.headerSpace;
      return true;
    }
    return false;
  }

  spacer(height = 3) {
    this.ensureSpace(height);
    this.cursorY += height;
  }

  title(text) {
    this.ensureSpace(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(0);
    this.doc.text(text, this.pageWidth / 2, this.cursorY + 6, { align: 'center' });
    this.cursorY += 9;
  }

  subtitle(text, { size = 9, color } = {}) {
    this.ensureSpace(6);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(size);
    this.doc.setTextColor(...(color || this.config.mutedText));
    this.doc.text(text, this.pageWidth / 2, this.cursorY + 4, { align: 'center' });
    this.cursorY += 5;
    this.doc.setTextColor(0);
  }

  sectionHeader(text) {
    this.ensureSpace(10);
    this.doc.setFillColor(...this.config.headerFill);
    this.doc.rect(this.marginX, this.cursorY, this.contentWidth, 7, 'F');
    this.doc.setTextColor(...this.config.headerText);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.text(text, this.marginX + 2, this.cursorY + 4.8);
    this.cursorY += 8;
    this.doc.setTextColor(0);
    this.spacer(2);
  }

  label(text, x, y) {
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(0);
    this.doc.text(text, x, y);
  }

  value(text, x, y) {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(0);
    this.doc.text(text ?? '', x, y);
  }

  fieldRow(fields) {
    if (!fields || fields.length === 0) return;
    const rowHeight = 12;
    this.ensureSpace(rowHeight);
    const colWidth = this.contentWidth / fields.length;
    fields.forEach((field, i) => {
      const x = this.marginX + i * colWidth;
      this.label(field.label || '', x, this.cursorY + 3);
      this.value(String(field.value ?? ''), x, this.cursorY + 8);
      this.doc.setDrawColor(...this.config.borderColor);
      this.doc.line(x, this.cursorY + 9, x + colWidth - 3, this.cursorY + 9);
    });
    this.cursorY += rowHeight;
  }

  checkboxList(items, { title, columns } = {}) {
    if (title) {
      this.ensureSpace(6);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(0);
      this.doc.text(title, this.marginX, this.cursorY + 3);
      this.cursorY += 5;
    }

    const lineHeight = 5.5;
    const boxSize = 3;

    if (columns && columns > 0) {
      const colWidth = this.contentWidth / columns;
      const rows = Math.ceil(items.length / columns);
      this.ensureSpace(rows * lineHeight);
      items.forEach((item, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const x = this.marginX + col * colWidth;
        const y = this.cursorY + row * lineHeight;
        this._drawCheckbox(item, x, y, boxSize);
      });
      this.cursorY += rows * lineHeight;
      return;
    }

    let x = this.marginX;
    this.ensureSpace(lineHeight);
    items.forEach((item) => {
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8.5);
      const textWidth = this.doc.getTextWidth(item.label);
      const entryWidth = boxSize + 1.5 + textWidth + 4;
      if (x + entryWidth > this.pageWidth - this.marginX) {
        this.cursorY += lineHeight;
        this.ensureSpace(lineHeight);
        x = this.marginX;
      }
      this._drawCheckbox(item, x, this.cursorY, boxSize);
      x += entryWidth;
    });
    this.cursorY += lineHeight;
  }

  _drawCheckbox(item, x, y, boxSize) {
    this.doc.setDrawColor(0);
    this.doc.setLineWidth(0.2);
    this.doc.rect(x, y - boxSize + 0.5, boxSize, boxSize);
    if (item.checked) {
      this.doc.setFillColor(0);
      this.doc.rect(x + 0.6, y - boxSize + 1.1, boxSize - 1.2, boxSize - 1.2, 'F');
    }
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(0);
    this.doc.text(item.label, x + boxSize + 1.5, y);
  }

  table(columns, rows, options = {}) {
    autoTable(this.doc, {
      startY: this.cursorY,
      margin: { left: this.marginX, right: this.marginX },
      head: [columns],
      body: rows,
      headStyles: {
        fillColor: this.config.headerFill,
        textColor: this.config.headerText,
        fontSize: 9,
      },
      styles: { fontSize: 9, cellPadding: 2 },
      theme: 'grid',
      ...options,
    });
    this.cursorY = this.doc.lastAutoTable.finalY + 3;
  }

  save(filename) {
    this.doc.save(filename);
  }

  preview() {
    return window.open(this.doc.output('bloburl'), '_blank');
  }

  getBlob() {
    return this.doc.output('blob');
  }
}

export default PdfDocument;
