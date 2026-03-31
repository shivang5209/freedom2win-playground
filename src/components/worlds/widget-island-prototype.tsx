"use client";

import { useMemo, useState } from "react";

type TrayWidget = "Scaffold" | "AppBar" | "Column" | "Text" | "Button";
type HighlightZone = "phone-root" | "phone-appbar" | "phone-body" | "phone-column";
type ChildWidget = "Text" | "Button";

type BuildState = {
  scaffold: boolean;
  appBar: boolean;
  column: boolean;
  children: ChildWidget[];
};

const TRAY_ITEMS: TrayWidget[] = ["Scaffold", "AppBar", "Column", "Text", "Button"];

const INITIAL_STATE: BuildState = {
  scaffold: false,
  appBar: false,
  column: false,
  children: [],
};

type CodeLine = {
  id: string;
  text: string;
  zone: HighlightZone;
  indent?: number;
  muted?: boolean;
};

export function WidgetIslandPrototype() {
  const [build, setBuild] = useState<BuildState>(INITIAL_STATE);
  const [highlight, setHighlight] = useState<HighlightZone | null>(null);
  const [activeCodeLine, setActiveCodeLine] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isComplete =
    build.scaffold &&
    build.appBar &&
    build.column &&
    build.children.includes("Text") &&
    build.children.includes("Button");

  const codeLines = useMemo<CodeLine[]>(() => {
    if (!build.scaffold) {
      return [
        { id: "hint-open", text: "Scaffold(", zone: "phone-root", muted: true },
        {
          id: "hint-root",
          text: "// Drag Scaffold into the phone to start building",
          zone: "phone-root",
          indent: 1,
          muted: true,
        },
        { id: "hint-close", text: ");", zone: "phone-root", muted: true },
      ];
    }

    const childrenCode: CodeLine[] =
      build.children.length === 0
        ? [
            {
              id: "child-hint",
              text: "children: const [",
              zone: "phone-column",
              indent: 2,
            },
            {
              id: "child-hint-text",
              text: "// Add Text from tray",
              zone: "phone-column",
              indent: 3,
              muted: true,
            },
            {
              id: "child-hint-button",
              text: "// Add Button from tray",
              zone: "phone-column",
              indent: 3,
              muted: true,
            },
            {
              id: "child-hint-close",
              text: "],",
              zone: "phone-column",
              indent: 2,
            },
          ]
        : [
            {
              id: "children-open",
              text: "children: const [",
              zone: "phone-column",
              indent: 2,
            },
            ...build.children.flatMap((child, idx) =>
              child === "Text"
                ? [
                    {
                      id: `child-${idx}`,
                      text: "Text('Hello from Widget Island'),",
                      zone: "phone-column" as HighlightZone,
                      indent: 3,
                    },
                  ]
                : [
                    {
                      id: `child-${idx}-open`,
                      text: "ElevatedButton(",
                      zone: "phone-column" as HighlightZone,
                      indent: 3,
                    },
                    {
                      id: `child-${idx}-press`,
                      text: "onPressed: null,",
                      zone: "phone-column" as HighlightZone,
                      indent: 4,
                    },
                    {
                      id: `child-${idx}`,
                      text: "child: Text('Tap me'),",
                      zone: "phone-column" as HighlightZone,
                      indent: 4,
                    },
                    {
                      id: `child-${idx}-close`,
                      text: "),",
                      zone: "phone-column" as HighlightZone,
                      indent: 3,
                    },
                  ],
            ),
            {
              id: "children-close",
              text: "],",
              zone: "phone-column",
              indent: 2,
            },
          ];

    return [
      { id: "scaffold-open", text: "Scaffold(", zone: "phone-root" },
      {
        id: "appbar-open",
        text: build.appBar ? "appBar: AppBar(" : "// appBar: AppBar(",
        zone: "phone-appbar",
        indent: 1,
        muted: !build.appBar,
      },
      {
        id: "appbar-title",
        text: build.appBar
          ? "title: const Text('My Playground App'),"
          : "// title: const Text('My Playground App'),",
        zone: "phone-appbar",
        indent: 2,
        muted: !build.appBar,
      },
      {
        id: "appbar-close",
        text: build.appBar ? ")," : "// ),",
        zone: "phone-appbar",
        indent: 1,
        muted: !build.appBar,
      },
      {
        id: "column-open",
        text: build.column
          ? "body: Column("
          : "body: const Center(child: Text('Drop Column to continue')),",
        zone: "phone-body",
        indent: 1,
      },
      ...(build.column ? childrenCode : []),
      ...(build.column
        ? [{ id: "column-close", text: "),", zone: "phone-body" as HighlightZone, indent: 1 }]
        : []),
      { id: "scaffold-close", text: ");", zone: "phone-root" },
    ];
  }, [build]);

  const flutterSnippet = useMemo(() => {
    const hasText = build.children.includes("Text");
    const hasButton = build.children.includes("Button");

    const scaffoldBody = !build.scaffold
      ? "const Center(child: Text('Drop Scaffold in Widget Island to begin'))"
      : build.column
        ? `Column(
            children: const [
              ${hasText ? "Text('Hello from Widget Island')," : "// Add Text from tray,"}
              ${
                hasButton
                  ? `ElevatedButton(
                onPressed: null,
                child: Text('Tap me'),
              ),`
                  : "// Add Button from tray,"
              }
            ],
          )`
        : "const Center(child: Text('Drop Column in the body zone'))";

    const appBarCode =
      build.scaffold && build.appBar
        ? `appBar: AppBar(
          title: const Text('My Playground App'),
        ),`
        : "";

    return `import 'package:flutter/material.dart';

void main() => runApp(const DemoApp());

class DemoApp extends StatelessWidget {
  const DemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: ${build.scaffold ? `Scaffold(
        ${appBarCode}
        body: ${scaffoldBody},
      )` : scaffoldBody},
    );
  }
}`;
  }, [build]);

  const dartPadLink = useMemo(
    () => `https://dartpad.dev/?null_safety=true#code=${encodeURIComponent(flutterSnippet)}`,
    [flutterSnippet],
  );

  const challengeChecks = [
    { id: "check-scaffold", done: build.scaffold, label: "Place Scaffold" },
    { id: "check-appbar", done: build.appBar, label: "Place AppBar" },
    { id: "check-column", done: build.column, label: "Place Column" },
    { id: "check-text", done: build.children.includes("Text"), label: "Add Text in Column" },
    { id: "check-button", done: build.children.includes("Button"), label: "Add Button in Column" },
  ];

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

  async function copyCode() {
    await navigator.clipboard.writeText(flutterSnippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function onFocusLink(zone: HighlightZone, codeLineId: string | null = null) {
    setHighlight(zone);
    if (codeLineId) setActiveCodeLine(codeLineId);
  }

  function onLeaveLink() {
    setHighlight(null);
    setActiveCodeLine(null);
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[250px_1fr_320px]">
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
          Tip: drag into drop zones, then inspect generated Flutter code below.
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
            <TreeNode
              label="Scaffold"
              onEnter={() => onFocusLink("phone-root", "scaffold-open")}
              onLeave={onLeaveLink}
            />
            <TreeNode
              label={build.appBar ? "AppBar" : "AppBar (missing)"}
              secondary={!build.appBar}
              onEnter={() => onFocusLink("phone-appbar", "appbar-open")}
              onLeave={onLeaveLink}
            />
            <TreeNode
              label={build.column ? "Column" : "Column (missing)"}
              secondary={!build.column}
              onEnter={() => onFocusLink("phone-body", "column-open")}
              onLeave={onLeaveLink}
            />
            {build.column &&
              build.children.map((child, idx) => (
                <TreeNode
                  key={`${child}-${idx}`}
                  label={child}
                  compact
                  onEnter={() => onFocusLink("phone-column", `child-${idx}`)}
                  onLeave={onLeaveLink}
                />
              ))}
          </div>
        )}

        <div className={`completion-banner mt-6 ${isComplete ? "is-active" : ""}`}>
          {isComplete
            ? "First build complete. Now open DartPad to edit real Flutter code."
            : "Build target: Scaffold + AppBar + Column + Text + Button"}
        </div>
      </aside>

      <section className="panel-card xl:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="panel-title">Live Flutter Code</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="tool-pill" onClick={copyCode}>
              {copied ? "Copied" : "Copy Code"}
            </button>
            <a className="tool-pill tool-pill-primary" href={dartPadLink} target="_blank" rel="noreferrer">
              Open in DartPad
            </a>
          </div>
        </div>

        <p className="panel-help mt-3">
          Hover tree nodes or code lines to see UI-to-code mapping.
        </p>

        <div className="code-panel mt-4">
          <div className="code-line code-line-file">
            <span className="code-line-number">00</span>
            <span className="code-line-content">home:</span>
          </div>
          {codeLines.map((line, index) => (
            <button
              key={line.id}
              type="button"
              className={`code-line ${activeCodeLine === line.id ? "code-line-active" : ""} ${line.muted ? "code-line-muted" : ""}`}
              onMouseEnter={() => onFocusLink(line.zone, line.id)}
              onMouseLeave={onLeaveLink}
            >
              <span className="code-line-number">{String(index + 1).padStart(2, "0")}</span>
              <span
                className="code-line-content"
                style={{ paddingLeft: `${(line.indent ?? 0) * 16}px` }}
              >
                {line.text}
              </span>
            </button>
          ))}
        </div>
      </section>

      <aside className="panel-card">
        <h2 className="panel-title">Starter Challenge</h2>
        <p className="panel-help mt-3">
          Complete the checklist and then open DartPad to modify labels or add widgets in code.
        </p>
        <div className="challenge-list mt-4">
          {challengeChecks.map((item) => (
            <div key={item.id} className={`challenge-item ${item.done ? "is-done" : ""}`}>
              <span className="challenge-label">{item.label}</span>
              <span className={`challenge-status ${item.done ? "is-done" : ""}`}>
                {item.done ? "Done" : "Pending"}
              </span>
            </div>
          ))}
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
