import { Metadata } from "next";
import LegalTermsClient from "./LegalTermsClient";

// BROWSER SEKME ADI VE SEO AYARLARI BURADA YAPILIR
export const metadata: Metadata = {
    title: "Legal Blueprint | Novatrum",
    description: "General Terms & Conditions and foundational parameters governing our engineering partnerships.",
};

export default function LegalTermsPage() {
    // Sadece alttaki çevirili ve görsel kısmı çağırıyoruz
    return <LegalTermsClient />;
}