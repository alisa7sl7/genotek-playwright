import { test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BasketPage } from '../basket_page/BasketPage'; 

test.describe.configure({ mode: 'parallel', retries: 1 });

let basketPage: BasketPage;

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  basketPage = new BasketPage(page);
});

test.afterEach(async ({}, testInfo) => {
  // Runs after each test and save url on failure.
  if (testInfo.status == 'failed' || testInfo.status == 'passed') {
    const page_url = basketPage.page.url();
    let page_path = page_url.replace('https://basket.genotek.ru', '');
    page_path = page_path.replace(/\?.*/, '');
    allure.link({ url: page_path, name: 'execution_point' });
  }
});

test.afterAll(async () => {
  await basketPage.page.close();
});

const items = [
  {
    name: 'Происхождение',
    href: '/?products=28152',
  },
  //Также увидела, что для остальных продуктов применяется автоматический промо-код, поэтому для остальных элементов требуется доработка:
  // Если промокод есть, необходимо убрать заполнение промокода и проверить только изменение суммы

  
    // {
  //   name: 'Генетический паспорт',
  //   href: '/?products=31180,15906,420984,520377,518040,518041,427571',
  // },
  // {
  //   name: 'Полный геном',
  //   href: '/?products=424006,427571',
  // },

];

for (const item of items) {
  test(`Добавление товара ${item.name} в корзину, применение промокода, изменение стоимости товара`, async () => {
    test.info().annotations.push(
      {
        type: 'As an',
        description: 'Client',
      },
      {
        type: 'I want',
        description: `to check the price of the product ${item.name} after applying promo code`,
      },
      {
        type: 'So that',
        description: 'I can verify that the discount has been applied correctly',
      }
    );

    await basketPage.goto();
    
    await test.step(`Добавим ${item.name} в корзину`, async () => {
      await basketPage.addItemToBasket(item);
    });

    await basketPage.checkVisabilityProduct(item);

    await test.step('Ожидание полной загрузки суммы товара', async () => {
      const priceLocator = basketPage.page.locator('.basket-order__bill-price');
      await basketPage.page.waitForResponse(response => response.url().includes('https://basket-back.genotek.ru/get-ga-stat'), { timeout: 10000 });
      await priceLocator.waitFor({ state: 'visible', timeout: 10000 });
    });

    await test.step(`Добавление промокода к товару ${item.name}`, async () => {
      await basketPage.applyPromoCode();
    });

    await test.step('Проверка уменьшения стоимости товара', async () => {
      await basketPage.checkChangePrice();
    });
  });
}
