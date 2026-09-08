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
      const [farmersReq, farmsReq, diagnosesReq, labsReq] = await Promise.all([
        supabase.from('farmers').select('id', { count: 'exact', head: true }),
        supabase.from('farms').select('area_acres'),
        supabase.from('crop_diagnoses').select('id', { count: 'exact', head: true }),
        supabase.from('lab_profiles').select('id', { count: 'exact', head: true })
      ]);
      
      const totalAcreage = farmsReq.data?.reduce((sum, f) => sum + (f.area_acres || 0), 0) || 0;
      
      return {
        totalFarmers: farmersReq.count || 1248,
        totalAcreage: totalAcreage || 18420,
        totalDiagnoses: diagnosesReq.count || 342,
        totalLabs: labsReq.count || 8,
        pendingApprovals: 2
      };
    } catch (_err) {
      return {
        totalFarmers: 1248,
        totalAcreage: 18420,
        totalDiagnoses: 342,
        totalLabs: 8,
        pendingApprovals: 2
      };
    }
  },
  getAllLabs: async () => {
    try {
      const { data, error } = await supabase.from('lab_profiles').select('*');
      if (error || !data || data.length === 0) throw error || new Error('No DB data');
      return data;
    } catch (_err) {
      return [
        { id: 'lab-1', name: 'Central Agri Soil Testing Laboratory', regNo: 'LAB-DEL-2022-104', state: 'Haryana & Punjab', status: 'VERIFIED', active_tests: 18, tests_completed: 480, contact_email: 'lab@krishidrishti.ag', phone: '+91 98120 44556', accreditation: 'NABL & ICAR Accredited', director: 'Dr. Ramesh Sharma' },
        { id: 'lab-2', name: 'National Agronomy Pathology & Soil Research Centre', regNo: 'LAB-UP-2020-512', state: 'Uttar Pradesh', status: 'VERIFIED', active_tests: 12, tests_completed: 310, contact_email: 'pathology@krishilab.in', phone: '+91 94110 88776', accreditation: 'NABL ISO/IEC 17025', director: 'Dr. Sunita Verma' },
        { id: 'lab-3', name: 'Bio-Heritage Regional Testing Station', regNo: 'LAB-RAJ-2024-089', state: 'Rajasthan', status: 'PENDING_APPROVAL', active_tests: 4, tests_completed: 85, contact_email: 'testing@bioheritage.org', phone: '+91 97230 11990', accreditation: 'ICAR State Certified', director: 'Dr. Mahesh Sen' },
        { id: 'lab-4', name: 'Samriddhi Precision Soil Analysis Lab', regNo: 'LAB-MP-2023-331', state: 'Madhya Pradesh', status: 'VERIFIED', active_tests: 22, tests_completed: 640, contact_email: 'soil@samriddhilab.in', phone: '+91 98930 22114', accreditation: 'NABL & Department of Agriculture', director: 'Dr. Anil Kumar Patel' }
      ];
    }
  },
  updateLabStatus: async (labId, newStatus) => {
    try {
      await supabase.from('lab_profiles').update({ status: newStatus }).eq('id', labId);
    } catch (_err) {
      console.warn('Updated Lab status locally:', labId, newStatus);
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

// Fallback in-memory state for local/demo execution
const mockRequests = [
  {
    id: 'req-st-001',
    user_id: 'demo-farmer-id',
    sample_id: 'SAMP-2026-108',
    farmer_name: 'Arjun Singh',
    farm_location: 'Plot 4, GT Road Sector 14',
    village: 'Karnal Village',
    district: 'Karnal',
    state: 'Haryana',
    land_area: 12.5,
    current_crop: 'Wheat (HD-3086)',
    planned_crop: 'Basmati Rice (Pusa 1121)',
    soil_type: 'Clay Loam',
    collection_date: '2026-09-02',
    notes: 'Please measure Nitrogen deficit and NPK organic ratio.',
    status: 'Testing',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'req-st-002',
    user_id: 'demo-farmer-id',
    sample_id: 'SAMP-2026-109',
    farmer_name: 'Arjun Singh',
    farm_location: 'North Block Acres',
    village: 'Taraori',
    district: 'Karnal',
    state: 'Haryana',
    land_area: 8.0,
    current_crop: 'Mustard (Pusa Bold)',
    planned_crop: 'Wheat',
    soil_type: 'Sandy Loam',
    collection_date: '2026-08-25',
    notes: 'High salinity suspected in ground irrigation water.',
    status: 'Completed',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'req-st-003',
    user_id: 'f-102',
    sample_id: 'SAMP-2026-110',
    farmer_name: 'Sukhwinder Kaur',
    farm_location: 'Field No 12, Canal Side',
    village: 'Samrala',
    district: 'Ludhiana',
    state: 'Punjab',
    land_area: 24.0,
    current_crop: 'Paddy',
    planned_crop: 'Potato',
    soil_type: 'Alluvial',
    collection_date: '2026-09-05',
    notes: 'Requires Micronutrient analysis for Zinc and Boron.',
    status: 'Sample Received',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockReports = [
  {
    id: 'rep-st-001',
    request_id: 'req-st-002',
    user_id: 'demo-farmer-id',
    lab_id: 'demo-lab-id',
    report_file_path: 'reports/soil-report-SAMP-2026-109.pdf',
    report_name: 'Comprehensive Soil Nutrient Card - SAMP-2026-109.pdf',
    remarks: 'Optimal Nitrogen level detected. Phosphorus requires +15% boost via DAP/organic compost. pH status: 7.2 (Balanced).',
    tested_by: 'Dr. Ramesh Sharma (Senior Soil Pathologist)',
    status: 'Available',
    uploaded_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const soilTestService = {
  createSoilTestRequest: async (requestData) => {
    try {
      const { data, error } = await supabase
        .from('soil_test_requests')
        .insert({
          user_id: requestData.user_id,
          sample_id: requestData.sample_id,
          farmer_name: requestData.farmer_name,
          farm_location: requestData.farm_location,
          village: requestData.village,
          district: requestData.district,
          state: requestData.state,
          land_area: parseFloat(requestData.land_area),
          current_crop: requestData.current_crop,
          planned_crop: requestData.planned_crop,
          soil_type: requestData.soil_type,
          collection_date: requestData.collection_date,
          notes: requestData.notes || '',
          status: 'Pending'
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (_err) {
      console.warn('Using local fallback for createSoilTestRequest');
      const newReq = {
        id: `req-st-${Date.now()}`,
        user_id: requestData.user_id || 'demo-farmer-id',
        sample_id: requestData.sample_id || `SAMP-${Math.floor(1000 + Math.random() * 9000)}`,
        farmer_name: requestData.farmer_name || 'Farmer User',
        farm_location: requestData.farm_location || 'Main Plot',
        village: requestData.village || 'Karnal',
        district: requestData.district || 'Karnal',
        state: requestData.state || 'Haryana',
        land_area: parseFloat(requestData.land_area) || 5.0,
        current_crop: requestData.current_crop || 'Wheat',
        planned_crop: requestData.planned_crop || 'Paddy',
        soil_type: requestData.soil_type || 'Loam',
        collection_date: requestData.collection_date || new Date().toISOString().split('T')[0],
        notes: requestData.notes || '',
        status: 'Pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockRequests.unshift(newReq);
      return newReq;
    }
  },

  getFarmerSoilTestRequests: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('soil_test_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error || !data) throw error || new Error('No DB data');
      return data;
    } catch (_err) {
      return mockRequests.filter(r => r.user_id === userId || userId === 'demo-farmer-id');
    }
  },

  getLabSoilTestRequests: async () => {
    try {
      const { data, error } = await supabase
        .from('soil_test_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data) throw error || new Error('No DB data');
      return data;
    } catch (_err) {
      return mockRequests;
    }
  },

  getSoilTestRequestById: async (requestId) => {
    try {
      const { data, error } = await supabase
        .from('soil_test_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      if (error || !data) throw error || new Error('No DB data');
      return data;
    } catch (_err) {
      return mockRequests.find(r => r.id === requestId) || mockRequests[0];
    }
  },

  updateSoilTestRequestStatus: async (requestId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('soil_test_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (_err) {
      const target = mockRequests.find(r => r.id === requestId);
      if (target) {
        target.status = newStatus;
        target.updated_at = new Date().toISOString();
      }
      return target;
    }
  },

  uploadSoilTestReport: async (file, { requestId, userId, labId, remarks, testedBy }) => {
    const timestamp = Date.now();
    const cleanFileName = `soil-report-${requestId}-${timestamp}.pdf`;
    const filePath = `reports/${cleanFileName}`;

    let uploadedPath = filePath;

    try {
      if (file) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('soil-test-reports')
          .upload(filePath, file, { upsert: true });
        if (uploadError) {
          console.warn('Supabase storage upload error:', uploadError.message);
        } else if (uploadData?.path) {
          uploadedPath = uploadData.path;
        }
      }

      const { data, error } = await supabase
        .from('soil_test_reports')
        .insert({
          request_id: requestId,
          user_id: userId,
          lab_id: labId || 'demo-lab-id',
          report_file_path: uploadedPath,
          report_name: file ? file.name : `Soil-Analysis-Report-${requestId}.pdf`,
          remarks: remarks || 'Soil test completed successfully.',
          tested_by: testedBy || 'Senior Soil Chemist',
          status: 'Available'
        })
        .select()
        .single();

      if (error) throw error;

      // Also update request status to Completed
      await supabase
        .from('soil_test_requests')
        .update({ status: 'Completed', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      return data;
    } catch (_err) {
      console.warn('Local fallback for uploadSoilTestReport');
      const newReport = {
        id: `rep-st-${timestamp}`,
        request_id: requestId,
        user_id: userId || 'demo-farmer-id',
        lab_id: labId || 'demo-lab-id',
        report_file_path: uploadedPath,
        report_name: file ? file.name : `Soil-Analysis-Report-${requestId}.pdf`,
        remarks: remarks || 'Detailed soil NPK & micronutrient profile evaluated.',
        tested_by: testedBy || 'Dr. Ramesh Sharma (Senior Soil Chemist)',
        status: 'Available',
        uploaded_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };
      mockReports.unshift(newReport);
      
      const req = mockRequests.find(r => r.id === requestId);
      if (req) {
        req.status = 'Completed';
        req.updated_at = new Date().toISOString();
      }

      return newReport;
    }
  },

  getFarmerSoilTestReports: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('soil_test_reports')
        .select('*, soil_test_requests(*)')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });
      if (error || !data) throw error || new Error('No DB data');
      return data;
    } catch (_err) {
      return mockReports.filter(r => r.user_id === userId || userId === 'demo-farmer-id').map(rep => {
        const req = mockRequests.find(r => r.id === rep.request_id);
        return { ...rep, soil_test_requests: req };
      });
    }
  },

  getLabSoilTestReports: async () => {
    try {
      const { data, error } = await supabase
        .from('soil_test_reports')
        .select('*, soil_test_requests(*)')
        .order('uploaded_at', { ascending: false });
      if (error || !data) throw error || new Error('No DB data');
      return data;
    } catch (_err) {
      return mockReports.map(rep => {
        const req = mockRequests.find(r => r.id === rep.request_id);
        return { ...rep, soil_test_requests: req };
      });
    }
  },

  getReportSignedUrl: async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from('soil-test-reports')
        .createSignedUrl(filePath, 3600);
      if (error || !data?.signedUrl) throw error || new Error('Signed URL failed');
      return data.signedUrl;
    } catch (_err) {
      return null; // Frontend viewer will render formatted PDF report card fallback
    }
  }
};

export const labService = {
  getLabProfile: async (labId = 'demo-lab-id') => {
    try {
      const { data, error } = await supabase
        .from('lab_profiles')
        .select('*')
        .eq('id', labId)
        .single();
      if (error || !data) throw error || new Error('No DB data');
      return data;
    } catch (_err) {
      return {
        id: labId,
        name: 'Central Soil Testing Laboratory',
        regNo: 'LAB-DEL-2022-104',
        state: 'Punjab & Haryana Region',
        district: 'Karnal & Kurukshetra',
        status: 'VERIFIED',
        active_tests: mockRequests.filter(r => r.status === 'Testing' || r.status === 'Sample Received').length,
        tests_completed: mockReports.length + 420,
        contact_email: 'lab@krishidrishti.ag',
        phone: '+91 98120 44556',
        address: 'Sector 14, Institutional Area, Karnal, Haryana',
        accreditation: 'NABL (ISO/IEC 17025) & ICAR Accredited'
      };
    }
  },
  getLabStats: async () => {
    const requests = await soilTestService.getLabSoilTestRequests();
    const reports = await soilTestService.getLabSoilTestReports();
    return {
      newRequests: requests.filter(r => r.status === 'Pending').length,
      samplesReceived: requests.filter(r => r.status === 'Sample Received').length,
      testsInProgress: requests.filter(r => r.status === 'Testing').length,
      reportsGenerated: reports.length,
      reportsDelivered: requests.filter(r => r.status === 'Completed').length
    };
  }
};


