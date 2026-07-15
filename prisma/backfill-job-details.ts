import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  await prisma.notification.update({
    where: { slug: 'rrb-technician-2026' },
    data: {
      applicationFeeGeneral: 'Rs 500 (refundable on appearing for CBT)',
      applicationFeeScSt: 'Rs 250 (refundable on appearing for CBT)',
      selectionProcess: ['Computer Based Test (CBT)', 'Computer Based Aptitude Test', 'Document Verification', 'Medical Examination'],
      howToApply: 'Eligible candidates can apply online through the official RRB website. Visit the recruitment portal, register with a valid email and mobile number, fill in the application form, upload required documents, pay the application fee, and submit before the last date.',
    },
  });

  await prisma.notification.update({
    where: { slug: 'ssc-aso-2026' },
    data: {
      applicationFeeGeneral: 'Rs 100',
      applicationFeeScSt: 'Exempted',
      selectionProcess: ['Tier 1: Computer Based Exam', 'Tier 2: Descriptive Paper', 'Document Verification'],
      howToApply: 'Candidates must apply online via the SSC official website (ssc.nic.in). Complete one-time registration, fill in the application, upload photograph and signature, pay the fee, and submit before the deadline.',
    },
  });

  await prisma.notification.update({
    where: { slug: 'ibps-po-2026' },
    data: {
      applicationFeeGeneral: 'Rs 850',
      applicationFeeScSt: 'Rs 175',
      selectionProcess: ['Preliminary Exam', 'Main Exam', 'Interview'],
      howToApply: 'Apply online through the IBPS official website. Register, fill in personal and educational details, upload photograph/signature, pay the application fee online, and submit the form before the last date.',
    },
  });

  await prisma.notification.update({
    where: { slug: 'iaf-agniveervayu-2026' },
    data: {
      applicationFeeGeneral: 'Rs 250',
      applicationFeeScSt: 'Rs 250',
      selectionProcess: ['Online Written Test', 'Physical Fitness Test', 'Medical Examination'],
      howToApply: 'Apply online through the official Agnipath Vayu portal. Register with valid credentials, fill the application, upload documents, pay the fee, and submit before the closing date.',
    },
  });

  console.log('Backfill complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
