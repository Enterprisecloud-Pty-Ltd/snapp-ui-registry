import * as React from "react";
import { createRoot } from "react-dom/client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import css from "./compiled.css?raw";

const values = ["first", "disabled", "second", "third"];
const navigationKeys = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
];
const changes: { host: string; name: string; value: string }[] = [];
const bubbleEvents: {
  host: string;
  name: string;
  key: string;
  defaultPrevented: boolean;
}[] = [];

const CustomTab = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(function CustomTab({ children, ...props }, ref) {
  return (
    <button {...props} type="button" ref={ref}>
      <span data-custom-label="">{children}</span>
    </button>
  );
});

interface CaseProps {
  host: string;
  name: string;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  manual?: boolean;
  controlled?: boolean;
  asChild?: boolean;
  loop?: boolean;
  cancel?: "trigger" | "list" | "capture";
  cancelFocus?: boolean;
  redirectFocus?: boolean;
  offscreen?: boolean;
}

function KeyboardCase({
  host,
  name,
  orientation = "horizontal",
  dir = "ltr",
  manual,
  controlled,
  asChild,
  loop = true,
  cancel,
  cancelFocus,
  redirectFocus,
  offscreen,
}: CaseProps) {
  const [value, setValue] = React.useState("first");
  const redirect = React.useRef<HTMLButtonElement>(null);
  const cancelNavigation = (event: React.KeyboardEvent) => {
    if (navigationKeys.includes(event.key)) event.preventDefault();
  };
  const handleValueChange = (next: string) => {
    changes.push({ host, name, value: next });
    if (controlled) setValue(next);
  };
  return (
    <section
      data-case={name}
      data-scroll-viewport={offscreen ? "" : undefined}
      style={
        offscreen ? { height: 64, width: 280, overflow: "auto" } : undefined
      }
    >
      <Tabs
        orientation={orientation}
        dir={dir}
        activationMode={manual ? "manual" : "automatic"}
        {...(controlled ? { value } : { defaultValue: "first" })}
        onValueChange={handleValueChange}
      >
        <TabsList
          aria-label={`${host} ${name}`}
          loop={loop}
          onKeyDown={
            cancel === "list"
              ? (event) => {
                  bubbleEvents.push({
                    host,
                    name,
                    key: event.key,
                    defaultPrevented: event.defaultPrevented,
                  });
                  cancelNavigation(event);
                }
              : undefined
          }
          onKeyDownCapture={cancel === "capture" ? cancelNavigation : undefined}
          onFocus={
            cancelFocus || redirectFocus
              ? (event) => {
                  if (cancelFocus && event.target === event.currentTarget)
                    event.preventDefault();
                  if (
                    redirectFocus &&
                    event.target instanceof HTMLElement &&
                    event.target.dataset.value === "second"
                  )
                    redirect.current?.focus();
                }
              : undefined
          }
        >
          {values.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              data-value={tab}
              disabled={tab === "disabled"}
              asChild={asChild}
              onKeyDown={cancel === "trigger" ? cancelNavigation : undefined}
            >
              {asChild ? <CustomTab>{tab}</CustomTab> : tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {values
          .filter((tab) => tab !== "disabled")
          .map((tab) => (
            <TabsContent key={tab} value={tab}>
              Panel {tab}
            </TabsContent>
          ))}
      </Tabs>
      {controlled && (
        <button data-external-value="" onClick={() => setValue("third")}>
          Set third externally
        </button>
      )}
      {redirectFocus && (
        <button ref={redirect} data-focus-redirect="">
          User focus destination
        </button>
      )}
    </section>
  );
}

function NestedTabs({ host }: { host: string }) {
  return (
    <section data-case="nested">
      <Tabs defaultValue="first" data-nested-owner="outer">
        <TabsList aria-label={`${host} outer`}>
          <TabsTrigger value="first" data-value="first">
            Outer first
          </TabsTrigger>
          <TabsTrigger value="second" data-value="second">
            Outer second
          </TabsTrigger>
        </TabsList>
        <TabsContent value="first">
          <Tabs defaultValue="first" data-nested-owner="inner">
            <TabsList aria-label={`${host} inner`}>
              <TabsTrigger value="first" data-value="first">
                Inner first
              </TabsTrigger>
              <TabsTrigger value="second" data-value="second">
                Inner second
              </TabsTrigger>
              <TabsTrigger value="third" data-value="third">
                Inner third
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </TabsContent>
        <TabsContent value="second">Outer second panel</TabsContent>
      </Tabs>
    </section>
  );
}

function MultipleLists({ host }: { host: string }) {
  return (
    <section data-case="multiple-lists">
      <Tabs defaultValue="first">
        {["one", "two"].map((list) => (
          <TabsList
            key={list}
            aria-label={`${host} list ${list}`}
            data-list={list}
          >
            {(list === "one"
              ? ["first", "second"]
              : ["first", "second", "third"]
            ).map((value) => (
              <TabsTrigger key={value} value={value} data-value={value}>
                {value}
              </TabsTrigger>
            ))}
          </TabsList>
        ))}
      </Tabs>
    </section>
  );
}

function Preview({ host }: { host: string }) {
  return (
    <div className="ec-app flex flex-col items-start gap-4 p-4">
      <KeyboardCase host={host} name="horizontal" />
      <KeyboardCase host={host} name="vertical" orientation="vertical" />
      <KeyboardCase host={host} name="rtl" dir="rtl" />
      <KeyboardCase
        host={host}
        name="vertical-rtl"
        orientation="vertical"
        dir="rtl"
      />
      <KeyboardCase host={host} name="manual" manual />
      <KeyboardCase host={host} name="controlled" controlled />
      <KeyboardCase host={host} name="controlled-manual" controlled manual />
      <KeyboardCase host={host} name="as-child" asChild />
      <KeyboardCase host={host} name="no-loop" loop={false} />
      <KeyboardCase host={host} name="cancel-trigger" cancel="trigger" />
      <KeyboardCase host={host} name="cancel-list" cancel="list" />
      <KeyboardCase host={host} name="cancel-capture" cancel="capture" />
      <KeyboardCase host={host} name="cancel-focus" cancelFocus />
      <KeyboardCase host={host} name="redirect-focus" redirectFocus />
      <KeyboardCase
        host={host}
        name="offscreen"
        orientation="vertical"
        offscreen
      />
      <NestedTabs host={host} />
      <MultipleLists host={host} />
    </div>
  );
}

const roots = new Map<
  string,
  { unmount: () => void; container: HTMLElement }
>();
const hosts = [
  "standalone",
  "pcf-light",
  "shadow-a",
  "shadow-b",
  "nested-shell",
  "nested-cabinet",
];

function targetFor(id: string) {
  const host =
    id === "nested-cabinet"
      ? document
          .getElementById("nested-shell")!
          .shadowRoot!.querySelector<HTMLElement>("#nested-cabinet")!
      : document.getElementById(id)!;
  if (id === "standalone" || id === "pcf-light") return host;
  if (host.shadowRoot) return host.shadowRoot;
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = css;
  shadow.append(style);
  const sentinel = document.createElement("p");
  sentinel.dataset.hostSentinel = id;
  sentinel.style.cssText = "font:23px Georgia;color:rgb(150,20,90)";
  sentinel.textContent = `${id} host sentinel`;
  shadow.append(sentinel);
  if (id === "nested-shell") {
    const cabinet = document.createElement("section");
    cabinet.id = "nested-cabinet";
    shadow.append(cabinet);
  }
  return shadow;
}

function mount(id: string) {
  if (roots.has(id)) throw new Error(`Already mounted: ${id}`);
  const container = document.createElement("div");
  container.dataset.mountContainer = id;
  targetFor(id).append(container);
  const root = createRoot(container);
  root.render(<Preview host={id} />);
  roots.set(id, { container, unmount: () => root.unmount() });
}

function unmount(id: string) {
  const record = roots.get(id);
  if (!record) return;
  record.unmount();
  record.container.remove();
  roots.delete(id);
}

for (const id of hosts) mount(id);
Object.assign(window, {
  __TABS_KEYBOARD_PREVIEW__: { hosts, changes, bubbleEvents, mount, unmount },
});
