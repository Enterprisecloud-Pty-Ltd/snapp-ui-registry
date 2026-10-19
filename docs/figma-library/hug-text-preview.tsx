import * as React from "react";
import { createRoot } from "react-dom/client";

import { HugText } from "@/components/ui/hug-text";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpandedTab } from "@/components/snapp/navigation/navigation-header";
import {
	Tabs as BaselineTabs,
	TabsList as BaselineTabsList,
	TabsTrigger as BaselineTabsTrigger,
} from "@baseline-tabs";

import css from "./compiled.css?raw";

interface PreviewProps {
	label: string;
	weight: number;
	family: string;
}

function Preview({ label, weight, family }: PreviewProps) {
	return (
		<div
			className="ec-app flex flex-col items-start gap-4 p-4"
			style={{ fontFamily: "Aptos", fontSize: 14, lineHeight: "20px" }}
		>
			<Tabs defaultValue="one" data-probe="single">
				<TabsList aria-label="Single tab" className="p-0">
					<TabsTrigger value="one">Item</TabsTrigger>
				</TabsList>
			</Tabs>
			<ExpandedTab data-probe="expanded" label="Item" nextLabel="Item" />
			<Tabs defaultValue="0">
				<TabsList aria-label="Eight tabs" data-probe="menu">
					{Array.from({ length: 8 }, (_, index) => (
						<TabsTrigger key={index} value={String(index)}>
							Item
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>
			<Tabs defaultValue="dynamic">
				<TabsList aria-label="Dynamic tabs">
					<TabsTrigger
						data-probe="dynamic"
						style={{ fontFamily: family, fontWeight: weight }}
						value="dynamic"
					>
						{label}
					</TabsTrigger>
					<TabsTrigger data-probe="chunks" value="chunks">
						{"It"}
						<React.Fragment>
							{"em"}
							{2}
						</React.Fragment>
						{null}
						{false}
					</TabsTrigger>
					<TabsTrigger data-probe="icon" value="icon">
						<svg aria-hidden="true" className="size-3" viewBox="0 0 12 12">
							<path d="M0 0H12V12H0Z" />
						</svg>
						{"It"}
						{"em"}
					</TabsTrigger>
					<TabsTrigger data-probe="complex" value="complex">
						<span data-custom-label="">Rich label</span>
					</TabsTrigger>
				</TabsList>
			</Tabs>
			<Tabs defaultValue="native">
				<TabsList aria-label="Native child">
					<TabsTrigger asChild value="native">
						<a data-probe="as-child" href="#native-child">
							Native link
						</a>
					</TabsTrigger>
				</TabsList>
			</Tabs>
			<BaselineTabs defaultValue="first">
				<BaselineTabsList aria-label="Baseline keyboard tabs">
					{["first", "second", "third", "fourth"].map((value) => (
						<BaselineTabsTrigger key={value} value={value}>
							{value === "first" ? "Item" : value}
						</BaselineTabsTrigger>
					))}
				</BaselineTabsList>
			</BaselineTabs>
			<div style={{ transform: "scale(1.5)", transformOrigin: "left top" }}>
				<HugText data-probe="transformed">Item</HugText>
			</div>
		</div>
	);
}

const mounts = ["standalone", "first-shadow", "second-shadow"].map((id) => {
	const host = document.getElementById(id)!;
	const target =
		id === "standalone" ? host : host.attachShadow({ mode: "open" });
	if (target instanceof ShadowRoot) {
		const style = document.createElement("style");
		style.textContent = css;
		target.append(style);
	}
	const container = document.createElement("div");
	target.append(container);
	const root = createRoot(container);
	let props: PreviewProps = { label: "Item", weight: 400, family: "Aptos" };
	const update = (next: Partial<PreviewProps>) => {
		props = { ...props, ...next };
		root.render(<Preview {...props} />);
	};
	update({});
	return { id, update, unmount: () => root.unmount() };
});

Object.assign(window, { __HUG_TEXT_PREVIEW__: mounts });
