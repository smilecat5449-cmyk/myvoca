/**
 * My Vocab — React Native / Expo
 * 단일 파일 (App.js)  |  lucide-react-native 아이콘  |  Tailwind-style 디자인
 *
 * 의존성:
 *   expo install @react-native-async-storage/async-storage
 *   npm install lucide-react-native react-native-svg
 *
 * Supabase 연동 시:
 *   npm install @supabase/supabase-js
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { registerRootComponent } from 'expo';
import {
  Award,
  BookMarked,
  BookOpen,
  BrainCircuit,
  Check, ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Layers,
  Moon,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Sun, Trash2,
  X
} from 'lucide-react-native';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Switch,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

// ─────────────────────────────────────────────────────────────────
//  THEME SYSTEM
// ─────────────────────────────────────────────────────────────────
const LIGHT = {
  bg:           '#faf8f3',
  paper:        '#ffffff',
  paper2:       '#f4f1e8',
  ink:          '#1e1c18',
  ink2:         '#4a4640',
  ink3:         '#9a948a',
  ink4:         '#ccc7bc',
  rule:         'rgba(0,0,0,0.06)',
  rule2:        'rgba(0,0,0,0.12)',
  blue:         '#2c5f8a',
  blueBg:       '#eef4f9',
  blueBorder:   'rgba(44,95,138,0.22)',
  green:        '#27704a',
  greenBg:      '#eef6f1',
  greenBorder:  'rgba(39,112,74,0.22)',
  red:          '#c0392b',
  redBg:        '#fdf1f0',
  redBorder:    'rgba(192,57,43,0.18)',
  amber:        '#a0621a',
  amberBg:      '#fdf5e8',
  amberBorder:  'rgba(160,98,26,0.2)',
  navBg:        'rgba(250,248,243,0.97)',
  shadow:       '#00000010',
};
const DARK = {
  bg:           '#131110',
  paper:        '#1c1a17',
  paper2:       '#232018',
  ink:          '#ede9e0',
  ink2:         '#c2bcb0',
  ink3:         '#7a7468',
  ink4:         '#46423c',
  rule:         'rgba(255,255,255,0.05)',
  rule2:        'rgba(255,255,255,0.10)',
  blue:         '#70aad8',
  blueBg:       'rgba(112,170,216,0.12)',
  blueBorder:   'rgba(112,170,216,0.22)',
  green:        '#5bbf83',
  greenBg:      'rgba(91,191,131,0.12)',
  greenBorder:  'rgba(91,191,131,0.22)',
  red:          '#e07060',
  redBg:        'rgba(224,112,96,0.12)',
  redBorder:    'rgba(224,112,96,0.18)',
  amber:        '#d4944a',
  amberBg:      'rgba(212,148,74,0.12)',
  amberBorder:  'rgba(212,148,74,0.2)',
  navBg:        'rgba(19,17,16,0.97)',
  shadow:       '#00000040',
};

// ─────────────────────────────────────────────────────────────────
//  SUPABASE CONFIG
// ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://yizaxbgvboaetxyvetxm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpemF4Ymd2Ym9hZXR4eXZldHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NzA1MTksImV4cCI6MjA5MTE0NjUxOX0.lLfuOHPtccWuqSnIhqhOLU2gfv8ElBapJ5dIJ5ePpgw';
const sbClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─────────────────────────────────────────────────────────────────
//  CONTEXT
// ─────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

const STORAGE_KEY   = 'myvocab_v3';
const THEME_KEY     = 'myvocab_theme';
const GEMINI_KEY    = 'myvocab_gemini_key';
const PER_PAGE      = 20;
const WORD_TYPES    = ['n.', 'v.', 'adj.', 'adv.', 'phr.'];

// ─────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const today = () => new Date().toISOString().slice(0, 10);
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ─────────────────────────────────────────────────────────────────
//  AI — GEMINI API
// ─────────────────────────────────────────────────────────────────
async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error ${res.status}`);
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function generateWords(input, apiKey) {
  const prompt = `
다음 영어 입력을 분석해서 단어장 JSON을 만들어 주세요.
입력: "${input}"

규칙:
- 단어 목록이면 각 단어를 처리
- 영어 문장이면 핵심 단어만 추출
- 각 단어에 대해: word, pronunciation, type(n./v./adj./adv./phr.), meaning_ko(한국어), meaning_en(영어), example(영어 예문)
- JSON 배열만 출력 (설명 없이)

출력 형식:
[{"word":"...","pronunciation":"...","type":"n.","meaning_ko":"...","meaning_en":"...","example":"..."}]
`;
  const text = await callGemini(apiKey, prompt);
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('파싱 실패');
  return JSON.parse(match[0]);
}

// ─────────────────────────────────────────────────────────────────
//  ROOT PROVIDER
// ─────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme]       = useState('light');
  const [words, setWords]       = useState([]);
  const [geminiKey, setGeminiKey] = useState('');
  const [tab, setTab]           = useState('add');   // add | list | quiz | settings
  const [toast, setToast]       = useState('');
  const [sbUser, setSbUser]     = useState(null);    // Supabase user
  const [authMode, setAuthMode] = useState('login'); // login | signup
  const [showAuth, setShowAuth] = useState(true);    // Show auth screen
  const [loading, setLoading]   = useState(true);    // Loading auth state
  const toastAnim               = useRef(new Animated.Value(0)).current;
  const T = theme === 'light' ? LIGHT : DARK;

  // ── boot ──
  useEffect(() => {
    (async () => {
      try {
        // Check Supabase session
        const { data: { session } } = await sbClient.auth.getSession();
        if (session?.user) {
          setSbUser(session.user);
          setShowAuth(false);
          // Load words from Supabase
          const { data } = await sbClient.from('words').select('*').eq('user_id', session.user.id);
          if (data) setWords(data.map(r => ({
            id: r.id, word: r.word, pronunciation: r.pronunciation,
            type: r.type, meaning_ko: r.meaning_ko, meaning_en: r.meaning_en,
            example: r.example, date: r.added_date, memorized: r.memorized
          })));
        }
      } catch (err) {
        console.log('Auth check:', err.message);
      }

      // Load local settings
      const [th, gk] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(GEMINI_KEY),
      ]);
      if (th)  setTheme(th);
      if (gk)  setGeminiKey(gk);
      setLoading(false);
    })();
  }, []);

  // ── persist ──
  const saveWords = useCallback(async (w) => {
    setWords(w);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(w));
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  }, [theme]);

  const saveGeminiKey = useCallback(async (k) => {
    setGeminiKey(k);
    await AsyncStorage.setItem(GEMINI_KEY, k);
  }, []);

  // ── auth ──
  const doLogin = useCallback(async (email, pw) => {
    try {
      const { data, error } = await sbClient.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
      setSbUser(data.user);
      setShowAuth(false);
      const { data: wdata } = await sbClient.from('words').select('*').eq('user_id', data.user.id);
      if (wdata) setWords(wdata.map(r => ({
        id: r.id, word: r.word, pronunciation: r.pronunciation,
        type: r.type, meaning_ko: r.meaning_ko, meaning_en: r.meaning_en,
        example: r.example, date: r.added_date, memorized: r.memorized
      })));
      showToast('로그인했어요!');
    } catch (err) {
      showToast(err.message || '로그인 실패');
    }
  }, []);

  const doSignup = useCallback(async (email, pw) => {
    try {
      const { data, error } = await sbClient.auth.signUp({ email, password: pw });
      if (error) throw error;
      showToast('인증 메일을 보냈어요! 메일을 확인해주세요.');
      setAuthMode('login');
    } catch (err) {
      showToast(err.message || '가입 실패');
    }
  }, []);

  const doLogout = useCallback(async () => {
    try {
      await sbClient.auth.signOut();
      setSbUser(null);
      setShowAuth(true);
      setWords([]);
      showToast('로그아웃했어요.');
    } catch (err) {
      showToast(err.message || '로그아웃 실패');
    }
  }, []);

  const skipAuth = useCallback(() => {
    setShowAuth(false);
    setSbUser(null);
    showToast('로그인 없이 사용해요. (동기화 안됨)');
  }, []);

  // ── toast ──
  const showToast = useCallback((msg) => {
    setToast(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [toastAnim]);

  const addWords = useCallback((newWords) => {
    saveWords([...newWords.map(w => ({ ...w, id: uid(), date: today(), memorized: false })), ...words]);
  }, [words, saveWords]);

  const deleteWord = useCallback((id) => {
    saveWords(words.filter(w => w.id !== id));
  }, [words, saveWords]);

  const toggleMemorized = useCallback((id) => {
    saveWords(words.map(w => w.id === id ? { ...w, memorized: !w.memorized } : w));
  }, [words, saveWords]);

  const ctx = {
    T, theme, toggleTheme, words, addWords, deleteWord, toggleMemorized,
    showToast, tab, setTab, geminiKey, saveGeminiKey,
    sbUser, doLogout,
  };

  const toastStyle = {
    position: 'absolute', bottom: 100, alignSelf: 'center',
    backgroundColor: T.ink, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 24, zIndex: 999,
    opacity: toastAnim,
    transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  };

  return (
    <AppCtx.Provider value={ctx}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={T.navBg} />
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        {showAuth && !loading ? (
          <AuthScreen email="" pw="" authMode={authMode} setAuthMode={setAuthMode} doLogin={doLogin} doSignup={doSignup} skipAuth={skipAuth} />
        ) : (
          <>
            <TopBar />
            <View style={{ flex: 1 }}>
              {tab === 'add'      && <AddScreen />}
              {tab === 'list'     && <ListScreen />}
              {tab === 'quiz'     && <QuizScreen />}
              {tab === 'settings' && <SettingsScreen />}
            </View>
            <BottomNav />
          </>
        )}
        <Animated.View style={toastStyle} pointerEvents="none">
          <Text style={{ color: T.bg, fontSize: 13 }}>{toast}</Text>
        </Animated.View>
      </View>
    </AppCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────
//  AUTH SCREEN
// ─────────────────────────────────────────────────────────────────
function AuthScreen({ email, pw, authMode, setAuthMode, doLogin, doSignup, skipAuth }) {
  const { T } = useApp();
  const [em, setEm] = useState(email);
  const [p, setP] = useState(pw);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!em.trim() || !p.trim()) { return; }
    setLoading(true);
    if (authMode === 'login') {
      await doLogin(em, p);
    } else {
      await doSignup(em, p);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 40, maxWidth: 400, alignSelf: 'center', width: '100%' }}>
        <View style={{ marginBottom: 28, alignItems: 'center' }}>
          <BookMarked size={40} color={T.blue} strokeWidth={2} style={{ marginBottom: 16 }} />
          <Text style={{ fontFamily: 'serif', fontSize: 28, fontWeight: '700', color: T.ink, marginBottom: 6 }}>
            My Vocab
          </Text>
          <Text style={{ fontSize: 13, color: T.ink3, lineHeight: 20, textAlign: 'center' }}>
            OPIc · 면접 영어 단어장{'\n'}로그인하면 모든 기기에서 동기화돼요
          </Text>
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: T.paper2, borderRadius: 10, padding: 3, marginBottom: 20, borderWidth: 1, borderColor: T.rule2 }}>
          <TouchableOpacity
            onPress={() => setAuthMode('login')}
            style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: authMode === 'login' ? T.paper : 'transparent', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: authMode === 'login' ? '500' : '400', color: authMode === 'login' ? T.ink : T.ink3 }}>로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAuthMode('signup')}
            style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: authMode === 'signup' ? T.paper : 'transparent', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: authMode === 'signup' ? '500' : '400', color: authMode === 'signup' ? T.ink : T.ink3 }}>회원가입</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: T.paper, borderRadius: 12, borderWidth: 1, borderColor: T.rule2, padding: 20 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>이메일</Text>
            <TextInput
              style={{ backgroundColor: T.bg, borderRadius: 8, borderWidth: 1, borderColor: T.rule2, color: T.ink, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontFamily: 'sans-serif' }}
              placeholder="example@email.com"
              placeholderTextColor={T.ink4}
              value={em}
              onChangeText={setEm}
              editable={!loading}
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>비밀번호</Text>
            <TextInput
              style={{ backgroundColor: T.bg, borderRadius: 8, borderWidth: 1, borderColor: T.rule2, color: T.ink, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontFamily: 'sans-serif' }}
              placeholder={authMode === 'signup' ? '6자 이상' : '비밀번호'}
              placeholderTextColor={T.ink4}
              value={p}
              onChangeText={setP}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            onPress={handleAuth}
            disabled={loading}
            style={{ backgroundColor: T.ink, borderRadius: 8, paddingVertical: 12, alignItems: 'center', opacity: loading ? 0.5 : 1 }}>
            <Text style={{ color: T.bg, fontSize: 14, fontWeight: '500' }}>
              {loading ? '처리 중...' : (authMode === 'login' ? '로그인' : '가입하기')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <TouchableOpacity onPress={skipAuth}>
            <Text style={{ fontSize: 12, color: T.ink4 }}>로그인 없이 사용하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────
//  TOP BAR
// ─────────────────────────────────────────────────────────────────
function TopBar() {
  const { T, theme, toggleTheme } = useApp();
  return (
    <View style={{
      height: 56, paddingHorizontal: 20, flexDirection: 'row',
      alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: T.navBg, borderBottomWidth: 1, borderBottomColor: T.rule2,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <BookMarked size={20} color={T.blue} strokeWidth={2} />
        <Text style={{ fontFamily: 'serif', fontSize: 20, fontWeight: '700', color: T.ink, letterSpacing: -0.3 }}>
          My Vocab
        </Text>
      </View>
      <TouchableOpacity
        onPress={toggleTheme}
        style={{
          width: 36, height: 36, borderRadius: 10, borderWidth: 1,
          borderColor: T.rule2, alignItems: 'center', justifyContent: 'center',
          backgroundColor: T.paper,
        }}>
        {theme === 'dark'
          ? <Sun size={16} color={T.amber} strokeWidth={2} />
          : <Moon size={16} color={T.ink3} strokeWidth={2} />}
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
//  BOTTOM NAV
// ─────────────────────────────────────────────────────────────────
function BottomNav() {
  const { T, tab, setTab } = useApp();
  const items = [
    { key: 'add',      label: '추가',   Icon: Plus },
    { key: 'list',     label: '단어장', Icon: BookOpen },
    { key: 'quiz',     label: '퀴즈',   Icon: BrainCircuit },
    { key: 'settings', label: '설정',   Icon: Settings },
  ];
  return (
    <View style={{
      flexDirection: 'row', height: 64, backgroundColor: T.navBg,
      borderTopWidth: 1, borderTopColor: T.rule2,
      paddingBottom: Platform.OS === 'ios' ? 8 : 0,
    }}>
      {items.map(({ key, label, Icon }) => {
        const active = tab === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => setTab(key)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Icon
              size={22}
              color={active ? T.blue : T.ink4}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <Text style={{
              fontSize: 10,
              color: active ? T.blue : T.ink4,
              fontWeight: active ? '600' : '400',
            }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ADD SCREEN
// ─────────────────────────────────────────────────────────────────
function AddScreen() {
  const { T, addWords, showToast, geminiKey, setTab } = useApp();
  const [inputText, setInputText]   = useState('');
  const [loading, setLoading]       = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [mWord, setMWord]           = useState('');
  const [mPron, setMPron]           = useState('');
  const [mType, setMType]           = useState('n.');
  const [mMeaningKo, setMeaningKo]  = useState('');
  const [mMeaningEn, setMeaningEn]  = useState('');
  const [mExample, setMExample]     = useState('');
  const [typeOpen, setTypeOpen]     = useState(false);

  const handleAiAdd = async () => {
    if (!inputText.trim()) return;
    if (!geminiKey) {
      Alert.alert('API 키 필요', 'Gemini API 키를 설정에서 입력해주세요.', [
        { text: '설정으로', onPress: () => setTab('settings') },
        { text: '취소', style: 'cancel' },
      ]);
      return;
    }
    setLoading(true);
    try {
      const results = await generateWords(inputText.trim(), geminiKey);
      addWords(results);
      setInputText('');
      showToast(`✅ ${results.length}개 단어 추가됨`);
    } catch (e) {
      Alert.alert('오류', 'AI 처리 중 오류가 발생했어요.\n' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = () => {
    if (!mWord.trim() || !mMeaningKo.trim()) {
      Alert.alert('필수 항목', '단어와 한국어 뜻을 입력해주세요.');
      return;
    }
    addWords([{ word: mWord.trim(), pronunciation: mPron.trim(), type: mType, meaning_ko: mMeaningKo.trim(), meaning_en: mMeaningEn.trim(), example: mExample.trim() }]);
    setMWord(''); setMPron(''); setMeaningKo(''); setMeaningEn(''); setMExample('');
    showToast('✅ 단어 추가됨');
  };

  const inputStyle = {
    backgroundColor: T.bg, borderWidth: 1, borderColor: T.rule2,
    borderRadius: 10, color: T.ink, fontSize: 14, padding: 12,
    marginBottom: 8,
  };
  const labelStyle = { fontSize: 11, color: T.ink3, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        {/* ── AI 카드 ── */}
        <Card>
          <CardTitle icon={<Sparkles size={15} color={T.blue} />} title="AI로 단어 추가" T={T} />
          <TextInput
            style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]}
            placeholder={'단어 또는 영어 문장을 입력하세요.\n\n예) resilience, eloquent\n예) "I adapt quickly to new environments."'}
            placeholderTextColor={T.ink4}
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
          <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 12, lineHeight: 18 }}>
            쉼표 구분 단어 목록 또는 영어 문장 붙여넣기 → AI가 자동으로 뜻·예문 생성
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleAiAdd}
              disabled={loading}
              style={{
                flex: 1, backgroundColor: T.ink, borderRadius: 10, paddingVertical: 13,
                alignItems: 'center', opacity: loading ? 0.5 : 1,
                flexDirection: 'row', justifyContent: 'center', gap: 6,
              }}>
              {loading
                ? <Text style={{ color: T.bg, fontSize: 14, fontWeight: '500' }}>처리 중...</Text>
                : <>
                    <Sparkles size={15} color={T.bg} />
                    <Text style={{ color: T.bg, fontSize: 14, fontWeight: '500' }}>AI로 단어 추가하기</Text>
                  </>
              }
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setInputText('')}
              style={{
                paddingHorizontal: 16, borderRadius: 10, borderWidth: 1,
                borderColor: T.rule2, alignItems: 'center', justifyContent: 'center',
              }}>
              <X size={16} color={T.ink3} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* ── 수동 추가 카드 ── */}
        <Card>
          <TouchableOpacity
            onPress={() => setShowManual(!showManual)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle icon={<Pencil size={15} color={T.ink3} />} title="수동으로 단어 추가" T={T} noLine />
            {showManual
              ? <ChevronUp size={16} color={T.ink3} />
              : <ChevronDown size={16} color={T.ink3} />}
          </TouchableOpacity>

          {showManual && (
            <View style={{ marginTop: 14, gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={labelStyle}>단어 *</Text>
                  <TextInput style={inputStyle} placeholder="resilience" placeholderTextColor={T.ink4} value={mWord} onChangeText={setMWord} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={labelStyle}>발음기호</Text>
                  <TextInput style={inputStyle} placeholder="/rɪˈzɪliəns/" placeholderTextColor={T.ink4} value={mPron} onChangeText={setMPron} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {/* 품사 드롭다운 */}
                <View style={{ flex: 1 }}>
                  <Text style={labelStyle}>품사</Text>
                  <TouchableOpacity
                    onPress={() => setTypeOpen(!typeOpen)}
                    style={[inputStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }]}>
                    <Text style={{ color: T.ink, fontSize: 14 }}>{mType}</Text>
                    <ChevronDown size={14} color={T.ink3} />
                  </TouchableOpacity>
                  {typeOpen && (
                    <View style={{
                      position: 'absolute', top: 58, left: 0, right: 0, zIndex: 100,
                      backgroundColor: T.paper, borderWidth: 1, borderColor: T.rule2,
                      borderRadius: 10, overflow: 'hidden',
                    }}>
                      {WORD_TYPES.map(t => (
                        <TouchableOpacity
                          key={t}
                          onPress={() => { setMType(t); setTypeOpen(false); }}
                          style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: T.rule }}>
                          <Text style={{ color: t === mType ? T.blue : T.ink, fontSize: 14 }}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={labelStyle}>한국어 뜻 *</Text>
                  <TextInput style={inputStyle} placeholder="회복력, 탄력성" placeholderTextColor={T.ink4} value={mMeaningKo} onChangeText={setMeaningKo} />
                </View>
              </View>

              <View>
                <Text style={labelStyle}>영어 뜻</Text>
                <TextInput style={inputStyle} placeholder="the ability to recover quickly" placeholderTextColor={T.ink4} value={mMeaningEn} onChangeText={setMeaningEn} />
              </View>
              <View>
                <Text style={labelStyle}>예문</Text>
                <TextInput style={inputStyle} placeholder="I've developed resilience through challenges." placeholderTextColor={T.ink4} value={mExample} onChangeText={setMExample} />
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={handleManualAdd}
                  style={{
                    flex: 1, backgroundColor: T.ink, borderRadius: 10, paddingVertical: 13,
                    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
                  }}>
                  <Check size={15} color={T.bg} />
                  <Text style={{ color: T.bg, fontSize: 14, fontWeight: '500' }}>단어 저장</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setMWord(''); setMPron(''); setMeaningKo(''); setMeaningEn(''); setMExample(''); }}
                  style={{
                    paddingHorizontal: 16, borderRadius: 10, borderWidth: 1,
                    borderColor: T.rule2, alignItems: 'center', justifyContent: 'center',
                  }}>
                  <RotateCcw size={16} color={T.ink3} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────
//  LIST SCREEN
// ─────────────────────────────────────────────────────────────────
function ListScreen() {
  const { T, words, deleteWord, toggleMemorized, showToast } = useApp();
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');  // all | todo | done
  const [page, setPage]         = useState(1);
  const [detailWord, setDetail] = useState(null);

  const filtered = useMemo(() => {
    let w = words;
    if (filter === 'todo') w = w.filter(x => !x.memorized);
    if (filter === 'done') w = w.filter(x => x.memorized);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      w = w.filter(x =>
        x.word.toLowerCase().includes(q) ||
        (x.meaning_ko || '').includes(q)
      );
    }
    return [...w].sort((a, b) => a.word.localeCompare(b.word));
  }, [words, filter, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [filter, search]);

  // 알파벳 그룹
  const groups = useMemo(() => {
    const map = {};
    paged.forEach(w => {
      const k = w.word[0]?.toUpperCase() ?? '#';
      if (!map[k]) map[k] = [];
      map[k].push(w);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [paged]);

  const handleDelete = (w) => {
    Alert.alert('삭제', `"${w.word}"를 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => { deleteWord(w.id); showToast('삭제됨'); }},
    ]);
  };

  const FilterPill = ({ label, value }) => (
    <TouchableOpacity
      onPress={() => setFilter(value)}
      style={{
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1,
        borderColor: filter === value ? T.blue : T.rule2,
        backgroundColor: filter === value ? T.blueBg : 'transparent',
      }}>
      <Text style={{ fontSize: 12, color: filter === value ? T.blue : T.ink3, fontWeight: filter === value ? '600' : '400' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Controls */}
      <View style={{
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
        flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        backgroundColor: T.bg,
      }}>
        <Text style={{ fontFamily: 'serif', fontSize: 16, fontWeight: '700', color: T.ink, marginRight: 4 }}>
          단어장 <Text style={{ fontSize: 13, color: T.ink3, fontWeight: '400' }}>({filtered.length})</Text>
        </Text>
        <FilterPill label="전체" value="all" />
        <FilterPill label="미암기" value="todo" />
        <FilterPill label="암기완료" value="done" />
        <View style={{
          flex: 1, minWidth: 120, flexDirection: 'row', alignItems: 'center',
          backgroundColor: T.paper, borderRadius: 10, borderWidth: 1,
          borderColor: T.rule2, paddingHorizontal: 10, height: 34,
        }}>
          <Search size={14} color={T.ink4} style={{ marginRight: 6 }} />
          <TextInput
            style={{ flex: 1, fontSize: 13, color: T.ink }}
            placeholder="검색..." placeholderTextColor={T.ink4}
            value={search} onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={13} color={T.ink4} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* List */}
      {groups.length === 0 ? (
        <EmptyState T={T} message={search ? '검색 결과가 없어요' : '단어를 추가해보세요'} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          {groups.map(([letter, ws]) => (
            <View key={letter} style={{ marginBottom: 20 }}>
              <View style={{ borderBottomWidth: 1, borderBottomColor: T.rule2, paddingBottom: 6, marginBottom: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: T.ink3, letterSpacing: 1, fontFamily: 'serif' }}>
                  {letter}
                </Text>
              </View>
              {ws.map((w, i) => (
                <WordEntry
                  key={w.id} word={w} isFirst={i === 0} isLast={i === ws.length - 1} isOnly={ws.length === 1}
                  T={T} onToggle={() => toggleMemorized(w.id)} onDelete={() => handleDelete(w)}
                  onPress={() => setDetail(w)}
                />
              ))}
            </View>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16 }}>
              <PageBtn disabled={page <= 1} onPress={() => setPage(p => p - 1)} T={T} label={<ChevronLeft size={14} color={T.ink2} />} />
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <PageBtn key={n} active={n === page} onPress={() => setPage(n)} T={T} label={String(n)} />
                );
              })}
              <PageBtn disabled={page >= totalPages} onPress={() => setPage(p => p + 1)} T={T} label={<ChevronRight size={14} color={T.ink2} />} />
            </View>
          )}
        </ScrollView>
      )}

      {/* Detail Modal */}
      <Modal visible={!!detailWord} transparent animationType="slide" onRequestClose={() => setDetail(null)}>
        <WordDetailModal word={detailWord} T={T} onClose={() => setDetail(null)}
          onDelete={() => { handleDelete(detailWord); setDetail(null); }}
          onToggle={() => { if (detailWord) toggleMemorized(detailWord.id); }} />
      </Modal>
    </View>
  );
}

function WordEntry({ word: w, isFirst, isLast, isOnly, T, onToggle, onDelete, onPress }) {
  const radius = {
    borderTopLeftRadius:    (isFirst || isOnly) ? 12 : 0,
    borderTopRightRadius:   (isFirst || isOnly) ? 12 : 0,
    borderBottomLeftRadius: (isLast  || isOnly) ? 12 : 0,
    borderBottomRightRadius:(isLast  || isOnly) ? 12 : 0,
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[{
        backgroundColor: T.paper,
        borderLeftWidth: 1, borderRightWidth: 1,
        borderBottomWidth: 1,
        borderTopWidth: (isFirst || isOnly) ? 1 : 0,
        borderColor: T.rule2,
        padding: 14,
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        opacity: w.memorized ? 0.55 : 1,
      }, radius]}>
      {/* 좌측 체크 바 */}
      <View style={{ width: 3, position: 'absolute', left: 0, top: (isFirst||isOnly)?0:0, bottom:0,
        borderTopLeftRadius:(isFirst||isOnly)?12:0, borderBottomLeftRadius:(isLast||isOnly)?12:0,
        backgroundColor: w.memorized ? T.green : 'transparent' }} />

      {/* 체크박스 */}
      <TouchableOpacity onPress={onToggle} style={{ marginTop: 3 }}>
        <View style={{
          width: 20, height: 20, borderRadius: 5,
          borderWidth: 1.5,
          borderColor: w.memorized ? T.greenBorder : T.rule2,
          backgroundColor: w.memorized ? T.greenBg : 'transparent',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {w.memorized && <Check size={12} color={T.green} strokeWidth={2.5} />}
        </View>
      </TouchableOpacity>

      {/* 내용 */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <Text style={{
            fontFamily: 'serif', fontSize: 18, fontWeight: '700', color: T.ink,
            textDecorationLine: w.memorized ? 'line-through' : 'none',
          }}>
            {w.word}
          </Text>
          {w.pronunciation ? (
            <Text style={{ fontFamily: 'monospace', fontSize: 12, color: T.ink3 }}>{w.pronunciation}</Text>
          ) : null}
        </View>
        {w.type ? (
          <View style={{
            alignSelf: 'flex-start', marginVertical: 4,
            backgroundColor: T.blueBg, borderWidth: 1, borderColor: T.blueBorder,
            borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
          }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 10, color: T.blue }}>{w.type}</Text>
          </View>
        ) : null}
        <Text style={{ fontSize: 14, color: T.ink2, lineHeight: 20 }}>{w.meaning_ko}</Text>
        {w.example ? (
          <Text style={{
            fontFamily: 'serif', fontStyle: 'italic', fontSize: 12, color: T.ink3,
            lineHeight: 18, marginTop: 4,
            paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: T.ink4,
          }} numberOfLines={2}>
            {w.example}
          </Text>
        ) : null}
        <Text style={{ fontFamily: 'monospace', fontSize: 10, color: T.ink4, marginTop: 6 }}>{w.date}</Text>
      </View>

      {/* 삭제 버튼 */}
      <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
        <Trash2 size={15} color={T.ink4} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function WordDetailModal({ word: w, T, onClose, onDelete, onToggle }) {
  if (!w) return null;
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
      <View style={{ backgroundColor: T.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
        {/* Handle */}
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: T.ink4, alignSelf: 'center', marginBottom: 20 }} />

        <Text style={{ fontFamily: 'serif', fontSize: 36, fontWeight: '700', color: T.ink, marginBottom: 4 }}>{w.word}</Text>
        {w.pronunciation ? <Text style={{ fontFamily: 'monospace', fontSize: 14, color: T.ink3, marginBottom: 10 }}>{w.pronunciation}</Text> : null}
        {w.type ? (
          <View style={{
            alignSelf: 'flex-start', backgroundColor: T.blueBg, borderWidth: 1,
            borderColor: T.blueBorder, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 16,
          }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 11, color: T.blue }}>{w.type}</Text>
          </View>
        ) : null}

        <Text style={{ fontSize: 20, color: T.ink, fontWeight: '400', marginBottom: 8 }}>{w.meaning_ko}</Text>
        {w.meaning_en ? <Text style={{ fontSize: 14, color: T.ink2, marginBottom: 14 }}>{w.meaning_en}</Text> : null}
        {w.example ? (
          <View style={{ backgroundColor: T.paper2, borderLeftWidth: 2, borderLeftColor: T.ink4, borderRadius: 4, padding: 12, marginBottom: 20 }}>
            <Text style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: 14, color: T.ink3, lineHeight: 22 }}>{w.example}</Text>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <TouchableOpacity
            onPress={() => { onToggle(); }}
            style={{
              flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
              backgroundColor: w.memorized ? T.amberBg : T.greenBg,
              borderWidth: 1, borderColor: w.memorized ? T.amberBorder : T.greenBorder,
            }}>
            <Text style={{ fontSize: 14, color: w.memorized ? T.amber : T.green, fontWeight: '600' }}>
              {w.memorized ? '미암기로 변경' : '암기완료'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={{
              paddingHorizontal: 16, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
              backgroundColor: T.redBg, borderWidth: 1, borderColor: T.redBorder,
            }}>
            <Trash2 size={18} color={T.red} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={{
              paddingHorizontal: 16, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
              backgroundColor: T.paper2, borderWidth: 1, borderColor: T.rule2,
            }}>
            <X size={18} color={T.ink3} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function PageBtn({ active, disabled, onPress, T, label }) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        minWidth: 34, height: 34, borderRadius: 8, borderWidth: 1,
        borderColor: active ? T.ink : T.rule2,
        backgroundColor: active ? T.ink : T.paper,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
        opacity: disabled ? 0.3 : 1,
      }}>
      {typeof label === 'string'
        ? <Text style={{ fontSize: 13, color: active ? T.bg : T.ink2, fontFamily: 'monospace' }}>{label}</Text>
        : label}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────
//  QUIZ SCREEN
// ─────────────────────────────────────────────────────────────────
function QuizScreen() {
  const { T, words } = useApp();
  const [view, setView]     = useState('setup');  // setup | session | result
  const [queue, setQueue]   = useState([]);
  const [idx, setIdx]       = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [know, setKnow]     = useState(0);
  const [hard, setHard]     = useState(0);
  const flipAnim            = useRef(new Animated.Value(0)).current;

  const todoWords = words.filter(w => !w.memorized);
  const doneWords = words.filter(w => w.memorized);

  const startQuiz = () => {
    const pool = todoWords.length >= 5 ? todoWords : words;
    if (pool.length === 0) {
      Alert.alert('단어 없음', '퀴즈할 단어를 먼저 추가해주세요.');
      return;
    }
    setQueue(shuffle(pool).slice(0, Math.min(pool.length, 20)));
    setIdx(0); setKnow(0); setHard(0); setFlipped(false);
    flipAnim.setValue(0);
    setView('session');
  };

  const flip = () => {
    Animated.timing(flipAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    setFlipped(true);
  };

  const next = (result) => {
    if (result === 'know') setKnow(k => k + 1);
    else setHard(h => h + 1);
    if (idx + 1 >= queue.length) {
      setView('result');
    } else {
      setIdx(i => i + 1);
      setFlipped(false);
      flipAnim.setValue(0);
    }
  };

  const endQuiz = () => { setView('setup'); };

  const prog = queue.length > 0 ? (idx / queue.length) : 0;
  const current = queue[idx];

  // ── SETUP VIEW ──
  if (view === 'setup') return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontFamily: 'serif', fontSize: 22, fontWeight: '700', color: T.ink, marginBottom: 16 }}>
        퀴즈
      </Text>
      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {[
          { label: '전체', num: words.length, color: T.ink },
          { label: '미암기', num: todoWords.length, color: T.amber },
          { label: '암기완료', num: doneWords.length, color: T.green },
        ].map(({ label, num, color }) => (
          <View key={label} style={{
            flex: 1, backgroundColor: T.paper, borderRadius: 14, borderWidth: 1,
            borderColor: T.rule2, padding: 16, alignItems: 'center',
          }}>
            <Text style={{ fontFamily: 'serif', fontSize: 28, color, lineHeight: 34 }}>{num}</Text>
            <Text style={{ fontSize: 11, color: T.ink3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Progress ring placeholder */}
      {words.length > 0 && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 32, borderWidth: 4,
              borderColor: T.green, alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: T.green }}>
                {Math.round((doneWords.length / words.length) * 100)}%
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: T.ink, fontWeight: '600', marginBottom: 4 }}>학습 진행률</Text>
              <View style={{ height: 6, backgroundColor: T.paper2, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{
                  height: '100%', borderRadius: 3, backgroundColor: T.green,
                  width: `${words.length > 0 ? (doneWords.length / words.length) * 100 : 0}%`,
                }} />
              </View>
              <Text style={{ fontSize: 12, color: T.ink3, marginTop: 4 }}>
                {doneWords.length} / {words.length} 단어 암기완료
              </Text>
            </View>
          </View>
        </Card>
      )}

      <TouchableOpacity
        onPress={startQuiz}
        style={{
          backgroundColor: T.ink, borderRadius: 14, paddingVertical: 16,
          alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
        }}>
        <BrainCircuit size={18} color={T.bg} />
        <Text style={{ color: T.bg, fontSize: 16, fontWeight: '600' }}>퀴즈 시작하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ── SESSION VIEW ──
  if (view === 'session' && current) return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Progress */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <View style={{ flex: 1, height: 4, backgroundColor: T.paper2, borderRadius: 2, overflow: 'hidden' }}>
          <View style={{ width: `${prog * 100}%`, height: '100%', backgroundColor: T.blue, borderRadius: 2 }} />
        </View>
        <Text style={{ fontFamily: 'monospace', fontSize: 12, color: T.ink3 }}>{idx + 1}/{queue.length}</Text>
      </View>

      {/* Flash Card */}
      <View style={{
        backgroundColor: T.paper, borderRadius: 20, padding: 28,
        minHeight: 240, borderWidth: 1, borderColor: T.rule2, marginBottom: 14,
        shadowColor: T.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12,
        elevation: 4, justifyContent: 'space-between',
      }}>
        {/* Type badge */}
        {current.type ? (
          <View style={{
            alignSelf: 'flex-start', backgroundColor: T.blueBg,
            borderWidth: 1, borderColor: T.blueBorder, borderRadius: 20,
            paddingHorizontal: 10, paddingVertical: 3,
          }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 10, color: T.blue, letterSpacing: 0.5 }}>{current.type}</Text>
          </View>
        ) : <View />}

        <View>
          <Text style={{ fontFamily: 'serif', fontSize: 42, fontWeight: '700', color: T.ink, letterSpacing: -0.5, lineHeight: 50 }}>
            {current.word}
          </Text>
          {current.pronunciation ? (
            <Text style={{ fontFamily: 'monospace', fontSize: 14, color: T.ink3, marginTop: 4 }}>{current.pronunciation}</Text>
          ) : null}
        </View>

        {/* Answer (revealed) */}
        {flipped && (
          <Animated.View style={{
            borderTopWidth: 1, borderTopColor: T.rule2, paddingTop: 18, marginTop: 18,
            opacity: flipAnim,
          }}>
            <Text style={{ fontSize: 20, color: T.ink, fontWeight: '500', marginBottom: 10, lineHeight: 28 }}>
              {current.meaning_ko}
            </Text>
            {current.meaning_en ? (
              <Text style={{ fontSize: 13, color: T.ink3, marginBottom: 10 }}>{current.meaning_en}</Text>
            ) : null}
            {current.example ? (
              <View style={{
                backgroundColor: T.paper2, borderLeftWidth: 2, borderLeftColor: T.ink4,
                borderRadius: 4, padding: 12,
              }}>
                <Text style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: 13, color: T.ink3, lineHeight: 20 }}>
                  {current.example}
                </Text>
              </View>
            ) : null}
          </Animated.View>
        )}
      </View>

      {/* Hint */}
      {!flipped && (
        <Text style={{ textAlign: 'center', fontSize: 12, color: T.ink4, marginBottom: 10 }}>
          단어를 보고 뜻을 떠올린 뒤 확인해보세요
        </Text>
      )}

      {/* Buttons */}
      {!flipped ? (
        <TouchableOpacity
          onPress={flip}
          style={{
            backgroundColor: T.blueBg, borderWidth: 1, borderColor: T.blueBorder,
            borderRadius: 14, paddingVertical: 16, alignItems: 'center',
          }}>
          <Text style={{ fontSize: 16, color: T.blue, fontWeight: '600' }}>뜻 확인하기</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => next('know')}
            style={{
              flex: 1, backgroundColor: T.greenBg, borderWidth: 1, borderColor: T.greenBorder,
              borderRadius: 14, paddingVertical: 16, alignItems: 'center',
            }}>
            <Text style={{ fontSize: 15, color: T.green, fontWeight: '600' }}>✓ 알았어요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => next('hard')}
            style={{
              flex: 1, backgroundColor: T.amberBg, borderWidth: 1, borderColor: T.amberBorder,
              borderRadius: 14, paddingVertical: 16, alignItems: 'center',
            }}>
            <Text style={{ fontSize: 15, color: T.amber, fontWeight: '600' }}>↺ 다시볼게요</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={endQuiz} style={{ marginTop: 12, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: T.ink4 }}>퀴즈 종료</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ── RESULT VIEW ──
  if (view === 'result') return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{
        backgroundColor: T.paper, borderRadius: 20, padding: 36,
        alignItems: 'center', borderWidth: 1, borderColor: T.rule2,
        shadowColor: T.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12,
        elevation: 4,
      }}>
        <Award size={48} color={T.amber} strokeWidth={1.5} style={{ marginBottom: 16 }} />
        <Text style={{ fontFamily: 'serif', fontSize: 28, fontWeight: '700', color: T.ink, marginBottom: 6 }}>완료!</Text>
        <Text style={{ fontSize: 14, color: T.ink3, marginBottom: 24 }}>
          {queue.length}개 단어 퀴즈 완료
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginBottom: 24 }}>
          <View style={{
            flex: 1, backgroundColor: T.greenBg, borderRadius: 14, padding: 18, alignItems: 'center',
          }}>
            <Text style={{ fontFamily: 'serif', fontSize: 32, color: T.green, marginBottom: 4 }}>{know}</Text>
            <Text style={{ fontSize: 11, color: T.ink3, textTransform: 'uppercase', letterSpacing: 0.5 }}>알았어요</Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: T.amberBg, borderRadius: 14, padding: 18, alignItems: 'center',
          }}>
            <Text style={{ fontFamily: 'serif', fontSize: 32, color: T.amber, marginBottom: 4 }}>{hard}</Text>
            <Text style={{ fontSize: 11, color: T.ink3, textTransform: 'uppercase', letterSpacing: 0.5 }}>다시볼게요</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
          <TouchableOpacity
            onPress={startQuiz}
            style={{
              flex: 1, backgroundColor: T.ink, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
            }}>
            <Text style={{ color: T.bg, fontSize: 15, fontWeight: '600' }}>다시 퀴즈</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={endQuiz}
            style={{
              flex: 1, borderWidth: 1, borderColor: T.rule2, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
            }}>
            <Text style={{ color: T.ink2, fontSize: 15 }}>단어장으로</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return null;
}

// ─────────────────────────────────────────────────────────────────
//  SETTINGS SCREEN
// ─────────────────────────────────────────────────────────────────
function SettingsScreen() {
  const { T, theme, toggleTheme, words, geminiKey, saveGeminiKey, showToast, sbUser, doLogout } = useApp();
  const [keyInput, setKeyInput] = useState(geminiKey);
  const [showKey, setShowKey]   = useState(false);

  const exportData = async () => {
    const json = JSON.stringify(words, null, 2);
    // Expo에서는 expo-sharing + expo-file-system으로 실제 export 구현
    Alert.alert('내보내기', `${words.length}개 단어 데이터\n(실제 앱에서는 파일로 저장됩니다)\n\n${json.slice(0, 200)}...`);
  };

  const clearAll = () => {
    Alert.alert('전체 삭제', '모든 단어를 삭제할까요? 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_KEY);
          showToast('전체 삭제 완료');
        }},
    ]);
  };

  const SectionLabel = ({ label }) => (
    <Text style={{
      fontSize: 11, fontWeight: '600', color: T.ink3, textTransform: 'uppercase',
      letterSpacing: 0.7, paddingHorizontal: 4, paddingBottom: 8, paddingTop: 4,
      borderBottomWidth: 1, borderBottomColor: T.rule2, marginBottom: 8,
    }}>{label}</Text>
  );

  const SettingsRow = ({ title, desc, right, last }) => (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 14, paddingHorizontal: 16,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: T.rule,
      gap: 12,
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: T.ink, marginBottom: 2 }}>{title}</Text>
        {desc ? <Text style={{ fontSize: 12, color: T.ink3 }}>{desc}</Text> : null}
      </View>
      {right}
    </View>
  );

  const cardStyle = {
    backgroundColor: T.paper, borderRadius: 14, borderWidth: 1,
    borderColor: T.rule2, marginBottom: 20, overflow: 'hidden',
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      {/* 계정 */}
      {sbUser && (
        <>
          <SectionLabel label="계정" />
          <View style={cardStyle}>
            <SettingsRow
              title={sbUser.email}
              desc="Supabase 동기화 활성화"
              last
              right={
                <TouchableOpacity
                  onPress={doLogout}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                    borderWidth: 1, borderColor: T.red, backgroundColor: T.redBg,
                  }}>
                  <Text style={{ fontSize: 12, color: T.red, fontWeight: '500' }}>로그아웃</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </>
      )}

      {/* AI API */}
      <SectionLabel label="AI API 키" />
      <View style={cardStyle}>
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: T.rule }}>
          <Text style={{ fontSize: 14, color: T.ink, marginBottom: 2 }}>Gemini API 키</Text>
          <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 10 }}>Google Gemini — 단어 자동 생성에 사용</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{
              flex: 1, flexDirection: 'row', alignItems: 'center',
              backgroundColor: T.bg, borderRadius: 10, borderWidth: 1, borderColor: T.rule2,
              paddingHorizontal: 12, height: 42,
            }}>
              <TextInput
                style={{ flex: 1, fontSize: 13, color: T.ink }}
                placeholder="AIzaSy..."
                placeholderTextColor={T.ink4}
                secureTextEntry={!showKey}
                value={keyInput}
                onChangeText={setKeyInput}
              />
              <TouchableOpacity onPress={() => setShowKey(!showKey)}>
                <Text style={{ fontSize: 11, color: T.blue }}>{showKey ? '숨김' : '표시'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={async () => { await saveGeminiKey(keyInput); showToast('저장됨'); }}
              style={{
                paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: T.rule2,
                backgroundColor: T.paper2, alignItems: 'center', justifyContent: 'center',
              }}>
              <Check size={16} color={T.green} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ padding: 12, backgroundColor: T.amberBg }}>
          <Text style={{ fontSize: 12, color: T.amber, lineHeight: 18 }}>
            💡 <Text style={{ fontWeight: '600' }}>aistudio.google.com</Text>에서 무료 API 키를 발급받으세요. 키는 이 기기에만 저장됩니다.
          </Text>
        </View>
      </View>

      {/* 화면 */}
      <SectionLabel label="화면" />
      <View style={cardStyle}>
        <SettingsRow
          title="다크 모드"
          desc="어두운 배경으로 전환"
          last
          right={
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: T.rule2, true: T.blue }}
              thumbColor="#fff"
            />
          }
        />
      </View>

      {/* 데이터 */}
      <SectionLabel label="데이터" />
      <View style={cardStyle}>
        <SettingsRow
          title="JSON 내보내기"
          desc={`${words.length}개 단어 백업`}
          right={
            <TouchableOpacity
              onPress={exportData}
              style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
                borderWidth: 1, borderColor: T.rule2, backgroundColor: T.paper2,
              }}>
              <Text style={{ fontSize: 12, color: T.ink2 }}>저장</Text>
            </TouchableOpacity>
          }
        />
        <SettingsRow
          title="JSON 가져오기"
          desc="백업 파일에서 불러오기"
          last
          right={
            <TouchableOpacity
              onPress={() => Alert.alert('가져오기', 'expo-document-picker 연동 후 사용 가능합니다.')}
              style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
                borderWidth: 1, borderColor: T.rule2, backgroundColor: T.paper2,
              }}>
              <Text style={{ fontSize: 12, color: T.ink2 }}>불러오기</Text>
            </TouchableOpacity>
          }
        />
      </View>

      {/* 위험 */}
      <SectionLabel label="위험 구역" />
      <View style={cardStyle}>
        <SettingsRow
          title="전체 단어 삭제"
          desc="모든 단어를 삭제해요. 되돌릴 수 없어요."
          last
          right={
            <TouchableOpacity
              onPress={clearAll}
              style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
                backgroundColor: T.redBg, borderWidth: 1, borderColor: T.redBorder,
              }}>
              <Text style={{ fontSize: 12, color: T.red }}>초기화</Text>
            </TouchableOpacity>
          }
        />
      </View>

      {/* 앱 정보 */}
      <View style={{ alignItems: 'center', marginTop: 12, gap: 4 }}>
        <Text style={{ fontFamily: 'serif', fontSize: 16, fontWeight: '700', color: T.ink }}>My Vocab</Text>
        <Text style={{ fontSize: 11, color: T.ink4 }}>v1.0.0 · OPIc 영어 단어장</Text>
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────
//  SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────
function Card({ children, style }) {
  const { T } = useApp();
  return (
    <View style={[{
      backgroundColor: T.paper, borderRadius: 14, padding: 18, marginBottom: 14,
      borderWidth: 1, borderColor: T.rule2,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
      elevation: 2,
    }, style]}>
      {children}
    </View>
  );
}

function CardTitle({ icon, title, T, noLine }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: noLine ? 0 : 14 }}>
      {icon}
      <Text style={{ fontFamily: 'serif', fontSize: 14, fontWeight: '700', color: T.ink }}>{title}</Text>
      {!noLine && <View style={{ flex: 1, height: 1, backgroundColor: T.rule2, marginLeft: 4 }} />}
    </View>
  );
}

function EmptyState({ T, message }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <Layers size={36} color={T.ink4} strokeWidth={1.2} style={{ marginBottom: 12 }} />
      <Text style={{ fontSize: 14, color: T.ink4, textAlign: 'center', lineHeight: 22 }}>{message}</Text>
    </View>
  );
}

registerRootComponent(App);
