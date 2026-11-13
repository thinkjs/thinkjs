export function buildEdge(options: {
  appPath: string;
  outfile: string;
  env?: string;
  options?: {bodyLimit?: number};
}): Promise<{outfile: string; bytes: number; metafile: import('esbuild').Metafile}>;
