import request from 'supertest';
import app from '../server';
import { supabase } from '../config/supabase';

// Mock Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  },
}));

describe('Matching Routes', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockProfile = { 
    id: 'user-123', 
    gender: 'male', 
    age: 28, 
    city: 'Mumbai', 
    verified: true,
    preferences: { ageMin: 20, ageMax: 30 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  describe('GET /api/matching/recommendations', () => {
    it('should return recommended matches', async () => {
      // Mock user profile fetch
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            neq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ 
              data: table === 'profiles' ? (supabase.from as unknown as Record<string, unknown>)._isSingle ? mockProfile : [
                { id: 'partner-1', gender: 'female', age: 25, city: 'Mumbai', verified: true },
                { id: 'partner-2', gender: 'female', age: 24, city: 'Pune', verified: true }
              ] : [], 
              error: null 
            }),
            single: jest.fn().mockImplementation(function(this: { _isSingle: boolean }) {
              this._isSingle = true;
              return this;
            }),
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });

      // Refinement to handle the two different calls to 'profiles'
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            data: [
              { id: 'partner-1', gender: 'female', age: 25, city: 'Mumbai', verified: true },
              { id: 'partner-2', gender: 'female', age: 24, city: 'Pune', verified: true }
            ],
            error: null
          });
        }),
        single: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            data: mockProfile,
            error: null
          });
        }),
      });

      const res = await request(app)
        .get('/api/matching/recommendations')
        .set('Authorization', 'Bearer mock-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.matches).toBeDefined();
      expect(res.body.matches.length).toBeGreaterThan(0);
      expect(res.body.matches[0].compatibility_score).toBeDefined();
    }, 30000);

    it('should return 401 if no token provided', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') });
      
      const res = await request(app).get('/api/matching/recommendations');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/matching/interest/send', () => {
    it('should send an interest successfully', async () => {
      // Mock interest check
      const mockSingleNull = jest.fn().mockResolvedValue({ data: null, error: null });

      // Mock interest insert
      const mockSingleResult = jest.fn().mockResolvedValue({ data: { id: 'interest-1' }, error: null });
      const mockSelectResult = jest.fn().mockReturnValue({ single: mockSingleResult });
      const mockInsertResult = jest.fn().mockReturnValue({ select: mockSelectResult });

      // Mock notification insert
      const mockNotificationInsert = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'interests') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: mockSingleNull,
            insert: mockInsertResult,
          };
        }
        if (table === 'notifications') {
          return {
            insert: mockNotificationInsert,
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });

      const res = await request(app)
        .post('/api/matching/interest/send')
        .set('Authorization', 'Bearer mock-token')
        .send({ receiverId: 'target-user', message: 'Hello' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    }, 30000);
  });
});
