import AetherImageEditor from '@/components/AetherImageEditor';
import { Suspense } from 'react';

export default function Home() {
  return (
    <Suspense>
      <AetherImageEditor />
    </Suspense>
  );
}
