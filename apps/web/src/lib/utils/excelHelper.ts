import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Módulo de Exportación Técnica Premium (Ambiensa ERP)
 * Genera reportes de ingeniería con estilos corporativos (Colores, Bordes, Formato numérico).
 */

export const exportProjectToExcel = async (projectName: string, data: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de Ingeniería');

  // 1. Estilos Globales
  const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo 600
  const subTotalFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }; // Slate 50
  const whiteFont: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
  const darkFont: Partial<ExcelJS.Font> = { color: { argb: 'FF1E293B' }, bold: true, size: 10 };
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  // 2. Encabezado del Proyecto
  worksheet.mergeCells('A1:K1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `REPORTE TÉCNICO DE AVANCE: ${projectName.toUpperCase()}`;
  titleCell.font = { size: 14, bold: true, color: { argb: 'FF0F172A' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells('A2:K2');
  const dateCell = worksheet.getCell('A2');
  dateCell.value = `Generado el: ${new Date().toLocaleDateString()} | Sistema Ambiensa ERP`;
  dateCell.font = { size: 9, italic: true, color: { argb: 'FF64748B' } };
  dateCell.alignment = { horizontal: 'center' };
  
  worksheet.addRow([]); // Espacio

  // 3. Agrupar datos por fecha
  const groupedByDate: { [key: string]: any[] } = {};
  data.forEach((item) => {
    const date = item.fecha; 
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(item);
  });

  const sortedDates = Object.keys(groupedByDate).sort();
  let currentRow = 4;

  // 4. Generar bloques por jornada
  sortedDates.forEach((date, index) => {
    // Fila "DÍA X"
    const dayRow = worksheet.addRow([`DÍA ${index + 1} - ${date}`]);
    dayRow.getCell(1).font = { size: 11, bold: true, color: { argb: 'FF4F46E5' } };
    worksheet.mergeCells(`A${dayRow.number}:K${dayRow.number}`);
    
    // Encabezados de Tabla
    const headerLabels = [
      'CALLE / UBICACIÓN', 'UNIDADES', 'DIAM (m)', 'ABS INICIO', 'ABS FIN', 
      'LONG (m)', 'ANCHO (m)', 'AREA (m2)', 'ALT (m)', 'VOL (m3)', 'TOTAL (m3)'
    ];
    const headerRow = worksheet.addRow(headerLabels);
    headerRow.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = whiteFont;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    });

    let dayTotal = 0;

    // Filas de Datos
    groupedByDate[date].forEach((av) => {
      const vol = Number(av.volumen_dia) || 0;
      dayTotal += vol;

      const dataRow = worksheet.addRow([
        `${av.lotes_unidades?.calle || 'MZ ' + av.lotes_unidades?.mz + ' V' + av.lotes_unidades?.villa}`,
        '1',
        '-',
        av.abs_inicio || 0,
        av.abs_fin || 0,
        Number(av.longitud) || 0,
        Number(av.ancho) || 0,
        Number(av.area) || 0,
        Number(av.altura_promedio) || 0,
        vol,
        vol
      ]);

      dataRow.eachCell((cell, colNumber) => {
        cell.border = thinBorder;
        cell.font = { size: 9, color: { argb: 'FF334155' } };
        // Alinear números a la derecha
        if (colNumber >= 4) {
            cell.alignment = { horizontal: 'right' };
            cell.numFmt = '#,##0.00';
        }
      });
    });

    // Fila de Totales del Día
    const totalRow = worksheet.addRow(['TOTAL JORNADA:', '', '', '', '', '', '', '', '', dayTotal, dayTotal]);
    totalRow.eachCell((cell, colNumber) => {
        cell.fill = subTotalFill;
        cell.font = darkFont;
        cell.border = thinBorder;
        if (colNumber >= 10) {
            cell.numFmt = '#,##0.00';
            cell.alignment = { horizontal: 'right' };
        }
    });

    worksheet.addRow([]); // Espacio entre días
  });

  // 5. Configuración de Columnas
  worksheet.columns = [
    { key: 'calle', width: 25 },
    { key: 'units', width: 10 },
    { key: 'diam', width: 10 },
    { key: 'abs_i', width: 12 },
    { key: 'abs_f', width: 12 },
    { key: 'long', width: 10 },
    { key: 'ancho', width: 10 },
    { key: 'area', width: 10 },
    { key: 'alt', width: 10 },
    { key: 'vol', width: 12 },
    { key: 'total', width: 12 },
  ];

  // 6. Generar Blob y descargar
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Reporte_${projectName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
};
