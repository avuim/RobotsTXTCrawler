import { HttpCrawlerWithRedirectValidation } from './src/services/HttpCrawlerWithRedirectValidation';
import { CrawlerConfig } from './config/crawler.config';
import { NormalizedWebsite } from './src/types/Website';

// Test-Konfiguration
const testConfig: CrawlerConfig = {
  parallelWorkers: 15,
  batchSize: 100,
  httpTimeout: 10000,
  requestDelay: 500,
  domainCooldown: 1000,
  maxRetries: 3,
  browserFallback: true,
  browserTimeout: 15000,
  maxBrowserInstances: 3,
  headless: true,
  userAgentRotation: true,
  randomDelay: true,
  respectRobotsTxt: false,
  outputDir: './output',
  logLevel: 'info',
  forceUpdate: false,
  updateAfterDays: 30,
  maxConcurrentRequests: 50,
  connectionPoolSize: 20
};

async function testRedirectValidation() {
  console.log('🔍 Teste HttpCrawlerWithRedirectValidation...\n');
  
  const crawler = new HttpCrawlerWithRedirectValidation(testConfig);
  
  // Test-Websites mit verschiedenen Redirect-Szenarien
  const testWebsites: Array<NormalizedWebsite & { description: string }> = [
    {
      domain: 'www.jahnreisen.de',
      normalizedDomain: 'www-jahnreisen-de',
      originalSite: 'www.jahnreisen.de',
      robotsTxtUrl: 'https://www.jahnreisen.de/robots.txt',
      description: 'Normale robots.txt (sollte funktionieren)'
    },
    {
      domain: 'example.com',
      normalizedDomain: 'example-com',
      originalSite: 'example.com',
      robotsTxtUrl: 'https://example.com/robots.txt',
      description: 'Standard-Beispiel-Domain'
    },
    {
      domain: 'httpbin.org',
      normalizedDomain: 'httpbin-org',
      originalSite: 'httpbin.org',
      robotsTxtUrl: 'https://httpbin.org/redirect/3',
      description: 'Test mit mehreren Redirects (sollte fehlschlagen)'
    }
  ];
  
  for (const website of testWebsites) {
    console.log(`\n📋 Teste: ${website.domain}`);
    console.log(`   URL: ${website.robotsTxtUrl}`);
    console.log(`   Beschreibung: ${website.description}`);
    console.log('   ' + '─'.repeat(50));
    
    try {
      const result = await crawler.crawlRobotsTxt(website);
      
      console.log(`✅ Erfolgreich gecrawlt:`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Methode: ${result.method}`);
      console.log(`   Response Zeit: ${result.responseTime}ms`);
      console.log(`   Content Größe: ${result.fileSize} Bytes`);
      
      if (result.metadata) {
        console.log(`   Redirect Count: ${result.metadata.redirectCount}`);
        console.log(`   Finale URL: ${result.metadata.finalUrl}`);
        if (result.metadata.redirectChain && result.metadata.redirectChain.length > 1) {
          console.log(`   Redirect Chain:`);
          result.metadata.redirectChain.forEach((url: string, index: number) => {
            console.log(`     ${index + 1}. ${url}`);
          });
        }
      }
      
      // Zeige ersten Teil des Contents
      if (result.content) {
        const preview = result.content.substring(0, 200);
        console.log(`   Content Preview: ${preview}${result.content.length > 200 ? '...' : ''}`);
      }
      
    } catch (error) {
      console.log(`❌ Fehler beim Crawlen:`);
      console.log(`   ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log('\n🏁 Test abgeschlossen!');
}

// Test ausführen
if (require.main === module) {
  testRedirectValidation().catch(console.error);
}

export { testRedirectValidation };
