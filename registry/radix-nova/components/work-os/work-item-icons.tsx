import type { SVGProps } from "react"

import type { WorkItemIcon } from "@/components/snapp/work-os/work-item.types"

type IconProps = SVGProps<SVGSVGElement>

function WorkGripIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="5"
      viewBox="0 0 12 5"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0 .5A.5.5 0 0 1 .5 0h11a.5.5 0 0 1 0 1H.5A.5.5 0 0 1 0 .5Zm0 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function BookWorkIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      viewBox="0 0 13 16"
      width="13"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 5.5a.5.5 0 0 1 .5-.5h1.29l.22-1.1a.5.5 0 1 1 .98.2L5.81 5h.98l.22-1.1a.5.5 0 0 1 .98.2L7.81 5h.94a.5.5 0 0 1 0 1H7.61l-.2 1H8.5a.5.5 0 0 1 0 1H7.21l-.22 1.1a.5.5 0 1 1-.98-.2L6.19 8h-.98l-.22 1.1a.5.5 0 0 1-.98-.2L4.19 8h-.94a.5.5 0 0 1 0-1h1.14l.2-1H3.5a.5.5 0 0 1-.5-.5ZM6.39 7l.2-1h-.98l-.2 1h.98ZM2 0h8a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.5.5H1a1 1 0 0 0 1 1h9.5a.5.5 0 0 1 0 1H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2ZM1 13h10V2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v11Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ClipboardWorkIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      viewBox="0 0 12 16"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.85 7.85a.5.5 0 0 0-.7-.7L5 10.29 3.85 9.15a.5.5 0 0 0-.7.7l1.5 1.5a.5.5 0 0 0 .7 0l3.5-3.5ZM4.5 0a1.5 1.5 0 0 0-1.41 1H1.5A1.5 1.5 0 0 0 0 2.5v12A1.5 1.5 0 0 0 1.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 10.5 1H8.91A1.5 1.5 0 0 0 7.5 0h-3ZM4 1.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM1.5 2h1.59A1.5 1.5 0 0 0 4.5 3h3a1.5 1.5 0 0 0 1.41-1h1.59a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function BugWorkIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="15"
      viewBox="0 0 16 15"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7 .5a.5.5 0 0 0-1 0V1c0 .4.12.77.32 1.08A3 3 0 0 0 4 5h-.5A1.5 1.5 0 0 1 2 3.5v-2a.5.5 0 0 0-1 0v2A2.5 2.5 0 0 0 3.5 6H4v1.5H.5a.5.5 0 0 0 0 1H4V10h-.5A2.5 2.5 0 0 0 1 12.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 1 3.5 11H4a4 4 0 0 0 8 0h.5a1.5 1.5 0 0 1 1.5 1.5v2a.5.5 0 0 0 1 0v-2a2.5 2.5 0 0 0-2.5-2.5H12V8.5h3.5a.5.5 0 0 0 0-1H12V6h.5A2.5 2.5 0 0 0 15 3.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 1 12.5 5H12a3 3 0 0 0-2.32-2.92c.2-.31.32-.68.32-1.08V.5a.5.5 0 0 0-1 0V1a1 1 0 0 1-2 0V.5ZM11 5v6a3 3 0 0 1-6 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ClockWorkIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="12"
      viewBox="0 0 12 12"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0Zm0 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1Zm-.5 2a.5.5 0 0 1 .5.5V6h1.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function WorkTypeIcon({ type }: { type: WorkItemIcon }) {
  if (type === "none") {
    return <span aria-hidden="true" className="size-5" />
  }

  const icons = {
    book: <BookWorkIcon className="text-snapp-icon-blue" />,
    bug: <BugWorkIcon className="text-snapp-icon-red" />,
    clipboard: <ClipboardWorkIcon className="text-snapp-icon-amber" />,
  }

  return (
    <span className="inline-flex size-5 shrink-0 items-center justify-center">
      {icons[type]}
    </span>
  )
}

export { ClockWorkIcon, WorkGripIcon, WorkTypeIcon }
