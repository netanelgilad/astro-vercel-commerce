import { Command } from 'commander';
import type { BlocksConfig, WixCliGenerateBlocksOptions } from './types';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command()
  .version('0.1.0')
  .argument('<name>')
  .requiredOption('-p, --path <project root>', 'Base path for widgets configuration.', process.cwd())
  .requiredOption('-s, --source <source path>', 'relative path to blocks config', 'src/components/wix-blocks/components')
  .requiredOption('-o, --output <output path>', 'relative path to blocks generated react code', 'src/components/wix-blocks/generated')
  .action(async (name: string, options: WixCliGenerateBlocksOptions) => {
    try {
      const { path: rootPath, source, output } = options;

      const data = fs.readFileSync(path.join(rootPath, source, `${name}.json`), 'utf-8');
      const blocksData: BlocksConfig = JSON.parse(data);
      const { metaSiteId } = blocksData;
      const outputPath = path.join(rootPath, output);

      const builderCliPath = path.resolve(__dirname, '../../builder-cli/src/index.ts');

      const builderCliProcess = spawn('tsx', [
        builderCliPath,
        `-m`,
        metaSiteId,
        `-o`,
        outputPath,
        '--clean',
        ' --dump',
      ]);

      builderCliProcess.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      builderCliProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });

    } catch (err) {
      console.error('Failed to generate code for blocks', err)
    }
  })

program.parse(process.argv)

