import type { SVGProps } from "react";
import grip from "@/assets/snapp/work/2c7aa.svg";
import book from "@/assets/snapp/work/e7672.svg";
import task from "@/assets/snapp/work/234ca.svg";
import bug from "@/assets/snapp/work/18d12.svg";
import clock from "@/assets/snapp/work/66936.svg";
import type { WorkItemIcon } from "@/components/snapp/work-os/work-item.types";

type IconProps = SVGProps<SVGSVGElement>;

/** Legacy SVG-shaped API backed by the unmodified Figma asset. */
function WorkGripIcon(props: IconProps) {
	return (
		<svg
			aria-hidden="true"
			width={12}
			height={5}
			viewBox="0 0 12 5"
			{...props}
		>
			<image href={grip} width={12} height={5} />
		</svg>
	);
}
function ClockWorkIcon(props: IconProps) {
	return (
		<svg
			aria-hidden="true"
			width={12}
			height={12}
			viewBox="0 0 12 12"
			{...props}
		>
			<image href={clock} width={12} height={12} />
		</svg>
	);
}
function WorkTypeIcon({ type }: { type: WorkItemIcon }) {
	const src = { book, clipboard: task, bug, none: undefined }[type];
	return src ? (
		<img src={src} alt="" width={20} height={20} className="shrink-0" />
	) : (
		<span aria-hidden="true" className="size-5 shrink-0" />
	);
}

export { ClockWorkIcon, WorkGripIcon, WorkTypeIcon };
