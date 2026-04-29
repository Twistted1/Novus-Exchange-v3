import React from "react";

const outgrowSignals = [
  "You need to run complex, long-running data processing jobs that exceed Edge Function timeouts.",
  "You are building a highly specialized search engine that requires custom Elasticsearch/Typesense clusters.",
  "You need to deploy the database in a specific region or on-premise for compliance reasons.",
  "Your team grows to include dedicated DevOps engineers who want to manage infrastructure as code.",
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-24 bg-black w-full">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_20%,rgba(220,38,38,0.12),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(220,38,38,0.08),transparent_40%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/35 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <p className="text-red-500 text-xs font-bold tracking-[0.22em] uppercase mb-4">Architecture</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-5">
            Built on Supabase
          </h2>
          <p className="text-gray-400 leading-relaxed">
            We chose Supabase as the foundational layer for the Novus Ecosystem. It provides the perfect balance of speed, scalability, and structure for a modern media and SaaS platform.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">When Supabase is enough</p>
            <h3 className="text-2xl font-black text-white mb-3">For your current stage, it is enough</h3>
            <p className="text-gray-400 leading-relaxed mb-4">
              For a media brand plus early-stage SaaS ecosystem, Supabase can comfortably power content, auth, storage, forms, waitlists,
              and admin workflows. The goal right now should be structure, not stack complexity.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2"><span className="text-red-400">•</span><span>Keep the CMS on top of Supabase</span></li>
              <li className="flex gap-2"><span className="text-red-400">•</span><span>Use Edge Functions for server-side actions</span></li>
              <li className="flex gap-2"><span className="text-red-400">•</span><span>Use Storage for images, PDFs, demos, and upload pipelines</span></li>
              <li className="flex gap-2"><span className="text-red-400">•</span><span>Use Postgres schemas and RLS to keep products and editorial data organised</span></li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-red-600/10 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">When to add more infrastructure</p>
            <h3 className="text-2xl font-black text-white mb-3">Only expand when you hit real bottlenecks</h3>
            <ul className="space-y-3 text-sm text-gray-300 leading-relaxed">
              {outgrowSignals.map((signal) => (
                <li key={signal} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.18em] text-red-300 mb-2">Next step</p>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Need the exact tables, buckets, and function list?</h3>
              <p className="text-gray-400 leading-relaxed">
                The next section turns this strategy into a concrete Supabase implementation plan for your CMS, website, uploads, waitlists,
                and product ecosystem.
              </p>
            </div>
            <a
              href="#implementation-plan"
              className="inline-flex items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-red-200 hover:bg-red-500/15 transition-colors text-center"
            >
              View Implementation Plan
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
