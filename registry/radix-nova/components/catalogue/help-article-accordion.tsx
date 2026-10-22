import type * as React from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface HelpArticle {
	content: React.ReactNode;
	id: string;
	title: React.ReactNode;
}

interface HelpArticleAccordionProps
	extends Omit<React.ComponentProps<"section">, "children"> {
	articles: HelpArticle[];
	defaultExpandedId?: string;
	heading: React.ReactNode;
}

function HelpArticleAccordion({
	articles,
	className,
	defaultExpandedId,
	heading,
	...props
}: HelpArticleAccordionProps) {
	if (articles.length === 0) return null;

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
				appearance="help-article"
				collapsible
				defaultValue={defaultExpandedId}
				type="single"
			>
				{articles.map((article) => (
					<AccordionItem
						appearance="help-article"
						key={article.id}
						value={article.id}
					>
						<AccordionTrigger appearance="help-article">
							{article.title}
						</AccordionTrigger>
						<AccordionContent appearance="help-article">
							{article.content}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</section>
	);
}

export { HelpArticleAccordion };
export type { HelpArticle, HelpArticleAccordionProps };
