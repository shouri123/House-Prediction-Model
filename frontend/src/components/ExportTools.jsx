import React, { useRef } from 'react';
import { saveAs } from 'file-saver';
import { formatCurrency } from '../utils';

const ExportTools = ({ data, results }) => {
    const dashboardRef = useRef(null);

    const downloadCSV = () => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map((row) =>
                headers.map((h) => {
                    const val = row[h];
                    if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
                    return val;
                }).join(',')
            ),
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'house_predictions.csv');
    };

    const downloadPDF = async () => {
        try {
            const { default: jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            const margin = 15;
            let y = margin;

            doc.setFontSize(20);
            doc.setTextColor(59, 130, 246);
            doc.text('House Price Prediction Report', margin, y);
            y += 12;

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
            y += 10;

            // Summary stats
            if (results?.graphs?.summary_stats) {
                const stats = results.graphs.summary_stats;
                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text('Summary', margin, y);
                y += 8;

                doc.setFontSize(10);
                doc.setTextColor(60);
                doc.text(`Total Properties: ${stats.total_properties}`, margin, y); y += 6;
                doc.text(`Average Price: ${formatCurrency(stats.avg_price)}`, margin, y); y += 6;
                doc.text(`Highest Price: ${formatCurrency(stats.max_price)}`, margin, y); y += 6;
                doc.text(`Lowest Price: ${formatCurrency(stats.min_price)}`, margin, y); y += 10;
            }

            // Metrics
            if (results?.metrics) {
                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text('Model Performance', margin, y);
                y += 8;

                doc.setFontSize(10);
                doc.setTextColor(60);
                doc.text(`MAE: ${formatCurrency(results.metrics.mae)}`, margin, y); y += 6;
                doc.text(`RMSE: ${formatCurrency(results.metrics.rmse)}`, margin, y); y += 6;
                doc.text(`R² Score: ${results.metrics.r2.toFixed(4)}`, margin, y); y += 10;
            }

            // Insights
            if (results?.insights && results.insights.length > 0) {
                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text('Key Insights', margin, y);
                y += 8;

                doc.setFontSize(10);
                doc.setTextColor(60);
                results.insights.forEach((insight) => {
                    if (y > 270) { doc.addPage(); y = margin; }
                    doc.text(`${insight.icon} ${insight.title}: ${insight.text}`, margin, y, { maxWidth: 180 });
                    y += 12;
                });
                y += 5;
            }

            // Predictions table (first 30 rows)
            if (data && data.length > 0) {
                doc.addPage();
                y = margin;
                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text('Prediction Details', margin, y);
                y += 8;

                doc.setFontSize(8);
                const rows = data.slice(0, 30);
                rows.forEach((row, i) => {
                    if (y > 280) { doc.addPage(); y = margin; }
                    doc.setTextColor(60);
                    doc.text(
                        `#${i + 1}: ${formatCurrency(row.predicted_price)} | Income: ${row.median_income} | Ocean: ${row.ocean_proximity} | (${row.latitude}, ${row.longitude})`,
                        margin, y, { maxWidth: 180 }
                    );
                    y += 6;
                });
            }

            doc.save('house_prediction_report.pdf');
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    return (
        <div className="flex flex-wrap gap-3">
            <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition text-sm font-medium"
            >
                📥 Download CSV
            </button>
            <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition text-sm font-medium"
            >
                📄 Download Report (PDF)
            </button>
        </div>
    );
};

export default ExportTools;
