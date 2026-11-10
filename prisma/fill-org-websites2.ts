import 'dotenv/config';
import { prisma } from '../lib/prisma';
const SITES: Record<string, string> = {
  'RML Hospital': 'https://rmlh.nic.in', GPRB: 'https://gprb.gujarat.gov.in', SIL: 'https://scootersindia.com',
  RWF: 'https://rwf.indianrailways.gov.in', MCF: 'https://mcf.indianrailways.gov.in', NITIE: 'https://nitie.ac.in',
  'MPSC-MZ': 'https://mpsc.mizoram.gov.in', SPSC: 'https://spscskm.gov.in',
};
async function main() {
  for (const [shortName, website] of Object.entries(SITES)) {
    const r = await prisma.organization.updateMany({ where: { shortName, OR: [{ website: null }, { website: '' }] }, data: { website } });
    console.log(shortName + ': ' + (r.count ? 'set' : 'skipped'));
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
