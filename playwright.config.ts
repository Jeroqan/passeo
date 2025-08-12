import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Use path.resolve to ensure the correct absolute path is generated
export const AUTH_FILE = path.resolve(__dirname, 'tests/auth/user.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  // globalSetup, artık /tests klasörünün içinden çağrılıyor.
  globalSetup: require.resolve('./tests/global.setup'),

  use: {
    // Portu dinamik olarak belirlemek için baseURL'i webServer'dan aldırıyoruz.
    // Artık sabit bir port belirtmeye gerek yok.
    baseURL: 'http://localhost:3000', // webServer başlatılmazsa varsayılan.
    trace: 'on-first-retry',
    headless: true,
    // Tüm testler, globalSetup tarafından oluşturulan bu oturum durumunu kullanır
    storageState: AUTH_FILE,
  },
  
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // globalSetup'ta oluşturulan dosyayı yüklüyoruz.
        storageState: AUTH_FILE,
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: AUTH_FILE,
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop WebKit'],
        storageState: AUTH_FILE,
      },
    },
  ],

  // Test raporları için çıktı klasörü
  outputDir: 'test-results/',

  // Playwright'ın testi çalıştırmadan önce geliştirme sunucusunu başlatmasını sağla
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000', // Next.js'in başlamasını bekleyeceği URL
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // Sunucunun başlaması için 2 dakika bekle
    stdout: 'pipe',
    stderr: 'pipe',
  },
}); 