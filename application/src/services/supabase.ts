import { createClient } from '@supabase/supabase-js';
import { Token, User, Portfolio, Watchlist, Activity } from '../types';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {
  // User operations
  static async createUser(address: string, email?: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            address,
            email,
            default_amount: 0.01,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return data as User;
    } catch (err) {
      console.error('Error creating user:', err);
      return null;
    }
  }

  static async getUser(address: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('address', address)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found, create new user
          return this.createUser(address);
        }
        console.error('Error fetching user:', error);
        return null;
      }

      return data as User;
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  }

  static async updateUserDefaultAmount(address: string, amount: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ default_amount: amount })
        .eq('address', address);

      if (error) {
        console.error('Error updating user default amount:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error updating user default amount:', err);
      return false;
    }
  }

  // Portfolio operations
  static async getPortfolio(userAddress: string): Promise<Portfolio | null> {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_address', userAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Portfolio not found, create empty portfolio
          return this.createEmptyPortfolio(userAddress);
        }
        console.error('Error fetching portfolio:', error);
        return null;
      }

      return data as Portfolio;
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      return null;
    }
  }

  static async createEmptyPortfolio(userAddress: string): Promise<Portfolio | null> {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .insert([
          {
            user_address: userAddress,
            tokens: [],
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating empty portfolio:', error);
        return null;
      }

      return data as Portfolio;
    } catch (err) {
      console.error('Error creating empty portfolio:', err);
      return null;
    }
  }

  static async updatePortfolio(portfolio: Portfolio): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('portfolio')
        .upsert({
          user_address: portfolio.user_address,
          tokens: portfolio.tokens,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating portfolio:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error updating portfolio:', err);
      return false;
    }
  }

  // Watchlist operations
  static async getWatchlist(userAddress: string): Promise<Watchlist | null> {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_address', userAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Watchlist not found, create empty watchlist
          return this.createEmptyWatchlist(userAddress);
        }
        console.error('Error fetching watchlist:', error);
        return null;
      }

      return data as Watchlist;
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      return null;
    }
  }

  static async createEmptyWatchlist(userAddress: string): Promise<Watchlist | null> {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .insert([
          {
            user_address: userAddress,
            tokens: [],
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating empty watchlist:', error);
        return null;
      }

      return data as Watchlist;
    } catch (err) {
      console.error('Error creating empty watchlist:', err);
      return null;
    }
  }

  static async updateWatchlist(watchlist: Watchlist): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('watchlist')
        .upsert({
          user_address: watchlist.user_address,
          tokens: watchlist.tokens,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating watchlist:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error updating watchlist:', err);
      return false;
    }
  }

  // Activity operations
  static async addActivity(activity: Omit<Activity, 'id'>): Promise<Activity | null> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([
          {
            user_address: activity.user_address,
            token: activity.token,
            action: activity.action,
            amount: activity.amount,
            created_at: activity.created_at || new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding activity:', error);
        return null;
      }

      return data as Activity;
    } catch (err) {
      console.error('Error adding activity:', err);
      return null;
    }
  }

  static async getActivities(userAddress: string, limit: number = 10): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_address', userAddress)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      return data as Activity[];
    } catch (err) {
      console.error('Error fetching activities:', err);
      return [];
    }
  }
}
