import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

type CacheEntry<T> = {
    value: T
    expireAt: number
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class fsCache {
    msid: string | undefined

    setMsid(msid: string): void {
        this.msid = msid
    }
    setCache<T>(key: string, value: T, ttl: number = 60): void {
        const cacheDir = path.resolve(__dirname, 'cache')
        const expireAt = Date.now() + ttl * 1000
        const data: CacheEntry<T> = { value, expireAt }
        // Ensure cache directory exists
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir)
        }
        const filePath = path.join(cacheDir, `${this.msid}-${key}`)
        fs.writeFileSync(filePath, JSON.stringify(data))
    }

    getCache<T>(key: string): T | null {
        const cacheDir = path.resolve(__dirname, 'cache')
        // Ensure cache directory exists
        if (!fs.existsSync(cacheDir)) {
            return null
        }
        const filePath = path.join(cacheDir, `${this.msid}-${key}`)
        if (!fs.existsSync(filePath)) return null

        const data: CacheEntry<T> = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        if (Date.now() > data.expireAt) {
            fs.unlinkSync(filePath)
            return null
        }

        return data.value
    }
}

const cache = new fsCache()
export default cache
