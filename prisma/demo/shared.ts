import { todayIST } from '../../lib/job-status';

export const DEMO_DOMAIN = '@demo.govmatch.test';
export const DEMO_PASSWORD = 'Demo@12345';
export const DEMO_LINK = 'https://demo.govmatch.test/notice';
export const DAY_MS = 86_400_000;

/** The IST calendar day this many days from today, as YYYY-MM-DD. */
export const dayOffset = (n: number) => new Date(todayIST().getTime() + n * DAY_MS).toISOString().slice(0, 10);

/** A birth date that makes the person exactly `age` today, with a 30 day margin so the birthday never flips mid-run. */
export function dobForAge(age: number): Date {
  const d = new Date(todayIST());
  d.setUTCFullYear(d.getUTCFullYear() - age);
  d.setUTCDate(d.getUTCDate() - 30);
  return d;
}

export interface Rule { category: string; status: string; years?: number; maxAge?: number }

export interface PostDef {
  title: string;
  quals: string[];
  /** Branch (field) the post asks for, such as "Computer Science". */
  field?: string;
  minAge: number;
  maxAge: number | null;
  type: string;
  vacancies: number;
  gender?: 'MALE' | 'FEMALE';
  minHeight?: number;
  minChest?: number;
  domicile?: string;
  minExperience?: number;
  certs?: string[];
  rules?: Rule[];
  pwdTypes?: string[];
}

export interface Change {
  kind: 'POSTPONED' | 'PREPONED' | 'TIME_ADDED';
  daysAgo: number;
  oldDay: number | null;
  oldTime?: string;
  newDay: number | null;
  newTime?: string;
  reason?: string;
}

/** day and time are the ORIGINAL schedule; `changes` are the moves after that, in order. */
export interface EventDef { kind: string; label: string; day: number | null; time?: string; changes?: Change[] }

export interface JobDef {
  key: string;
  title: string;
  org: string;
  stateCode?: string;
  status?: string;
  published?: boolean;
  schedule: EventDef[];
  posts: PostDef[];
  direct?: string;
  admitCards?: { title: string; releaseDay: number; examDay: number | null }[];
  results?: { title: string; type: string; day: number }[];
  answerKeys?: { title: string; day: number; objectionDay: number | null }[];
  /** Expected lifecycle phase today. */
  phase: 'UPCOMING' | 'LIVE' | 'CLOSED' | 'CANCELLED';
  /** For LIVE jobs: are applications still being accepted? */
  open?: boolean;
}

export interface UserDef {
  key: string;
  name: string;
  age: number | null;
  category: string;
  gender: string;
  education: { qual: string; subject?: string }[];
  disability?: { types: string[]; percent: number };
  statuses?: string[];
  domicile?: string;
  experience?: number;
  certs?: string[];
  height?: number;
  chest?: number;
  prefTypes?: string[];
  plan?: 'FREE' | 'PREMIUM_60' | 'PREMIUM_EXPIRED';
  active?: boolean;
  saved?: string[];
  applied?: string[];
}
