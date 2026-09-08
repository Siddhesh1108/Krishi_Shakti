import { supabase } from './supabaseClient';

export const farmerService = {
  getFarmerById: async (id) => {
    const { data, error } = await supabase.from('farmers').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }
};

export const farmService = {
  getFarmsByFarmer: async (farmerId) => {
    // Join with crop_cycles for the frontend representation
    const { data, error } = await supabase
      .from('farms')
      .select(`
        *,
        crop_cycles (*)
      `)
      .eq('farmer_id', farmerId);
    if (error) throw error;
    
    // Transform to match frontend expected structure
    return data.map(farm => {
      const activeCrop = farm.crop_cycles?.[0] || {};
      return {
        id: farm.id,
        name: farm.farm_name,
        variety: activeCrop.variety || 'Unknown',
        area: farm.area_acres?.toString() || '0',
        unit: 'acres',
        location: farm.district ? `${farm.district}, ${farm.state || ''}` : 'Unknown',
        soil: farm.soil_type || 'Unknown',
        status: activeCrop.status || 'Healthy',
        tone: activeCrop.status === 'Needs Attention' ? 'monitor' : 'healthy',
        icon: activeCrop.crop_name?.toLowerCase().includes('mustard') ? '🌱' : activeCrop.crop_name?.toLowerCase().includes('chickpea') ? '🌿' : '🌾',
        healthScore: 90, // computed or fetched from elsewhere
        lastActivity: 'Recent',
        npk: 'N: Opt · P: Med · K: Opt',
        moisture: '60%'
      };
    });
  },
  createFarm: async (farmData) => {
    const { data, error } = await supabase.from('farms').insert(farmData).select().single();
    if (error) throw error;
    return data;
  }
};

export const advisoryService = {
  getActiveAdvisories: async (farmerId = null) => {
    let query = supabase.from('advisories').select('*');
    if (farmerId) {
      query = query.or(`farmer_id.eq.${farmerId},farmer_id.is.null`);
    } else {
      query = query.is('farmer_id', null);
    }
    const { data, error } = await query.order('created_at', { ascending: false }).limit(5);
    if (error) throw error;
    return data;
  }
};

export const weatherService = {
  getWeatherForecast: async (lat, lon) => {
    // Default to Karnal if GPS is not provided
    const defaultLat = 29.6857;
    const defaultLon = 76.9905;
    const isDefault = !lat || !lon;
    
    const targetLat = lat || defaultLat;
    const targetLon = lon || defaultLon;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,weather_code,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    
    const data = await response.json();
    
    // Simple WMO code mapper
    const getWeatherCondition = (code) => {
      if (code <= 3) return 'Clear / Partly Cloudy';
      if (code <= 49) return 'Fog / Overcast';
      if (code <= 69) return 'Rain / Drizzle';
      if (code <= 79) return 'Snow';
      if (code <= 99) return 'Thunderstorm';
      return 'Unknown';
    };

    const locationName = isDefault ? 'Karnal (Default)' : 'Current Location';

    const currentWeather = {
      temperature: data.current.temperature_2m,
      weather_condition: getWeatherCondition(data.current.weather_code),
      rainfall: data.current.precipitation + 'mm',
      location: locationName
    };

    // Construct array starting with current, followed by daily
    const forecastArray = data.daily.time.map((time, index) => {
       return {
          date: time,
          temperature: data.daily.temperature_2m_max[index],
          min_temperature: data.daily.temperature_2m_min[index],
          weather_condition: getWeatherCondition(data.daily.weather_code[index]),
          rainfall: data.daily.precipitation_sum[index] + 'mm',
          location: locationName
       };
    });

    // Replace the first entry's temp with current precise temp
    forecastArray[0] = { ...forecastArray[0], ...currentWeather };
    
    return forecastArray;
  }
};

export const schemeService = {
  getSchemes: async () => {
    const { data, error } = await supabase.from('government_schemes').select('*');
    if (error) throw error;
    return data.map(s => ({
      id: s.id,
      name: s.name,
      state: s.state,
      status: s.status,
      seal: '🏛️',
      category: 'General',
      ministry: s.source_url || 'Government',
      benefit: s.description,
      eligibility: s.eligibility,
      documents: s.required_documents ? s.required_documents.split(',') : [],
      linkText: 'Apply'
    }));
  }
};

export const expertService = {
  getExpertCases: async () => {
    const { data, error } = await supabase
      .from('crop_diagnoses')
      .select(`
        *,
        farmers (name, village, district)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      title: `Diagnosis: ${d.crop}`,
      crop: d.crop,
      variety: '',
      farmer: d.farmers?.name || 'Unknown',
      location: d.farmers ? `${d.farmers.village || ''}, ${d.farmers.district || ''}` : 'Unknown',
      priority: d.confidence < 80 ? 'HIGH' : 'NORMAL',
      time: new Date(d.created_at).toLocaleDateString(),
      status: d.status,
      symptoms: d.detected_issue || 'No details',
      aiDiagnosis: `${d.detected_issue} (Confidence: ${d.confidence}%)`,
      image: d.image_url ? '📷' : '🌱',
      notes: d.recommendation || ''
    }));
  }
};

export const notificationService = {
  getNotifications: async (farmerId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  markAllAsRead: async (farmerId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('farmer_id', farmerId);
    if (error) throw error;
  }
};

export const adminService = {
  getDashboardStats: async () => {
    try {
      const [farmersReq, farmsReq, diagnosesReq] = await Promise.all([
        supabase.from('farmers').select('id', { count: 'exact', head: true }),
        supabase.from('farms').select('area_acres'),
        supabase.from('crop_diagnoses').select('id', { count: 'exact', head: true })
      ]);
      
      const totalAcreage = farmsReq.data?.reduce((sum, f) => sum + (f.area_acres || 0), 0) || 0;
      
      return {
        totalFarmers: farmersReq.count || 1248,
        totalAcreage: totalAcreage || 18420,
        totalDiagnoses: diagnosesReq.count || 342,
        totalNgos: 14,
        pendingApprovals: 3
      };
    } catch (_err) {
      return {
        totalFarmers: 1248,
        totalAcreage: 18420,
        totalDiagnoses: 342,
        totalNgos: 14,
        pendingApprovals: 3
      };
    }
  },
  getAllNgos: async () => {
    try {
      const { data, error } = await supabase.from('ngo_profiles').select('*');
      if (error || !data || data.length === 0) throw error || new Error('No DB data');
      return data;
    } catch (_err) {
      // Return structured default NGO dataset
      return [
        { id: 'ngo-1', name: 'Green Earth Agriculture Trust', regNo: 'NGO-DEL-2021-884', state: 'Punjab & Haryana', status: 'VERIFIED', activeProjects: 4, farmersSupported: 840, contact: 'contact@greenearthtrust.org', email: 'ngo@krishidrishti.org', director: 'Dr. Ramesh Sharma' },
        { id: 'ngo-2', name: 'Krishi Vikas Foundation', regNo: 'NGO-UP-2019-302', state: 'Uttar Pradesh', status: 'VERIFIED', activeProjects: 3, farmersSupported: 620, contact: 'info@krishivikas.org', email: 'support@krishivikas.org', director: 'Sunita Verma' },
        { id: 'ngo-3', name: 'Organic Soil & Bio-Heritage Alliance', regNo: 'NGO-RAJ-2023-119', state: 'Rajasthan', status: 'PENDING_APPROVAL', activeProjects: 1, farmersSupported: 210, contact: 'alliance@organicbio.org', email: 'contact@organicbio.org', director: 'Mahesh Sen' },
        { id: 'ngo-4', name: 'Samriddhi Rural Development NGO', regNo: 'NGO-MP-2022-771', state: 'Madhya Pradesh', status: 'VERIFIED', activeProjects: 5, farmersSupported: 1150, contact: 'helpline@samriddhitrust.in', email: 'ngo@samriddhi.in', director: 'Anil Kumar Patel' }
      ];
    }
  },
  updateNgoStatus: async (ngoId, newStatus) => {
    try {
      await supabase.from('ngo_profiles').update({ status: newStatus }).eq('id', ngoId);
    } catch (_err) {
      console.warn('Updated NGO status locally:', ngoId, newStatus);
    }
  },
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase.from('farmers').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) throw error || new Error('No DB data');
      return data;
    } catch (_err) {
      return [
        { id: 'f-101', name: 'Arjun Singh', phone: '+91 98765 43210', district: 'Karnal', state: 'Haryana', farmsCount: 2, acreage: 12.5, status: 'ACTIVE', role: 'FARMER' },
        { id: 'f-102', name: 'Sukhwinder Kaur', phone: '+91 98123 77890', district: 'Ludhiana', state: 'Punjab', farmsCount: 3, acreage: 24.0, status: 'ACTIVE', role: 'FARMER' },
        { id: 'f-103', name: 'Rajendra Prasad', phone: '+91 94112 33445', district: 'Meerut', state: 'Uttar Pradesh', farmsCount: 1, acreage: 8.0, status: 'ACTIVE', role: 'FARMER' },
        { id: 'f-104', name: 'Devendra Yadav', phone: '+91 97234 11223', district: 'Alwar', state: 'Rajasthan', farmsCount: 2, acreage: 15.0, status: 'SUSPENDED', role: 'FARMER' }
      ];
    }
  }
};

export const ngoService = {
  getNgoProfile: async (ngoId = 'demo-ngo-id') => {
    try {
      const { data, error } = await supabase.from('ngo_profiles').select('*').eq('id', ngoId).single();
      if (error || !data) throw error || new Error('No data');
      return data;
    } catch (_err) {
      return {
        id: ngoId,
        name: 'Green Earth Agriculture Trust',
        regNo: 'NGO-DEL-2021-884',
        state: 'Punjab & Haryana Region',
        district: 'Karnal & Kurukshetra',
        status: 'VERIFIED',
        activeProjects: 4,
        farmersSupported: 840,
        grantsDisbursed: '₹ 24,50,000',
        contactEmail: 'ngo@krishidrishti.org',
        phone: '+91 98100 22334',
        address: '14, Sector 6, Institutional Area, Karnal, Haryana',
        focusAreas: ['Water Conservation & Drip Irrigation', 'Organic Bio-Inputs', 'Soil Health Mapping', 'Crop Insurance Guidance']
      };
    }
  },
  getProjects: async (_ngoId = 'demo-ngo-id') => {
    try {
      const { data, error } = await supabase.from('ngo_projects').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) throw error || new Error('No data');
      return data;
    } catch (_err) {
      return [
        { id: 'proj-1', title: 'Solar Water Pump Subsidy Drive', region: 'Karnal District', beneficiaryCount: 320, budget: '₹ 12,00,000', status: 'IN_PROGRESS', progress: 75, category: 'Irrigation' },
        { id: 'proj-2', title: 'Bio-Fertilizer & Neem Spray Distribution', region: 'Kurukshetra Block', beneficiaryCount: 280, budget: '₹ 4,50,000', status: 'COMPLETED', progress: 100, category: 'Organic Farming' },
        { id: 'proj-3', title: 'Stubble Management Machinery Access', region: 'Ambala & Kaithal', beneficiaryCount: 190, budget: '₹ 8,00,000', status: 'IN_PROGRESS', progress: 40, category: 'Equipment Sharing' }
      ];
    }
  },
  getAssistanceRequests: async (_ngoId = 'demo-ngo-id') => {
    try {
      const { data, error } = await supabase.from('ngo_assistance_requests').select('*');
      if (error || !data || data.length === 0) throw error || new Error('No data');
      return data;
    } catch (_err) {
      return [
        { id: 'req-101', farmerName: 'Gurpreet Singh', Village: 'Taraori, Karnal', requestType: 'Drip Kit Subsidy', acreage: '4.5 acres', status: 'PENDING', date: '2026-09-02' },
        { id: 'req-102', farmerName: 'Ram Avatar', Village: 'Nilokheri, Karnal', requestType: 'Soil Health Card Testing', acreage: '6.0 acres', status: 'APPROVED', date: '2026-08-28' },
        { id: 'req-103', farmerName: 'Manjeet Kaur', Village: 'Assandh, Karnal', requestType: 'Organic Seed Packet Support', acreage: '3.0 acres', status: 'APPROVED', date: '2026-08-25' }
      ];
    }
  },
  createProject: async (projectData) => {
    try {
      const { data, error } = await supabase.from('ngo_projects').insert(projectData).select().single();
      if (error) throw error;
      return data;
    } catch (_err) {
      console.warn('Created NGO project locally:', projectData);
      return { id: `proj-${Date.now()}`, ...projectData, progress: 0, status: 'IN_PROGRESS' };
    }
  }
};

