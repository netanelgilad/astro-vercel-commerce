import fs from 'node:fs'
import path from 'node:path'
import type { AppData, AppModel, ImportedNamespaces } from '@wix/builder-app-model'
import { getAllAppPages, getAppData, getSiteAssetsParams, getVeloFiles, getWixCodeData } from '@wix/builder-app-model'
import { logger } from '@wix/builder-commons'
import _ from 'lodash'
import { buildBlocks } from '@wix/builder'
import { shouldOverrideDir } from './interactions'
import cache from './fsCache'
import type { CLIOptions } from './types'

export function buildPath(relativePath: string, packageName: string): string {
    const absolutePath = path.resolve(relativePath)
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Path "${absolutePath}" does not exist`)
    }
    if (!fs.lstatSync(absolutePath).isDirectory()) {
        throw new Error(`Path "${absolutePath}" is not a directory`)
    }
    return path.join(absolutePath, packageName, '/')
}

function getResources() {
    const pages = cache.getCache('pages')
    const veloFiles = cache.getCache('veloFiles')
    const appData = cache.getCache('appData')
    const pagesImportedNamespaces = cache.getCache('pagesImportedNamespaces')
    return { pages, veloFiles, appData, pagesImportedNamespaces }
}

function setResources(pages: any, veloFiles: any, appData: any, pagesImportedNamespaces: ImportedNamespaces) {
    cache.setCache('pages', pages, 30)
    cache.setCache('veloFiles', veloFiles, 30)
    cache.setCache('appData', appData, 30)
    cache.setCache('pagesImportedNamespaces', pagesImportedNamespaces, 30)
}

export async function fetchResources(options: any) {
    cache.setMsid(options.msid)
    const resources = getResources()
    if (!resources.pages || !resources.veloFiles || !resources.appData) {
        logger.logStart(`Fetching model building data` + JSON.stringify(options, null, 2))
        const { siteUrl, siteId, appDefId, siteRevision } = await getSiteAssetsParams(options.msid, options.appVersion)
        console.log({ siteUrl, siteId, appDefId, siteRevision })
        const appData = (await getAppData({ appDefId, appVersion: options.appVersion })) as AppData
        const veloFiles = await getVeloFiles({ appData, metaSiteId: options.msid })
        const pages = await getAllAppPages(appData, options.msid, siteId, siteRevision)
        const pagesImportedNamespaces = await getWixCodeData(siteUrl, options.msid)
        logger.logEnd()

        setResources(pages, veloFiles, appData, pagesImportedNamespaces)
        return { pages, veloFiles, appData, pagesImportedNamespaces, siteUrl }
    } else {
        return resources as any
    }
}

export async function buildWidget(appModel: AppModel, options: CLIOptions) {
    const { out, target, override, clean, dump, publicPath, useVite } = options
    const dirName = _.kebabCase(appModel.app.name)

    const targetPath = buildPath(out, dirName)
    if (fs.existsSync(targetPath)) {
        if (clean) {
            fs.rmSync(targetPath, { recursive: true })
        } else if (!override && !(await shouldOverrideDir(targetPath))) {
            process.exit()
        }
    }

    await buildBlocks(appModel, {
        outputPath: targetPath,
        target,
        publicPath,
        fs,
        verbose: true,
        dumpModels: dump,
        useVite,
    })
}
