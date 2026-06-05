import PdfDocument from "./PdfDocument";

/**
 * Servicio para generar el PDF de Caracterización de Pesca
 */
export const generateCaracterizacionPescaPdf = async (data) => {
  const doc = new PdfDocument();

  // 1. ENCABEZADO
  doc.title("FICHA DE CARACTERIZACIÓN DE PESCA");
  doc.subtitle("Documento de registro técnico de caracterización pesquera");
  
  doc.spacer(10);

  // SECCIÓN 1: IDENTIFICACIÓN
  doc.sectionHeader("1. IDENTIFICACIÓN");
  
  // Agrupamos los campos en filas de 2 para aprovechar la función fieldRow
  doc.fieldRow([
    { label: "Nombre del Pescador:", value: data.nombrePescador },
    { label: "Documento:", value: data.documento },
  ]);
  doc.fieldRow([
    { label: "Consejo Comunitario:", value: data.consejoComunitario },
    { label: "Asociación:", value: data.asociacion },
  ]);
  doc.fieldRow([
    { label: "Comunidad / Vereda:", value: data.comunidad },
    { label: "Teléfono:", value: data.telefono },
  ]);

  doc.spacer(10);

  // SECCIÓN 2: COMPOSICIÓN DEL HOGAR
  doc.sectionHeader("2. COMPOSICIÓN DEL HOGAR");
  
  doc.subtitle(`Total de personas dependientes: ${data.totalPersonas || 0}`, { size: 10, color: [0, 0, 0] });
  doc.spacer(5);

  // Tabla de composición
  const columns = ["Categoría", "Cantidad"];
  const rows = [
    ["Niños (0-12 años)", data.ninios || 0],
    ["Jóvenes (13-17 años)", data.jovenes || 0],
    ["Adultos (18-59 años)", data.adultos || 0],
    ["Adultos Mayores (60+)", data.adultosMayores || 0],
    ["Hombres", data.hombres || 0],
    ["Mujeres", data.mujeres || 0],
  ];
  
  doc.table(columns, rows);
  
  doc.spacer(10);
  const dieta = data.pescadoBaseAlimentacion === "si" ? "SÍ" : (data.pescadoBaseAlimentacion === "no" ? "NO" : "N/A");
  doc.subtitle(`¿El pescado es base de alimentación en su hogar?: ${dieta}`, { size: 10, color: [0, 0, 0] });

  doc.spacer(10);

  // SECCIÓN 3: ACTIVIDAD PESQUERA
  doc.sectionHeader("3. ACTIVIDAD PESQUERA");
  
  const expMap = {
    'menos5': 'Menos de 5 años',
    '5-10': '5-10 años',
    'mas10': 'Más de 10 años'
  };
  const pescaMap = {
    'mar': 'Mar adentro',
    'rio': 'Río/Estero',
    'ambos': 'Ambos'
  };

  doc.fieldRow([
    { label: "Años de experiencia:", value: expMap[data.anosExperiencia] || data.anosExperiencia || "N/A" },
    { label: "Tipo de pesca:", value: pescaMap[data.tipoPesca] || data.tipoPesca || "N/A" },
  ]);

  doc.spacer(10);

  // SECCIÓN 4: EMBARCACIÓN Y EQUIPO
  doc.sectionHeader("4. EMBARCACIÓN Y EQUIPO");
  
  const embMap = {
    'canoa': 'Canoa',
    'fibra': 'Fibra',
    'madera': 'Madera'
  };

  doc.fieldRow([
    { label: "Tipo de embarcación:", value: embMap[data.tipoEmbarcacion] || data.tipoEmbarcacion || "N/A" },
  ]);

  doc.spacer(20);
  doc.subtitle("Fin del documento", { size: 8 });

  return await doc.getBlob();
};