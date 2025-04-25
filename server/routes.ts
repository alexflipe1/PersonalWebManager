import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPageSchema, insertMenuItemSchema } from "@shared/schema";

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
