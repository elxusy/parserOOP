export const selectors = {
	main: {
		productCard: '.product-cards .product-cards-layout__item',
		lastPage:
			'.pagination.ng-star-inserted li.page-item.ng-star-inserted a[href]',
	},
	product: {
		basePrice: '.price__main-value',
		salePrice: '.price__sale-value',
		imageUrl: '.product-picture__img',
		nameA: '.product-title__text',
	},
	switchToRowBtn: 'button.listing-view-switcher__button--list',
}
