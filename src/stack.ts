import type { ParsedFrame, StackLineParser, StackParser } from "./types";

export function buildStackParser(parsers: StackLineParser[]): StackParser {
  return {
    parse(stack: string) {
      const lines = stack.split("\n");
      const frames: ParsedFrame[] = [];
      for (const line of lines) {
        for (const p of parsers) {
          const frame = p(line);
          if (frame) {
            frames.push(frame);
            break;
          }
        }
      }
      return frames;
    },
  };
}

// Parser “chrome-like”:  at func (file:line:col)
const chromeLike: StackLineParser = (line) => {
  const m = line.match(/^\s*at\s+(.*)\s+\((.*):(\d+):(\d+)\)\s*$/);
  if (!m) return null;
  return {
    function: m[1],
    filename: m[2],
    lineno: Number(m[3]),
    colno: Number(m[4]),
    in_app: true,
  };
};

export function resolveStackParser(
  input?: StackParser | StackLineParser[]
): StackParser {
  if (!input) return buildStackParser([chromeLike]);
  if (Array.isArray(input)) return buildStackParser(input);
  return input;
}
