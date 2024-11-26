import { Command } from 'commander';
import type { BlocksConfig, WixCliOpenEditorOptions } from './types';
import fs from 'fs';
import path from 'path';
import open from 'open';

const program = new Command()
  .version('0.1.0')
  .argument('<name>')
  .requiredOption('-p, --path <project root>', 'Base path for widgets configuration.', process.cwd())
  .requiredOption('-s, --source <source path>', 'relative path to blocks config', 'src/components/wix-blocks/components')
  .action(async (name: string, options: WixCliOpenEditorOptions) => {
    try {
      const { path: rootPath, source } = options;

      const data = fs.readFileSync(path.join(rootPath, source, `${name}.json`), 'utf-8');
      const blocksData: BlocksConfig = JSON.parse(data);
      const { metaSiteId, blocksId } = blocksData;
      await open(`https://blocks.wix.com/edit/blocks/${blocksId}?metaSiteId=${metaSiteId}`);
    } catch (err) {
      console.error('Failed to open blocks editor for widget', err)
    }
  })

program.parse(process.argv)

