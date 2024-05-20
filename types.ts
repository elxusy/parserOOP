import { Browser, PuppeteerLaunchOptions } from 'puppeteer'

export interface IScraper {
	browser: Browser | null

	init: (browserOptions: PuppeteerLaunchOptions) => Promise<void>

	scrape: (url: string, name: string) => Promise<TResultList | null>
}

export type TResultList = TResultRow[]

export type TResultRow = {
	productName: string | null | undefined
	prices: TPrices
	image: string | null | undefined
	url: string | null | undefined
}

type TPrices = {
	basePrice: string | null | undefined
	salePrice: string | null | undefined
}
