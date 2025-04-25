import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPageSchema, insertMenuItemSchema, insertCustomButtonSchema } from "@shared/schema";
import * as customButtonsService from "./customButtons";

export async function registerRoutes(app: Express): Promise<Server> {
  // Pages routes
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.getPages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.post("/api/pages", async (req, res) => {
    try {
      const pageData = insertPageSchema.parse(req.body);
      const page = await storage.createPage(pageData);
      res.status(201).json(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid page data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  app.put("/api/pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pageData = insertPageSchema.partial().parse(req.body);
      const updatedPage = await storage.updatePage(id, pageData);
      
      if (!updatedPage) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(updatedPage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid page data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update page" });
    }
  });

  app.delete("/api/pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deletePage(id);
      
      if (!result) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  // Menu routes
  app.get("/api/menu", async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post("/api/menu", async (req, res) => {
    try {
      const menuItemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItemData = insertMenuItemSchema.partial().parse(req.body);
      const updatedMenuItem = await storage.updateMenuItem(id, menuItemData);
      
      if (!updatedMenuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(updatedMenuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteMenuItem(id);
      
      if (!result) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  app.post("/api/menu/reorder", async (req, res) => {
    try {
      const schema = z.object({
        itemIds: z.array(z.number())
      });
      
      const { itemIds } = schema.parse(req.body);
      const menuItems = await storage.reorderMenuItems(itemIds);
      res.json(menuItems);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to reorder menu items" });
    }
  });

  // Botões Personalizados routes
  app.get("/api/custom-buttons", async (req, res) => {
    try {
      let buttons;
      if (typeof customButtonsService.getCustomButtons === 'function') {
        // Use o arquivo de serviço se disponível
        buttons = customButtonsService.getCustomButtons();
      } else {
        // Use o armazenamento de memória ou banco de dados
        buttons = await storage.getCustomButtons();
      }
      res.json(buttons);
    } catch (error) {
      console.error("Erro ao buscar botões personalizados:", error);
      res.status(500).json({ message: "Erro ao buscar botões personalizados" });
    }
  });

  app.get("/api/custom-buttons/page/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      let buttons;
      if (typeof customButtonsService.getCustomButtonsByPage === 'function') {
        // Use o arquivo de serviço se disponível
        buttons = customButtonsService.getCustomButtonsByPage(slug);
      } else {
        // Use o armazenamento de memória ou banco de dados
        buttons = await storage.getCustomButtonsByPage(slug);
      }
      res.json(buttons);
    } catch (error) {
      console.error(`Erro ao buscar botões para a página ${req.params.slug}:`, error);
      res.status(500).json({ message: "Erro ao buscar botões personalizados para a página" });
    }
  });

  app.get("/api/custom-buttons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      let button;
      if (typeof customButtonsService.getCustomButtonById === 'function') {
        // Use o arquivo de serviço se disponível
        button = customButtonsService.getCustomButtonById(id);
      } else {
        // Use o armazenamento de memória ou banco de dados
        button = await storage.getCustomButton(id);
      }
      
      if (!button) {
        return res.status(404).json({ message: "Botão não encontrado" });
      }
      
      res.json(button);
    } catch (error) {
      console.error(`Erro ao buscar botão com ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Erro ao buscar botão personalizado" });
    }
  });

  app.post("/api/custom-buttons", (req, res) => {
    try {
      const buttonSchema = z.object({
        text: z.string(),
        type: z.string(),
        url: z.string(),
        internalLink: z.string().nullable().optional(),
        externalUrl: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        pageSlug: z.string(),
        style: z.string().default("primary"),
        size: z.string().default("default"),
        openInNewTab: z.boolean().default(true)
      });
      
      const buttonData = buttonSchema.parse(req.body);
      
      // Adicionamos a data de criação aqui
      const now = new Date();
      const newButtonWithTimestamp = {
        ...buttonData,
        createdAt: now
      };
      
      // Usamos o arquivo de serviço para servidores baseados em arquivos
      // ou o armazenamento para servidores baseados em memória ou banco de dados
      let newButton;
      if (typeof customButtonsService.addCustomButton === 'function') {
        newButton = customButtonsService.addCustomButton(newButtonWithTimestamp);
      } else {
        newButton = storage.createCustomButton(newButtonWithTimestamp);
      }
      
      res.status(201).json(newButton);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos para o botão", 
          errors: error.errors 
        });
      }
      
      console.error("Erro ao criar botão personalizado:", error);
      res.status(500).json({ message: "Erro ao criar botão personalizado" });
    }
  });

  app.put("/api/custom-buttons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const buttonSchema = z.object({
        text: z.string().optional(),
        type: z.string().optional(),
        url: z.string().optional(),
        internalLink: z.string().nullable().optional(),
        externalUrl: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        pageSlug: z.string().optional(),
        style: z.string().optional(),
        size: z.string().optional(),
        openInNewTab: z.boolean().optional()
      });
      
      const buttonData = buttonSchema.parse(req.body);
      
      let updatedButton;
      if (typeof customButtonsService.updateCustomButton === 'function') {
        // Use o arquivo de serviço se disponível
        updatedButton = customButtonsService.updateCustomButton(id, buttonData);
      } else {
        // Use o armazenamento de memória ou banco de dados
        updatedButton = await storage.updateCustomButton(id, buttonData);
      }
      
      if (!updatedButton) {
        return res.status(404).json({ message: "Botão não encontrado" });
      }
      
      res.json(updatedButton);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos para o botão", 
          errors: error.errors 
        });
      }
      
      console.error(`Erro ao atualizar botão com ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Erro ao atualizar botão personalizado" });
    }
  });

  app.delete("/api/custom-buttons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      let success;
      if (typeof customButtonsService.deleteCustomButton === 'function') {
        // Use o arquivo de serviço se disponível
        success = customButtonsService.deleteCustomButton(id);
      } else {
        // Use o armazenamento de memória ou banco de dados
        success = await storage.deleteCustomButton(id);
      }
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Botão não encontrado" });
      }
    } catch (error) {
      console.error(`Erro ao excluir botão com ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Erro ao excluir botão personalizado" });
    }
  });

  // Authentication route - simple password check
  app.post("/api/auth", (req, res) => {
    try {
      const schema = z.object({
        password: z.string()
      });
      
      const { password } = schema.parse(req.body);
      
      if (password === "8390") {
        return res.json({ success: true });
      }
      
      res.status(401).json({ message: "Incorrect password" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
