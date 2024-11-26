export type CLIOptions = {
    msid: string
    out: string
    target: 'export' | 'wix'
    override: boolean
    clean: boolean
    dump: boolean
    publicPath: string
    appVersion: string
    localSiteAssets: boolean
    useVite?: boolean
}
