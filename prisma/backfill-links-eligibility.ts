import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  // ---------------- RRB Technician ----------------
  const rrb = await prisma.notification.findUnique({ where: { slug: 'rrb-technician-2026' }, include: { posts: true } });
  if (rrb) {
    await prisma.notificationLink.deleteMany({ where: { notificationId: rrb.id } });
    await prisma.notificationLink.createMany({
      data: [
        { notificationId: rrb.id, label: 'Apply Online', url: 'https://www.rrbapply.gov.in', linkType: 'APPLY_ONLINE', order: 0 },
        { notificationId: rrb.id, label: 'Download Notification', url: 'https://www.rrbapply.gov.in/notification', linkType: 'NOTIFICATION_PDF', order: 1 },
        { notificationId: rrb.id, label: 'Official Website', url: 'https://indianrailways.gov.in', linkType: 'OFFICIAL_WEBSITE', order: 2 },
      ],
    });
    if (rrb.posts[0]) {
      await prisma.post.update({
        where: { id: rrb.posts[0].id },
        data: {
          educationDetails: 'Matriculation (10th) or ITI from a recognized institution in the relevant trade.',
          ageRelaxation: { OBC: '+3 years', SC: '+5 years', ST: '+5 years', PwD: '+10 years', 'Ex-Servicemen': 'As per rules' },
        },
      });
    }
  }

  // ---------------- SSC ASO ----------------
  const ssc = await prisma.notification.findUnique({ where: { slug: 'ssc-aso-2026' }, include: { posts: true } });
  if (ssc) {
    await prisma.notificationLink.deleteMany({ where: { notificationId: ssc.id } });
    await prisma.notificationLink.createMany({
      data: [
        { notificationId: ssc.id, label: 'Apply Online', url: 'https://ssc.nic.in/apply', linkType: 'APPLY_ONLINE', order: 0 },
        { notificationId: ssc.id, label: 'Download Notification', url: 'https://ssc.nic.in/notification', linkType: 'NOTIFICATION_PDF', order: 1 },
        { notificationId: ssc.id, label: 'Official Website', url: 'https://ssc.nic.in', linkType: 'OFFICIAL_WEBSITE', order: 2 },
      ],
    });
    if (ssc.posts[0]) {
      await prisma.post.update({
        where: { id: ssc.posts[0].id },
        data: {
          educationDetails: 'Bachelor\u0027s degree in any discipline from a recognized university.',
          ageRelaxation: { OBC: '+3 years', SC: '+5 years', ST: '+5 years', PwD: '+10 years' },
        },
      });
    }
  }

  // ---------------- IBPS PO ----------------
  const ibps = await prisma.notification.findUnique({ where: { slug: 'ibps-po-2026' }, include: { posts: true } });
  if (ibps) {
    await prisma.notificationLink.deleteMany({ where: { notificationId: ibps.id } });
    await prisma.notificationLink.createMany({
      data: [
        { notificationId: ibps.id, label: 'Apply Online', url: 'https://www.ibps.in/apply', linkType: 'APPLY_ONLINE', order: 0 },
        { notificationId: ibps.id, label: 'Official Website', url: 'https://www.ibps.in', linkType: 'OFFICIAL_WEBSITE', order: 1 },
      ],
    });
    if (ibps.posts[0]) {
      await prisma.post.update({
        where: { id: ibps.posts[0].id },
        data: {
          educationDetails: 'Graduate in any discipline from a university recognized by the Govt. of India.',
          ageRelaxation: { OBC: '+3 years', SC: '+5 years', ST: '+5 years', PwD: '+10 years', 'Ex-Servicemen': '+5 years' },
        },
      });
    }
  }

  // ---------------- IAF Agniveervayu (with physical criteria) ----------------
  const iaf = await prisma.notification.findUnique({ where: { slug: 'iaf-agniveervayu-2026' }, include: { posts: true } });
  if (iaf) {
    await prisma.notificationLink.deleteMany({ where: { notificationId: iaf.id } });
    await prisma.notificationLink.createMany({
      data: [
        { notificationId: iaf.id, label: 'Apply Online', url: 'https://agnipathvayu.cdac.in/apply', linkType: 'APPLY_ONLINE', order: 0 },
        { notificationId: iaf.id, label: 'Download Notification', url: 'https://agnipathvayu.cdac.in/notification', linkType: 'NOTIFICATION_PDF', order: 1 },
        { notificationId: iaf.id, label: 'Official Website', url: 'https://indianairforce.nic.in', linkType: 'OFFICIAL_WEBSITE', order: 2 },
      ],
    });
    if (iaf.posts[0]) {
      await prisma.post.update({
        where: { id: iaf.posts[0].id },
        data: {
          educationDetails: 'Passed 12th with Physics, Chemistry and Mathematics from a recognized board, or equivalent vocational course.',
          ageRelaxation: { 'Ex-Servicemen': 'As per rules' },
          physicalCriteria: {
            'Height (Male)': '152.5 cm minimum',
            'Height (Female)': '152 cm minimum',
            'Chest (Male)': 'Minimum expansion 5 cm',
            Vision: '6/6 in one eye, 6/9 in other (correctable)',
          },
        },
      });
    }
  }

  console.log('Links and eligibility backfill complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
