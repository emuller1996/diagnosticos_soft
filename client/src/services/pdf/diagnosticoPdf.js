import PdfDocument from './PdfDocument';
import { resolveStaticUrl } from '../apiClient';
import logoColombia from '../../assets/logo-colombia.png';
import logoVivienda from '../../assets/logo-vivienda.png';

const TIPOS_ACTIVIDAD = ['Servicios', 'Comercio', 'Artesanía', 'Turismo', 'Agropecuaria', 'Otro'];
const NIVELES_EDUCATIVOS = ['Primaria', 'Secundaria', 'Técnico', 'Universitario', 'Postgrado', 'Ninguno'];
const TIPOS_TENENCIA = [
  'Certificado de tradición y libertad',
  'Acto administrativo de adjudicación',
  'Certificado de concejo comunitario',
  'Fallo o sentencia judicial',
  'Certificado de resguardo indígena',
  'Certificado de sana posesión',
  'Otro',
];
const CAUSAS_NO_CUMPLE = [
  'Zona de reserva natural',
  'Reserva obra pública',
  'Franja de vía',
  'Parques nacionales',
  'Alto riesgo no mitigable',
  'Ronda de cuerpo de agua',
  'Redes de alta tensión',
  'Riesgo de inundación',
  'Otro',
];

const FUENTES_AGUA = [
  'Acueducto convencional',
  'Acueducto no convencional',
  'Aljibe',
  'Cuerpo superficial de agua',
  'Agua lluvia',
  'Vehículo cisterna',
  'Método alternativo',
  'Otro',
];

const TIPOS_AGUAS_RESIDUALES = [
  'Red de alcantarillado convencional',
  'Sistema séptico',
  'Pozo de absorción',
  'Otro',
  'Ninguno',
];

const TIPOS_ENERGIA = [
  'Conexión a red de energía eléctrica',
  'Fuente propia de energía',
  'Otro',
  'Ninguno',
];

const PREMISAS_DIBUJO = [
  'Linderos del predio',
  'Acceso principal del predio',
  'Zona de implantación',
  'Puntos cardinales (Norte)',
  'Vivienda existente (Mejoramiento)',
  'Acceso a la vivienda (Mejoramiento)',
  'Cotas generales predio',
  'Cotas generales vivienda',
  'Cotas zona de implantación',
];

const HEADER_TOP = 8;
const HEADER_HEIGHT = 38;

const drawPageHeader = (doc, data, pageNum) => {
  const meta = data.metadata || {};
  const x0 = doc.marginX;
  const w = doc.contentWidth;

  // "Hoja N" arriba a la derecha
  doc.doc.setFont('helvetica', 'normal');
  doc.doc.setFontSize(8);
  doc.doc.setTextColor(100);
  doc.doc.text(`Hoja ${pageNum}`, doc.pageWidth - doc.marginX, 6, { align: 'right' });
  doc.doc.setTextColor(0);

  // Recuadro del header
  doc.doc.setDrawColor(180);
  doc.doc.setLineWidth(0.2);
  doc.doc.rect(x0, HEADER_TOP, w, HEADER_HEIGHT - HEADER_TOP);

  // Logos
  const logoW = 22;
  const logoH = 18;
  if (data._logoColombiaDataUrl) {
    try {
      doc.doc.addImage(data._logoColombiaDataUrl, 'PNG', x0 + 2, HEADER_TOP + 2, logoW, logoH);
    } catch (err) {
      console.warn('logo Colombia:', err);
    }
  }
  if (data._logoViviendaDataUrl) {
    try {
      doc.doc.addImage(data._logoViviendaDataUrl, 'PNG', x0 + w - logoW - 2, HEADER_TOP + 2, logoW, logoH);
    } catch (err) {
      console.warn('logo Vivienda:', err);
    }
  }

  // Título centrado
  const cx = doc.pageWidth / 2;
  doc.doc.setFont('helvetica', 'bold');
  doc.doc.setFontSize(11);
  doc.doc.text('DIAGNÓSTICO INTEGRAL', cx, HEADER_TOP + 5, { align: 'center' });
  doc.doc.setFontSize(9);
  doc.doc.text('PROCESO: GESTIÓN A LA POLÍTICA DE VIVIENDA', cx, HEADER_TOP + 9.5, { align: 'center' });
  doc.doc.setFont('helvetica', 'normal');
  doc.doc.setFontSize(7);
  doc.doc.setTextColor(100);
  doc.doc.text('Versión: 4.0 | Fecha: 07/09/2023 | Código: GPV-F-73', cx, HEADER_TOP + 13, { align: 'center' });
  doc.doc.setTextColor(0);

  // Metadata: 3 columnas (Fecha Diligenciamiento, Consecutivo, Fecha Suscripción)
  const metaTop = HEADER_TOP + 18;
  const metaX = x0 + logoW + 4;
  const metaW = w - 2 * (logoW + 4);
  const colW = metaW / 3;
  const writeMeta = (label, value, fx) => {
    doc.doc.setFont('helvetica', 'bold');
    doc.doc.setFontSize(7);
    doc.doc.text(label, fx, metaTop);
    doc.doc.setFont('helvetica', 'normal');
    doc.doc.setFontSize(9);
    doc.doc.text(String(value ?? ''), fx, metaTop + 5);
    doc.doc.setDrawColor(200);
    doc.doc.line(fx, metaTop + 6, fx + colW - 3, metaTop + 6);
  };
  writeMeta('FECHA DE DILIGENCIAMIENTO', meta.fechaDiligenciamiento, metaX);
  writeMeta('CONSECUTIVO HOGAR', meta.consecutivoHogar, metaX + colW);
  writeMeta('FECHA DE SUSCRIPCIÓN', meta.fechaSuscripcion, metaX + colW * 2);
};

const renderTitular = (doc, data) => {
  const t = data.titular || {};
  doc.sectionHeader('A. DATOS DEL TITULAR DEL HOGAR');
  doc.fieldRow([
    { label: 'A) NOMBRE(S)', value: t.nombre },
    { label: 'E) DEPARTAMENTO', value: t.departamento },
  ]);
  doc.fieldRow([
    { label: 'B) APELLIDO(S)', value: t.apellido },
    { label: 'F) MUNICIPIO', value: t.municipio },
  ]);
  doc.fieldRow([
    { label: 'C) NO. DOCUMENTO', value: t.documento },
    { label: 'G) VEREDA', value: t.vereda },
  ]);
  doc.fieldRow([
    { label: 'D) CEL. CONTACTO', value: t.celular },
    { label: 'H) OTRO', value: t.otro },
  ]);
};

const renderModalidad = (doc, data) => {
  const modalidad = data.modalidad?.type;
  doc.sectionHeader('DATOS DEL SUBSIDIO - MODALIDAD');
  doc.checkboxList([
    { label: 'Vivienda Nueva', checked: modalidad === 'vivienda nueva' },
    { label: 'Mejoramiento', checked: modalidad === 'mejoramiento' },
  ]);
};

const renderCondicionHogar = (doc, data) => {
  const actividad = data.actividadProductiva || {};
  doc.sectionHeader('B. CONDICIÓN DEL HOGAR');

  doc.checkboxList(
    [
      { label: 'SI', checked: actividad.tiene === true },
      { label: 'No', checked: actividad.tiene === false },
    ],
    { title: 'a) ¿En la vivienda se desarrolla alguna actividad productiva?' }
  );

  doc.checkboxList(
    TIPOS_ACTIVIDAD.map((t) => ({ label: t, checked: actividad.tipo === t })),
    { title: 'Tipo de actividad:', columns: 3 }
  );

  if (actividad.descripcion) {
    doc.fieldRow([{ label: 'DESCRIBA (OTRO):', value: actividad.descripcion }]);
  }

  doc.checkboxList(
    NIVELES_EDUCATIVOS.map((n) => ({ label: n, checked: data.nivelEducativo === n })),
    { title: 'b) ¿Cuál es el nivel educativo alcanzado por el Jefe de Hogar?', columns: 3 }
  );

  doc.spacer(2);
  doc.fieldRow([
    { label: 'C) NO. PERSONAS', value: data.numeroPersonas },
    { label: 'D) NO. HOGARES', value: data.numeroHogares },
    { label: 'E) HABITACIONES', value: data.numeroHabitaciones },
    { label: 'F) CUARTOS', value: data.numeroCuartos },
  ]);
};

const renderTenencia = (doc, data) => {
  const tenencia = data.tenenciaPredio || {};
  doc.sectionHeader('C. ACREDITACIÓN DE LA TENENCIA DEL PREDIO');
  doc.checkboxList(
    TIPOS_TENENCIA.map((t) => ({ label: t, checked: tenencia.tipo === t })),
    { columns: 2 }
  );
  if (tenencia.tipo === 'Otro') {
    doc.fieldRow([{ label: 'NOMBRE Y/O DESCRIPCIÓN (OTRO):', value: tenencia.otro }]);
  }
};

const renderCondicionesAmbientales = (doc, data) => {
  const condiciones = data.condicionesAmbientales || [];
  doc.sectionHeader('D. CONDICIONES AMBIENTALES Y TERRITORIALES DEL PREDIO');

  const rows = condiciones.map((c, i) => [
    `${String.fromCharCode(97 + i)}) ${c.condicion}`,
    c.cumple ? 'X' : '',
    c.cumple ? '' : 'X',
  ]);
  doc.table(['CONDICIÓN', 'CUMPLE', 'NO CUMPLE'], rows, {
    columnStyles: {
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'center', cellWidth: 25 },
    },
  });

  const hasIncumplimiento = condiciones.some((c) => c.cumple === false);
  if (hasIncumplimiento) {
    const causas = data.causasNoCumple || {};
    const selected = causas.causas || [];
    doc.checkboxList(
      CAUSAS_NO_CUMPLE.map((c) => ({ label: c, checked: selected.includes(c) })),
      { title: 'Si el predio "NO CUMPLE", indicar la causa:', columns: 3 }
    );
    if (selected.includes('Otro')) {
      doc.fieldRow([{ label: 'DESCRIPCIÓN CAUSA "OTRO":', value: causas.otro }]);
    }
  }
};

const renderServiciosPublicos = (doc, data) => {
  const servicios = data.serviciosPublicos || {};
  const agua = servicios.abastecimientoAgua || {};
  const residuales = servicios.aguasResiduales || {};
  const energia = servicios.energia || {};
  const fuentesSeleccionadas = agua.fuentes || [];

  doc.sectionHeader('F. DISPONIBILIDAD O ACCESO A SERVICIOS PÚBLICOS');

  doc.subtitle('ABASTECIMIENTO DE AGUA', { size: 9, color: [0, 0, 0] });
  doc.checkboxList(
    [
      { label: 'SI', checked: agua.cuenta === true },
      { label: 'NO', checked: agua.cuenta === false },
    ],
    { title: '¿El predio cuenta con posibilidad de abastecimiento de agua?' }
  );
  doc.checkboxList(
    FUENTES_AGUA.map((f) => ({ label: f, checked: fuentesSeleccionadas.includes(f) })),
    { title: 'Fuente de agua para consumo humano y doméstico:', columns: 3 }
  );
  if (fuentesSeleccionadas.includes('Otro')) {
    doc.fieldRow([{ label: '¿CUÁL? (OTRO):', value: agua.fuenteOtroDescripcion }]);
  }
  doc.spacer(2);

  doc.subtitle('TRATAMIENTO DE AGUAS RESIDUALES', { size: 9, color: [0, 0, 0] });
  doc.checkboxList(
    TIPOS_AGUAS_RESIDUALES.map((t) => ({ label: t, checked: residuales.tipo === t })),
    { title: '¿Con qué tipo de servicio sanitario cuenta el hogar?', columns: 2 }
  );
  if (residuales.tipo === 'Otro') {
    doc.fieldRow([{ label: '¿CUÁL? (OTRO):', value: residuales.otroDescripcion }]);
  }
  doc.spacer(2);

  doc.subtitle('DISPONIBILIDAD O ACCESO A ENERGÍA', { size: 9, color: [0, 0, 0] });
  doc.checkboxList(
    TIPOS_ENERGIA.map((t) => ({ label: t, checked: energia.tipo === t })),
    { title: 'Para las actividades del hogar la energía que utiliza es:', columns: 2 }
  );
  if (energia.tipo === 'Otro') {
    doc.fieldRow([{ label: '¿CUÁL? (OTRO):', value: energia.otroDescripcion }]);
  }
};

const renderLevantamiento = (doc, data) => {
  const lev = data.levantamiento || {};
  const carac = lev.caracteristicas || {};
  const premisas = lev.premisas || [];

  doc.sectionHeader('G. LEVANTAMIENTO (MANO ALZADA)');

  doc.subtitle('PREMISAS DE DIBUJO', { size: 9, color: [0, 0, 0] });
  doc.checkboxList(
    PREMISAS_DIBUJO.map((p, i) => ({
      label: `${String.fromCharCode(97 + i)}) ${p}`,
      checked: premisas.includes(p),
    })),
    { columns: 2 }
  );
  doc.spacer(2);

  doc.subtitle('CARACTERÍSTICAS DEL PREDIO', { size: 9, color: [0, 0, 0] });
  doc.fieldRow([
    { label: 'A) ÁREA ZONA DE INTERVENCIÓN (M²)', value: carac.area },
    { label: 'B) PENDIENTE EN ZONA DE INTERVENCIÓN (%)', value: carac.pendiente },
  ]);
  if (carac.observaciones) {
    doc.fieldRow([{ label: 'OBSERVACIONES DEL LEVANTAMIENTO:', value: carac.observaciones }]);
  }

  if (data._croquisDataUrl) {
    const props = doc.doc.getImageProperties(data._croquisDataUrl);
    const aspect = props.width / props.height;
    const maxW = doc.contentWidth;
    const maxH = 110;
    const minH = 50;
    const subtitleHeight = 6;

    doc.spacer(2);

    let availableForImage = doc.pageHeight - doc.marginY - doc.cursorY - subtitleHeight;
    if (availableForImage < minH) {
      doc.ensureSpace(subtitleHeight + maxH);
      availableForImage = doc.pageHeight - doc.marginY - doc.cursorY - subtitleHeight;
    }

    const effectiveMaxH = Math.min(availableForImage, maxH);
    let w = maxW;
    let h = w / aspect;
    if (h > effectiveMaxH) {
      h = effectiveMaxH;
      w = h * aspect;
    }

    doc.subtitle('CROQUIS / LEVANTAMIENTO', { size: 9, color: [0, 0, 0] });
    const x = doc.marginX + (doc.contentWidth - w) / 2;
    doc.doc.addImage(data._croquisDataUrl, 'WEBP', x, doc.cursorY, w, h);
    doc.cursorY += h;
  }
};

const renderMiembros = (doc, data) => {
  const miembros = data.miembros || [];
  doc.sectionHeader('COMPOSICIÓN DEL HOGAR – MIEMBROS');

  if (miembros.length === 0) {
    doc.subtitle('Sin miembros registrados.', { size: 8 });
    return;
  }

  const rows = miembros.map((m) => [
    m.apellidos || '',
    m.nombres || '',
    m.documento || '',
    m.alteracionMovilidad ? 'X' : '',
    m.ciegoSordo ? 'X' : '',
    m.altNeurologica ? 'X' : '',
    m.condEscaleras ? 'X' : '',
    m.descDiscapacidad || '',
  ]);

  doc.table(
    ['APELLIDOS', 'NOMBRES', 'DOCUMENTO', 'ALT. MOV.', 'CIEGO/SORDO', 'ALT. NEURO.', 'COND. ESCAL.', 'DESC. DISCAP.'],
    rows,
    {
      styles: { fontSize: 7, cellPadding: 1.5 },
      columnStyles: {
        3: { halign: 'center', cellWidth: 14 },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'center', cellWidth: 14 },
        6: { halign: 'center', cellWidth: 16 },
      },
    }
  );
};

const drawSignatureBox = (doc, dataUrl, x, y, w, h) => {
  doc.doc.setDrawColor(150);
  doc.doc.setLineWidth(0.2);
  doc.doc.rect(x, y, w, h);
  if (dataUrl) {
    try {
      const props = doc.doc.getImageProperties(dataUrl);
      const aspect = props.width / props.height;
      let drawW = w - 4;
      let drawH = drawW / aspect;
      if (drawH > h - 4) {
        drawH = h - 4;
        drawW = drawH * aspect;
      }
      const dx = x + (w - drawW) / 2;
      const dy = y + (h - drawH) / 2;
      doc.doc.addImage(dataUrl, 'WEBP', dx, dy, drawW, drawH);
    } catch (err) {
      console.warn('No se pudo embeber la imagen en el PDF:', err);
    }
  }
};

const renderConstanciaVisita = (doc, data) => {
  const constancia = data.constanciaVisita || {};
  const profesional = constancia.profesional || {};
  const titular = data.titular || {};

  doc.sectionHeader('I. CONSTANCIA DE VISITA');

  const colW = doc.contentWidth / 2 - 2;
  const leftX = doc.marginX;
  const rightX = doc.marginX + colW + 4;
  const startY = doc.cursorY;

  doc.doc.setFont('helvetica', 'bold');
  doc.doc.setFontSize(9);
  doc.doc.setFillColor(...doc.config.headerFill);
  doc.doc.rect(leftX, startY, colW, 6, 'F');
  doc.doc.rect(rightX, startY, colW, 6, 'F');
  doc.doc.setTextColor(...doc.config.headerText);
  doc.doc.text('TITULAR DEL HOGAR', leftX + 2, startY + 4);
  doc.doc.text('PROFESIONAL DE DIAGNÓSTICO', rightX + 2, startY + 4);
  doc.doc.setTextColor(0);

  let yLeft = startY + 9;
  let yRight = startY + 9;

  const writeField = (label, value, x, y) => {
    doc.doc.setFont('helvetica', 'bold');
    doc.doc.setFontSize(7.5);
    doc.doc.text(label, x, y);
    doc.doc.setFont('helvetica', 'normal');
    doc.doc.setFontSize(10);
    doc.doc.text(String(value ?? ''), x, y + 4.5);
    doc.doc.setDrawColor(200);
    doc.doc.line(x, y + 5.5, x + colW - 4, y + 5.5);
  };

  const titularNombre = `${titular.nombre || ''} ${titular.apellido || ''}`.trim();
  writeField('NOMBRE', titularNombre, leftX + 2, yLeft);
  yLeft += 9;
  writeField('NO. DOCUMENTO', titular.documento, leftX + 2, yLeft);
  yLeft += 9;

  writeField('NOMBRE', profesional.nombre, rightX + 2, yRight);
  yRight += 9;
  writeField('NO. DOCUMENTO', profesional.documento, rightX + 2, yRight);
  yRight += 9;
  writeField('NO. TARJETA PROFESIONAL', profesional.tarjetaProfesional, rightX + 2, yRight);
  yRight += 9;

  const firmaH = 30;
  const firmaW = (colW - 8) / 2;
  drawSignatureBox(doc, constancia.firmaTitular, leftX + 2, yLeft, firmaW, firmaH);
  drawSignatureBox(doc, data._huellaDataUrl, leftX + 2 + firmaW + 4, yLeft, firmaW, firmaH);
  doc.doc.setFont('helvetica', 'normal');
  doc.doc.setFontSize(7.5);
  doc.doc.text('Firma del Titular', leftX + 2 + firmaW / 2, yLeft + firmaH + 3, { align: 'center' });
  doc.doc.text('Huella Digital', leftX + 2 + firmaW + 4 + firmaW / 2, yLeft + firmaH + 3, { align: 'center' });
  yLeft += firmaH + 6;

  drawSignatureBox(doc, profesional.firma, rightX + 2, yRight, colW - 4, firmaH);
  doc.doc.text('Firma del Profesional', rightX + 2 + (colW - 4) / 2, yRight + firmaH + 3, { align: 'center' });
  yRight += firmaH + 6;

  doc.cursorY = Math.max(yLeft, yRight) + 2;

  doc.fieldRow([
    { label: 'TESTIGO (SI APLICA) - NOMBRE', value: constancia.testigo },
    { label: 'FECHA DE VISITA', value: constancia.fechaVisita },
  ]);
};

const renderUbicacionGps = (doc, data) => {
  const gps = data?.ubicacionGps || {};
  const latStr = gps.latitud;
  const lngStr = gps.longitud;
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const hasValues = Number.isFinite(lat) && Number.isFinite(lng);

  // Si no hay coordenadas válidas, omitimos la sección.
  if (!hasValues) return;

  doc.sectionHeader('E. UBICACIÓN GPS DEL PREDIO');

  doc.fieldRow([
    { label: 'LATITUD', value: latStr },
    { label: 'LONGITUD', value: lngStr },
  ]);

  // Link clickeable a Google Maps.
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  doc.spacer(2);
  doc.doc.setFont('helvetica', 'bold');
  doc.doc.setFontSize(8);
  doc.doc.setTextColor(0);
  doc.doc.text('COORDENADAS GPS (ENLACE):', doc.marginX, doc.cursorY + 3);
  doc.doc.setFont('helvetica', 'normal');
  doc.doc.setFontSize(10);
  doc.doc.setTextColor(30, 64, 175);
  doc.doc.textWithLink('Ver en Google Maps', doc.marginX, doc.cursorY + 9, { url });
  doc.doc.setTextColor(0);
  doc.cursorY += 12;
};

const renderConceptoTecnico = (doc, data) => {
  const concepto = data.conceptoTecnico || {};
  const requisitos = Array.isArray(concepto.requisitosGenerales) ? concepto.requisitosGenerales : [];
  const viviendaNueva = concepto.viviendaNueva || {};
  const condiciones = Array.isArray(viviendaNueva.condiciones) ? viviendaNueva.condiciones : [];

  doc.sectionHeader('J. CONCEPTO TÉCNICO - DIAGNÓSTICO INTEGRAL');

  doc.subtitle('VALIDACIÓN REQUISITOS GENERALES', { size: 9, color: [0, 0, 0] });
  const requisitosRows = requisitos.map((r, i) => [
    `${String.fromCharCode(97 + i)}) ${r.requisito}`,
    r.cumple === true ? 'X' : '',
    r.cumple === false ? 'X' : '',
  ]);
  doc.table(['REQUISITO', 'CUMPLE', 'NO CUMPLE'], requisitosRows, {
    columnStyles: {
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'center', cellWidth: 25 },
    },
  });
  doc.spacer(2);

  doc.subtitle('VALIDACIÓN MODALIDAD VIVIENDA NUEVA', { size: 9, color: [0, 0, 0] });
  doc.checkboxList([
    { label: 'APLICA', checked: viviendaNueva.aplica === true },
    { label: 'NO APLICA', checked: viviendaNueva.aplica === false },
  ]);

  if (viviendaNueva.aplica === true) {
    const condicionesRows = condiciones.map((c, i) => [
      `${String.fromCharCode(97 + i)}) ${c.condicion}`,
      c.valor === true ? 'X' : '',
      c.valor === false ? 'X' : '',
    ]);
    doc.table(['CONDICIÓN', 'SI', 'NO'], condicionesRows, {
      columnStyles: {
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 20 },
      },
    });
  }
};

const renderAnexoFotografico = (doc, data) => {
  const fotos = data?.anexoFotografico?.fotos || [];
  if (!fotos.length) return;

  const dataUrls = data._anexoFotosDataUrls || [];
  const titular = data.titular || {};

  doc.sectionHeader('ANEXO 01 - REGISTRO FOTOGRÁFICO');

  // Dos columnas: DATOS TITULAR | DATOS DEL PREDIO
  doc.fieldRow([
    { label: 'NOMBRE(S)', value: titular.nombre },
    { label: 'DEPARTAMENTO', value: titular.departamento },
  ]);
  doc.fieldRow([
    { label: 'APELLIDO(S)', value: titular.apellido },
    { label: 'MUNICIPIO', value: titular.municipio },
  ]);
  doc.fieldRow([
    { label: 'NO. DOCUMENTO', value: titular.documento },
    { label: 'VEREDA', value: titular.vereda },
  ]);
  doc.fieldRow([
    { label: 'CEL. CONTACTO', value: titular.celular },
    { label: '', value: '' },
  ]);
  doc.spacer(3);

  // Layout de fotos: 2 por fila
  const gap = 4;
  const colW = (doc.contentWidth - gap) / 2;
  const imgH = 55; // altura del área de imagen
  const headerBarH = 6;
  const obsBoxH = 16;
  const blockH = headerBarH + imgH + obsBoxH + 4; // alto total de cada foto

  for (let i = 0; i < fotos.length; i += 2) {
    doc.ensureSpace(blockH);
    const rowY = doc.cursorY;

    for (let col = 0; col < 2; col++) {
      const idx = i + col;
      if (idx >= fotos.length) break;
      const foto = fotos[idx];
      const dataUrl = dataUrls[idx];
      const x = doc.marginX + col * (colW + gap);

      // Header "FOTOGRAFÍA N"
      doc.doc.setFillColor(...doc.config.headerFill);
      doc.doc.rect(x, rowY, colW, headerBarH, 'F');
      doc.doc.setTextColor(...doc.config.headerText);
      doc.doc.setFont('helvetica', 'bold');
      doc.doc.setFontSize(8);
      doc.doc.text(`FOTOGRAFÍA ${idx + 1}`, x + 2, rowY + 4.2);
      doc.doc.setTextColor(0);

      // Imagen
      const imgY = rowY + headerBarH;
      doc.doc.setDrawColor(180);
      doc.doc.setLineWidth(0.2);
      doc.doc.rect(x, imgY, colW, imgH);

      if (dataUrl) {
        try {
          const props = doc.doc.getImageProperties(dataUrl);
          const aspect = props.width / props.height;
          let drawW = colW - 2;
          let drawH = drawW / aspect;
          if (drawH > imgH - 2) {
            drawH = imgH - 2;
            drawW = drawH * aspect;
          }
          const dx = x + (colW - drawW) / 2;
          const dy = imgY + (imgH - drawH) / 2;
          doc.doc.addImage(dataUrl, 'WEBP', dx, dy, drawW, drawH);
        } catch (err) {
          // En caso de error, queda el recuadro vacío.
          console.warn('No se pudo embeber la foto en el PDF:', err);
        }
      }

      // Recuadro de observaciones
      const obsY = imgY + imgH;
      doc.doc.setFont('helvetica', 'bold');
      doc.doc.setFontSize(7);
      doc.doc.text('OBSERVACIONES:', x + 1, obsY + 3);
      doc.doc.setDrawColor(180);
      doc.doc.rect(x, obsY, colW, obsBoxH);
      doc.doc.setFont('helvetica', 'normal');
      doc.doc.setFontSize(8);
      const obsText = String(foto?.observaciones || '');
      const wrapped = doc.doc.splitTextToSize(obsText, colW - 2);
      doc.doc.text(wrapped, x + 1, obsY + 7);
    }

    doc.cursorY = rowY + blockH;
  }
};

const sections = [
  renderTitular,
  renderModalidad,
  renderCondicionHogar,
  renderTenencia,
  renderCondicionesAmbientales,
  renderUbicacionGps,
  renderServiciosPublicos,
  renderLevantamiento,
  renderMiembros,
  renderConstanciaVisita,
  renderConceptoTecnico,
  renderAnexoFotografico,
];

const fetchAsDataUrl = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

const hydrateAssets = async (data) => {
  const out = { ...data };

  const croquisUrl = data?.levantamiento?.croquisUrl;
  if (croquisUrl) {
    try {
      out._croquisDataUrl = await fetchAsDataUrl(resolveStaticUrl(croquisUrl));
    } catch (err) {
      console.warn('No se pudo cargar el croquis para el PDF:', err);
    }
  }

  const huella = data?.constanciaVisita?.huellaDigital;
  if (huella?.startsWith('data:')) {
    out._huellaDataUrl = huella;
  } else if (huella) {
    try {
      out._huellaDataUrl = await fetchAsDataUrl(resolveStaticUrl(huella));
    } catch (err) {
      console.warn('No se pudo cargar la huella para el PDF:', err);
    }
  }

  try {
    out._logoColombiaDataUrl = await fetchAsDataUrl(logoColombia);
  } catch (err) {
    console.warn('No se pudo cargar el logo Colombia para el PDF:', err);
  }
  try {
    out._logoViviendaDataUrl = await fetchAsDataUrl(logoVivienda);
  } catch (err) {
    console.warn('No se pudo cargar el logo Vivienda para el PDF:', err);
  }

  const anexoFotos = data?.anexoFotografico?.fotos || [];
  if (anexoFotos.length) {
    out._anexoFotosDataUrls = await Promise.all(
      anexoFotos.map(async (foto) => {
        const url = foto?.url;
        if (!url) return null;
        if (url.startsWith('data:')) return url;
        try {
          return await fetchAsDataUrl(resolveStaticUrl(url));
        } catch (err) {
          console.warn('No se pudo cargar una foto del anexo para el PDF:', err);
          return null;
        }
      })
    );
  }

  return out;
};

export const generateDiagnosticoPdf = (data) => {
  const doc = new PdfDocument({ headerSpace: 30 });
  sections.forEach((section) => section(doc, data));

  // Estampar header en cada página después de tener todo el contenido
  const total = doc.doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.doc.setPage(i);
    drawPageHeader(doc, data, i);
  }

  return doc;
};

export const downloadDiagnosticoPdf = async (data, filename) => {
  const consecutivo = data?.metadata?.consecutivoHogar;
  const id = data?.id || 'documento';
  const name = filename || `diagnostico-${consecutivo || id}.pdf`;

  // Reservar la pestaña ANTES del await — los browsers bloquean window.open
  // post-await porque pierde la marca de "user gesture".
  const previewWindow = window.open('', '_blank');

  try {
    const hydrated = await hydrateAssets(data);
    const doc = generateDiagnosticoPdf(hydrated);
    const blobUrl = doc.doc.output('bloburl');

    if (previewWindow && !previewWindow.closed) {
      previewWindow.location.href = blobUrl;
    } else {
      // Popup bloqueado — caemos a descarga directa.
      doc.save(name);
    }
  } catch (err) {
    if (previewWindow && !previewWindow.closed) previewWindow.close();
    throw err;
  }
};
