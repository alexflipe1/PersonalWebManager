import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CustomButton } from '@shared/schema';

// Obter o diretório atual (equivalente ao __dirname em CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUTTONS_FILE = path.resolve(__dirname, '../data/customButtons.json');

// Garantir que o diretório existe
function ensureDirectoryExists() {
  const dir = path.dirname(BUTTONS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Ler botões do arquivo
export function getCustomButtons(): CustomButton[] {
  try {
    ensureDirectoryExists();
    if (!fs.existsSync(BUTTONS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(BUTTONS_FILE, 'utf8');
    return JSON.parse(data) as CustomButton[];
  } catch (error) {
    console.error('Erro ao ler botões personalizados:', error);
    return [];
  }
}

// Salvar botões no arquivo
export function saveCustomButtons(buttons: CustomButton[]): void {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(BUTTONS_FILE, JSON.stringify(buttons, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar botões personalizados:', error);
  }
}

// Obter botões de uma página específica
export function getCustomButtonsByPage(pageSlug: string): CustomButton[] {
  const buttons = getCustomButtons();
  return buttons.filter(button => button.pageSlug === pageSlug);
}

// Obter um botão por ID
export function getCustomButtonById(id: number): CustomButton | undefined {
  const buttons = getCustomButtons();
  return buttons.find(button => button.id === id);
}

// Adicionar um novo botão
export function addCustomButton(button: Omit<CustomButton, 'id'>): CustomButton {
  const buttons = getCustomButtons();
  const newId = buttons.length > 0 ? Math.max(...buttons.map(b => b.id)) + 1 : 1;
  
  const newButton: CustomButton = {
    ...button,
    id: newId
  };
  
  buttons.push(newButton);
  saveCustomButtons(buttons);
  return newButton;
}

// Atualizar um botão existente
export function updateCustomButton(id: number, buttonUpdate: Partial<CustomButton>): CustomButton | undefined {
  const buttons = getCustomButtons();
  const index = buttons.findIndex(button => button.id === id);
  
  if (index === -1) {
    return undefined;
  }
  
  const updatedButton = {
    ...buttons[index],
    ...buttonUpdate
  };
  
  buttons[index] = updatedButton;
  saveCustomButtons(buttons);
  return updatedButton;
}

// Excluir um botão
export function deleteCustomButton(id: number): boolean {
  const buttons = getCustomButtons();
  const index = buttons.findIndex(button => button.id === id);
  
  if (index === -1) {
    return false;
  }
  
  buttons.splice(index, 1);
  saveCustomButtons(buttons);
  return true;
}