import PdfDocument from './PdfDocument';

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

const renderHeader = (doc, data) => {
  doc.title('DIAGNÓSTICO INTEGRAL');
  doc.subtitle('PROCESO: GESTIÓN A LA POLÍTICA DE VIVIENDA');
  doc.subtitle('Versión: 4.0 | Fecha: 07/09/2023 | Código: GPV-F-73', { size: 7.5 });
  doc.spacer(4);

  const meta = data.metadata || {};
  doc.fieldRow([
    { label: 'FECHA DE DILIGENCIAMIENTO', value: meta.fechaDiligenciamiento },
    { label: 'CONSECUTIVO HOGAR', value: meta.consecutivoHogar },
    { label: 'FECHA DE SUSCRIPCIÓN', value: meta.fechaSuscripcion },
  ]);
  doc.spacer(3);
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

const sections = [
  renderHeader,
  renderTitular,
  renderModalidad,
  renderCondicionHogar,
  renderTenencia,
  renderCondicionesAmbientales,
];

export const generateDiagnosticoPdf = (data) => {
  const doc = new PdfDocument();
  sections.forEach((section) => section(doc, data));
  return doc;
};

export const downloadDiagnosticoPdf = (data, filename) => {
  const doc = generateDiagnosticoPdf(data);
  const consecutivo = data?.metadata?.consecutivoHogar;
  const id = data?.id || 'documento';
  const name = filename || `diagnostico-${consecutivo || id}.pdf`;

  //doc.save(name);
  doc.preview();
};
