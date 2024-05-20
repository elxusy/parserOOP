import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer'
import { selectors } from './constants.js'
import { IScraper, TResultList, TResultRow } from './types.js'

export class Scraper implements IScraper {
	browser: Browser | null = null

	async init(browserOptions: PuppeteerLaunchOptions = {}): Promise<void> {
		this.browser = await puppeteer.launch(browserOptions)
	}

	async scrape(url: string, name: string): Promise<TResultList | null> {
		try {
			if (!this.browser) {
				throw new Error('Scraper not initialized. Call init() first.')
			}

			const [page] = await this.browser.pages()
			await page.goto(url, { waitUntil: 'networkidle0' })

			await page.screenshot({ path: './debug/screenshot.png' })

			const lastPage = await this.getLastPage(page)

			await page.click(selectors.switchToRowBtn)

			if (!lastPage) {
				throw new Error('Не удалось получить последнююю страницу')
			}

			console.log({ lastPage })

			let currentPage = 1
			const scrapeResults = []

			do {
				try {
					const thisUrl = url + '?page=' + String(currentPage)

					await page.goto(thisUrl, {
						waitUntil: 'networkidle0',
					})

					await page.screenshot({
						path: `./debug/screenshot${currentPage}.png`,
					})
				} catch (error) {
					console.warn(
						`Не удалось загрузить страницу ${currentPage} для категории ${name}`
					)
					console.warn(error)
					return null
				}

				console.log('Page - ', currentPage)

				try {
					const scrapeResult = await this._scrapePage(page)
					scrapeResults.push(...scrapeResult)
				} catch (error) {
					console.warn(
						`Не удалось спарсить страницу ${currentPage} для категории ${name}`
					)
					console.warn(error)
					return null
				}

				currentPage++
			} while (currentPage <= lastPage)

			await this.browser.close()

			return scrapeResults
		} catch (error) {
			await this.browser?.close()
			console.warn(error)

			return null
		} finally {
			await this.browser?.close()
		}
	}

	async _scrapePage(page: Page) {
		try {
			await this._scrollToEnd(page)

			const productDetails = await page.evaluate(
				(mainProductCardSelector, product) => {
					const elements = document.querySelectorAll(mainProductCardSelector)

					const productDetails = []
					for (const element of elements) {
						const data: TResultRow = {
							productName: null,
							prices: { basePrice: null, salePrice: null },
							image: null,
							url: null,
						}

						data.productName =
							element.querySelector(product.nameA)?.textContent || null
						data.prices.basePrice =
							element.querySelector(product.basePrice)?.textContent || null
						data.prices.salePrice =
							element.querySelector(product.salePrice)?.textContent || null
						data.image =
							element.querySelector(product.imageUrl)?.getAttribute('src') ||
							null

						const url =
							element.querySelector(product.nameA)?.getAttribute('href') || null
						if (url) {
							data.url = 'https://www.mvideo.ru' + url
						}

						productDetails.push(data)
					}
					return productDetails
				},

				selectors.main.productCard,
				selectors.product
			)

			return productDetails
		} catch (error) {
			console.error('Ошибка в методе scrapePage:', error)
			throw new Error('Произошла ошибка при парсинге ' + error)
		}
	}

	async _scrollToEnd(page: Page) {
		try {
			while (true) {
				await page.evaluate(() => window.scrollBy(0, 300))

				const isAtBottom = await page.evaluate(() => {
					const body = document.body
					const scrollHeight = body.scrollHeight
					const scrollTop = window.scrollY
					const clientHeight = window.innerHeight
					return scrollTop + clientHeight >= scrollHeight
				})

				if (isAtBottom) {
					break
				}
			}
		} catch (error) {
			console.error(error)
		}
	}

	async getLastPage(page: Page): Promise<number | null> {
		try {
			const selector = selectors.main.lastPage

			const elements = await page.$$(selector)

			if (elements) {
				const firstElement = elements[elements.length - 2]
				const href = await page.evaluate(
					el => el?.getAttribute('href'),
					firstElement
				)

				if (href) {
					const pageQueryParam = new URL(href).searchParams.get('page')

					if (pageQueryParam) {
						const page = parseInt(pageQueryParam)

						if (!isNaN(page)) {
							return page
						}
					}
				}
			} else {
				console.warn('No pagination links found.')

				return 1
			}

			return 1
		} catch (error) {
			console.error('An error occurred while getting last page:', error)
			return null
		}
	}
}
