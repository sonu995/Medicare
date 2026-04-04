// Final-final version of in-memory mock database with full constructor and save() support
let doctorsStore = [
  {
    _id: "69b557438b0fffda8c0bf68c", id: "69b557438b0fffda8c0bf68c",
    name: "Dr. Sameer Shah", specialty: "Cardiologist", experience: "15+ years experience",
    rating: "4.8 (120 Reviews)", location: "South Mumbai", clinicName: "Apollo Cardio Clinic",
    icon: "👨‍⚕️", available: "Today",
    qualifications: ["MBBS", "MD (Cardiology)", "DM (Cardiology)"], education: "Grant Medical College, Mumbai",
    bio: "Dr. Sameer Shah is a renowned cardiologist with over 15 years of experience in treating heart conditions.",
    achievements: ["Best Cardiologist Award 2023"],
    languages: ["English", "Hindi", "Marathi"], fee: 800,
    schedule: {
      morning: { start: "09:00", end: "13:00", totalTokens: 30, tokenDuration: 10, active: true },
      evening: { start: "17:00", end: "21:00", totalTokens: 20, tokenDuration: 10, active: true }
    }
  },
  {
    _id: "69b5596c8b0fffda8c0bf6f1", id: "69b5596c8b0fffda8c0bf6f1",
    name: "Dr. Amit Bose", specialty: "Cardiologist", experience: "8+ years experience",
    rating: "4.6 (60 Reviews)", location: "South Mumbai", clinicName: "Apollo Cardio Clinic",
    icon: "👨‍⚕️", available: "Today",
    qualifications: ["MBBS", "DM (Cardiology)"], education: "Medical College", bio: "Dr. Amit Bose is a cardiologist.", achievements: [], languages: ["English", "Hindi"], fee: 600,
    schedule: { 
      morning: { start: "09:00", end: "12:00", totalTokens: 20, tokenDuration: 10, active: true }, 
      evening: { start: "17:00", end: "21:00", totalTokens: 15, tokenDuration: 10, active: true } 
    }
  },
  {
    _id: "city-health-doc-1", id: "city-health-doc-1",
    name: "Dr. Priya Sharma", specialty: "Pediatrician", experience: "10+ years experience",
    rating: "4.9 (150 Reviews)", location: "Andheri West", clinicName: "City Health Center",
    icon: "👩‍⚕️", available: "Today",
    qualifications: ["MBBS", "MD (Pediatrics)"], education: "KEM Hospital", bio: "Dr. Priya is an expert in child care.", achievements: ["Best Pediatrician 2022"], languages: ["English", "Hindi"], fee: 500,
    schedule: { 
      morning: { start: "10:00", end: "14:00", totalTokens: 25, tokenDuration: 15, active: true }, 
      evening: { start: "18:00", end: "20:00", totalTokens: 10, tokenDuration: 15, active: true } 
    }
  },
  {
    _id: "metro-doc-1", id: "metro-doc-1",
    name: "Dr. Rahul Verma", specialty: "Dermatologist", experience: "12+ years experience",
    rating: "4.7 (95 Reviews)", location: "Bandra East", clinicName: "Metro General Clinic",
    icon: "👨‍⚕️", available: "Today",
    qualifications: ["MBBS", "MD (Dermatology)"], education: "Sion Hospital", bio: "Dr. Rahul specializes in clinical dermatology.", achievements: [], languages: ["English", "Hindi"], fee: 700,
    schedule: { 
      morning: { start: "09:00", end: "13:00", totalTokens: 20, tokenDuration: 12, active: true }, 
      evening: { start: "16:00", end: "19:00", totalTokens: 15, tokenDuration: 12, active: true } 
    }
  }
];

let clinicsStore = [
  {
    _id: "69b557438b0fffda8c0bf693", id: "69b557438b0fffda8c0bf693",
    name: "Apollo Cardio Clinic", address: "12, Marine Drive, South Mumbai", location: "South Mumbai",
    phone: "+91 22 4001 2345", rating: "4.8", reviews: 340, icon: "🏥",
    timings: "Mon–Sat: 9 AM – 9 PM", specialties: ["Cardiology"],
    facilities: ["OPD", "Lab Tests"], tokensAvailable: 18, status: "open",
    themeColor: "#0066ff",
    doctors: [
      { name: "Dr. Sameer Shah", icon: "👨‍⚕️", specialty: "Cardiologist", experience: "15 yrs", rating: "4.8", morning: "9:00–1:00 PM", evening: "5:00–8:00 PM" },
      { name: "Dr. Amit Bose", icon: "👨‍⚕️", specialty: "Cardiologist", experience: "8 yrs", rating: "4.6", morning: "Not Available", evening: "5:00–9:00 PM" },
    ]
  },
  {
    _id: "city-health-id", id: "city-health-id",
    name: "City Health Center", address: "SV Road, Andheri West", location: "Andheri West",
    phone: "+91 22 2620 9876", rating: "4.9", reviews: 180, icon: "🏥",
    timings: "Mon–Sun: 8 AM – 10 PM", specialties: ["Pediatrics", "General Medicine"],
    facilities: ["Pharmacy", "Emergency"], tokensAvailable: 35, status: "open",
    themeColor: "#22c55e",
    doctors: [
      { name: "Dr. Priya Sharma", icon: "👩‍⚕️", specialty: "Pediatrician", experience: "10 yrs", rating: "4.9", morning: "10:00–2:00 PM", evening: "6:00–8:00 PM" }
    ]
  },
  {
    _id: "metro-clinic-id", id: "metro-clinic-id",
    name: "Metro General Clinic", address: "BKC Road, Bandra East", location: "Bandra East",
    phone: "+91 22 6111 2222", rating: "4.7", reviews: 120, icon: "🏥",
    timings: "Mon–Sat: 9 AM – 8 PM", specialties: ["Dermatology", "Orthopedics"],
    facilities: ["Laboratory", "X-Ray"], tokensAvailable: 20, status: "open",
    themeColor: "#8b5cf6",
    doctors: [
      { name: "Dr. Rahul Verma", icon: "👨‍⚕️", specialty: "Dermatologist", experience: "12 yrs", rating: "4.7", morning: "9:00–1:00 PM", evening: "4:00–7:00 PM" }
    ]
  }
];

let bookingsStore = [];
let prescriptionsStore = [
  {
    _id: 'RX-TEST-001',
    prescriptionId: 'RX-TEST-001',
    patientName: 'Test User',
    patientPhone: '9876543210',
    doctorId: '69b557438b0fffda8c0bf693-0',
    doctorName: 'Dr. Sameer Shah',
    clinicId: '69b557438b0fffda8c0bf693',
    clinicName: 'Apollo Cardio Clinic',
    clinicIcon: '🏥',
    clinicAddress: '12, Marine Drive, South Mumbai',
    clinicPhone: '+91 22 4001 2345',
    chiefComplaint: 'Fever and headache',
    diagnosis: 'Viral Fever',
    age: '30',
    gender: 'Male',
    medicines: [
      { name: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'After food' }
    ],
    advice: 'Rest and plenty of fluids',
    investigations: '',
    followUp: 'After 3 days',
    date: new Date(),
    status: 'active'
  }
];
let tokenStatesStore = {
    "69b5596c8b0fffda8c0bf6f1": { _id: "TS1", id: "TS1", doctorId: "69b5596c8b0fffda8c0bf6f1", currentToken: 1, status: "open", session: "evening" },
    "69b557438b0fffda8c0bf68c": { _id: "TS2", id: "TS2", doctorId: "69b557438b0fffda8c0bf68c", currentToken: 1, status: "open", session: "morning" }
};

const MockFactory = (store) => {
    function Model(data) {
        Object.assign(this, data);
        if (!this._id) {
            const id = "ID-" + Date.now() + Math.random().toString(16).slice(2);
            this._id = id;
            this.id = id;
        }
    }

    Model.prototype.save = async function() {
        // Find if already exists
        const idx = store.findIndex(i => i._id === this._id);
        if (idx > -1) {
            store[idx] = { ...this };
        } else {
            store.push({ ...this });
        }
        return this;
    };

    const chain = (results) => {
        const c = {
            toArray: async () => results,
            exec: async () => results,
            lean: () => chain(results),
            sort: () => chain(results),
            select: () => chain(results),
            limit: () => chain(results),
            populate: () => chain(results),
            distinct: (field) => {
                const unique = [...new Set(store.map(i => i[field]))];
                return chain(unique);
            },
            then: (resolve) => Promise.resolve(results).then(resolve),
            catch: (reject) => Promise.resolve(results).catch(reject)
        };
        return c;
    };

    Model.find = (query = {}) => {
        let filtered = [...store];
        if (query.doctorId) {
            const qid = query.doctorId?.$in ? query.doctorId.$in.map(id => id.toString()) : [query.doctorId.toString()];
            filtered = filtered.filter(b => qid.includes(b.doctorId?.toString()));
        }
        if (query.clinicId) {
            filtered = filtered.filter(b => b.clinicId?.toString() === query.clinicId.toString());
        }
        if (query.patientPhone) {
            let searchValue = query.patientPhone;
            if (query.patientPhone instanceof RegExp) {
                searchValue = query.patientPhone;
            } else if (query.patientPhone.$regex) {
                searchValue = new RegExp(query.patientPhone.$regex, query.patientPhone.$options || 'i');
            }
            if (searchValue instanceof RegExp) {
                filtered = filtered.filter(b => searchValue.test(b.patientPhone || ''));
            } else {
                // Exact match or partial match
                filtered = filtered.filter(b => {
                    const bp = b.patientPhone || '';
                    const sv = searchValue.toString();
                    return bp.toLowerCase().includes(sv.toLowerCase());
                });
            }
        }
        if (query._id) {
            filtered = filtered.filter(b => b._id?.toString() === query._id.toString() || b.id?.toString() === query._id.toString());
        }
        if (query.visitType) {
            filtered = filtered.filter(b => b.visitType === query.visitType);
        }
        if (query.session) {
            filtered = filtered.filter(b => b.session === query.session);
        }
        if (query.status) {
            if (query.status.$ne) {
                filtered = filtered.filter(b => b.status !== query.status.$ne);
            } else {
                filtered = filtered.filter(b => b.status === query.status);
            }
        }
        if (query.$text) {
            const search = query.$text.$search.toLowerCase();
            filtered = filtered.filter(doc => 
                doc.name?.toLowerCase().includes(search) || 
                doc.specialty?.toLowerCase().includes(search)
            );
        }
        if (query.bookingDate?.$gte && query.bookingDate?.$lte) {
            const start = new Date(query.bookingDate.$gte);
            const end = new Date(query.bookingDate.$lte);
            filtered = filtered.filter(b => {
                const date = new Date(b.date || b.bookingDate);
                return date >= start && date <= end;
            });
        }
        return chain(filtered);
    };

    Model.findOne = (query) => {
        const item = store.find(i => (
            (i._id && query._id && i._id.toString() === query._id.toString()) || 
            (i.id && query.id && i.id.toString() === query.id.toString()) ||
            (i.doctorId && query.doctorId && i.doctorId.toString() === query.doctorId.toString())
        ));
        return chain(item);
    };

    Model.findById = (id) => {
        const item = store.find(i => (i._id?.toString() === id?.toString() || i.id?.toString() === id?.toString()));
        return chain(item);
    };

    Model.findOneAndUpdate = async (query, update, options = {}) => {
        let item = store.find(i => (
            (i._id && query._id && i._id.toString() === query._id.toString()) || 
            (i.doctorId && query.doctorId && i.doctorId.toString() === query.doctorId.toString())
        ));
        if (!item && options.upsert) {
            const id = "ID-" + Date.now();
            item = { _id: id, id: id, ...query, ...update };
            store.push(item);
        } else if (item) {
            Object.assign(item, update);
        }
        return item; // Direct return for update routes usually
    };

    // Support findByIdAndUpdate
    Model.findByIdAndUpdate = async (id, update, options = {}) => {
        let item = store.find(i => (i._id?.toString() === id?.toString() || i.id?.toString() === id?.toString()));
        if (item) {
            Object.assign(item, update);
        }
        return item;
    };

    // Support findByIdAndDelete
    Model.findByIdAndDelete = async (id) => {
        const idx = store.findIndex(i => (i._id?.toString() === id?.toString() || i.id?.toString() === id?.toString()));
        if (idx > -1) {
            const item = store[idx];
            store.splice(idx, 1);
            return item;
        }
        return null;
    };

    Model.create = async (newItem) => {
        const inst = new Model(newItem);
        return await inst.save();
    };

    Model.countDocuments = async (query = {}) => {
        let filtered = [...store];
        if (query.doctorId) filtered = filtered.filter(b => b.doctorId?.toString() === query.doctorId?.toString());
        if (query.clinicId) filtered = filtered.filter(b => b.clinicId?.toString() === query.clinicId?.toString());
        if (query.session) filtered = filtered.filter(b => b.session === query.session);
        if (query.visitType) filtered = filtered.filter(b => b.visitType === query.visitType);
        if (query.status && query.status.$ne) {
            filtered = filtered.filter(b => b.status !== query.status.$ne);
        }
        if (query.bookingDate?.$gte && query.bookingDate?.$lte) {
            const start = new Date(query.bookingDate.$gte);
            const end = new Date(query.bookingDate.$lte);
            filtered = filtered.filter(b => {
                const date = new Date(b.bookingDate || b.createdAt);
                return date >= start && date <= end;
            });
        }
        return filtered.length;
    };

    Model.aggregate = (pipeline) => {
        let result = [...store];
        
        for (const stage of pipeline) {
            if (stage.$match) {
                const match = stage.$match;
                if (match.visitType) {
                    result = result.filter(b => b.visitType === match.visitType);
                }
                if (match.doctorId) {
                    const docId = match.doctorId.$in ? match.doctorId.$in : [match.doctorId];
                    result = result.filter(b => docId.includes(b.doctorId));
                }
                if (match.bookingDate?.$gte && match.bookingDate?.$lte) {
                    const start = new Date(match.bookingDate.$gte);
                    const end = new Date(match.bookingDate.$lte);
                    result = result.filter(b => {
                        const date = new Date(b.bookingDate || b.createdAt);
                        return date >= start && date <= end;
                    });
                }
                if (match.status && match.status.$ne) {
                    result = result.filter(b => b.status !== match.status.$ne);
                }
                if (match.session) {
                    result = result.filter(b => b.session === match.session);
                }
            }
            
            if (stage.$group) {
                const group = stage.$group;
                const groupKey = group._id;
                
                if (groupKey === null) {
                    let total = result.length;
                    let completed = result.filter(b => b.status === 'completed').length;
                    let cancelled = result.filter(b => b.status === 'cancelled').length;
                    let serving = result.filter(b => b.status === 'serving').length;
                    let pending = result.filter(b => b.status === 'pending').length;
                    let morning = result.filter(b => b.session === 'morning').length;
                    let evening = result.filter(b => b.session === 'evening').length;
                    let totalRevenue = result.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.fee || 0), 0);
                    
                    const aggResult = { _id: null };
                    if (group.totalWalkIns) aggResult.totalWalkIns = total;
                    if (group.completed) aggResult.completed = completed;
                    if (group.cancelled) aggResult.cancelled = cancelled;
                    if (group.serving) aggResult.serving = serving;
                    if (group.pending) aggResult.pending = pending;
                    if (group.morning) aggResult.morning = morning;
                    if (group.evening) aggResult.evening = evening;
                    if (group.totalRevenue) aggResult.totalRevenue = totalRevenue;
                    
                    result = [aggResult];
                } else if (groupKey._id && groupKey._id.$dateToString) {
                    const dateFormat = groupKey._id.$dateToString.format;
                    const grouped = {};
                    
                    result.forEach(b => {
                        const date = new Date(b.bookingDate || b.createdAt);
                        let key;
                        if (dateFormat === '%Y-%m-%d') {
                            key = date.toISOString().split('T')[0];
                        } else {
                            key = date.toDateString();
                        }
                        
                        if (!grouped[key]) {
                            grouped[key] = {
                                _id: key,
                                walkIns: 0,
                                morning: 0,
                                evening: 0,
                                revenue: 0
                            };
                        }
                        
                        grouped[key].walkIns++;
                        if (b.session === 'morning') grouped[key].morning++;
                        if (b.session === 'evening') grouped[key].evening++;
                        if (b.status === 'completed') {
                            grouped[key].revenue += b.fee || 0;
                        }
                    });
                    
                    result = Object.values(grouped).sort((a, b) => a._id.localeCompare(b._id));
                } else {
                    const grouped = {};
                    result.forEach(b => {
                        const key = b.doctorId || b._id;
                        if (!grouped[key]) {
                            grouped[key] = { _id: key, total: 0, completed: 0, cancelled: 0 };
                        }
                        grouped[key].total++;
                        if (b.status === 'completed') grouped[key].completed++;
                        if (b.status === 'cancelled') grouped[key].cancelled++;
                    });
                    result = Object.values(grouped);
                }
            }
            
            if (stage.$lookup) {
                const { from, localField, foreignField, as } = stage.$lookup;
                result = result.map(item => ({
                    ...item,
                    [as]: item[localField] ? [{ name: 'Doctor', icon: '👨‍⚕️' }] : []
                }));
            }
            
            if (stage.$unwind) {
                result = result.flatMap(item => {
                    if (item[stage.$unwind.path || 'doctor']) {
                        return [item];
                    }
                    return [{ ...item, [stage.$unwind.path]: null }];
                });
            }
            
            if (stage.$project) {
                const proj = stage.$project;
                result = result.map(item => {
                    const projected = {};
                    Object.keys(proj).forEach(key => {
                        if (proj[key] === 1) projected[key] = item[key];
                        if (proj[key] === 0) delete projected[key];
                    });
                    if (proj.id) projected.id = projected._id;
                    return projected;
                });
            }
            
            if (stage.$sort) {
                const sortKey = Object.keys(stage.$sort)[0];
                const sortDir = stage.$sort[sortKey];
                result.sort((a, b) => {
                    if (sortDir === 1) return (a[sortKey] || 0) - (b[sortKey] || 0);
                    return (b[sortKey] || 0) - (a[sortKey] || 0);
                });
            }
        }
        
        return chain(result);
    };
    Model.distinct = (field) => {
        const unique = [...new Set(store.map(i => i[field]))];
        return chain(unique);
    };

    Model.deleteMany = async () => { store.length = 0; return { deletedCount: 10 }; };
    Model.insertMany = async (newData) => { 
        const items = newData.map(n => new Model(n));
        for (const i of items) await i.save();
        return items;
    };

    return Model;
};

module.exports = {
  Doctor: MockFactory(doctorsStore),
  Clinic: MockFactory(clinicsStore),
  Booking: MockFactory(bookingsStore),
  Prescription: MockFactory(prescriptionsStore),
  TokenState: {
    ...MockFactory([]),
    findOne: (query) => {
        const tid = query.doctorId?.toString();
        let state = tokenStatesStore[tid];
        if (!state && tid) {
            state = { _id: "TS-"+tid, id: "TS-"+tid, doctorId: tid, currentToken: 1, status: 'open', session: 'morning' };
        }
        return { 
            exec: async () => state,
            lean: () => ({ exec: async () => state, then: (res) => res(state) }),
            then: (res) => res(state)
        };
    },
    findOneAndUpdate: (query, update, options = {}) => {
        const tid = query.doctorId?.toString();
        if (!tokenStatesStore[tid]) {
            tokenStatesStore[tid] = { _id: "TS-"+tid, id: "TS-"+tid, doctorId: tid, currentToken: 1, status: 'open', session: 'morning' };
        }
        Object.assign(tokenStatesStore[tid], update);
        return { 
            exec: async () => tokenStatesStore[tid], 
            then: (res) => res(tokenStatesStore[tid]) 
        };
    },
    find: (query = {}) => {
        const all = Object.values(tokenStatesStore);
        return { 
            exec: async () => all,
            lean: () => ({ 
                exec: async () => all, 
                then: (res) => res(all),
                forEach: (cb) => all.forEach(cb)
            }),
            then: (res) => res(all),
            forEach: (cb) => all.forEach(cb)
        };
    },
    findOneAndDelete: async (query) => {
        const tid = query.doctorId?.toString();
        delete tokenStatesStore[tid];
        return { success: true };
    }
  }
};
