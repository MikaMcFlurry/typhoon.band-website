"use client";

import Link from "next/link";
import { useDict } from "@/components/i18n/DictProvider";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  const { dict, locale } = useDict();
  return (
    <section className="container-x flex min-h-[70svh] flex-col items-start justify-center pb-24 pt-[calc(var(--header-h)+48px)]">
      <p className="label">404</p>
      <h1 className="h-section mt-4 max-w-[18ch]">{dict.notFound.title}</h1>
      <p className="lede mt-6">{dict.notFound.body}</p>
      <Link className="btn btn-primary mt-10" href={`/${locale}`}>
        <Icon name="arrow-left" size={18} />
        {dict.notFound.cta}
      </Link>
    </section>
  );
}
