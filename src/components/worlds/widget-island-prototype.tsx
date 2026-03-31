"use client";

import { useMemo, useState } from "react";

type TrayWidget = "Scaffold" | "AppBar" | "Column" | "Text" | "Button";
type HighlightZone = "phone-root" | "phone-appbar" | "phone-body" | "phone-column";

type BuildState = {
  scaffold: boolean;
  appBar: boolean;
  column: boolean;
  children: Array<"Text" | "Button">;
};

const TRAY_ITEMS: TrayWidget[] = ["Scaffold", "AppBar", "Column", "Text", "Button"];

const INITIAL_STATE: BuildState = {
  scaffold: false,
  appBar: false,
  column: false,
  children: [],
};

export function WidgetIslandPrototype() {
  const [build, setBuild] = useState<BuildState>(INITIAL_STATE);
  const [highlight, setHighlight] = useState<HighlightZone | null>(null);

  const treeNodes = useMemo(() => {
    if (!build.scaffold) return [];

    return [
      {
        key: "Scaffold",
        zone: "phone-root" as HighlightZone,
        children: [
          {
            key: "AppBar",
            zone: "phone-appbar" as HighlightZone,
            present: build.appBar,
          },
          {
            key: "Column",
            zone: "phone-body" as HighlightZone,
            present: build.column,
            children: build.children.map((child, idx) => ({
              key: `${child}-${idx}`,
              label: child,
              zone: "phone-column" as HighlightZone,
            })),
          },
        ],
      },
    ];
  }, [build]);

  const isComplete =
    build.scaffold &&
    build.appBar &&
    build.column &&
    build.children.includes("Text") &&
    build.children.includes("Button");

  function onDropWidget(zone: string, widget: string) {
    if (!TRAY_ITEMS.includes(widget as TrayWidget)) return;

    setBuild((prev) => {
      const next = { ...prev, children: [...prev.children] };

      if (zone === "root" && widget === "Scaffold") next.scaffold = true;
      if (zone === "appbar" && widget === "AppBar" && next.scaffold) next.appBar = true;
      if (zone === "body" && widget === "Column" && next.scaffold) next.column = true;
      if (zone === "column" && next.column && (widget === "Text" || widget === "Button")) {
        if (next.children.length < 4) next.children.push(widget);
      }
      return next;
    });
  }

  function removeWidget(widget: TrayWidget | "Text-child" | "Button-child") {
    setBuild((prev) => {
      if (widget === "Scaffold") return INITIAL_STATE;
      if (widget === "AppBar") return { ...prev, appBar: false };
      if (widget === "Column") return { ...prev, column: false, children: [] };
      if (widget === "Text-child") {
        const idx = prev.children.indexOf("Text");
        if (idx === -1) return prev;
        const nextChildren = [...prev.children];
        nextChildren.splice(idx, 1);
        return { ...prev, children: nextChildren };
      }
      if (widget === "Button-child") {
        const idx = prev.children.indexOf("Button");
        if (idx === -1) return prev;
        const nextChildren = [...prev.children];
        nextChildren.splice(idx, 1);
        return { ...prev, children: nextChildren };
      }
      return prev;
    });
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[280px_1fr_320px]">
      <aside className="panel-card">
        <h2 className="panel-title">Widget Tray</h2>
        <div className="mt-4 grid gap-3">
          {TRAY_ITEMS.map((item) => (
            <button
              key={item}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", item);
                event.dataTransfer.effectAllowed = "copy";
              }}
              className="tray-item"
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <p className="panel-help mt-4">
          Tip: drag into highlighted zones. Removing Scaffold resets the entire build.
        </p>
      </aside>

      <div className="panel-card">
        <h2 className="panel-title">Live Phone Preview</h2>
        <div className="mt-4 flex justify-center">
          <div
            className={`phone-frame ${highlight === "phone-root" ? "is-highlighted" : ""}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onDropWidget("root", event.dataTransfer.getData("text/plain"))}
          >
            {!build.scaffold && <DropZone label="Drop Scaffold" />}
            {build.scaffold && (
              <>
                <div
                  className={`phone-appbar ${highlight === "phone-appbar" ? "is-highlighted" : ""}`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => onDropWidget("appbar", event.dataTransfer.getData("text/plain"))}
                >
                  {build.appBar ? (
                    <PlacedWidget label="AppBar" onRemove={() => removeWidget("AppBar")} />
                  ) : (
                    <DropZone label="Drop AppBar" compact />
                  )}
                </div>

                <div
                  className={`phone-body ${highlight === "phone-body" ? "is-highlighted" : ""}`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => onDropWidget("body", event.dataTransfer.getData("text/plain"))}
                >
                  {!build.column && <DropZone label="Drop Column" />}
                  {build.column && (
                    <div className="phone-column">
                      <PlacedWidget label="Column" onRemove={() => removeWidget("Column")} />
                      <div
                        className={`column-stack ${highlight === "phone-column" ? "is-highlighted" : ""}`}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => onDropWidget("column", event.dataTransfer.getData("text/plain"))}
                      >
                        {build.children.map((child, idx) => (
                          <PlacedWidget
                            key={`${child}-${idx}`}
                            label={child}
                            onRemove={() =>
                              removeWidget(child === "Text" ? "Text-child" : "Button-child")
                            }
                          />
                        ))}
                        {build.children.length < 4 && <DropZone label="Drop Text or Button" compact />}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="reset-pill"
                  onClick={() => removeWidget("Scaffold")}
                >
                  Remove Scaffold
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <aside className="panel-card">
        <h2 className="panel-title">Widget Tree</h2>
        {!build.scaffold && (
          <p className="panel-help mt-4">
            Tree appears when you place <code>Scaffold</code>.
          </p>
        )}
        {build.scaffold && (
          <div className="mt-4 space-y-4">
            {treeNodes.map((root) => (
              <div key={root.key}>
                <TreeNode
                  label={root.key}
                  onEnter={() => setHighlight(root.zone)}
                  onLeave={() => setHighlight(null)}
                />
                <TreeNode
                  label={build.appBar ? "AppBar" : "AppBar (missing)"}
                  secondary={!build.appBar}
                  onEnter={() => setHighlight("phone-appbar")}
                  onLeave={() => setHighlight(null)}
                />
                <TreeNode
                  label={build.column ? "Column" : "Column (missing)"}
                  secondary={!build.column}
                  onEnter={() => setHighlight("phone-body")}
                  onLeave={() => setHighlight(null)}
                />
                {build.column &&
                  build.children.map((child, idx) => (
                    <TreeNode
                      key={`${child}-${idx}`}
                      label={child}
                      compact
                      onEnter={() => setHighlight("phone-column")}
                      onLeave={() => setHighlight(null)}
                    />
                  ))}
              </div>
            ))}
          </div>
        )}

        <div className={`completion-banner mt-6 ${isComplete ? "is-active" : ""}`}>
          {isComplete ? "First build complete. Nice snap." : "Build target: Scaffold + AppBar + Column + Text + Button"}
        </div>
      </aside>
    </section>
  );
}

function TreeNode({
  label,
  onEnter,
  onLeave,
  compact = false,
  secondary = false,
}: {
  label: string;
  onEnter: () => void;
  onLeave: () => void;
  compact?: boolean;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`tree-node ${compact ? "tree-node-compact" : ""} ${secondary ? "tree-node-secondary" : ""}`}
    >
      {label}
    </button>
  );
}

function PlacedWidget({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="placed-widget">
      <span>{label}</span>
      <button type="button" onClick={onRemove} aria-label={`Remove ${label}`}>
        x
      </button>
    </div>
  );
}

function DropZone({ label, compact = false }: { label: string; compact?: boolean }) {
  return <div className={`drop-zone ${compact ? "drop-zone-compact" : ""}`}>{label}</div>;
}
