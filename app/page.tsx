'use client';
import JobDisplay from '@/components/JobDisplay';
import JobSearch from '@/components/JobSearch';

export default function Home() {
  return (
    <div className="p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <div className="pt-24 pb-12">
        <JobSearch onSearched={(what, where) => console.log(what, where)} />
      </div>
      <JobDisplay />
    </div>
  );
}
