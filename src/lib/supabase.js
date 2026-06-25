import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL exists:', !!SUPABASE_URL)
console.log('Supabase Key exists:', !!SUPABASE_KEY)
console.log('Supabase bucket name exact:', 'documents')
console.log('Supabase table name exact:', 'documents')

// If env vars are present, create a real client. Otherwise export a safe stub
let _supabase
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    _supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Suppress browser warnings about localStorage
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    })
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err?.message);
    _supabase = null;
  }
} else {
  _supabase = null;
}

// Create a resilient wrapper that handles missing client gracefully
const makeErr = (msg) => ({ error: { message: msg }, data: null })

const supabaseClient = _supabase ? _supabase : {
  auth: {
    signUp: async (options) => makeErr('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'),
    signInWithPassword: async (options) => makeErr('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'),
    signInWithOAuth: async (options) => makeErr('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'),
    resetPasswordForEmail: async (email, opts) => makeErr('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'),
    setSession: async (session) => makeErr('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'),
    updateUser: async (attrs) => makeErr('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'),
    signOut: async () => makeErr('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'),
    onAuthStateChange: (callback) => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
  }
}

// Wrap to catch and suppress specific known errors
const authOnly = {
  auth: {
    signUp: async (options) => {
      try {
        if (!_supabase) return makeErr('Supabase not configured');
        const result = await _supabase.auth.signUp(options);
        // Suppress the "Anonymous sign-ins are disabled" error - it's a known issue with some Supabase setups
        if (result?.error?.message?.includes('Anonymous sign-ins')) {
          return { error: null, data: { user: null, session: null } };
        }
        return result;
      } catch (err) {
        if (err?.message?.includes('Anonymous sign-ins')) {
          return { error: null, data: { user: null, session: null } };
        }
        return makeErr(err?.message || 'Signup failed');
      }
    },
    signInWithPassword: async (options) => {
      try {
        if (!_supabase) return makeErr('Supabase not configured');
        return await _supabase.auth.signInWithPassword(options);
      } catch (err) {
        return makeErr(err?.message || 'Login failed');
      }
    },
    signInWithOAuth: async (options) => {
      try {
        if (!_supabase) return makeErr('Supabase not configured');
        const result = await _supabase.auth.signInWithOAuth(options);
        // Handle provider-not-enabled style responses coming from Supabase
        if (result?.error && /provider.*enabled|Unsupported provider|provider is not enabled/i.test(result.error.message || '')) {
          return { error: { message: 'OAuth provider not enabled', code: 'provider_not_enabled' } };
        }
        return result;
      } catch (err) {
        // Suppress "Anonymous sign-ins are disabled" error for OAuth
        const msg = err?.message || String(err);
        if (/provider.*enabled|Unsupported provider|provider is not enabled/i.test(msg)) {
          return { error: { message: 'OAuth provider not enabled', code: 'provider_not_enabled' } };
        }
        if (msg.includes('Anonymous sign-ins')) {
          return { error: null };
        }
        return makeErr(msg || 'OAuth login failed');
      }
    },
    resetPasswordForEmail: async (email, opts) => {
      try {
        if (!_supabase) return makeErr('Supabase not configured');
        return await _supabase.auth.resetPasswordForEmail(email, opts);
      } catch (err) {
        return makeErr(err?.message || 'Password reset failed');
      }
    },
    setSession: async (session) => {
      try {
        if (!_supabase) return makeErr('Supabase not configured');
        return await _supabase.auth.setSession(session);
      } catch (err) {
        return makeErr(err?.message || 'Set session failed');
      }
    },
    updateUser: async (attrs) => {
      try {
        if (!_supabase) return makeErr('Supabase not configured');
        return await _supabase.auth.updateUser(attrs);
      } catch (err) {
        return makeErr(err?.message || 'Update user failed');
      }
    },
    onAuthStateChange: (callback) => {
      try {
        if (!_supabase) return { data: { subscription: { unsubscribe: () => {} } }, error: null };
        return _supabase.auth.onAuthStateChange(callback);
      } catch (err) {
        return { data: { subscription: { unsubscribe: () => {} } }, error: err };
      }
    },
    getSession: async () => {
      try {
        if (!_supabase) return { data: { session: null }, error: null };
        return await _supabase.auth.getSession();
      } catch (err) {
        return { data: { session: null }, error: err };
      }
    },
    getUser: async () => {
      try {
        if (!_supabase) return { data: { user: null }, error: null };
        return await _supabase.auth.getUser();
      } catch (err) {
        return { data: { user: null }, error: err };
      }
    },
    signOut: async () => {
      try {
        if (!_supabase) return makeErr('Supabase not configured');
        return await _supabase.auth.signOut();
      } catch (err) {
        return makeErr(err?.message || 'Sign out failed');
      }
    },
  }
}

// Expose higher-level storage and db helpers that call the underlying client when available
const storageHelpers = {
  upload: async (bucket, path, file, options = {}) => {
    try {
      console.log(`storage.upload called - bucket: ${bucket}, path: ${path}, file: ${file?.name || 'no-file'}`)
      if (!_supabase) {
        console.error('Supabase client not configured - cannot upload')
        return makeErr('Supabase not configured');
      }
      const res = await _supabase.storage.from(bucket).upload(path, file, options)
      console.log('storage.upload response:', res)
      return res
    } catch (err) {
      console.error('storage.upload caught error:', err)
      return makeErr(err?.message || 'Storage upload failed');
    }
  },
  getPublicUrl: (bucket, path) => {
    try {
      if (!_supabase) return { data: { publicUrl: null }, error: null };
      return _supabase.storage.from(bucket).getPublicUrl(path);
    } catch (err) {
      return { data: { publicUrl: null }, error: err };
    }
  }
}

const dbHelpers = {
  insertDocument: async (doc) => {
    try {
      console.log('db.insertDocument called:', doc)
      console.log('METADATA TO INSERT:', doc)
      if (!_supabase) {
        console.error('Supabase client not configured - cannot insert document')
        return makeErr('Supabase not configured');
      }
      const session = await _supabase.auth.getSession()
      console.log('AUTH SESSION:', session)
      const user = session?.data?.user ?? null
      console.log('USER OBJECT:', user)
      console.log('USER ID:', user?.id)
      const res = await _supabase.from('documents').insert([doc])
      console.log('db.insertDocument response:', res)
      return res
    } catch (err) {
      console.error('db.insertDocument caught error:', err)
      return makeErr(err?.message || 'DB insert failed');
    }
  },
  fetchDocumentsByUser: async (userId) => {
    try {
      if (!_supabase) return { data: [], error: null };
      return await _supabase
        .from('documents')
        .select('*')
        .eq('uploaded_by', userId)
        .order('uploaded_at', { ascending: false });
    } catch (err) {
      return { data: [], error: err };
    }
  },
  // Fetch chat history for a specific document — uses anon key + RLS (no service role needed)
  fetchChatHistoryByDocument: async (userId, documentId) => {
    try {
      if (!_supabase) return { data: [], error: null };
      return await _supabase
        .from('chat_history')
        .select('id, question, answer, created_at')
        .eq('user_id', userId)
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });
    } catch (err) {
      return { data: [], error: err };
    }
  },
  // Save a single Q&A exchange to chat_history using the anon client + RLS
  saveChatMessage: async (userId, documentId, question, answer) => {
    try {
      if (!_supabase) return { data: null, error: { message: 'Supabase not configured' } };
      return await _supabase
        .from('chat_history')
        .insert([{
          user_id: userId,
          document_id: documentId,
          question,
          answer,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
    } catch (err) {
      return { data: null, error: err };
    }
  }
}

// Merge into exported supabase object
export const supabaseFull = {
  ...authOnly,
  storage: storageHelpers,
  db: dbHelpers,
}

// For backward compatibility, export default as `supabase` as well
export const supabase_client = (() => {
  // Keep the original `supabase` export name used by the app
  try {
    // eslint-disable-next-line no-undef
    return supabaseFull
  } catch (e) {
    return supabaseFull
  }
})();

// Also export `supabase` identifier matching previous code
export const supabase = supabaseFull
