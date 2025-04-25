import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MenuItem } from '@shared/schema';

// Obter o diretório atual (equivalente ao __dirname em CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MENU_FILE = path.resolve(__dirname, '../data/menuItems.json');

// Garantir que o diretório existe
function ensureDirectoryExists() {
  const dir = path.dirname(MENU_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Ler itens de menu do arquivo
export function getMenuItems(): MenuItem[] {
  try {
    ensureDirectoryExists();
    if (!fs.existsSync(MENU_FILE)) {
      // Criar itens de menu padrão se o arquivo não existir
      const defaultMenuItems = createDefaultMenuItems();
      saveMenuItems(defaultMenuItems);
      return defaultMenuItems;
    }
    const data = fs.readFileSync(MENU_FILE, 'utf8');
    return JSON.parse(data) as MenuItem[];
  } catch (error) {
    console.error('Erro ao ler itens de menu:', error);
    return createDefaultMenuItems();
  }
}

// Criar itens de menu padrão
function createDefaultMenuItems(): MenuItem[] {
  return [
    {
      id: 1,
      text: 'Início',
      type: 'internal',
      url: '/home',
      order: 1
    },
    {
      id: 2,
      text: 'Serviços',
      type: 'internal',
      url: '/servicos',
      order: 2
    },
    {
      id: 3,
      text: 'Alex',
      type: 'internal',
      url: '/admin',
      order: 3
    },
    {
      id: 4,
      text: 'Site',
      type: 'internal',
      url: '/site',
      order: 4
    }
  ];
}

// Salvar itens de menu no arquivo
export function saveMenuItems(menuItems: MenuItem[]): void {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(MENU_FILE, JSON.stringify(menuItems, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar itens de menu:', error);
  }
}

// Obter um item de menu por ID
export function getMenuItem(id: number): MenuItem | undefined {
  const menuItems = getMenuItems();
  return menuItems.find(item => item.id === id);
}

// Criar um novo item de menu
export function createMenuItem(menuItem: Omit<MenuItem, 'id'>): MenuItem {
  const menuItems = getMenuItems();
  const newId = menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1;
  
  const newMenuItem: MenuItem = {
    ...menuItem,
    id: newId
  };
  
  menuItems.push(newMenuItem);
  saveMenuItems(menuItems);
  return newMenuItem;
}

// Atualizar um item de menu existente
export function updateMenuItem(id: number, menuItemUpdate: Partial<MenuItem>): MenuItem | undefined {
  const menuItems = getMenuItems();
  const index = menuItems.findIndex(item => item.id === id);
  
  if (index === -1) {
    return undefined;
  }
  
  const updatedMenuItem = {
    ...menuItems[index],
    ...menuItemUpdate
  };
  
  menuItems[index] = updatedMenuItem;
  saveMenuItems(menuItems);
  return updatedMenuItem;
}

// Excluir um item de menu
export function deleteMenuItem(id: number): boolean {
  const menuItems = getMenuItems();
  const index = menuItems.findIndex(item => item.id === id);
  
  if (index === -1) {
    return false;
  }
  
  menuItems.splice(index, 1);
  saveMenuItems(menuItems);
  return true;
}

// Reordenar itens de menu
export function reorderMenuItems(itemIds: number[]): MenuItem[] {
  const menuItems = getMenuItems();
  const reorderedItems: MenuItem[] = [];
  
  // Reordenar com base na ordem dos IDs fornecidos
  for (let i = 0; i < itemIds.length; i++) {
    const id = itemIds[i];
    const item = menuItems.find(item => item.id === id);
    
    if (item) {
      reorderedItems.push({
        ...item,
        order: i + 1
      });
    }
  }
  
  // Adicionar itens que não estavam na lista de reordenação
  const otherItems = menuItems.filter(item => !itemIds.includes(item.id));
  const allItems = [...reorderedItems, ...otherItems];
  
  saveMenuItems(allItems);
  return allItems;
}