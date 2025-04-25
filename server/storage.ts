import { 
  User, InsertUser, 
  Page, InsertPage, 
  MenuItem, InsertMenuItem,
  SiteSettings, InsertSiteSettings
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Page methods
  getPages(): Promise<Page[]>;
  getPage(id: number): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: number): Promise<boolean>;
  
  // Menu methods
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  reorderMenuItems(itemIds: number[]): Promise<MenuItem[]>;
  
  // Settings methods
  getSetting(name: string): Promise<SiteSettings | undefined>;
  saveSetting(setting: InsertSiteSettings): Promise<SiteSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pages: Map<number, Page>;
  private menuItems: Map<number, MenuItem>;
  private settings: Map<string, SiteSettings>;
  
  userCurrentId: number;
  pageCurrentId: number;
  menuItemCurrentId: number;
  settingCurrentId: number;

  constructor() {
    this.users = new Map();
    this.pages = new Map();
    this.menuItems = new Map();
    this.settings = new Map();
    
    this.userCurrentId = 1;
    this.pageCurrentId = 1;
    this.menuItemCurrentId = 1;
    this.settingCurrentId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Create default pages
    const homePage: InsertPage = {
      title: "Início",
      slug: "home",
      content: `<h1 class="text-3xl font-bold text-dark mb-6">Bem-vindo ao Meu Site</h1>
      <p class="text-gray-600 mb-4">Este é um site personalizado com um sistema de gerenciamento de conteúdo integrado.</p>
      <div class="grid md:grid-cols-2 gap-6 mt-8">
          <div class="bg-white p-6 rounded-lg shadow-md">
              <span class="material-icons text-primary text-4xl mb-4">web</span>
              <h3 class="text-xl font-semibold mb-2">Design Moderno</h3>
              <p class="text-gray-600">Interface limpa e responsiva para todos os dispositivos.</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
              <span class="material-icons text-primary text-4xl mb-4">edit</span>
              <h3 class="text-xl font-semibold mb-2">Conteúdo Editável</h3>
              <p class="text-gray-600">Gerencie textos, imagens e botões facilmente.</p>
          </div>
      </div>
      <section>
          <h2 class="text-2xl font-bold text-dark mb-4 mt-8">Recursos Principais</h2>
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
              <div class="p-6">
                  <ul class="space-y-3">
                      <li class="flex items-start">
                          <span class="material-icons text-accent mr-2">check_circle</span>
                          <span>Área administrativa protegida por senha</span>
                      </li>
                      <li class="flex items-start">
                          <span class="material-icons text-accent mr-2">check_circle</span>
                          <span>Criação e edição de páginas personalizadas</span>
                      </li>
                      <li class="flex items-start">
                          <span class="material-icons text-accent mr-2">check_circle</span>
                          <span>Gerenciamento do menu de navegação</span>
                      </li>
                      <li class="flex items-start">
                          <span class="material-icons text-accent mr-2">check_circle</span>
                          <span>Incorporação de sites externos via iframe</span>
                      </li>
                  </ul>
              </div>
          </div>
      </section>`
    };
    
    const servicesPage: InsertPage = {
      title: "Serviços",
      slug: "servicos",
      content: `<h1 class="text-3xl font-bold text-dark mb-6">Nossos Serviços</h1>
      <p class="text-gray-600 mb-6">Conheça os serviços que oferecemos.</p>
      
      <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-xl font-semibold mb-3">Serviço 1</h3>
              <p class="text-gray-600 mb-4">Descrição do serviço 1 que você oferece.</p>
              <a href="#" class="text-primary font-medium hover:underline">Saiba mais</a>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-xl font-semibold mb-3">Serviço 2</h3>
              <p class="text-gray-600 mb-4">Descrição do serviço 2 que você oferece.</p>
              <a href="#" class="text-primary font-medium hover:underline">Saiba mais</a>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-xl font-semibold mb-3">Serviço 3</h3>
              <p class="text-gray-600 mb-4">Descrição do serviço 3 que você oferece.</p>
              <a href="#" class="text-primary font-medium hover:underline">Saiba mais</a>
          </div>
      </div>`
    };
    
    const sitePage: InsertPage = {
      title: "Site",
      slug: "site",
      content: `<h1 class="text-3xl font-bold text-dark mb-6">Sobre o Site</h1>
      <div class="bg-white p-6 rounded-lg shadow-md">
          <p class="text-gray-600 mb-4">Este site foi criado para demonstrar as funcionalidades de um sistema de gerenciamento de conteúdo personalizado.</p>
          <p class="text-gray-600 mb-4">Na área administrativa, é possível criar novas páginas, gerenciar o menu de navegação, editar conteúdo existente e muito mais.</p>
          <p class="text-gray-600">Navegue pelo menu para explorar as diferentes seções do site.</p>
      </div>`
    };
    
    this.createPage(homePage);
    this.createPage(servicesPage);
    this.createPage(sitePage);
    
    // Create default menu items
    const menuItems: InsertMenuItem[] = [
      {
        text: "Início",
        order: 1,
        type: "internal",
        internalLink: "home",
        externalUrl: null
      },
      {
        text: "Serviços",
        order: 2,
        type: "internal",
        internalLink: "servicos",
        externalUrl: null
      },
      {
        text: "Site",
        order: 3,
        type: "internal",
        internalLink: "site",
        externalUrl: null
      },
      {
        text: "Alex",
        order: 4,
        type: "internal",
        internalLink: "alex",
        externalUrl: null
      }
    ];
    
    menuItems.forEach(item => this.createMenuItem(item));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Page methods
  async getPages(): Promise<Page[]> {
    return Array.from(this.pages.values()).sort((a, b) => a.id - b.id);
  }
  
  async getPage(id: number): Promise<Page | undefined> {
    return this.pages.get(id);
  }
  
  async getPageBySlug(slug: string): Promise<Page | undefined> {
    return Array.from(this.pages.values()).find(page => page.slug === slug);
  }
  
  async createPage(insertPage: InsertPage): Promise<Page> {
    const id = this.pageCurrentId++;
    const now = new Date();
    const page: Page = { 
      ...insertPage, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.pages.set(id, page);
    return page;
  }
  
  async updatePage(id: number, pageUpdate: Partial<InsertPage>): Promise<Page | undefined> {
    const existingPage = this.pages.get(id);
    if (!existingPage) return undefined;
    
    const updatedPage: Page = {
      ...existingPage,
      ...pageUpdate,
      updatedAt: new Date()
    };
    
    this.pages.set(id, updatedPage);
    return updatedPage;
  }
  
  async deletePage(id: number): Promise<boolean> {
    return this.pages.delete(id);
  }
  
  // Menu methods
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).sort((a, b) => a.order - b.order);
  }
  
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }
  
  async createMenuItem(insertMenuItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.menuItemCurrentId++;
    const menuItem: MenuItem = { ...insertMenuItem, id };
    this.menuItems.set(id, menuItem);
    return menuItem;
  }
  
  async updateMenuItem(id: number, menuItemUpdate: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const existingMenuItem = this.menuItems.get(id);
    if (!existingMenuItem) return undefined;
    
    const updatedMenuItem: MenuItem = {
      ...existingMenuItem,
      ...menuItemUpdate
    };
    
    this.menuItems.set(id, updatedMenuItem);
    return updatedMenuItem;
  }
  
  async deleteMenuItem(id: number): Promise<boolean> {
    return this.menuItems.delete(id);
  }
  
  async reorderMenuItems(itemIds: number[]): Promise<MenuItem[]> {
    // Update the order of each menu item based on its position in the itemIds array
    for (let i = 0; i < itemIds.length; i++) {
      const id = itemIds[i];
      const menuItem = this.menuItems.get(id);
      
      if (menuItem) {
        this.menuItems.set(id, { ...menuItem, order: i + 1 });
      }
    }
    
    return this.getMenuItems();
  }
  
  // Settings methods
  async getSetting(name: string): Promise<SiteSettings | undefined> {
    return this.settings.get(name);
  }
  
  async saveSetting(insertSetting: InsertSiteSettings): Promise<SiteSettings> {
    const id = this.settingCurrentId++;
    const setting: SiteSettings = { ...insertSetting, id };
    this.settings.set(insertSetting.name, setting);
    return setting;
  }
}

export const storage = new MemStorage();
