import type { Metadata } from 'next';
import InstagramPanel from './InstagramPanel';

export const metadata: Metadata = { title:'Instagram | Administração RIESCADE',robots:{ index:false,follow:false } };
export default function Page() { return <InstagramPanel />; }
