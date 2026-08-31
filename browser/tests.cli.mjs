import {chromium} from "playwright"
import {fileURLToPath, pathToFileURL} from "node:url"

const html = fileURLToPath(new URL("./tests.html", import.meta.url))

const run = async () => {
    const browser = await chromium.launch()

    try {
        const page = await browser.newPage()
        const pageErrors = []
        page.on("pageerror", error => pageErrors.push(error))

        await page.goto(pathToFileURL(html).href)

        // Completion is a state, not a promise: mocha.run() publishes its
        // stats on window when done, and an unfinished or broken page just
        // never does -- so this times out instead of passing.
        await page.waitForFunction(() => window.mochaStats !== undefined, null, {timeout: 60_000})
        const {tests, passes, pending, failures, duration} = await page.evaluate(() => window.mochaStats)
        console.log(`${passes} passing, ${failures} failing, ${pending} pending (${tests} tests, ${duration}ms)`)

        if (pageErrors.length) {
            throw new AggregateError(pageErrors, "Browser page errors occurred")
        }
        if (failures) {
            throw new Error(`Mocha reported ${failures} failed test(s)`)
        }
        if (!tests) {
            throw new Error("Mocha ran no tests")
        }
    } finally {
        await browser.close()
    }
}

run().catch(error => {
    console.error(error)
    process.exitCode = 1
})
