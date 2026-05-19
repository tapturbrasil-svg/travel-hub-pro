import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database Tables
export const TABLES = {
  agencies: 'agencies',
  users: 'users',
  trips: 'trips',
  reservations: 'reservations',
  passengers: 'passengers',
  rifas: 'rifas',
  rifa_participants: 'rifa_participants',
  translados: 'translados',
  hospedagens: 'hospedagens',
  suppliers: 'suppliers',
  leads: 'leads',
  subscriptions: 'subscriptions',
  support_tickets: 'support_tickets',
};

// Agency Functions
export const agencyService = {
  async getAll() {
    const { data, error } = await supabase
      .from(TABLES.agencies)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from(TABLES.agencies)
      .select('*, users(*), trips(*), subscriptions(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(agency: any) {
    const { data, error } = await supabase
      .from(TABLES.agencies)
      .insert(agency)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.agencies)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from(TABLES.agencies)
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getStats(agencyId: string) {
    const [users, trips, reservations, revenue] = await Promise.all([
      supabase.from(TABLES.users).select('id', { count: 'exact' }).eq('agency_id', agencyId),
      supabase.from(TABLES.trips).select('id', { count: 'exact' }).eq('agency_id', agencyId),
      supabase.from(TABLES.reservations).select('id', { count: 'exact' }).eq('agency_id', agencyId),
      supabase.from(TABLES.reservations).select('total_value').eq('agency_id', agencyId).eq('status', 'confirmed'),
    ]);
    
    return {
      users: users.count || 0,
      trips: trips.count || 0,
      reservations: reservations.count || 0,
      revenue: revenue.data?.reduce((acc, r) => acc + (r.total_value || 0), 0) || 0,
    };
  },
};

// User Functions
export const userService = {
  async getAll(agencyId?: string) {
    let query = supabase
      .from(TABLES.users)
      .select('*, agencies(name)')
      .order('created_at', { ascending: false });
    
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from(TABLES.users)
      .select('*, agencies(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(user: any) {
    const { data, error } = await supabase
      .from(TABLES.users)
      .insert(user)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.users)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Trip Functions
export const tripService = {
  async getAll(agencyId?: string) {
    let query = supabase
      .from(TABLES.trips)
      .select('*')
      .order('departure_date', { ascending: true });
    
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from(TABLES.trips)
      .select('*, agency(*), reservations(*), hospedagem(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(trip: any) {
    const { data, error } = await supabase
      .from(TABLES.trips)
      .insert(trip)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.trips)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Rifa Functions
export const rifaService = {
  async getAll(agencyId?: string) {
    let query = supabase
      .from(TABLES.rifas)
      .select('*, rifa_participants(*)')
      .order('created_at', { ascending: false });
    
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from(TABLES.rifas)
      .select('*, rifa_participants(*), agency(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(rifa: any) {
    const { data, error } = await supabase
      .from(TABLES.rifas)
      .insert(rifa)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.rifas)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addParticipant(rifaId: string, participant: any) {
    const { data, error } = await supabase
      .from(TABLES.rifa_participants)
      .insert({ ...participant, rifa_id: rifaId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Reservation Functions
export const reservationService = {
  async getAll(agencyId?: string, status?: string) {
    let query = supabase
      .from(TABLES.reservations)
      .select('*, trips(*), passengers(*)')
      .order('created_at', { ascending: false });
    
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(reservation: any) {
    const { data, error } = await supabase
      .from(TABLES.reservations)
      .insert(reservation)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update_status(id: string, status: string) {
    const { data, error } = await supabase
      .from(TABLES.reservations)
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Support Functions
export const supportService = {
  async getAll(status?: string) {
    let query = supabase
      .from(TABLES.support_tickets)
      .select('*, agencies(name), users(name)')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(ticket: any) {
    const { data, error } = await supabase
      .from(TABLES.support_tickets)
      .insert(ticket)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Subscription Functions
export const subscriptionService = {
  async getAll(agencyId?: string) {
    let query = supabase
      .from(TABLES.subscriptions)
      .select('*, agencies(name)')
      .order('created_at', { ascending: false });
    
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(subscription: any) {
    const { data, error } = await supabase
      .from(TABLES.subscriptions)
      .insert(subscription)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Financial Functions
export const financialService = {
  async getMRR(agencyId?: string) {
    let query = supabase
      .from(TABLES.subscriptions)
      .select('price')
      .eq('status', 'active');
    
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data?.reduce((acc, s) => acc + (s.price || 0), 0) || 0;
  },

  async getTransactions(startDate?: string, endDate?: string, agencyId?: string) {
    let query = supabase
      .from(TABLES.reservations)
      .select('*, agencies(name)')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false });
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getRevenueByPeriod(startDate: string, endDate: string, agencyId?: string) {
    const { data, error } = await supabase
      .from(TABLES.reservations)
      .select('created_at, total_value')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'confirmed');
    
    if (error) throw error;
    
    const byMonth: Record<string, number> = {};
    data?.forEach((r: any) => {
      const month = r.created_at.substring(0, 7);
      byMonth[month] = (byMonth[month] || 0) + (r.total_value || 0);
    });
    
    return byMonth;
  },
};