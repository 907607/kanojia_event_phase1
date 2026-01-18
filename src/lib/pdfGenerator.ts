import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Interfaces ---
export interface ExhibitionReportData {
    exhibition: {
        name: string;
        city: string;
        startDate: string;
        endDate?: string;
        status: string;
    };
    stats: {
        totalRevenue: number;
        totalOrders: number;
        avgOrderValue: number;
    };
    orders: Array<{
        id: string;
        createdAt: string;
        customerName: string;
        customerPhone: string;
        productName: string;
        quantity: number;
        totalAmount: number;
        salesman?: { username: string };
        paymentRef: string;
    }>;
    topProducts?: Array<{
        name: string;
        totalSold: number;
        revenue: number;
    }>;
}

export interface SalesmanReportData {
    salesman: {
        username: string;
        createdAt: string;
    };
    stats: {
        totalRevenue: number;
        totalOrders: number;
        avgOrderValue: number;
    };
    orders: Array<{
        createdAt: string;
        customerName: string;
        productName: string;
        totalAmount: number;
        exhibition: { name: string };
    }>;
}

// --- Design Constants ---
const COLORS = {
    primary: '#2563EB',    // Blue-600
    secondary: '#1E293B',  // Slate-800
    text: '#475569',       // Slate-600
    lightBg: '#F8FAFC',    // Slate-50
    border: '#E2E8F0',     // Slate-200
    white: '#FFFFFF'
};

// --- Helper Functions ---

const drawHeader = (doc: jsPDF, title: string, subtitle?: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Brand Logo/Name (Left)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary);
    doc.text('KANOJIA FURNITURE', 14, 20);

    // Report Title (Right)
    doc.setFontSize(12);
    doc.setTextColor(COLORS.secondary);
    doc.text(title.toUpperCase(), pageWidth - 14, 20, { align: 'right' });

    // Date Generated
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 26, { align: 'right' });

    // Subtitle (if any)
    if (subtitle) {
        doc.text(subtitle, 14, 26);
    }

    // Divider Line
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(14, 32, pageWidth - 14, 32);
};

const drawStatsRow = (doc: jsPDF, stats: { label: string, value: string }[], startY: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const gap = 6;
    const boxWidth = (pageWidth - (margin * 2) - (gap * 2)) / 3;
    const boxHeight = 24;

    stats.forEach((stat, index) => {
        const x = margin + (boxWidth + gap) * index;

        // Background Box
        doc.setFillColor(COLORS.lightBg);
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(x, startY, boxWidth, boxHeight, 2, 2, 'FD');

        // Label
        doc.setFontSize(9);
        doc.setTextColor(COLORS.text);
        doc.setFont('helvetica', 'normal');
        doc.text(stat.label.toUpperCase(), x + 6, startY + 9);

        // Value
        doc.setFontSize(12);
        doc.setTextColor(COLORS.secondary);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.value, x + 6, startY + 19);
    });

    return startY + boxHeight + 10; // Return next Y position
};

const drawFooter = (doc: jsPDF) => {
    const pageCount = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(COLORS.text);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15); // Top line

        doc.text(
            `Kanojia Furniture Shoppe - Confidential Report`,
            14,
            pageHeight - 10
        );

        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - 14,
            pageHeight - 10,
            { align: 'right' }
        );
    }
};

// --- Main Generators ---

export function generateExhibitionPDF(data: ExhibitionReportData): jsPDF {
    const doc = new jsPDF();

    // 1. Header
    drawHeader(doc, 'Exhibition Report');

    // 2. Exhibition Meta Data (Grid Layout)
    let currentY = 45;
    doc.setFontSize(10);
    doc.setTextColor(COLORS.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('EXHIBITION DETAILS', 14, 40);

    // Left Column
    doc.setFont('helvetica', 'bold');
    doc.text('Event Name:', 14, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.exhibition.name, 45, currentY);

    doc.setFont('helvetica', 'bold');
    doc.text('Location:', 14, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(data.exhibition.city, 45, currentY + 6);

    // Right Column (Offset by 100)
    const col2X = 110;
    doc.setFont('helvetica', 'bold');
    doc.text('Date Period:', col2X, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date(data.exhibition.startDate).toLocaleDateString()} - ${data.exhibition.endDate ? new Date(data.exhibition.endDate).toLocaleDateString() : 'Ongoing'}`, col2X + 30, currentY);

    doc.setFont('helvetica', 'bold');
    doc.text('Current Status:', col2X, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(data.exhibition.status === 'LIVE' ? '#16A34A' : COLORS.text); // Green if live
    doc.text(data.exhibition.status, col2X + 30, currentY + 6);

    // 3. Stats Section
    currentY += 20;
    currentY = drawStatsRow(doc, [
        { label: 'Total Revenue', value: `INR ${data.stats.totalRevenue.toLocaleString()}` },
        { label: 'Total Orders', value: data.stats.totalOrders.toString() },
        { label: 'Avg Order Value', value: `INR ${Math.round(data.stats.avgOrderValue).toLocaleString()}` }
    ], currentY);

    // 4. Orders Table
    doc.setFontSize(11);
    doc.setTextColor(COLORS.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED ORDER HISTORY', 14, currentY);

    autoTable(doc, {
        startY: currentY + 5,
        head: [['Date', 'Customer', 'Product', 'Salesman', 'Ref', 'Amount']],
        body: data.orders.map(order => [
            new Date(order.createdAt).toLocaleDateString(),
            order.customerName,
            `${order.productName} (x${order.quantity})`,
            order.salesman?.username || '-',
            order.paymentRef,
            `INR ${order.totalAmount.toLocaleString()}`
        ]),
        theme: 'grid',
        headStyles: {
            fillColor: COLORS.primary,
            textColor: COLORS.white,
            fontStyle: 'bold',
            halign: 'left'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            textColor: COLORS.text
        },
        columnStyles: {
            5: { halign: 'right', fontStyle: 'bold' } // Right align Amount
        },
        alternateRowStyles: {
            fillColor: COLORS.lightBg
        }
    });

    // 5. Top Products (Optional)
    if (data.topProducts && data.topProducts.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY + 15;

        // Avoid page break on title if possible
        if (finalY < 250) {
            doc.setFontSize(11);
            doc.setTextColor(COLORS.secondary);
            doc.setFont('helvetica', 'bold');
            doc.text('TOP PERFORMING PRODUCTS', 14, finalY);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Product Name', 'Units Sold', 'Total Revenue']],
                body: data.topProducts.map(p => [
                    p.name,
                    p.totalSold.toString(),
                    `INR ${p.revenue.toLocaleString()}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: COLORS.secondary },
                columnStyles: {
                    1: { halign: 'center' },
                    2: { halign: 'right' }
                }
            });
        }
    }

    // 6. Footer
    drawFooter(doc);

    return doc;
}

export function generateSalesmanPDF(data: SalesmanReportData): jsPDF {
    const doc = new jsPDF();

    // 1. Header
    drawHeader(doc, 'Salesman Performance');

    // 2. Profile Meta Data
    let currentY = 45;
    doc.setFontSize(10);
    doc.setTextColor(COLORS.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFILE DETAILS', 14, 40);

    doc.setFont('helvetica', 'bold');
    doc.text('Staff Name:', 14, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.salesman.username, 40, currentY);

    doc.setFont('helvetica', 'bold');
    doc.text('Joined Date:', 14, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(data.salesman.createdAt).toLocaleDateString(), 40, currentY + 6);

    // 3. Stats Section
    currentY += 20;
    currentY = drawStatsRow(doc, [
        { label: 'Revenue Generated', value: `INR ${data.stats.totalRevenue.toLocaleString()}` },
        { label: 'Orders Closed', value: data.stats.totalOrders.toString() },
        { label: 'Avg Ticket Size', value: `INR ${Math.round(data.stats.avgOrderValue).toLocaleString()}` }
    ], currentY);

    // 4. Sales Table
    doc.setFontSize(11);
    doc.setTextColor(COLORS.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('RECENT SALES ACTIVITY', 14, currentY);

    autoTable(doc, {
        startY: currentY + 5,
        head: [['Date', 'Exhibition', 'Customer', 'Product', 'Amount']],
        body: data.orders.map(order => [
            new Date(order.createdAt).toLocaleDateString(),
            order.exhibition.name,
            order.customerName,
            order.productName,
            `INR ${order.totalAmount.toLocaleString()}`
        ]),
        theme: 'grid',
        headStyles: {
            fillColor: COLORS.primary,
            textColor: COLORS.white,
            halign: 'left'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            textColor: COLORS.text
        },
        columnStyles: {
            4: { halign: 'right', fontStyle: 'bold' } // Right align Amount
        },
        alternateRowStyles: {
            fillColor: COLORS.lightBg
        }
    });

    // 5. Footer
    drawFooter(doc);

    return doc;
}