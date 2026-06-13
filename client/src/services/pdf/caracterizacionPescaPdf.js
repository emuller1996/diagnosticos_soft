import PdfDocument from "./PdfDocument";
import { resolveStaticUrl } from '../apiClient';

/**
 * Helper para convertir una URL de imagen en DataURL (Base64)
 */
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

/**
 * Carga las imágenes de los anexos y las convierte a DataURL
 */
const hydrateAssets = async (data) => {
  const out = { ...data };
  const anexoFotos = data?.anexoFotografico?.fotos || [];
  
  if (anexoFotos.length) {
    out._anexoFotosDataUrls = await Promise.all(
      anexoFotos.map(async (foto) => {
        const url = foto?.url;
        if (!url) return null;
        //if (url.startsWith('data:')) return url;
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

/**
 * Genera el contenido del PDF de Caracterización de Pesca
 */
export const generateCaracterizacionPescaPdf = (data) => {
  const doc = new PdfDocument();

  // 1. ENCABEZADO
  doc.title("FICHA DE CARACTERIZACIÓN DE PESCA");
  doc.subtitle("Documento de registro técnico de caracterización pesquera");
  
  doc.spacer(10);

  // SECCIÓN 1: IDENTIFICACIÓN
  doc.sectionHeader("1. IDENTIFICACIÓN");
  
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

    const estadoMap = { 'bueno': 'Bueno', 'regular': 'Regular', 'malo': 'Malo' };
    const siNoMap = { 'si': 'SÍ', 'no': 'NO' };

    doc.fieldRow([
      { label: "Estado embarcación:", value: estadoMap[data.estadoEmbarcacion] || data.estadoEmbarcacion || "N/A" },
      { label: "Tiene motor:", value: siNoMap[data.tieneMotor] || data.tieneMotor || "N/A" },
    ]);

    if (data.tieneMotor === 'si') {
      doc.fieldRow([
        { label: "HP Motor:", value: data.hpMotor || "N/A" },
        { label: "Estado Motor:", value: estadoMap[data.estadoMotor] || data.estadoMotor || "N/A" },
      ]);
    }

    doc.spacer(10);

    // SECCIÓN 5: PRODUCCIÓN (ESTIMADA)
    doc.sectionHeader("5. PRODUCCIÓN (ESTIMADA)");
    const capturaMap = { 'poco': 'Poco (<20 kg)', 'medio': 'Medio (20-50 kg)', 'alto': 'Alto (>50 kg)' };
    const diasMap = { '1-2': '1-2 días', '3-4': '3-4 días', '5+': '5 o más días' };

    doc.fieldRow([
      { label: "Captura por día:", value: capturaMap[data.capturaPorDia] || data.capturaPorDia || "N/A" },
      { label: "Días de pesca/semana:", value: diasMap[data.diasPescaSemana] || data.diasPescaSemana || "N/A" },
    ]);

    doc.spacer(10);

    // SECCIÓN 6: MANEJO DEL PESCADO
    doc.sectionHeader("6. MANEJO DEL PESCADO");
    const conservaMap = { 'hielo': 'Hielo', 'sal': 'Sal', 'no-conserva': 'No conserva' };
    const tiempoVentaMap = { 'mismo-dia': 'Mismo día', '1-dia': '1 día', 'mas-1-dia': 'Más de 1 día' };
    const perdidaMap = { 'mucha': 'Mucha', 'algo': 'Algo', 'muy-poca': 'Muy poca' };

    doc.fieldRow([
      { label: "Conservación:", value: conservaMap[data.conservaPescado] || data.conservaPescado || "N/A" },
      { label: "Tiempo antes venta:", value: tiempoVentaMap[data.tiempoAntesVender] || data.tiempoAntesVender || "N/A" },
    ]);
    doc.fieldRow([
      { label: "Pérdida de pescado:", value: perdidaMap[data.perdidaPescado] || data.perdidaPescado || "N/A" },
    ]);

    doc.spacer(10);

    // SECCIÓN 7: COMERCIALIZACIÓN
    doc.sectionHeader("7. COMERCIALIZACIÓN");
    const ventaMap = { 
      'asociacion': 'Asociación', 
      'consejo-comunitario': 'Consejo Comunitario', 
      'comunidad-local': 'Comunidad Local', 
      'intermediario': 'Intermediario', 
      'buenaventura': 'Buenaventura' 
    };

    doc.fieldRow([
      { label: "Venta principal:", value: ventaMap[data.ventaPrincipal] || data.ventaPrincipal || "N/A" },
    ]);

    if (data.ventaPrincipal === 'buenaventura') {
      doc.spacer(5);
      doc.subtitle("Detalles transporte a Buenaventura:", { size: 9, color: [0, 0, 0] });
      
      const transMap = { 'lancha': 'Lancha', 'bote-propio': 'Bote propio', 'transporte-contratado': 'Transporte contratado', 'otro': 'Otro' };
      const tTiempoMap = { 'menos-2h': 'Menos de 2 horas', '2-5h': '2-5 horas', 'mas-5h': 'Más de 5 horas' };
      const probMap = { 'bajo-precio': 'Bajo precio', 'transporte': 'Transporte', 'se-daña': 'Se daña el pescado', 'intermediarios': 'Intermediarios', 'otro': 'Otro' };

      doc.fieldRow([
        { label: "Medio transporte:", value: transMap[data.medioTransporte] || data.medioTransporte || "N/A" },
        { label: "Tiempo transporte:", value: tTiempoMap[data.tiempoTransporte] || data.tiempoTransporte || "N/A" },
      ]);
      doc.fieldRow([
        { label: "Problemas principales:", value: probMap[data.problemasPrincipales] || data.problemasPrincipales || "N/A" },
      ]);
      if (data.otroMedioTransporte) {
        doc.fieldRow([{ label: "Otro medio:", value: data.otroMedioTransporte }]);
      }
      if (data.otroProblema) {
        doc.fieldRow([{ label: "Otro problema:", value: data.otroProblema }]);
      }
    }

    doc.spacer(10);

    // SECCIÓN 8: NECESIDADES PRIORITARIAS
    doc.sectionHeader("8. NECESIDADES PRIORITARIAS");
    const needsList = [
      { value: "embarcacion", label: "Embarcación" },
      { value: "motor", label: "Motor" },
      { value: "equipos-pesca", label: "Equipos de pesca" },
      { value: "sistema-frio", label: "Sistema de frío" },
      { value: "transporte", label: "Transporte" },
      { value: "capacitacion", label: "Capacitación" },
      { value: "comercializacion", label: "Comercialización" },
    ];

    const selectedNeeds = (data.necesidadesPrioritarias || []).map(val => ({
      label: needsList.find(n => n.value === val)?.label || val,
      checked: true
    })).concat(
      needsList.filter(n => !(data.necesidadesPrioritarias || []).includes(n.value)).map(n => ({
        label: n.label,
        checked: false
      }))
    );

    doc.checkboxList(selectedNeeds, { title: "Necesidades identificadas:" });

    doc.spacer(10);

    // SECCIÓN 9: ANEXOS FOTOGRÁFICOS
    const fotos = data.anexoFotografico?.fotos || [];
    if (fotos.length > 0) {
      doc.sectionHeader("9. ANEXOS FOTOGRÁFICOS");
      doc.spacer(5);
      
      for (let i = 0; i < fotos.length; i++) {
        const anexo = fotos[i];
        const dataUrl = data._anexoFotosDataUrls?.[i];
        
        if (dataUrl) {
          doc.addImage(dataUrl, { 
            caption: `Foto ${i + 1}: ${anexo.observaciones || 'Sin observaciones'}` 
          });
          doc.spacer(10);
        } else {
          doc.subtitle(`Foto ${i + 1}: [Imagen no disponible]`, { size: 8, color: [150, 0, 0] });
          doc.subtitle(`Obs: ${anexo.observaciones || 'Sin observaciones'}`, { size: 8 });
          doc.spacer(5);
        }
      }
    }

    return doc;
};

/**
 * Función principal para descargar el PDF
 */
export const downloadCaracterizacionPescaPdf = async (data, filename) => {
  const id = data?.id || 'documento';
  const name = filename || `caracterizacion-pesca-${id}.pdf`;

  const previewWindow = window.open('', '_blank');

    try {
      const hydrated = await hydrateAssets(data);
      const doc = generateCaracterizacionPescaPdf(hydrated);
      const blobUrl = doc.doc.output('bloburl');

      if (previewWindow && !previewWindow.closed) {
        previewWindow.location.href = blobUrl;
      } else {
        doc.save(name);
      }
    } catch (err) {
    if (previewWindow && !previewWindow.closed) previewWindow.close();
    throw err;
  }
};