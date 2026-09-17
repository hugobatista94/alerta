import { Feed } from '@/components/Feed';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 px-4 pb-16 pt-6 sm:px-6">
      <Feed />
    </main>
  );
}
