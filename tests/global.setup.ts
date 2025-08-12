import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// .env dosyasını güvenli bir şekilde yükle
// Dosya artık /tests klasöründe olduğu için, .env'e ulaşmak için bir üst dizine (..) çıkıyoruz.
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const USERNAME = process.env.TEST_USERNAME;
const PASSWORD = process.env.TEST_PASSWORD;
// AUTH_FILE'ın yolu da /tests klasörünün içinden hesaplanıyor.
export const AUTH_FILE = path.resolve(__dirname, 'auth', 'user.json');

if (!USERNAME || !PASSWORD) {
  throw new Error('TEST_USERNAME ve TEST_PASSWORD ortam değişkenleri ayarlanmalıdır.');
}

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(`${baseURL}/login`);

    await page.getByRole('textbox', { name: 'Kullanıcı Adı' }).fill(USERNAME!);
    await page.getByRole('textbox', { name: 'Şifre' }).fill(PASSWORD!);
    await page.getByRole('button', { name: 'Giriş Yap' }).click();

    await page.waitForURL(`${baseURL}/`);
    console.log('Successfully logged in and redirected to the homepage.');

    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    await page.context().storageState({ path: AUTH_FILE });
    console.log(`Session state saved to ${AUTH_FILE}`);

    await browser.close();
  } catch (error) {
    console.error('Authentication setup failed:', error);
    await page.screenshot({ path: 'test-results/global-setup-failure.png' });
    await browser.close();
    throw error;
  }
}

export default globalSetup; 