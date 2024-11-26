import colors from 'colors'
import { Command } from 'commander'
// @ts-ignore
import { logger } from '@wix/builder-commons'
// @ts-ignore
import { buildAppModel, getSiteAssetsData } from '@wix/builder-app-model'
import { buildWidget, fetchResources } from './utils'
import type { CLIOptions } from './types'

const targets = ['export', 'wix']

const program = new Command()
    .requiredOption('-m, --msid <msid>', 'MetaSiteID of a wix site to build')
    .requiredOption(
        '-o, --out <output_path>',
        'The target path for the generated package. The tool will create a new directory within the provide path.',
        '../builder-playground/src/app/components'
    )
    .option(
        '-t, --target <build target>',
        `Choose the target of the generated package. Options: ${JSON.stringify(targets)}`,
        'export'
    )
    .option('-p, --publicPath <build public path>', 'Bundle public path location.', 'none')
    .option('--override', 'If the output directory already exists, override its content.', false)
    .option('--clean', 'If the output directory already exists, clean it before build.', false)
    .option('--dump', 'Dumps debugging data as part of the generated package.', false)
    .option('--localSiteAssets', 'Use local site assets server', false)
    .option('--appVersion <appVersion>', 'app Version to be used, default is latest published version')
    .option('--useVite', 'use vite for building the package', false)
    .parse(process.argv)

const options = program.opts() as CLIOptions

async function main() {
    const { target, msid } = options
    if (!targets.includes(target)) {
        console.log(colors.red(`Invalid target: "${target}"\n`))
        return
    }

    try {
        console.log('MSID::::', msid)
        const { pages, appData, veloFiles, siteUrl, pagesImportedNamespaces } = await fetchResources(options)
        logger.logStart(`Fetching WidgetModel`)
        const siteAssetsData = await getSiteAssetsData(siteUrl, appData)
        const appModel = await buildAppModel(
            msid,
            pages,
            appData,
            veloFiles,
            pagesImportedNamespaces,
            { useExperiments: true },
            siteAssetsData
        )
        logger.logEnd()

        if (appModel.veloIgnoredWidgets?.length) {
            logger.block(colors.yellow('Velo Ignored Widgets'))
            logger.log(`In the following widgets velo was ignored: ${appModel.veloIgnoredWidgets.join(', ')}`)
            logger.log(`Velo files should have a new syntax with onInit function instead of $w.onReady`)
            logger.log(`Please use the velo template from here:`)
            logger.log(
                colors.dim(
                    'https://github.com/wix-private/wix-next/blob/master/packages/public/builder-velo/src/empty-velo-template.js'
                )
            )
            logger.blockEnd()
        }
        await buildWidget(appModel, options)
    } catch (err) {
        logger.failed(err)
    }
}

main()
