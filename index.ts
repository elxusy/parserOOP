import fs from 'fs/promises'
import { Scraper } from './Scraper'
import categoriesData from './categories.json'

const main = async () => {
	const selectedCategory = 5

	const scraper = new Scraper()

	await scraper.init({
		headless: false,
		product: 'chrome',
		protocol: 'webDriverBiDi',
	})

	const scrapedData = await scraper.scrape(
		categoriesData.data[selectedCategory].url,
		categoriesData.data[selectedCategory].name
	)

	if (!scrapedData?.length) {
		console.error('Нечего писать')
		return
	}

	await writeDataToJSON(scrapedData, 'result.json')
}

type DataType = object

async function writeDataToJSON<T extends DataType>(
	data: T,
	filePath: string
): Promise<void> {
	const jsonData = JSON.stringify(data, null, 2)

	try {
		await fs.writeFile(filePath, jsonData)
		console.log(`Data written successfully to ${filePath}`)
	} catch (error) {
		console.error(`Error writing data to file: ${error}`)
	}
}

main()
