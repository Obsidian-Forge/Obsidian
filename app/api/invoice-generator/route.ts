import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import fs from 'fs';
import path from 'path';

// 1. ÖNEMLİ: ReferenceError: document is not defined hatasını önlemek için Node.js runtime zorunlu
export const runtime = 'nodejs';

// Supabase Admin Bağlantısı (RLS'i geçmek için Service Role Key kullanılır)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { 
        autoRefreshToken: false, 
        persistSession: false 
    }
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { 
            clientId, 
            clientEmail, 
            clientName, 
            companyName, 
            clientAddress, 
            amount, 
            type, // 'project' veya 'maintenance'
            title, 
            projectName, 
            expenseMode, 
            totalExpenses,
            installmentNo,    // Kaçıncı taksit (Örn: 1 veya 2)
            totalInstallments // Toplam kaç taksit (Örn: 2)
        } = body;

        // 1. Proje Detaylarını Çek (Proje kapsamını PDF'e eklemek için)
        const { data: discoveryData } = await supabase
            .from('project_discovery')
            .select('details, discovery_number')
            .eq('client_email', clientEmail)
            .maybeSingle();

        // 2. Hesaplamalar ve PROFESYONEL DOSYA İSMİ
        const grossAmount = expenseMode === 'exclusive' ? amount + totalExpenses : amount;
        const safeInstallmentNo = installmentNo || 1;
        const safeTotalInstallments = totalInstallments || 1;
        
        // YENİ: Firma/Müşteri adını dosya ismine uygun hale getir (Boşlukları vs. alt tire yap)
        const safeName = (companyName || clientName || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
        
        let fileName = '';
        let docNo = '';
        const dateTag = new Date().toISOString().split('T')[0].replace(/-/g, '');

        if (type === 'maintenance') {
            docNo = `SUB-${dateTag}-${Date.now().toString().slice(-4)}`; // Maintenance için unique kalsın
            // Şık İsimlendirme: Novatrum_SUB_FirmaAdi_20260407.pdf
            fileName = `Novatrum_SUB_${safeName}_${dateTag}.pdf`;
        } else {
            docNo = `PRJ-${dateTag}-P${safeInstallmentNo}`; 
            // Şık İsimlendirme: Novatrum_Invoice_FirmaAdi_Part1.pdf
            fileName = `Novatrum_Invoice_${safeName}_Part${safeInstallmentNo}.pdf`;
        }

        // 3. PDF OLUŞTURMA
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;

        doc.setFont("helvetica");

        // --- TASARIM: LOGO VE ŞİRKET BİLGİLERİ ---
        try {
            const logoPath = path.join(process.cwd(), 'public', 'logo.png');
            if (fs.existsSync(logoPath)) {
                const logoBuffer = fs.readFileSync(logoPath);
                const logoBase64 = logoBuffer.toString('base64');
                doc.addImage(logoBase64, 'PNG', margin, 15, 20, 20); // 20x20 boyutu
            }
        } catch (e) { 
            console.error("Logo Error:", e); 
        }

        // Şirket Bilgileri (Logonun Altında)
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        let currentY = 42; 
        doc.text("NOVATRUM INFRASTRUCTURE & ENGINEERING", margin, currentY);
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        currentY += 5;
        doc.text("Belgium, Flanders | info@novatrum.eu | novatrum.eu", margin, currentY);

        // --- TASARIM: SAĞ ÜST BELGE BİLGİSİ ---
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(10, 10, 10);
        const mainTitle = type === 'maintenance' ? 'SUBSCRIPTION SUMMARY' : 'PROJECT SUMMARY';
        doc.text(mainTitle, pageWidth - margin, 25, { align: 'right' });
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(`Doc No: ${docNo}`, pageWidth - margin, 32, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, 37, { align: 'right' });

        doc.setDrawColor(230, 230, 230);
        doc.line(margin, 55, pageWidth - margin, 55);

        // --- MÜŞTERİ BİLGİLERİ ---
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(150, 150, 150);
        doc.text("PREPARED FOR:", margin, 65);
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(10, 10, 10);
        currentY = 72;
        doc.text(companyName || clientName, margin, currentY);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        currentY += 6;
        doc.text(clientEmail, margin, currentY);
        if (clientAddress) {
            currentY += 5;
            doc.text(clientAddress, margin, currentY);
        }

        // --- TABLO BAŞLIĞI ---
        currentY = 100;
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text("DESCRIPTION / SCOPE", margin + 2, currentY + 6.5);
        doc.text("AMOUNT", pageWidth - margin - 2, currentY + 6.5, { align: 'right' });
        
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY + 10, pageWidth - margin, currentY + 10);

        // --- TABLO İÇERİĞİ (SPECIFICATIONS DAHİL) ---
        currentY += 18;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(10, 10, 10);
        doc.text(`${projectName} - ${title}`, margin + 2, currentY);
        doc.text(`EUR ${grossAmount.toFixed(2)}`, pageWidth - margin - 2, currentY, { align: 'right' });

        // Proje detaylarını (Scope) açıklama altına ekle
        currentY += 8;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Project Specifications:", margin + 2, currentY);
        currentY += 5;

        const specs = discoveryData?.details || { "Project": projectName };
        Object.entries(specs).slice(0, 10).forEach(([key, value]) => {
            const line = `• ${key}: ${value}`;
            const splitLine = doc.splitTextToSize(line, 140);
            // Sayfa sonuna gelindiyse yeni sayfa ekle
            if (currentY + 5 > pageHeight - 60) { 
                doc.addPage(); 
                currentY = 20; 
            }
            doc.text(splitLine, margin + 4, currentY);
            currentY += (splitLine.length * 4);
        });

        // Exclusive Modu Gider Notu
        if (expenseMode === 'exclusive' && totalExpenses > 0) {
            currentY += 5;
            doc.setFont("helvetica", "italic");
            doc.text(`* Includes operational expenses: EUR ${totalExpenses.toFixed(2)}`, margin + 2, currentY);
        }

        // --- TOTAL DUE KUTUSU ---
        currentY = Math.max(currentY + 20, 180);
        const totalBoxWidth = 70;
        const summaryX = pageWidth - margin - totalBoxWidth;
        
        doc.setFillColor(248, 248, 248);
        doc.rect(summaryX - 5, currentY - 8, totalBoxWidth + 10, 14, 'F');
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(10, 10, 10);
        doc.text("TOTAL DUE", summaryX, currentY);
        doc.setFontSize(12);
        doc.text(`EUR ${grossAmount.toFixed(2)}`, pageWidth - margin - 2, currentY, { align: 'right' });

        // PAYMENT PART BİLGİSİ (Zümrüt Yeşili Renk - Emerald 500)
        if (type !== 'maintenance') {
            currentY += 12; 
            doc.setFontSize(10); 
            doc.setFont("helvetica", "bold");
            doc.setTextColor(16, 185, 129); 
            doc.text(`PAYMENT PART ${safeInstallmentNo} OF ${safeTotalInstallments}`, pageWidth - margin, currentY, { align: 'right' });
        }

        // --- FOOTER ---
        const footerY = pageHeight - 30;
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        const footerNote = "This is a digital proforma document. The final tax invoice will be issued by TENTOO. Please execute payment via the structured IBAN provided in the official document.";
        doc.text(doc.splitTextToSize(footerNote, pageWidth - (margin * 2)), margin, footerY);

        // 4. SUPABASE STORAGE YÜKLEME
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        const storagePath = `invoices/${clientId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('client-assets')
            .upload(storagePath, pdfBuffer, { 
                contentType: 'application/pdf', 
                upsert: true 
            });

        if (uploadError) throw new Error("Storage Upload Error: " + uploadError.message);

        const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(storagePath);

        // 5. VERİTABANI İŞLEMİ (in_operatörü ve upsert)
        const { data: existingInvoice } = await supabase
            .from('client_invoices')
            .select('id')
            .eq('client_id', clientId)
            .eq('invoice_type', type)
            .eq('installment_no', safeInstallmentNo)
            .maybeSingle();

        if (existingInvoice) {
            // Varsa Güncelle (Üzerine Yaz)
            const { error: updateError } = await supabase.from('client_invoices')
                .update({
                    file_url: publicUrl, 
                    file_name: fileName,
                    status: 'draft',
                    total_installments: type === 'maintenance' ? 1 : safeTotalInstallments
                })
                .eq('id', existingInvoice.id);
            if (updateError) throw new Error("Database Update Error: " + updateError.message);
        } else {
            // Yoksa Yeni Kayıt Oluştur
            const { error: insertError } = await supabase.from('client_invoices').insert({
                client_id: clientId,
                file_name: fileName,
                file_url: publicUrl,
                status: 'draft',
                invoice_type: type,                     
                installment_no: safeInstallmentNo,      
                total_installments: type === 'maintenance' ? 1 : safeTotalInstallments 
            });
            if (insertError) throw new Error("Database Entry Error: " + insertError.message);
        }

        return NextResponse.json({ success: true, url: publicUrl, fileName });

    } catch (error: any) {
        console.error("FATAL ERROR:", error);
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
    }
}