"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon } from "@/components/icons";
import { CATEGORIES, categoryLabel, type CategoryId } from "@/lib/categories";
import type { Video } from "@/lib/types";

type Filter = "all" | CategoryId;

export function SelectedWork({ videos }: { videos: Video[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown =
    filter === "all" ? videos : videos.filter((video) => video.category === filter);

  return (
    <section id="work" className="mx-auto max-w-[1120px] px-5 py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Selected work</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All work
          </FilterChip>
          {CATEGORIES.map((category) => (
            <FilterChip
              key={category.id}
              active={filter === category.id}
              onClick={() => setFilter(category.id)}
            >
              {category.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {videos.length === 0 && filter === "all" ? (
        <PlaceholderGrid />
      ) : shown.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing in this category yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {shown.map((video, index) => (
            <VideoCard key={video.id} video={video} featured={index === 0} />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`press h-11 shrink-0 rounded-full px-4 text-sm font-medium ${
        active
          ? "bg-white text-black"
          : "border border-white/10 bg-white/5 text-white/80"
      }`}
    >
      {children}
    </button>
  );
}

function VideoCard({ video, featured }: { video: Video; featured: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [engaged, setEngaged] = useState(false);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const hoverNone = window.matchMedia("(hover: none)").matches;
    if (!hoverNone) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (engaged) return;
        if (entry.isIntersecting) {
          void element.play();
        } else {
          element.pause();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [engaged]);

  function toggle() {
    const element = ref.current;
    if (!element) return;
    if (!engaged) {
      element.muted = false;
      element.controls = true;
      setEngaged(true);
      void element.play();
      return;
    }
    if (element.paused) {
      void element.play();
    } else {
      element.pause();
    }
  }

  return (
    <article className={featured ? "sm:col-span-2" : undefined}>
      <div
        className={`lift group relative overflow-hidden rounded-[28px] border border-white/8 bg-card ${
          featured ? "aspect-[16/9] sm:aspect-[16/8]" : "aspect-[16/10]"
        }`}
      >
        <video
          ref={ref}
          src={video.blobUrl}
          muted
          loop
          playsInline
          preload={featured ? "auto" : "metadata"}
          className="h-full w-full object-cover"
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onMouseEnter={(event) => {
            if (!engaged) void event.currentTarget.play();
          }}
          onMouseLeave={(event) => {
            if (!engaged) event.currentTarget.pause();
          }}
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={
            engaged && !paused ? `Pause ${video.title}` : `Play ${video.title}`
          }
          className="press absolute right-4 bottom-4 grid h-11 w-11 place-items-center rounded-full bg-white text-black shadow-lg"
        >
          {engaged && !paused ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4 px-1">
        <h3 className="font-medium tracking-tight">{video.title}</h3>
        <p className="shrink-0 text-sm text-muted">{categoryLabel(video.category)}</p>
      </div>
    </article>
  );
}

function PlaceholderGrid() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <Frame className="aspect-[16/9] sm:col-span-2 sm:aspect-[16/8]">
        <div className="absolute top-1/2 left-[16%] h-36 w-36 -translate-y-1/2 rounded-full border border-white/30 sm:h-48 sm:w-48" />
        <div className="absolute top-1/2 right-[14%] h-44 w-44 -translate-y-1/2 rounded-full bg-blue sm:h-64 sm:w-64" />
        <span className="absolute top-1/2 right-[30%] h-3 w-3 -translate-y-1/2 rounded-full bg-white" />
      </Frame>
      <Frame className="aspect-[16/10]">
        <div className="absolute top-[22%] left-[14%] h-28 w-28 rounded-[28px] bg-[#ffb199] sm:h-36 sm:w-36" />
        <div className="absolute top-[36%] left-[28%] h-24 w-24 rounded-[24px] bg-orange sm:h-28 sm:w-28" />
        <div className="absolute top-[28%] left-[46%] h-28 w-28 rounded-full bg-black sm:h-32 sm:w-32" />
        <div className="absolute top-[52%] left-[68%] h-7 w-7 rounded-full bg-blue" />
      </Frame>
      <Frame className="aspect-[16/10]">
        <div className="flex h-full items-end justify-center gap-3 px-10 pb-16 sm:gap-4 sm:px-14">
          <div className="h-[42%] w-8 rounded-t-xl bg-blue sm:w-10" />
          <div className="h-[68%] w-8 rounded-t-xl bg-white/25 sm:w-10" />
          <div className="h-[52%] w-8 rounded-t-xl bg-coral sm:w-10" />
          <div className="h-[82%] w-8 rounded-t-xl bg-orange sm:w-10" />
        </div>
      </Frame>
      <Frame className="aspect-[16/10]">
        <div className="absolute inset-0 bg-[#ff6436]" />
        <div className="absolute top-1/2 left-[18%] h-32 w-32 -translate-y-1/2 rounded-full bg-black sm:h-40 sm:w-40" />
        <div className="absolute top-[28%] left-[52%] h-6 w-6 rounded-full bg-blue" />
      </Frame>
      <Frame className="aspect-[16/10]">
        <div className="absolute inset-0 bg-blue" />
        <div className="absolute top-[34%] left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-[#d7e2ff]" />
        <div className="absolute top-[58%] left-1/2 h-36 w-56 -translate-x-1/2 rounded-t-[999px] bg-[#d7e2ff]" />
      </Frame>
      <Frame className="aspect-[16/9] sm:col-span-2 sm:aspect-[16/7]">
        <div className="grid h-full place-items-center">
          <div className="relative h-40 w-40 sm:h-52 sm:w-52">
            <div className="absolute inset-0 rounded-full border border-white/25" />
            <div className="absolute inset-5 rounded-full border border-blue-soft/80" />
            <div className="absolute inset-12 rounded-full border border-white/40" />
            <span className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral" />
          </div>
        </div>
      </Frame>
    </div>
  );
}

function Frame({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div
      className={`lift relative overflow-hidden rounded-[28px] border border-white/8 bg-[#101018] ${className}`}
    >
      {children}
      <span
        className="absolute right-4 bottom-4 grid h-11 w-11 place-items-center rounded-full bg-white text-black"
        aria-hidden="true"
      >
        <PlayIcon />
      </span>
    </div>
  );
}
