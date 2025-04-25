import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Page } from '@shared/schema';

// Obter o diretório atual (equivalente ao __dirname em CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGES_FILE = path.resolve(__dirname, '../data/pages.json');

// Garantir que o diretório existe
function ensureDirectoryExists() {
  const dir = path.dirname(PAGES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Ler páginas do arquivo
export function getPages(): Page[] {
  try {
    ensureDirectoryExists();
    if (!fs.existsSync(PAGES_FILE)) {
      // Criar páginas padrão se o arquivo não existir
      const defaultPages = createDefaultPages();
      savePages(defaultPages);
      return defaultPages;
    }
    const data = fs.readFileSync(PAGES_FILE, 'utf8');
    return JSON.parse(data) as Page[];
  } catch (error) {
    console.error('Erro ao ler páginas:', error);
    return createDefaultPages();
  }
}

// Criar páginas padrão
function createDefaultPages(): Page[] {
  return [
    {
      id: 1,
      title: 'Início',
      slug: 'home',
      content: '<h1 class="text-3xl font-bold mb-6">Bem-vindo ao Meu Site</h1><p class="mb-4">Esta é a página inicial do site. Você pode editar este conteúdo na área administrativa.</p>'
    },
    {
      id: 2,
      title: 'Serviços',
      slug: 'servicos',
      content: '<h1 class="text-3xl font-bold mb-6">Nossos Serviços</h1><p class="mb-4">Aqui você encontrará informações sobre os serviços oferecidos.</p>'
    },
    {
      id: 3,
      title: 'Informações do Site',
      slug: 'site',
      content: '<h1 class="text-3xl font-bold mb-6">Sobre o Site</h1><p class="mb-4">Informações sobre este site e como ele foi desenvolvido.</p>'
    }
  ];
}

// Salvar páginas no arquivo
export function savePages(pages: Page[]): void {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar páginas:', error);
  }
}

// Obter uma página por slug
export function getPageBySlug(slug: string): Page | undefined {
  const pages = getPages();
  return pages.find(page => page.slug === slug);
}

// Obter uma página por ID
export function getPage(id: number): Page | undefined {
  const pages = getPages();
  return pages.find(page => page.id === id);
}

// Criar uma nova página
export function createPage(page: Omit<Page, 'id'>): Page {
  const pages = getPages();
  const newId = pages.length > 0 ? Math.max(...pages.map(p => p.id)) + 1 : 1;
  
  const newPage: Page = {
    ...page,
    id: newId
  };
  
  pages.push(newPage);
  savePages(pages);
  return newPage;
}

// Atualizar uma página existente
export function updatePage(id: number, pageUpdate: Partial<Page>): Page | undefined {
  const pages = getPages();
  const index = pages.findIndex(page => page.id === id);
  
  if (index === -1) {
    return undefined;
  }
  
  const updatedPage = {
    ...pages[index],
    ...pageUpdate
  };
  
  pages[index] = updatedPage;
  savePages(pages);
  return updatedPage;
}

// Excluir uma página
export function deletePage(id: number): boolean {
  const pages = getPages();
  const index = pages.findIndex(page => page.id === id);
  
  if (index === -1) {
    return false;
  }
  
  pages.splice(index, 1);
  savePages(pages);
  return true;
}