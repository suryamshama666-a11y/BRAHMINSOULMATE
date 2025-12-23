import { describe, it, expect } from 'vitest';

// Simple test for blog service existence
describe('blogService', () => {
  it('blogService module can be imported', async () => {
    const module = await import('../api/blog.service');
    expect(module.blogService).toBeDefined();
  });

  it('blogService has getArticles method', async () => {
    const module = await import('../api/blog.service');
    expect(typeof module.blogService.getArticles).toBe('function');
  });

  it('blogService has getFeaturedArticles method', async () => {
    const module = await import('../api/blog.service');
    expect(typeof module.blogService.getFeaturedArticles).toBe('function');
  });

  it('blogService has getAnnouncements method', async () => {
    const module = await import('../api/blog.service');
    expect(typeof module.blogService.getAnnouncements).toBe('function');
  });

  it('blogService has getArticleBySlug method', async () => {
    const module = await import('../api/blog.service');
    expect(typeof module.blogService.getArticleBySlug).toBe('function');
  });
});
