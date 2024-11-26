export interface BlocksConfig {
  blocksId: string;
  metaSiteId: string;
}

export type WixCLIOptions = {
  source: string;
  path: string;
}

export interface WixCliOpenEditorOptions extends WixCLIOptions {
  name: string;
}

export interface WixCliGenerateBlocksOptions extends WixCliOpenEditorOptions {
  output: string;
}
