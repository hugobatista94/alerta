import { Feed } from '@/components/Feed';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 px-4 py-6">
      <Feed />
    </main>
  );
}
