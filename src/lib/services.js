import { supabase } from './supabaseClient';

export const adminService = {
  getDashboardStats: async () => {
    // Requires real RLS access
    const [farmersReq, labsReq, expertsReq, requestsReq] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'farmer'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'lab'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'expert'),
      supabase.from('soil_test_requests').select('id', { count: 'exact', head: true })
    ]);
    
    return {
      totalFarmers: farmersReq.count || 0,
      totalLabs: labsReq.count || 0,
      totalExperts: expertsReq.count || 0,
      totalRequests: requestsReq.count || 0
    };
  },
  
  getAllUsers: async (role = null) => {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (role) {
      query = query.eq('role', role);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getAllLabs: async () => {
    const { data, error } = await supabase.from('labs').select('*, profiles(full_name, email, mobile)');
    if (error) throw error;
    return data;
  }
};

export const soilTestService = {
  createSoilTestRequest: async (requestData) => {
    const { data, error } = await supabase
      .from('soil_test_requests')
      .insert(requestData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getRequests: async (filters = {}) => {
    let query = supabase.from('soil_test_requests').select('*, profiles!user_id(full_name, email, mobile), labs(lab_name)').order('created_at', { ascending: false });
    
    // Applying dynamic filters
    for (const key in filters) {
        if (filters[key]) {
            query = query.eq(key, filters[key]);
        }
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getRequestById: async (requestId) => {
    const { data, error } = await supabase
      .from('soil_test_requests')
      .select('*, profiles!user_id(full_name, mobile, email), labs(lab_name, address), field_workers(full_name, mobile)')
      .eq('id', requestId)
      .single();
    if (error) throw error;
    return data;
  },

  updateRequestStatus: async (requestId, newStatus) => {
    const { data, error } = await supabase
      .from('soil_test_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  assignFieldWorker: async (requestId, workerId) => {
    const { data, error } = await supabase
      .from('soil_test_requests')
      .update({ assigned_worker_id: workerId })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  uploadSoilTestReport: async (file, { requestId, userId, labId }) => {
    if (!file) throw new Error('File is required');
    
    const timestamp = Date.now();
    const cleanFileName = `soil-report-${requestId}-${timestamp}.pdf`;
    const filePath = `${userId}/${cleanFileName}`; // Organized by user ID

    // 1. Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('soil-test-reports')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) throw uploadError;

    // 2. Create metadata record
    const { data: reportData, error: reportError } = await supabase
      .from('soil_test_reports')
      .insert({
        request_id: requestId,
        user_id: userId,
        lab_id: labId,
        storage_path: uploadData.path,
        file_name: file.name
      })
      .select()
      .single();
      
    if (reportError) throw reportError;

    // 3. Update Request Status to Completed
    await soilTestService.updateRequestStatus(requestId, 'Completed');

    return reportData;
  },

  getReports: async (filters = {}) => {
    let query = supabase.from('soil_test_reports').select('*, soil_test_requests(*), profiles!user_id(full_name), labs(lab_name)').order('created_at', { ascending: false });
    
    for (const key in filters) {
        if (filters[key]) {
            query = query.eq(key, filters[key]);
        }
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getReportSignedUrl: async (storagePath) => {
    const { data, error } = await supabase.storage
      .from('soil-test-reports')
      .createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) throw error || new Error('Failed to generate signed URL');
    return data.signedUrl;
  }
};

export const labService = {
  getLabProfile: async (labId) => {
    const { data, error } = await supabase
      .from('labs')
      .select('*, profiles(full_name, email, mobile)')
      .eq('id', labId)
      .single();
    if (error) throw error;
    return data;
  },
  
  getFieldWorkers: async (labId) => {
    const { data, error } = await supabase
      .from('field_workers')
      .select('*')
      .eq('lab_id', labId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

export const expertService = {
    getAssignments: async (expertId) => {
        const { data, error } = await supabase
            .from('expert_assignments')
            .select('*, profiles!user_id(id, full_name, mobile, email)')
            .eq('expert_id', expertId)
            .eq('active', true);
        if (error) throw error;
        return data;
    },
    
    assignExpertToUser: async (expertId, userId, adminId) => {
        const { data, error } = await supabase
            .from('expert_assignments')
            .insert({
                expert_id: expertId,
                user_id: userId,
                assigned_by: adminId
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

export const marketplaceService = {
    getProducts: async () => {
        const { data, error } = await supabase
            .from('marketplace_products')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }
};
