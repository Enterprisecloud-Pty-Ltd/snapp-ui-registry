import type * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface HelpArticle {
  content: React.ReactNode
  id: string
  title: React.ReactNode
}

interface HelpArticleAccordionProps
  extends Omit<React.ComponentProps<"section">, "children"> {
  articles: HelpArticle[]
  defaultExpandedId?: string
  heading: React.ReactNode
}

function HelpArticleAccordion({
  articles,
  className,
  defaultExpandedId,
  heading,
  ...props
}: HelpArticleAccordionProps) {
  if (articles.length === 0) return null

  return (
    <section
      className={cn("flex flex-col gap-4 pb-4", className)}
      data-slot="snapp-help-article-accordion"
      {...props}
    >
      <h2 className="m-0 text-lg font-normal leading-5 text-snapp-text-brand">
        {heading}
      </h2>
      <Accordion
        className="border-b border-snapp-card-border"
        collapsible
        defaultValue={defaultExpandedId}
        type="single"
      >
        {articles.map((article) => (
          <AccordionItem
            className="border-t border-snapp-card-border not-last:border-b-0"
            key={article.id}
            value={article.id}
          >
            <AccordionTrigger className="rounded-none border-0 px-4 py-4 text-base font-normal leading-5 text-snapp-text-brand hover:no-underline">
              {article.title}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm font-normal leading-4 text-snapp-text-primary">
              {article.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export { HelpArticleAccordion }
export type { HelpArticle, HelpArticleAccordionProps }
