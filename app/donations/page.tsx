import type { Metadata } from "next";
import Link from "next/link";
import { HeartIcon } from "@/components/DonationBanner";
import { DONATION_PER_SESSION_EUR, formatDonation, getDonationTotal } from "@/lib/donations";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Coach Finder Kids Fund",
  description:
    "For every session booked on Coach Finder we set aside €1 to pay for football coaching for kids whose families can't afford it.",
  alternates: { canonical: "/donations" },
};

const steps = [
  {
    title: "A session is booked",
    body: `Every time a coach accepts a trial session booked through Coach Finder, we add €${DONATION_PER_SESSION_EUR} to the fund. It doesn't cost players or coaches anything extra: the money comes from Coach Finder.`,
  },
  {
    title: "The fund grows",
    body: "The total on our home page updates as sessions are booked, so you can see exactly how much has been set aside.",
  },
  {
    title: "Kids get coaching",
    body: "We use the fund to pay coaches on Coach Finder for sessions with kids whose families can't afford private coaching.",
  },
];

export default async function DonationsPage() {
  const total = await getDonationTotal();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / Kids Fund
      </nav>

      <div className="bg-primary-900 text-white rounded-2xl p-8 md:p-10 mb-10">
        <HeartIcon className="w-10 h-10 text-accent-400 mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Coach Finder Kids Fund</h1>
        <p className="text-primary-100 text-lg max-w-2xl mb-6">
          Every child who loves football deserves good coaching, whether or not their family can pay for it.
        </p>
        {total != null && (
          <div>
            <p className="text-5xl font-bold">{formatDonation(total)}</p>
            <p className="text-primary-100 mt-1">donated so far</p>
          </div>
        )}
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-primary-900 mb-3">What the fund does</h2>
        <p className="text-gray-700 text-lg mb-3">
          Private football coaching can make a big difference to a young player, but at €30 to €50 an hour it is out of
          reach for many families. The Kids Fund pays for coaching sessions for kids who can&apos;t afford them, so money
          is never the reason a talented or motivated kid misses out.
        </p>
        <p className="text-gray-700 text-lg">
          The sessions are given by verified coaches on Coach Finder, the same coaches you can find in our search.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-primary-900 mb-5">How it works</h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <li key={step.title} className="bg-white border border-gray-200 rounded-xl p-6">
              <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-primary-50 text-primary-700 font-bold mb-3">
                {i + 1}
              </span>
              <h3 className="font-semibold text-primary-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-primary-900 mb-3">Where the money goes</h2>
        <ul className="space-y-3 text-gray-700 text-lg">
          <li className="flex gap-3">
            <span className="text-primary-600 font-bold">•</span>
            <span>All of it goes to coaching sessions for kids. None of it is used to run Coach Finder.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary-600 font-bold">•</span>
            <span>We pay the coach directly for each session, at their normal rate.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary-600 font-bold">•</span>
            <span>
              The kids are young players in the Netherlands whose families can&apos;t afford private coaching.
            </span>
          </li>
        </ul>
      </section>

      <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-gray-700 flex-1">
          Want to help? Book your sessions through Coach Finder: each one adds €{DONATION_PER_SESSION_EUR} to the fund.
        </p>
        <Link
          href="/search?showAll=true"
          className="inline-block text-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-lg"
        >
          Find a coach
        </Link>
      </div>
    </div>
  );
}
