import privacy from "../../../../packages/mesurer/PRIVACY.md?raw";

type PrivacyListItem = { text: string; children?: string[] };

type PrivacyBlock =
  | { type: "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: PrivacyListItem[] };

function parsePrivacy(raw: string) {
  const lines = raw.split(/\r?\n/);
  const blocks: PrivacyBlock[] = [];
  let listItems: PrivacyListItem[] = [];
  let lastItem: PrivacyListItem | null = null;

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: "ul", items: listItems });
      listItems = [];
      lastItem = null;
    }
  };

  for (const line of lines) {
    if (line.startsWith("# ")) {
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }

    if (line.startsWith("  - ") && lastItem) {
      const childItem = line.slice(4).trim();
      if (!lastItem.children) {
        lastItem.children = [];
      }
      lastItem.children.push(childItem);
      continue;
    }

    if (line.startsWith("- ")) {
      const item = { text: line.slice(2).trim() };
      listItems.push(item);
      lastItem = item;
      continue;
    }

    if (line.trim() === "") {
      flushList();
      continue;
    }

    flushList();
    blocks.push({ type: "p", text: line.trim() });
  }

  flushList();

  return blocks;
}

const privacyBlocks = parsePrivacy(privacy);

const URL_PATTERN = /^https?:\/\/.+/i;

export default function Privacy() {
  return (
    <div className="flex flex-col gap-6">
      {privacyBlocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2 key={index} className="font-medium text-strong">
              {block.text}
            </h2>
          );
        }

        if (block.type === "h3") {
          return (
            <h3 key={index} className="font-[450] text-strong">
              {block.text}
            </h3>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5 text-muted">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  {item.text}
                  {item.children && item.children.length > 0 && (
                    <ul className="list-disc space-y-1 pl-5 text-muted">
                      {item.children.map((child, childIndex) => (
                        <li key={childIndex}>{child}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          );
        }

        if (URL_PATTERN.test(block.text)) {
          return (
            <p key={index} className="text-muted">
              <a
                href={block.text}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-strong"
              >
                {block.text}
              </a>
            </p>
          );
        }

        return (
          <p key={index} className="text-muted">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
