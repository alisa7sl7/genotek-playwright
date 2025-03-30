import { expect, Locator, Page } from '@playwright/test';

export class BasketPage {
  readonly page: Page;
  readonly URL: string = 'https://basket.genotek.ru/';
  readonly items = [
    {
      name: 'Происхождение',
      href: '/?products=28152',
    },
      // {
  //   name: 'Генетический паспорт',
  //   href: '/?products=31180,15906,420984,520377,518040,518041,427571',
  // },
  // {
  //   name: 'Полный геном',
  //   href: '/?products=424006,427571',
  // },
  ];
  readonly productTitleLocator: Locator;
  readonly promoCodeButtonLocator: Locator;
  readonly promoCodeInputLocator: Locator;
  readonly acceptPromoCodeButtonLocator: Locator;
  readonly fullPriceElementLocator: Locator;
  readonly newPriceElementLocator: Locator;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.URL, { waitUntil: 'domcontentloaded' });
  }

  async addItemToBasket(item: { name: string; href: string }) {
    const originElement = this.page.locator(`a[href="${item.href}"]`).first();
    await originElement.waitFor({ state: 'visible', timeout: 10000 });
    await originElement.click();
  }

  async checkVisabilityProduct(item: { name: string }) {
    const productTitle = this.page.locator('div.basket-order__bill-head-title', {
      hasText: `${item.name}`,
    });
    await productTitle.waitFor({ state: 'visible', timeout: 10000 });
    const titleText = await productTitle.innerText();
    expect(titleText).toContain(item.name);
  }

  async applyPromoCode() {
    const promoCodeButton = this.page.locator('.basket-promo-code.ng-star-inserted');
    await promoCodeButton.click();

    const promoCodeInput = this.page.locator('.basket-promo-code__input');
    await promoCodeInput.fill('genotek5');

    const acceptPromoCodeButton = this.page.locator('.basket-promo-code__icon');
    await acceptPromoCodeButton.click();

    await promoCodeInput.waitFor({ state: 'detached' });
    await acceptPromoCodeButton.waitFor({ state: 'detached' });
    await this.page.waitForTimeout(3000);
  }

  async checkChangePrice() {
    await this.page.waitForSelector('.basket-order__report-info priceroller', {
      state: 'visible',
    });

    const fullPriceElement = this.page.locator('.basket-order__report-info priceroller').first();
    const newPriceElement = this.page.locator('.basket-order__report-total priceroller').first();

    const fullPrice = await fullPriceElement.textContent();
    const newPrice = await newPriceElement.textContent();

    const fullPriceValue = fullPrice?.replace('₽', '').trim().replace(/\s+/g, '');
    const newPriceValue = newPrice?.replace('₽', '').trim().replace(/\s+/g, '');

    const fullPriceNumber = Number(fullPriceValue);
    const newPriceNumber = Number(newPriceValue);

    expect(newPriceNumber).toBeLessThan(fullPriceNumber);
  }
}
module.exports = { BasketPage };
