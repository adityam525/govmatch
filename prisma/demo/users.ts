import type { UserDef } from './shared';

const edu = (qual: string, subject?: string) => ({ qual, subject });
const user = (key: string, name: string, age: number | null, education: UserDef['education'], o: Partial<UserDef> = {}): UserDef => ({
  key, name, age, category: 'General', gender: 'Male', education, ...o,
});
const SCHOOL = [edu('10th Pass'), edu('12th Pass')];
const WITH_BA = [...SCHOOL, edu('B.A', 'History')];

export const USERS: UserDef[] = [
  // ---- Education
  user('grad-cs', 'Demo B.Tech CS', 25, [...SCHOOL, edu('B.Tech / B.E', 'Computer Science')], { domicile: 'BR', height: 175, chest: 82 }),
  user('tenth-only', 'Demo 10th Pass', 22, [edu('10th Pass')], { gender: 'Female' }),
  user('diploma-civil', 'Demo Diploma Civil', 24, [edu('10th Pass'), edu('Diploma (Engineering)', 'Civil')]),
  user('iti', 'Demo ITI', 21, [edu('ITI')]),
  user('two-ma', 'Demo Two M.A', 28, [edu('B.A', 'History'), edu('M.A', 'History'), edu('M.A', 'Economics')], { gender: 'Female' }),
  user('mtech-cs', 'Demo M.Tech CS', 30, [edu('B.Tech / B.E', 'Mechanical'), edu('M.Tech / M.E', 'Computer Science')]),

  // ---- Age relaxation
  user('twelfth-obc', 'Demo 12th OBC', 29, SCHOOL, { category: 'OBC' }),
  user('general-over', 'Demo General Over Age', 29, SCHOOL),
  user('pwd-locomotor', 'Demo PwD Locomotor 50', 36, WITH_BA, { disability: { types: ['LOCOMOTOR'], percent: 50 } }),
  user('pwd-hearing', 'Demo PwD Hearing 60', 36, WITH_BA, { disability: { types: ['HEARING'], percent: 60 } }),
  user('pwd-low', 'Demo PwD Locomotor 30', 36, WITH_BA, { disability: { types: ['LOCOMOTOR'], percent: 30 } }),
  user('ex-serviceman', 'Demo Ex-serviceman', 40, SCHOOL, { statuses: ['EX_SERVICEMAN'], height: 175, chest: 84 }),
  user('widow', 'Demo Widow', 33, [...SCHOOL, edu('B.Com')], { gender: 'Female', statuses: ['WIDOW'] }),

  // ---- Other requirements
  user('experienced-ctet', 'Demo Experienced CTET', 32, WITH_BA, { experience: 3, certs: ['CTET'], domicile: 'BR' }),
  user('short', 'Demo Short Candidate', 24, [edu('12th Pass')], { height: 165, chest: 78 }),
  user('up-resident', 'Demo UP Resident', 26, [edu('12th Pass'), edu('B.Sc', 'Physics')], { domicile: 'UP' }),
  user('contract-only', 'Demo Contract Only', 26, SCHOOL, { prefTypes: ['CONTRACT'] }),

  // ---- Incomplete profiles
  user('no-education', 'Demo No Education', 25, []),
  user('no-dob', 'Demo No Birth Date', null, SCHOOL),

  // ---- Accounts and plans
  user('premium', 'Demo Premium', 27, [...SCHOOL, edu('B.Tech / B.E', 'Computer Science')], {
    plan: 'PREMIUM_60',
    saved: ['l-closes-in-2', 'l-closes-today', 's-postponed-twice', 's-time-added', 'e-tenth'],
    applied: ['x-admit-card', 's-date-tba'],
  }),
  user('premium-expired', 'Demo Premium Expired', 27, SCHOOL, { plan: 'PREMIUM_EXPIRED' }),
  user('free-saver', 'Demo Free Saver', 27, SCHOOL, { plan: 'FREE', saved: ['s-time-added'] }),
  user('deactivated', 'Demo Deactivated', 27, SCHOOL, { active: false }),
];
