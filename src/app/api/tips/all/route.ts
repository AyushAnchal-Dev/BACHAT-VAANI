import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tips/all – Public endpoint to fetch all tips for the learn page
export async function GET() {
  try {
    // Ensure seed tips exist
    const count = await prisma.tip.count();
    if (count === 0) {
      await prisma.tip.createMany({
        data: [
          {
            contentEn: "Save at least 10% of your daily wage before spending on non-essentials.",
            contentHi: "गैर-जरूरी चीजों पर खर्च करने से पहले अपनी दैनिक मजदूरी का कम से कम 10% बचाएं।",
            category: "SAVINGS"
          },
          {
            contentEn: "Avoid high-interest local money lenders. Rely on micro-savings and self-help groups instead.",
            contentHi: "उच्च ब्याज वाले स्थानीय साहूकारों से बचें। इसके बजाय माइक्रो-बचत और स्वयं सहायता समूहों पर भरोसा करें।",
            category: "LOANS"
          },
          {
            contentEn: "Set a clear savings goal for emergency healthcare so you don't need to borrow when someone falls sick.",
            contentHi: "आपातकालीन स्वास्थ्य देखभाल के लिए एक स्पष्ट बचत लक्ष्य निर्धारित करें ताकि किसी के बीमार होने पर आपको उधार न लेना पड़े।",
            category: "EMERGENCY"
          },
          {
            contentEn: "Track your daily expenses. Even saving ₹20 a day adds up to over ₹7,000 in a single year!",
            contentHi: "अपने दैनिक खर्चों को ट्रैक करें। एक दिन में ₹20 बचाने से भी एक साल में ₹7,000 से अधिक हो जाते हैं!",
            category: "SAVINGS"
          },
          {
            contentEn: "A savings streak keeps you disciplined. Try to deposit a small amount every single day.",
            contentHi: "बचत की लकीर आपको अनुशासित रखती है। हर दिन एक छोटी राशि जमा करने का प्रयास करें।",
            category: "SAVINGS"
          },
          {
            contentEn: "UPI payments are free and instant. Use apps like BHIM, Google Pay, or PhonePe for cashless transactions.",
            contentHi: "UPI भुगतान मुफ्त और तत्काल हैं। कैशलेस लेनदेन के लिए BHIM, Google Pay या PhonePe जैसे ऐप का उपयोग करें।",
            category: "DIGITAL"
          },
          {
            contentEn: "Never share your OTP or UPI PIN with anyone — not even bank employees.",
            contentHi: "अपना OTP या UPI PIN किसी के साथ साझा न करें — बैंक कर्मचारियों के साथ भी नहीं।",
            category: "DIGITAL"
          },
        ]
      });
    }

    const tips = await prisma.tip.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tips });
  } catch (error) {
    console.error('API tips/all GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
