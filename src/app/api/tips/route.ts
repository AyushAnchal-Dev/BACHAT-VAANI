import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if tips exist, seed if empty
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
            category: "BUDGETING"
          },
          {
            contentEn: "Set a clear savings goal for emergency healthcare so you don't need to borrow when someone falls sick.",
            contentHi: "आपातकालीन स्वास्थ्य देखभाल के लिए एक स्पष्ट बचत लक्ष्य निर्धारित करें ताकि किसी के बीमार होने पर आपको उधार न लेना पड़े।",
            category: "LOANS"
          },
          {
            contentEn: "Track your daily expenses. Even saving ₹20 a day adds up to over ₹7,000 in a single year!",
            contentHi: "अपने दैनिक खर्चों को ट्रैक करें। एक दिन में ₹20 बचाने से भी एक साल में ₹7,000 से अधिक हो जाते हैं!",
            category: "SAVINGS"
          },
          {
            contentEn: "A savings streak keeps you disciplined. Try to deposit a small amount every single day.",
            contentHi: "बचत की लकीर आपको अनुशासित रखती है। हर दिन एक छोटी राशि जमा करने का प्रयास करें।",
            category: "BUDGETING"
          }
        ]
      });
    }

    const tips = await prisma.tip.findMany();
    // Select tip based on day of month to rotate daily
    const dayIndex = new Date().getDate() % tips.length;
    const tip = tips[dayIndex] || tips[0];

    return NextResponse.json({ success: true, tip });
  } catch (error) {
    console.error('API tips GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
