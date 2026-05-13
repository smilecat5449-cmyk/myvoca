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
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';
import {
    Award,
    BookMarked,
    BrainCircuit,
    Check, ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Layers,
    Leaf,
    Moon,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Settings,
    Sparkles,
    Sun, Trash2,
    Trophy,
    X
} from 'lucide-react';
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
    Image,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StatusBar,
    Switch,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';

// ─────────────────────────────────────────────────────────────────
//  THEME SYSTEM — Soft Avocado Ceramic Design
// ─────────────────────────────────────────────────────────────────
const LIGHT = {
  // 배경 및 기본 톤
  bg:           '#f5f1e8',      // Warm Oatmeal — 부드러운 오트밀
  paper:        '#faf8f4',      // Soft Cream — 부드러운 크림색
  paper2:       '#f0ebe2',      // Lighter Oatmeal
  
  // 텍스트
  ink:          '#2d2d2d',      // Dark Charcoal Gray — 진한 차콜
  ink2:         '#5a5550',      // Warm Gray
  ink3:         '#8b8680',      // Soft Gray
  ink4:         '#bbb5ae',      // Light Gray
  
  // 선 및 분할선
  rule:         'rgba(45,45,45,0.06)',   // Very subtle
  rule2:        'rgba(45,45,45,0.12)',   // Subtle
  
  // 아보카도 크림 (메인 강조색)
  blue:         '#a8bfa3',      // Soft Avocado Green
  blueBg:       '#e8ede4',      // Soft Avocado BG (lighter)
  blueBorder:   'rgba(168,191,163,0.3)', // Soft border
  
  // 아보카도 껍질 (카드 테두리)
  olive:        '#7a8566',      // Deep Olive
  oliveBg:      '#f0f3ed',      // Olive-tinted bg
  
  // 따뜻한 브라운 (버튼, 액션)
  warmBrown:    '#9b8b7e',      // Warm Brown — 아보카도 씨앗색
  brownBg:      '#ede6dd',      // Warm Brown BG
  brownBorder:  'rgba(155,139,126,0.3)',
  
  // 그린 (완료, 성공)
  green:        '#9db99b',      // Soft Green
  greenBg:      '#e8ebe4',      // Soft Green BG
  greenBorder:  'rgba(157,185,155,0.3)',
  
  // 레드 (경고, 위험)
  red:          '#b8837d',      // Soft Red Brown
  redBg:        '#f0ebe8',      // Soft Red BG
  redBorder:    'rgba(184,131,125,0.2)',
  
  // 옐로우/앰버 (주의)
  amber:        '#c9a876',      // Warm Amber
  amberBg:      '#f5eee5',      // Warm Amber BG
  amberBorder:  'rgba(201,168,118,0.2)',
  
  // 네비게이션
  navBg:        'rgba(245,241,232,0.97)', // Oatmeal with transparency
  shadow:       'rgba(45,45,45,0.08)',   // Very subtle shadow
};

const DARK = {
  // 배경 및 기본 톤
  bg:           '#2a2620',      // Dark Warm Brown
  paper:        '#3a3530',      // Dark Charcoal
  paper2:       '#433d36',      // Darker variant
  
  // 텍스트
  ink:          '#f5f1e8',      // Oatmeal text
  ink2:         '#d9d0c5',      // Light Gray text
  ink3:         '#a89f96',      // Medium Gray text
  ink4:         '#7a7370',      // Dark Gray text
  
  // 선 및 분할선
  rule:         'rgba(245,241,232,0.06)',
  rule2:        'rgba(245,241,232,0.12)',
  
  // 아보카도 크림
  blue:         '#b8cdb3',      // Lighter Avocado for dark mode
  blueBg:       'rgba(184,205,179,0.15)',
  blueBorder:   'rgba(184,205,179,0.3)',
  
  // 아보카도 껍질
  olive:        '#9aab94',      // Lighter Olive
  oliveBg:      'rgba(154,171,148,0.12)',
  
  // 따뜻한 브라운
  warmBrown:    '#b5a499',      // Lighter Warm Brown
  brownBg:      'rgba(181,164,153,0.12)',
  brownBorder:  'rgba(181,164,153,0.3)',
  
  // 그린
  green:        '#b5c9b3',      // Lighter Green
  greenBg:      'rgba(181,201,179,0.12)',
  greenBorder:  'rgba(181,201,179,0.3)',
  
  // 레드
  red:          '#d4a39c',      // Lighter Red
  redBg:        'rgba(212,163,156,0.12)',
  redBorder:    'rgba(212,163,156,0.2)',
  
  // 옐로우/앰버
  amber:        '#d9b896',      // Lighter Amber
  amberBg:      'rgba(217,184,150,0.12)',
  amberBorder:  'rgba(217,184,150,0.2)',
  
  // 네비게이션
  navBg:        'rgba(42,38,32,0.97)',
  shadow:       'rgba(0,0,0,0.25)',
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

const STORAGE_KEY      = 'myvocab_v3';
const THEME_KEY        = 'myvocab_theme';
const GEMINI_KEY       = 'myvocab_gemini_key';
const CATEGORIES_KEY   = 'myvocab_categories';
const AVOCADO_KEY      = 'myvocab_avocado';
const DAILY_LOG_KEY    = 'myvocab_daily_log';
const PROFILE_KEY      = 'myvocab_profile';
const LEADERBOARD_KEY  = 'myvocab_leaderboard';
const PER_PAGE         = 20;
const WORD_TYPES       = ['n.', 'v.', 'adj.', 'adv.', 'phr.'];

// ─────────────────────────────────────────────────────────────────
//  DEFAULT CATEGORIES (5개 기본 단어장)
// ─────────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  {
    id: 'default_travel',
    name: '여행 (Travel)',
    isDefault: true,
    words: [
      { word: 'airport', pronunciation: 'ˈeərpɔːrt', type: 'n.', meaning_ko: '공항', meaning_en: 'a place where aircraft depart and arrive', example: 'I arrived at the airport early.' },
      { word: 'passport', pronunciation: 'ˈpæspɔːrt', type: 'n.', meaning_ko: '여권', meaning_en: 'an official document for traveling internationally', example: 'You need a valid passport to travel abroad.' },
      { word: 'hotel', pronunciation: 'hoʊˈtel', type: 'n.', meaning_ko: '호텔', meaning_en: 'a place providing lodging and other services', example: 'We stayed at a luxury hotel.' },
      { word: 'suitcase', pronunciation: 'ˈsuːtkeɪs', type: 'n.', meaning_ko: '캐리어', meaning_en: 'a large bag for carrying clothes while traveling', example: 'I packed my suitcase for the trip.' },
      { word: 'reserve', pronunciation: 'rɪˈzɜːrv', type: 'v.', meaning_ko: '예약하다', meaning_en: 'to book or save something in advance', example: 'Can you reserve a table for us?' },
      { word: 'destination', pronunciation: 'ˌdestɪˈneɪʃən', type: 'n.', meaning_ko: '목적지', meaning_en: 'the place where someone is going', example: 'Paris is my favorite destination.' },
      { word: 'itinerary', pronunciation: 'aɪˈtɪnəreri', type: 'n.', meaning_ko: '일정', meaning_en: 'a planned route or sequence of activities', example: 'We planned a detailed itinerary.' },
      { word: 'tourism', pronunciation: 'ˈtʊrɪzəm', type: 'n.', meaning_ko: '관광', meaning_en: 'the business of providing services to travelers', example: 'Tourism is a major industry.' },
      { word: 'scenic', pronunciation: 'ˈsiːnɪk', type: 'adj.', meaning_ko: '풍경이 좋은', meaning_en: 'offering beautiful views', example: 'We took a scenic route.' },
      { word: 'accommodation', pronunciation: 'əˌkɑːməˈdeɪʃən', type: 'n.', meaning_ko: '숙박', meaning_en: 'a place where someone can live or stay', example: 'The accommodation includes breakfast.' },
      { word: 'guided tour', pronunciation: 'ˈɡaɪdɪd tʊr', type: 'phr.', meaning_ko: '가이드 투어', meaning_en: 'a tour led by an expert guide', example: 'We took a guided tour of the museum.' },
      { word: 'customs', pronunciation: 'ˈkʌstəmz', type: 'n.', meaning_ko: '세관', meaning_en: 'the official checking of goods entering a country', example: 'We went through customs at the airport.' },
      { word: 'currency', pronunciation: 'ˈkɜːrənsi', type: 'n.', meaning_ko: '통화', meaning_en: 'the money used in a particular country', example: 'What is the local currency?' },
      { word: 'budget', pronunciation: 'ˈbʌdʒɪt', type: 'n.', meaning_ko: '예산', meaning_en: 'the amount of money available to spend', example: 'We had a tight budget for the trip.' },
      { word: 'souvenir', pronunciation: 'ˌsuːvəˈnɪr', type: 'n.', meaning_ko: '기념품', meaning_en: 'a thing kept as a reminder of a visit', example: 'I bought souvenirs for my family.' },
      { word: 'explore', pronunciation: 'ɪkˈsplɔːr', type: 'v.', meaning_ko: '탐험하다', meaning_en: 'to travel through or investigate', example: 'We explored the old city.' },
      { word: 'adventure', pronunciation: 'ədˈventʃər', type: 'n.', meaning_ko: '모험', meaning_en: 'an exciting or unusual experience', example: 'The trip was full of adventure.' },
      { word: 'flight', pronunciation: 'flaɪt', type: 'n.', meaning_ko: '비행', meaning_en: 'a journey in an aircraft', example: 'The flight was delayed.' },
      { word: 'baggage', pronunciation: 'ˈbæɡɪdʒ', type: 'n.', meaning_ko: '짐', meaning_en: 'containers and bags with possessions', example: 'Put your baggage in the overhead bin.' },
    ]
  },
  {
    id: 'default_school',
    name: '학교 (School)',
    isDefault: true,
    words: [
      { word: 'classroom', pronunciation: 'ˈklæsruːm', type: 'n.', meaning_ko: '교실', meaning_en: 'a room where classes are taught', example: 'The classroom was full of students.' },
      { word: 'student', pronunciation: 'ˈstuːdənt', type: 'n.', meaning_ko: '학생', meaning_en: 'a person who is learning at a school', example: 'The student asked a question.' },
      { word: 'teacher', pronunciation: 'ˈtiːtʃər', type: 'n.', meaning_ko: '선생님', meaning_en: 'a person who teaches at a school', example: 'The teacher explained the lesson.' },
      { word: 'curriculum', pronunciation: 'kəˈrɪkjələm', type: 'n.', meaning_ko: '교육과정', meaning_en: 'the subjects studied in a school', example: 'The curriculum includes math and science.' },
      { word: 'homework', pronunciation: 'ˈhoʊmwɜːrk', type: 'n.', meaning_ko: '숙제', meaning_en: 'schoolwork to be done outside the classroom', example: 'I finished my homework.' },
      { word: 'exam', pronunciation: 'ɪɡˈzæm', type: 'n.', meaning_ko: '시험', meaning_en: 'a test of knowledge', example: 'The exam was difficult.' },
      { word: 'grade', pronunciation: 'ɡreɪd', type: 'n.', meaning_ko: '학년', meaning_en: 'a level or score in school', example: 'She got an A grade.' },
      { word: 'subject', pronunciation: 'ˈsʌbdʒekt', type: 'n.', meaning_ko: '과목', meaning_en: 'an area of study', example: 'My favorite subject is English.' },
      { word: 'lecture', pronunciation: 'ˈlektʃər', type: 'n.', meaning_ko: '강의', meaning_en: 'a formal presentation on a topic', example: 'The lecture was informative.' },
      { word: 'textbook', pronunciation: 'ˈtekstbʊk', type: 'n.', meaning_ko: '교과서', meaning_en: 'a book used for studying a subject', example: 'Open your textbook to page 50.' },
      { word: 'assignment', pronunciation: 'əˈsaɪnmənt', type: 'n.', meaning_ko: '과제', meaning_en: 'a task given to a student', example: 'Complete the assignment by Friday.' },
      { word: 'deadline', pronunciation: 'ˈdedlaɪn', type: 'n.', meaning_ko: '마감일', meaning_en: 'the date by which something must be finished', example: 'The deadline is tomorrow.' },
      { word: 'scholarship', pronunciation: 'ˈskɑːlərʃɪp', type: 'n.', meaning_ko: '장학금', meaning_en: 'financial aid for education', example: 'She won a scholarship.' },
      { word: 'enroll', pronunciation: 'ɪnˈroʊl', type: 'v.', meaning_ko: '등록하다', meaning_en: 'to register for a course or school', example: 'I enrolled in the class.' },
      { word: 'graduate', pronunciation: 'ˈɡrædʒuət', type: 'v.', meaning_ko: '졸업하다', meaning_en: 'to complete a course of study', example: 'She graduated last year.' },
      { word: 'tuition', pronunciation: 'tuˈɪʃən', type: 'n.', meaning_ko: '등록금', meaning_en: 'the fee for instruction', example: 'Tuition is expensive.' },
      { word: 'campus', pronunciation: 'ˈkæmpəs', type: 'n.', meaning_ko: '캠퍼스', meaning_en: 'the grounds of a school or college', example: 'The campus is beautiful.' },
      { word: 'dormitory', pronunciation: 'ˈdɔːrmɪtɔːri', type: 'n.', meaning_ko: '기숙사', meaning_en: 'a building where students live', example: 'I live in the dormitory.' },
      { word: 'library', pronunciation: 'ˈlaɪbreri', type: 'n.', meaning_ko: '도서관', meaning_en: 'a place with books for borrowing', example: 'The library is open until 9 PM.' },
      { word: 'thesis', pronunciation: 'ˈθiːsɪs', type: 'n.', meaning_ko: '논문', meaning_en: 'a long written work presenting research', example: 'I am writing my thesis.' },
    ]
  },
  {
    id: 'default_hobby',
    name: '취미 (Hobby)',
    isDefault: true,
    words: [
      { word: 'hobby', pronunciation: 'ˈhɑːbi', type: 'n.', meaning_ko: '취미', meaning_en: 'an activity done regularly for pleasure', example: 'Reading is my favorite hobby.' },
      { word: 'sports', pronunciation: 'spɔːrts', type: 'n.', meaning_ko: '스포츠', meaning_en: 'physical activities played for recreation', example: 'I enjoy playing sports.' },
      { word: 'painting', pronunciation: 'ˈpeɪntɪŋ', type: 'n.', meaning_ko: '그림 그리기', meaning_en: 'creating pictures with paint', example: 'She is talented at painting.' },
      { word: 'photography', pronunciation: 'fəˈtɑːɡrəfi', type: 'n.', meaning_ko: '사진', meaning_en: 'the art of taking photographs', example: 'Photography is my passion.' },
      { word: 'music', pronunciation: 'ˈmjuːzɪk', type: 'n.', meaning_ko: '음악', meaning_en: 'organized sounds and silence', example: 'I listen to music every day.' },
      { word: 'instrument', pronunciation: 'ˈɪnstrəmənt', type: 'n.', meaning_ko: '악기', meaning_en: 'a tool for making music', example: 'I play the guitar.' },
      { word: 'dancing', pronunciation: 'ˈdænsɪŋ', type: 'n.', meaning_ko: '춤추기', meaning_en: 'moving rhythmically to music', example: 'Dancing is fun.' },
      { word: 'reading', pronunciation: 'ˈriːdɪŋ', type: 'n.', meaning_ko: '독서', meaning_en: 'the activity of looking at written words', example: 'I enjoy reading novels.' },
      { word: 'writing', pronunciation: 'ˈraɪtɪŋ', type: 'n.', meaning_ko: '쓰기', meaning_en: 'putting words on paper', example: 'I love creative writing.' },
      { word: 'cooking', pronunciation: 'ˈkʊkɪŋ', type: 'n.', meaning_ko: '요리', meaning_en: 'preparing food', example: 'I enjoy cooking.' },
      { word: 'gardening', pronunciation: 'ˈɡɑːrdənɪŋ', type: 'n.', meaning_ko: '정원 가꾸기', meaning_en: 'growing plants and flowers', example: 'Gardening is relaxing.' },
      { word: 'hiking', pronunciation: 'ˈhaɪkɪŋ', type: 'n.', meaning_ko: '등산', meaning_en: 'walking in nature for recreation', example: 'We went hiking last weekend.' },
      { word: 'gaming', pronunciation: 'ˈɡeɪmɪŋ', type: 'n.', meaning_ko: '게임하기', meaning_en: 'playing video or board games', example: 'Gaming is a popular hobby.' },
      { word: 'crafting', pronunciation: 'ˈkræftɪŋ', type: 'n.', meaning_ko: '공예', meaning_en: 'making things by hand', example: 'She enjoys crafting.' },
      { word: 'collecting', pronunciation: 'kəˈlektɪŋ', type: 'n.', meaning_ko: '수집', meaning_en: 'gathering items of interest', example: 'He is collecting stamps.' },
      { word: 'swimming', pronunciation: 'ˈswɪmɪŋ', type: 'n.', meaning_ko: '수영', meaning_en: 'moving through water', example: 'Swimming is good exercise.' },
      { word: 'cycling', pronunciation: 'ˈsaɪklɪŋ', type: 'n.', meaning_ko: '자전거 타기', meaning_en: 'riding a bicycle', example: 'We went cycling.' },
      { word: 'drawing', pronunciation: 'ˈdrɔːɪŋ', type: 'n.', meaning_ko: '그리기', meaning_en: 'making pictures with pen or pencil', example: 'He is skilled at drawing.' },
      { word: 'volunteering', pronunciation: 'ˌvɑːlənˈtɪrɪŋ', type: 'n.', meaning_ko: '자원봉사', meaning_en: 'helping others without payment', example: 'Volunteering is rewarding.' },
      { word: 'meditation', pronunciation: 'ˌmedɪˈteɪʃən', type: 'n.', meaning_ko: '명상', meaning_en: 'calm reflection or contemplation', example: 'I practice meditation daily.' },
    ]
  },
  {
    id: 'default_business',
    name: '비즈니스 (Business)',
    isDefault: true,
    words: [
      { word: 'company', pronunciation: 'ˈkʌmpəni', type: 'n.', meaning_ko: '회사', meaning_en: 'a business organization', example: 'She works at a tech company.' },
      { word: 'employee', pronunciation: 'ɪmˈplɔɪi', type: 'n.', meaning_ko: '직원', meaning_en: 'a person employed by a company', example: 'The employee was promoted.' },
      { word: 'manager', pronunciation: 'ˈmænɪdʒər', type: 'n.', meaning_ko: '관리자', meaning_en: 'a person in charge of others', example: 'The manager approved the project.' },
      { word: 'conference', pronunciation: 'ˈkɑːnfərəns', type: 'n.', meaning_ko: '회의', meaning_en: 'a formal meeting of people', example: 'The conference was productive.' },
      { word: 'presentation', pronunciation: 'ˌprezənˈteɪʃən', type: 'n.', meaning_ko: '프레젠테이션', meaning_en: 'a talk about a topic', example: 'I gave a presentation.' },
      { word: 'contract', pronunciation: 'ˈkɑːntrækt', type: 'n.', meaning_ko: '계약', meaning_en: 'a legal agreement', example: 'We signed the contract.' },
      { word: 'profit', pronunciation: 'ˈprɑːfɪt', type: 'n.', meaning_ko: '이익', meaning_en: 'money gained from business', example: 'The profit increased.' },
      { word: 'revenue', pronunciation: 'ˈrevənuː', type: 'n.', meaning_ko: '수익', meaning_en: 'money earned by a business', example: 'Revenue was up this quarter.' },
      { word: 'client', pronunciation: 'ˈklaɪənt', type: 'n.', meaning_ko: '고객', meaning_en: 'a person using services', example: 'The client is satisfied.' },
      { word: 'investment', pronunciation: 'ɪnˈvestmənt', type: 'n.', meaning_ko: '투자', meaning_en: 'money put into something for profit', example: 'This is a good investment.' },
      { word: 'strategy', pronunciation: 'ˈstrætədʒi', type: 'n.', meaning_ko: '전략', meaning_en: 'a plan of action', example: 'We need a new strategy.' },
      { word: 'budget', pronunciation: 'ˈbʌdʒɪt', type: 'n.', meaning_ko: '예산', meaning_en: 'an amount of money set aside', example: 'The budget is tight.' },
      { word: 'deadline', pronunciation: 'ˈdedlaɪn', type: 'n.', meaning_ko: '마감일', meaning_en: 'the date by which work must be done', example: 'The deadline is Friday.' },
      { word: 'negotiate', pronunciation: 'nɪˈɡoʊʃieɪt', type: 'v.', meaning_ko: '협상하다', meaning_en: 'to discuss and reach an agreement', example: 'We will negotiate the price.' },
      { word: 'partnership', pronunciation: 'ˈpɑːrtnərʃɪp', type: 'n.', meaning_ko: '파트너십', meaning_en: 'a cooperative venture', example: 'We formed a partnership.' },
      { word: 'startup', pronunciation: 'ˈstɑːrtʌp', type: 'n.', meaning_ko: '스타트업', meaning_en: 'a new business venture', example: 'I joined a startup.' },
      { word: 'workflow', pronunciation: 'ˈwɜːrkfloʊ', type: 'n.', meaning_ko: '작업 흐름', meaning_en: 'the sequence of work processes', example: 'The workflow is efficient.' },
      { word: 'milestone', pronunciation: 'ˈmaɪlstoʊn', type: 'n.', meaning_ko: '이정표', meaning_en: 'a significant event in progress', example: 'This is a major milestone.' },
      { word: 'quarterly', pronunciation: 'ˈkwɔːrtərli', type: 'adj.', meaning_ko: '분기별의', meaning_en: 'happening four times a year', example: 'The quarterly report is due.' },
      { word: 'stakeholder', pronunciation: 'ˈsteɪkhoʊldər', type: 'n.', meaning_ko: '이해관계자', meaning_en: 'a person with an interest in something', example: 'Stakeholders must approve this.' },
    ]
  },
  {
    id: 'default_food',
    name: '음식 (Food)',
    isDefault: true,
    words: [
      { word: 'restaurant', pronunciation: 'ˈrestrɑːrɑːnt', type: 'n.', meaning_ko: '레스토랑', meaning_en: 'a place to eat meals', example: 'We dined at a nice restaurant.' },
      { word: 'menu', pronunciation: 'ˈmenjuː', type: 'n.', meaning_ko: '메뉴', meaning_en: 'a list of food available', example: 'What is on the menu?' },
      { word: 'delicious', pronunciation: 'dɪˈlɪʃəs', type: 'adj.', meaning_ko: '맛있는', meaning_en: 'tasting very good', example: 'The food was delicious.' },
      { word: 'ingredient', pronunciation: 'ɪnˈɡriːdiənt', type: 'n.', meaning_ko: '재료', meaning_en: 'a component in a recipe', example: 'Add the ingredients to the bowl.' },
      { word: 'recipe', pronunciation: 'ˈresəpi', type: 'n.', meaning_ko: '레시피', meaning_en: 'instructions for preparing food', example: 'I followed the recipe.' },
      { word: 'cuisine', pronunciation: 'kwɪˈziːn', type: 'n.', meaning_ko: '요리', meaning_en: 'a style of cooking', example: 'I love Italian cuisine.' },
      { word: 'appetizer', pronunciation: 'ˈæpɪtaɪzər', type: 'n.', meaning_ko: '애피타이저', meaning_en: 'a light food before the main course', example: 'We ordered an appetizer.' },
      { word: 'dessert', pronunciation: 'dɪˈzɜːrt', type: 'n.', meaning_ko: '디저트', meaning_en: 'sweet food served after a meal', example: 'I ordered dessert.' },
      { word: 'beverage', pronunciation: 'ˈbevərɪdʒ', type: 'n.', meaning_ko: '음료', meaning_en: 'a drink', example: 'What beverage would you like?' },
      { word: 'nutrition', pronunciation: 'nuˈtrɪʃən', type: 'n.', meaning_ko: '영양', meaning_en: 'the science of food and health', example: 'Good nutrition is important.' },
      { word: 'vitamin', pronunciation: 'ˈvaɪtəmɪn', type: 'n.', meaning_ko: '비타민', meaning_en: 'a nutrient needed for health', example: 'Vitamin C is important.' },
      { word: 'protein', pronunciation: 'ˈproʊtiːn', type: 'n.', meaning_ko: '단백질', meaning_en: 'a nutrient that builds muscle', example: 'Eggs contain protein.' },
      { word: 'carbohydrate', pronunciation: 'kɑːrboʊˈhaɪdreɪt', type: 'n.', meaning_ko: '탄수화물', meaning_en: 'a type of nutrient', example: 'Bread has carbohydrates.' },
      { word: 'fat', pronunciation: 'fæt', type: 'n.', meaning_ko: '지방', meaning_en: 'a nutrient that provides energy', example: 'Nuts contain healthy fat.' },
      { word: 'vegetarian', pronunciation: 'ˌvedʒɪˈteriən', type: 'adj.', meaning_ko: '채식의', meaning_en: 'eating no meat', example: 'She is vegetarian.' },
      { word: 'organic', pronunciation: 'ɔːrˈɡænɪk', type: 'adj.', meaning_ko: '유기농의', meaning_en: 'grown without chemicals', example: 'We buy organic food.' },
      { word: 'flavor', pronunciation: 'ˈfleɪvər', type: 'n.', meaning_ko: '맛', meaning_en: 'the taste of something', example: 'The flavor is excellent.' },
      { word: 'portion', pronunciation: 'ˈpɔːrʃən', type: 'n.', meaning_ko: '일인분', meaning_en: 'an amount of food for one person', example: 'The portion was large.' },
      { word: 'seasoning', pronunciation: 'ˈsiːzənɪŋ', type: 'n.', meaning_ko: '양념', meaning_en: 'flavoring added to food', example: 'Add salt as seasoning.' },
      { word: 'chef', pronunciation: 'ʃef', type: 'n.', meaning_ko: '셰프', meaning_en: 'a professional cook', example: 'The chef prepared the meal.' },
    ]
  },
];

// ─────────────────────────────────────────────────────────────────
//  HELPERS (moved before constants)
// ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const today = () => new Date().toISOString().slice(0, 10);

// ─────────────────────────────────────────────────────────────────
//  INITIAL AVOCADO STATE
// ─────────────────────────────────────────────────────────────────
const INITIAL_AVOCADO = {
  level: 1,
  totalCares: 0,
  careThisWeek: 0,
  coins: 0,
  skinIndex: 0,
  backgroundIndex: 0,
  lastLogin: today(),
  dailyCoinsFromQuiz: 0,
  dailyCoinsFromWords: 0,
  streak: 0,
  lastStreakDate: '',
  monthlyCoinsEarned: 0,
  leaderboardMonth: '',
};

// ─────────────────────────────────────────────────────────────────
//  INITIAL PROFILE
// ─────────────────────────────────────────────────────────────────
const INITIAL_PROFILE = {
  nickname: '나의 아보카도',
  photo: '🥑',
  photoUri: null,   // actual image URI from gallery/camera
  createdAt: today(),
};

// ─────────────────────────────────────────────────────────────────
//  MORE HELPERS
// ─────────────────────────────────────────────────────────────────
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
  const [theme, setTheme]           = useState('light');
  const [words, setWords]           = useState([]);
  const [geminiKey, setGeminiKey]   = useState('');
  const [tab, setTab]               = useState('home');   // home | categories | quiz | avocado | leaderboard
  const [toast, setToast]           = useState('');
  const [sbUser, setSbUser]         = useState(null);    // Supabase user
  const [authMode, setAuthMode]     = useState('login'); // login | signup
  const [showAuth, setShowAuth]     = useState(true);    // Show auth screen
  const [loading, setLoading]       = useState(true);    // Loading auth state
  const [showSettings, setShowSettings] = useState(false); // Show settings modal
  const [leaderboard, setLeaderboard] = useState({ streak: [], coins: [] });
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // ── NEW: Categories & Avocado ──
  const [categories, setCategories]           = useState(DEFAULT_CATEGORIES);
  const [customCategories, setCustomCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('default_travel');
  const [avocado, setAvocado]                 = useState(INITIAL_AVOCADO);
  const [profile, setProfile]                 = useState(INITIAL_PROFILE);

  const toastAnim                   = useRef(new Animated.Value(0)).current;
  const profileRef                  = useRef(INITIAL_PROFILE);
  const avocadoRef                  = useRef(INITIAL_AVOCADO);
  const T = theme === 'light' ? LIGHT : DARK;

  // ── boot ──
  useEffect(() => {
    (async () => {
      let sessionUser = null;
      try {
        // 1. 세션 확인
        const { data: { session } } = await sbClient.auth.getSession();
        if (session?.user) {
          sessionUser = session.user;
          setSbUser(session.user);
          const { data } = await sbClient.from('words').select('*').eq('user_id', session.user.id);
          if (data) setWords(data.map(r => ({
            id: r.id, word: r.word, pronunciation: r.pronunciation,
            type: r.type, meaning_ko: r.meaning_ko, meaning_en: r.meaning_en,
            example: r.example, date: r.added_date, memorized: r.memorized,
          })));
        }

        // 2. 로컬 데이터 로드
        const [th, gk, catData, avoData, profData] = await Promise.all([
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem(GEMINI_KEY),
          AsyncStorage.getItem(CATEGORIES_KEY),
          AsyncStorage.getItem(AVOCADO_KEY),
          AsyncStorage.getItem(PROFILE_KEY),
        ]);

        if (th) setTheme(th);
        if (gk) setGeminiKey(gk);

        if (catData) {
          try {
            const { customs } = JSON.parse(catData);
            setCustomCategories(customs || []);
          } catch (e) { console.log('Parse categories error:', e.message); }
        }

        if (avoData) {
          try {
            const avo = JSON.parse(avoData);
            const todayStr = today();
            const currentMonth = todayStr.slice(0, 7);

            // 월별 리셋
            if (!avo.leaderboardMonth || avo.leaderboardMonth !== currentMonth) {
              avo.leaderboardMonth = currentMonth;
              avo.monthlyCoinsEarned = 0;
            }

            // 연속 출석 계산
            const isNewDay = (avo.lastLogin || '') !== todayStr;
            if (isNewDay) {
              const prev = new Date();
              prev.setDate(prev.getDate() - 1);
              const prevStr = prev.toISOString().slice(0, 10);
              avo.streak = avo.lastStreakDate === prevStr ? (avo.streak || 0) + 1 : 1;
              avo.lastStreakDate = todayStr;
              avo.coins += 10;
              avo.monthlyCoinsEarned = (avo.monthlyCoinsEarned || 0) + 10;
              avo.dailyCoinsFromQuiz = 0;
              avo.dailyCoinsFromWords = 0;
              avo.lastLogin = todayStr;
            } else if (!avo.lastStreakDate) {
              avo.streak = 1;
              avo.lastStreakDate = todayStr;
            }

            setAvocado(avo);
            avocadoRef.current = avo;
            await AsyncStorage.setItem(AVOCADO_KEY, JSON.stringify(avo));
          } catch (e) { console.log('Parse avocado error:', e.message); }
        }

        if (profData) {
          try {
            const prof = JSON.parse(profData);
            setProfile(prof);
            profileRef.current = prof;
          } catch (e) { console.log('Parse profile error:', e.message); }
        }

        // 3. 로그인 상태면 리더보드 upsert
        if (sessionUser) {
          const avo  = avocadoRef.current;
          const prof = profileRef.current;
          sbClient.from('leaderboard_monthly').upsert({
            user_id:       sessionUser.id,
            nickname:      prof.nickname || '익명',
            photo:         prof.photo || '🥑',
            photo_uri:     prof.photoUri || null,
            streak:        avo.streak || 0,
            monthly_coins: avo.monthlyCoinsEarned || 0,
            month:         today().slice(0, 7),
          }, { onConflict: 'user_id,month' })
            .catch(e => console.warn('Boot leaderboard sync:', e));
        }
      } catch (err) {
        console.log('Boot error:', err.message);
      } finally {
        // 어떤 경우에도 반드시 로딩 해제
        setLoading(false);
      }
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

  // ── categories ──
  const saveCategories = useCallback(async (customs) => {
    setCustomCategories(customs);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify({
      defaults: DEFAULT_CATEGORIES,
      customs: customs,
    }));
  }, []);

  const addCategory = useCallback((name) => {
    const newCat = {
      id: `custom_${uid()}`,
      name: name,
      isDefault: false,
      words: [],
      createdAt: today(),
    };
    const updated = [...customCategories, newCat];
    saveCategories(updated);
    return newCat.id;
  }, [customCategories, saveCategories]);

  const deleteCategory = useCallback((catId) => {
    const updated = customCategories.filter(c => c.id !== catId);
    saveCategories(updated);
  }, [customCategories, saveCategories]);

  const renameCategory = useCallback((catId, newName) => {
    const updated = customCategories.map(c =>
      c.id === catId ? { ...c, name: newName } : c
    );
    saveCategories(updated);
  }, [customCategories, saveCategories]);

  // ── avocado ──
  const saveAvocado = useCallback(async (avo) => {
    setAvocado(avo);
    avocadoRef.current = avo;
    await AsyncStorage.setItem(AVOCADO_KEY, JSON.stringify(avo));
    // Sync to leaderboard (fire-and-forget)
    if (sbUser) {
      const month = today().slice(0, 7);
      const prof = profileRef.current;
      sbClient.from('leaderboard_monthly').upsert({
        user_id: sbUser.id,
        nickname: prof.nickname || '익명',
        photo: prof.photo || '🥑',
        photo_uri: prof.photoUri || null,
        streak: avo.streak || 0,
        monthly_coins: avo.monthlyCoinsEarned || 0,
        month,
      }, { onConflict: 'user_id,month' }).catch(e => console.warn('Leaderboard sync:', e));
    }
  }, [sbUser]);

  const addCoins = useCallback((amount) => {
    const currentMonth = today().slice(0, 7);
    const monthChanged = avocado.leaderboardMonth && avocado.leaderboardMonth !== currentMonth;
    const updated = {
      ...avocado,
      coins: avocado.coins + amount,
      monthlyCoinsEarned: monthChanged ? amount : (avocado.monthlyCoinsEarned || 0) + amount,
      leaderboardMonth: currentMonth,
    };
    saveAvocado(updated);
    return updated.coins;
  }, [avocado, saveAvocado]);

  const useCoins = useCallback((amount) => {
    if (avocado.coins < amount) return false;
    const updated = { ...avocado, coins: avocado.coins - amount };
    saveAvocado(updated);
    return true;
  }, [avocado, saveAvocado]);

  const careAvocado = useCallback((careAmount = 1) => {
    // careAmount: 1 for 물주기 (10 coins), 2 for 영양제 (20 coins)
    const updated = {
      ...avocado,
      totalCares: avocado.totalCares + careAmount,
      careThisWeek: avocado.careThisWeek + careAmount,
      level: avocado.totalCares + careAmount >= 50 ? 3 : (avocado.totalCares + careAmount >= 25 ? 2 : 1),
    };
    saveAvocado(updated);
  }, [avocado, saveAvocado]);

  // ── profile ──
  const saveProfile = useCallback(async (prof) => {
    setProfile(prof);
    profileRef.current = prof;
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(prof));
  }, []);

  const updateProfile = useCallback((changes) => {
    const updated = { ...profile, ...changes };
    saveProfile(updated);
  }, [profile, saveProfile]);

  // ── leaderboard ──
  const fetchLeaderboard = useCallback(async () => {
    if (!sbUser) return;
    const month = today().slice(0, 7);
    setLeaderboardLoading(true);
    try {
      const [streakRes, coinsRes] = await Promise.all([
        sbClient.from('leaderboard_monthly')
          .select('user_id, nickname, photo, photo_uri, streak')
          .eq('month', month)
          .order('streak', { ascending: false })
          .limit(100),
        sbClient.from('leaderboard_monthly')
          .select('user_id, nickname, photo, photo_uri, monthly_coins')
          .eq('month', month)
          .order('monthly_coins', { ascending: false })
          .limit(100),
      ]);
      setLeaderboard({
        streak: streakRes.data || [],
        coins: coinsRes.data || [],
      });
    } catch (e) {
      console.warn('Fetch leaderboard error:', e);
    }
    setLeaderboardLoading(false);
  }, [sbUser]);

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
      // 로그인 직후 현재 avocado 데이터로 leaderboard 즉시 upsert
      const avo  = avocadoRef.current;
      const prof = profileRef.current;
      const month = today().slice(0, 7);
      sbClient.from('leaderboard_monthly').upsert({
        user_id:       data.user.id,
        nickname:      prof.nickname || '익명',
        photo:         prof.photo || '🥑',
        photo_uri:     prof.photoUri || null,
        streak:        avo.streak || 0,
        monthly_coins: avo.monthlyCoinsEarned || 0,
        month,
      }, { onConflict: 'user_id,month' })
        .catch(e => console.warn('Login leaderboard sync:', e));
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
    } catch (err) {
      showToast(err.message || '로그아웃 실패');
    }
  }, []);

  const doKakaoLogin = useCallback(async () => {
    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await sbClient.auth.signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (err) {
      showToast(err.message || '카카오 로그인 실패');
    }
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
    sbUser, doLogout, doKakaoLogin,
    // NEW: categories, avocado, profile
    categories, customCategories, selectedCategory, setSelectedCategory,
    addCategory, deleteCategory, renameCategory,
    avocado, addCoins, useCoins, careAvocado,
    profile, updateProfile, showSettings, setShowSettings,
    // leaderboard
    leaderboard, leaderboardLoading, fetchLeaderboard,
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

        {/* 1. 앱 초기화 중 — 로딩 스피너 */}
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg }}>
            <BookMarked size={36} color={T.warmBrown} strokeWidth={2} />
            <Text style={{ marginTop: 16, fontSize: 13, color: T.ink3 }}>불러오는 중...</Text>
          </View>

        /* 2. 로그인 안 된 상태 — 항상 로그인 화면 */
        ) : !sbUser ? (
          <AuthScreen
            email="" pw=""
            authMode={authMode} setAuthMode={setAuthMode}
            doLogin={doLogin} doSignup={doSignup} doKakaoLogin={doKakaoLogin}
          />

        /* 3. 로그인 완료 — 앱 */
        ) : (
          <>
            <TopBar />
            <View style={{ flex: 1 }}>
              {tab === 'home'        && <AddScreen />}
              {tab === 'categories'  && <ListScreen />}
              {tab === 'quiz'        && <QuizScreen />}
              {tab === 'avocado'     && <AvocadoScreen />}
              {tab === 'leaderboard' && <LeaderboardScreen />}
            </View>
            <BottomNav />
          </>
        )}

        <Animated.View style={toastStyle} pointerEvents="none">
          <Text style={{ color: T.bg, fontSize: 13 }}>{toast}</Text>
        </Animated.View>
        {showSettings && <SettingsScreen />}
      </View>
    </AppCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────
//  AUTH SCREEN
// ─────────────────────────────────────────────────────────────────
function AuthScreen({ email, pw, authMode, setAuthMode, doLogin, doSignup, doKakaoLogin }) {
  const { T } = useApp();
  const [em, setEm] = useState(email);
  const [p, setP] = useState(pw);
  const [loading, setLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);

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

  const handleKakao = async () => {
    setKakaoLoading(true);
    await doKakaoLogin();
    setKakaoLoading(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 40, maxWidth: 400, alignSelf: 'center', width: '100%' }}>
        <View style={{ marginBottom: 28, alignItems: 'center' }}>
          <BookMarked size={40} color={T.warmBrown} strokeWidth={2} style={{ marginBottom: 16 }} />
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

        <View style={{ backgroundColor: T.paper, borderRadius: 20, borderWidth: 2, borderColor: T.olive, padding: 20, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>이메일</Text>
            <TextInput
              style={{ backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: T.rule2, color: T.ink, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontFamily: 'sans-serif' }}
              placeholder="example@email.com"
              placeholderTextColor={T.ink4}
              value={em}
              onChangeText={setEm}
              editable={!loading}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>비밀번호</Text>
            <TextInput
              style={{ backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: T.rule2, color: T.ink, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontFamily: 'sans-serif' }}
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
            disabled={loading || kakaoLoading}
            style={{ backgroundColor: T.warmBrown, borderRadius: 14, paddingVertical: 12, alignItems: 'center', opacity: loading ? 0.5 : 1 }}>
            <Text style={{ color: T.paper, fontSize: 14, fontWeight: '600' }}>
              {loading ? '처리 중...' : (authMode === 'login' ? '로그인' : '가입하기')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: T.rule2 }} />
          <Text style={{ fontSize: 12, color: T.ink4 }}>또는</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: T.rule2 }} />
        </View>

        {/* 카카오 로그인 */}
        <TouchableOpacity
          onPress={handleKakao}
          disabled={loading || kakaoLoading}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            backgroundColor: '#FEE500', borderRadius: 14, paddingVertical: 13,
            opacity: kakaoLoading ? 0.6 : 1,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08, shadowRadius: 3, elevation: 1,
          }}>
          {/* 카카오 심볼 */}
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.85)',
            alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 12, fontWeight: '900', color: '#FEE500', lineHeight: 14 }}>K</Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: 'rgba(0,0,0,0.85)' }}>
            {kakaoLoading ? '연결 중...' : '카카오로 로그인'}
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────
//  TOP BAR
// ─────────────────────────────────────────────────────────────────
function TopBar() {
  const { T, theme, toggleTheme, setTab, profile, setShowSettings } = useApp();
  const initial = profile?.nickname?.trim()?.[0]?.toUpperCase() || 'A';
  return (
    <View style={{
      height: 56, paddingHorizontal: 20, flexDirection: 'row',
      alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: T.navBg, borderBottomWidth: 1, borderBottomColor: T.rule2,
    }}>
      {/* Logo - click to go home */}
      <TouchableOpacity
        onPress={() => setTab('home')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <BookMarked size={20} color={T.warmBrown} strokeWidth={2} />
        <Text style={{ fontFamily: 'serif', fontSize: 20, fontWeight: '700', color: T.ink, letterSpacing: -0.3 }}>
          My Avoca
        </Text>
      </TouchableOpacity>

      {/* Right controls: Theme + Settings */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Settings button */}
        <TouchableOpacity
          onPress={() => setShowSettings(true)}
          style={{
            width: 40, height: 40, borderRadius: 14, borderWidth: 1,
            borderColor: T.rule2, alignItems: 'center', justifyContent: 'center',
            backgroundColor: T.paper, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
          }}>
          <Settings size={18} color={T.ink3} strokeWidth={2} />
        </TouchableOpacity>

        {/* Theme toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            width: 40, height: 40, borderRadius: 14, borderWidth: 1,
            borderColor: T.rule2, alignItems: 'center', justifyContent: 'center',
            backgroundColor: T.paper, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
          }}>
          {theme === 'dark'
            ? <Sun size={16} color={T.amber} strokeWidth={2} />
            : <Moon size={16} color={T.ink3} strokeWidth={2} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
//  BOTTOM NAV
// ─────────────────────────────────────────────────────────────────
function BottomNav() {
  const { T, tab, setTab } = useApp();
  const items = [
    { key: 'home',        label: '홈',      Icon: Plus },
    { key: 'categories',  label: '단어장',  Icon: Layers },
    { key: 'quiz',        label: '퀴즈',    Icon: BrainCircuit },
    { key: 'avocado',     label: '아보카도', Icon: Leaf },
    { key: 'leaderboard', label: '순위',    Icon: Trophy },
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
              color={active ? T.warmBrown : T.ink4}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <Text style={{
              fontSize: 10,
              color: active ? T.warmBrown : T.ink4,
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
  const { T, addWords, showToast, geminiKey, setTab, setShowSettings, avocado, addCoins } = useApp();
  const [inputText, setInputText]   = useState('');
  const [loading, setLoading]       = useState(false);
  const [showAI, setShowAI]         = useState(false);  // AI 섹션 (접힘 상태)
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
        { text: '설정으로', onPress: () => setShowSettings(true) },
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

    // 코인 시스템: 하루 3개 제한, 각 3코인
    if (avocado.dailyCoinsFromWords < 3) {
      addCoins(3);
      const remaining = 2 - avocado.dailyCoinsFromWords;
      showToast(`✅ 단어 추가됨 (+3 🪙, 오늘 ${remaining}개 남음)`);
    } else {
      showToast('✅ 단어 추가됨 (코인 획득량 한계 도달)');
    }
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

        {/* ── 수동 추가 카드 (메인) ── */}
        <Card>
          <CardTitle icon={<Pencil size={15} color={T.blue} />} title="수동으로 단어 추가" T={T} />

          <View style={{ gap: 10 }}>
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
                        <Text style={{ color: t === mType ? T.warmBrown : T.ink, fontSize: 14, fontWeight: t === mType ? '600' : '400' }}>{t}</Text>
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
                  flex: 1, backgroundColor: T.warmBrown, borderRadius: 12, paddingVertical: 13,
                  alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
                  shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
                }}>
                <Check size={15} color={T.paper} />
                <Text style={{ color: T.paper, fontSize: 14, fontWeight: '600' }}>단어 저장</Text>
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
        </Card>

        {/* ── AI로 단어 추가 (아코디언) ── */}
        <Card>
          <TouchableOpacity
            onPress={() => setShowAI(!showAI)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle icon={<Sparkles size={15} color={T.ink3} />} title="AI로 단어 추가" T={T} noLine />
            {showAI
              ? <ChevronUp size={16} color={T.ink3} />
              : <ChevronDown size={16} color={T.ink3} />}
          </TouchableOpacity>

          {showAI && (
            <View style={{ marginTop: 14, gap: 10 }}>
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
                    flex: 1, backgroundColor: T.warmBrown, borderRadius: 14, paddingVertical: 13,
                    alignItems: 'center', opacity: loading ? 0.5 : 1,
                    flexDirection: 'row', justifyContent: 'center', gap: 6,
                    shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
                  }}>
                  {loading
                    ? <Text style={{ color: T.paper, fontSize: 14, fontWeight: '600' }}>처리 중...</Text>
                    : <>
                        <Sparkles size={15} color={T.paper} />
                        <Text style={{ color: T.paper, fontSize: 14, fontWeight: '600' }}>AI로 단어 추가하기</Text>
                      </>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setInputText('')}
                  style={{
                    paddingHorizontal: 16, borderRadius: 12, borderWidth: 1,
                    borderColor: T.rule2, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: T.paper, shadowColor: T.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
                  }}>
                  <X size={16} color={T.ink3} />
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
//  LIST SCREEN (카테고리 기반)
// ─────────────────────────────────────────────────────────────────
function ListScreen() {
  const { T, words, deleteWord, toggleMemorized, showToast, categories, customCategories, selectedCategory, setSelectedCategory, addCategory } = useApp();
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');  // all | todo | done
  const [page, setPage]         = useState(1);
  const [detailWord, setDetail] = useState(null);
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // 모든 카테고리 (기본 + 커스텀)
  const allCats = useMemo(() => [...categories, ...customCategories], [categories, customCategories]);

  // 선택된 카테고리의 단어들
  const catWords = useMemo(() => {
    const cat = allCats.find(c => c.id === selectedCategory);
    if (!cat) return [];
    // cat.words가 있으면 사용, 아니면 전체 words 중 category 필드로 필터
    if (cat.words && cat.words.length > 0) {
      return cat.words;
    }
    return words.filter(w => w.category === selectedCategory);
  }, [selectedCategory, allCats, words]);

  const filtered = useMemo(() => {
    let w = catWords;
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
  }, [catWords, filter, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [filter, search, selectedCategory]);

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
        borderWidth: filter === value ? 2 : 1,
        borderColor: filter === value ? T.warmBrown : T.rule2,
        backgroundColor: filter === value ? T.brownBg : 'transparent',
      }}>
      <Text style={{ fontSize: 12, color: filter === value ? T.warmBrown : T.ink3, fontWeight: filter === value ? '600' : '400' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* 카테고리 탭 */}
      <View style={{
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
        backgroundColor: T.bg,
        borderBottomWidth: 1, borderBottomColor: T.rule2,
      }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {allCats.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16,
                  borderWidth: selectedCategory === cat.id ? 2 : 1,
                  borderColor: selectedCategory === cat.id ? T.warmBrown : T.rule2,
                  backgroundColor: selectedCategory === cat.id ? T.brownBg : 'transparent',
                }}>
                <Text style={{
                  fontSize: 12, fontWeight: selectedCategory === cat.id ? '600' : '400',
                  color: selectedCategory === cat.id ? T.warmBrown : T.ink3,
                }}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowNewCatModal(true)}
              style={{
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16,
                borderWidth: 1, borderColor: T.rule2, borderStyle: 'dashed',
              }}>
              <Text style={{ fontSize: 12, color: T.ink3 }}>+ 새 카테고리</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* 필터 & 검색 */}
      <View style={{
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
        flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        backgroundColor: T.bg,
      }}>
        <Text style={{ fontFamily: 'serif', fontSize: 14, fontWeight: '700', color: T.ink, marginRight: 4 }}>
          {filtered.length}개
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

      {/* 단어 목록 */}
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

      {/* New Category Modal */}
      <Modal visible={showNewCatModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 16 }}>
          <View style={{ backgroundColor: T.paper, borderRadius: 20, borderWidth: 2, borderColor: T.olive, padding: 20, shadowColor: T.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 5 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: T.ink, marginBottom: 16 }}>
              새 카테고리 만들기
            </Text>
            <TextInput
              style={{
                backgroundColor: T.bg, borderWidth: 1, borderColor: T.rule2,
                borderRadius: 14, color: T.ink, fontSize: 14, padding: 12,
                marginBottom: 16,
              }}
              placeholder="카테고리 이름"
              placeholderTextColor={T.ink4}
              value={newCatName}
              onChangeText={setNewCatName}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: T.paper2, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: T.rule2 }}
                onPress={() => { setShowNewCatModal(false); setNewCatName(''); }}>
                <Text style={{ color: T.ink, fontWeight: '600' }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: T.warmBrown, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                onPress={() => {
                  if (newCatName.trim()) {
                    const catId = addCategory(newCatName);
                    setSelectedCategory(catId);
                    setShowNewCatModal(false);
                    setNewCatName('');
                    showToast(`✅ 카테고리 "${newCatName}" 추가됨`);
                  }
                }}>
                <Text style={{ color: T.paper, fontWeight: '600' }}>만들기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function WordEntry({ word: w, isFirst, isLast, isOnly, T, onToggle, onDelete, onPress }) {
  const radius = {
    borderTopLeftRadius:    (isFirst || isOnly) ? 18 : 0,
    borderTopRightRadius:   (isFirst || isOnly) ? 18 : 0,
    borderBottomLeftRadius: (isLast  || isOnly) ? 18 : 0,
    borderBottomRightRadius:(isLast  || isOnly) ? 18 : 0,
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
            backgroundColor: T.brownBg, borderWidth: 1, borderColor: T.brownBorder,
            borderRadius: 16, paddingHorizontal: 10, paddingVertical: 3,
          }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 10, color: T.warmBrown, fontWeight: '600' }}>{w.type}</Text>
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
        minWidth: 34, height: 34, borderRadius: 8, borderWidth: active ? 2 : 1,
        borderColor: active ? T.warmBrown : T.rule2,
        backgroundColor: active ? T.brownBg : T.paper,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
        opacity: disabled ? 0.3 : 1,
      }}>
      {typeof label === 'string'
        ? <Text style={{ fontSize: 13, color: active ? T.warmBrown : T.ink2, fontFamily: 'monospace', fontWeight: active ? '600' : '400' }}>{label}</Text>
        : label}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────
//  QUIZ SCREEN
// ─────────────────────────────────────────────────────────────────
function QuizScreen() {
  const { T, words, avocado, addCoins, showToast, categories, customCategories, selectedCategory, setSelectedCategory } = useApp();
  const [view, setView]     = useState('setup');  // setup | session | result
  const [queue, setQueue]   = useState([]);
  const [idx, setIdx]       = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [know, setKnow]     = useState(0);
  const [hard, setHard]     = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [onlyMemorized, setOnlyMemorized] = useState(false);  // 암기완료만 필터
  const flipAnim            = useRef(new Animated.Value(0)).current;

  // 모든 카테고리
  const allCats = useMemo(() => [...categories, ...customCategories], [categories, customCategories]);

  // 선택된 카테고리의 단어들
  const catWords = useMemo(() => {
    const cat = allCats.find(c => c.id === selectedCategory);
    if (!cat) return [];
    if (cat.words && cat.words.length > 0) {
      return cat.words;
    }
    return words.filter(w => w.category === selectedCategory);
  }, [selectedCategory, allCats, words]);

  const todoWords = catWords.filter(w => !w.memorized);
  const doneWords = catWords.filter(w => w.memorized);

  const startQuiz = () => {
    let pool = onlyMemorized ? doneWords : (todoWords.length >= 5 ? todoWords : catWords);
    if (pool.length === 0) {
      Alert.alert('단어 없음', '퀴즈할 단어를 먼저 추가해주세요.');
      return;
    }
    setQueue(shuffle(pool).slice(0, Math.min(pool.length, 20)));
    setIdx(0); setKnow(0); setHard(0); setFlipped(false);
    setEarnedCoins(0);
    flipAnim.setValue(0);
    setView('session');
  };

  const flip = () => {
    Animated.timing(flipAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    setFlipped(true);
  };

  const next = (result) => {
    if (result === 'know') {
      setKnow(k => k + 1);
      // 코인 획득: +1 (하루 최대 10개)
      if (avocado.dailyCoinsFromQuiz < 10) {
        addCoins(1);
        setEarnedCoins(c => c + 1);
      }
    } else {
      setHard(h => h + 1);
    }
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

      {/* 카테고리 선택 */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 12, color: T.ink3, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' }}>
          카테고리
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {allCats.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selectedCategory === cat.id ? T.blue : T.rule2,
                  backgroundColor: selectedCategory === cat.id ? T.blueBg : 'transparent',
                }}>
                <Text style={{
                  fontSize: 12, fontWeight: selectedCategory === cat.id ? '600' : '400',
                  color: selectedCategory === cat.id ? T.blue : T.ink3,
                }}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 필터: 암기완료만 */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: T.paper, borderRadius: 12, padding: 12, marginBottom: 20,
        borderWidth: 1, borderColor: T.rule2,
      }}>
        <Text style={{ fontSize: 14, color: T.ink }}>암기완료만</Text>
        <Switch
          value={onlyMemorized}
          onValueChange={setOnlyMemorized}
          trackColor={{ false: T.rule2, true: T.blueBorder }}
          thumbColor={onlyMemorized ? T.blue : T.ink4}
        />
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {[
          { label: '전체', num: catWords.length, color: T.ink },
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
      {catWords.length > 0 && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 32, borderWidth: 4,
              borderColor: T.green, alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: T.green }}>
                {Math.round((doneWords.length / (catWords.length || 1)) * 100)}%
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: T.ink, fontWeight: '600', marginBottom: 4 }}>학습 진행률</Text>
              <View style={{ height: 6, backgroundColor: T.paper2, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{
                  height: '100%', borderRadius: 3, backgroundColor: T.green,
                  width: `${catWords.length > 0 ? (doneWords.length / catWords.length) * 100 : 0}%`,
                }} />
              </View>
              <Text style={{ fontSize: 12, color: T.ink3, marginTop: 4 }}>
                {doneWords.length} / {catWords.length} 단어 암기완료
              </Text>
            </View>
          </View>
        </Card>
      )}

      <TouchableOpacity
        onPress={startQuiz}
        style={{
          backgroundColor: T.warmBrown, borderRadius: 16, paddingVertical: 16,
          alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
          marginTop: 20, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
        }}>
        <BrainCircuit size={18} color={T.paper} />
        <Text style={{ color: T.paper, fontSize: 16, fontWeight: '600' }}>퀴즈 시작하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ── SESSION VIEW ──
  if (view === 'session' && current) return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Progress */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <View style={{ flex: 1, height: 6, backgroundColor: T.paper2, borderRadius: 3, overflow: 'hidden' }}>
          <View style={{ width: `${prog * 100}%`, height: '100%', backgroundColor: T.warmBrown, borderRadius: 3 }} />
        </View>
        <Text style={{ fontFamily: 'monospace', fontSize: 12, color: T.ink3 }}>{idx + 1}/{queue.length}</Text>
      </View>

      {/* Flash Card */}
      <View style={{
        backgroundColor: T.paper, borderRadius: 24, padding: 28,
        minHeight: 240, borderWidth: 2, borderColor: T.olive, marginBottom: 14,
        shadowColor: T.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8,
        elevation: 2, justifyContent: 'space-between',
      }}>
        {/* Type badge */}
        {current.type ? (
          <View style={{
            alignSelf: 'flex-start', backgroundColor: T.brownBg,
            borderWidth: 1, borderColor: T.brownBorder, borderRadius: 16,
            paddingHorizontal: 10, paddingVertical: 4,
          }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 10, color: T.warmBrown, letterSpacing: 0.5, fontWeight: '600' }}>{current.type}</Text>
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
            backgroundColor: T.brownBg, borderWidth: 2, borderColor: T.warmBrown,
            borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
          }}>
          <Text style={{ fontSize: 16, color: T.warmBrown, fontWeight: '600' }}>뜻 확인하기</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => next('know')}
            style={{
              flex: 1, backgroundColor: T.greenBg, borderWidth: 1, borderColor: T.greenBorder,
              borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: T.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
            }}>
            <Text style={{ fontSize: 15, color: T.green, fontWeight: '600' }}>✓ 알았어요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => next('hard')}
            style={{
              flex: 1, backgroundColor: T.amberBg, borderWidth: 1, borderColor: T.amberBorder,
              borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: T.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
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
        backgroundColor: T.paper, borderRadius: 24, padding: 36,
        alignItems: 'center', borderWidth: 2, borderColor: T.olive,
        shadowColor: T.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8,
        elevation: 2,
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

        {/* 코인 획득 표시 */}
        <View style={{
          width: '100%', backgroundColor: T.blueBg, borderRadius: 16, padding: 18,
          alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: T.blue,
        }}>
          <Text style={{ fontSize: 14, color: T.ink3, fontWeight: '500', marginBottom: 4 }}>
            이번 퀴즈에서 획득
          </Text>
          <Text style={{ fontFamily: 'serif', fontSize: 32, color: T.warmBrown, fontWeight: '700' }}>
            +{earnedCoins} 🪙
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
          <TouchableOpacity
            onPress={startQuiz}
            style={{
              flex: 1, backgroundColor: T.warmBrown, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
              shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
            }}>
            <Text style={{ color: T.paper, fontSize: 15, fontWeight: '600' }}>다시 퀴즈</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={endQuiz}
            style={{
              flex: 1, borderWidth: 1, borderColor: T.rule2, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
              backgroundColor: T.paper, shadowColor: T.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
            }}>
            <Text style={{ color: T.ink2, fontSize: 15, fontWeight: '500' }}>단어장으로</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return null;
}

// ─────────────────────────────────────────────────────────────────
//  ROOM ASSETS — image sources for room items & backgrounds
// ─────────────────────────────────────────────────────────────────

const ITEM_IMAGES = {
  // 캐릭터
  char_avocado:           require('./assets/images/items/character/basic/basic character.png'),
  char_avocado_uplifting: require('./assets/images/items/character/basic/basic uplifting.png'),
  char_avocado_happy:     require('./assets/images/items/character/basic/basic happy.png'),
  char_avocado_sad:       require('./assets/images/items/character/basic/basic sad.png'),
  char_avocado_surprised: require('./assets/images/items/character/basic/basic surprised.png'),
  // 가구 / 소품
  sofa:    require('./assets/images/items/props/sofa.png'),
  glasses: require('./assets/images/items/props/glasses.png'),
  curtain: require('./assets/images/items/props/curtain.png'),
  table:   require('./assets/images/items/props/table.png'),
  tumbler: require('./assets/images/items/props/tumbler.png'),
  // 배경
  bg_default:   require('./assets/images/items/backgrounds/bg_default.png'),
  background_2: require('./assets/images/items/backgrounds/background_2.jpg'),
  background_3: require('./assets/images/items/backgrounds/background_3.jpg'),
};

// Item display sizes (width × height in dp) — 이전값의 2배
const ITEM_SIZE = {
  char_avocado: { w: 1120, h: 1232 },
  curtain:      { w: 210, h: 250 },
  sofa:         { w: 220, h: 148 },
  table:        { w: 180, h: 126 },
  glasses:      { w: 82,  h: 40  },
  tumbler:      { w: 62,  h: 78  },
};

// All available room items (decoration drawer용)
// 새 아이템 추가 시: ITEM_IMAGES / ITEM_SIZE 에 등록 후 이 배열에 추가
const ALL_ROOM_ITEMS = [
  { id: 'char_avocado', category: '캐릭터', label: '아보카도',  free: true },
  { id: 'sofa',         category: '가구',   label: '소파',      free: true },
  { id: 'table',        category: '가구',   label: '탁자',      free: true },
  { id: 'curtain',      category: '가구',   label: '커튼',      free: true },
  { id: 'glasses',      category: '가구',   label: '안경',      free: true },
  { id: 'tumbler',      category: '가구',   label: '텀블러',    free: true },
  { id: 'bg_default',   category: '배경',   label: '기본 배경',  free: true  },
  { id: 'background_2', category: '배경',   label: '배경 2',     free: true  },
  { id: 'background_3', category: '배경',   label: '배경 3',     free: false },
];

// 상점 카탈로그 — 탭별 상품 목록
// 새 상품 추가 시: ITEM_IMAGES 에 이미지 등록 후 아래 배열에 추가
const SHOP_CATALOG = {
  캐릭터: [
    { id: 'char_avocado', label: '아보카도',   price: 0,   desc: '기본 아보카도 캐릭터',  badge: '기본' },
    { id: 'char2',        label: '눈멍이',     price: 120, desc: '순둥순둥 모습',          badge: 'NEW'  },
    { id: 'char3',        label: '키위새',     price: 120, desc: '귀여운 친구',            badge: '인기' },
    { id: 'char4',        label: '오독이',     price: 84,  desc: '통통한 아보카도',        badge: '추천' },
  ],
  가구: [
    { id: 'sofa',         label: '소파',       price: 0,   desc: '포근한 초록 소파',       badge: '기본' },
    { id: 'table',        label: '탁자',       price: 0,   desc: '원목 커피 테이블',       badge: '기본' },
    { id: 'curtain',      label: '커튼',       price: 0,   desc: '아치형 창문 커튼',       badge: '기본' },
    { id: 'glasses',      label: '안경',       price: 0,   desc: '동그란 귀여운 안경',     badge: '기본' },
    { id: 'tumbler',      label: '텀블러',     price: 0,   desc: '친환경 텀블러',          badge: '기본' },
    { id: 'room2',        label: '꽃향기 소파', price: 68, desc: '포근한 플로럴 소파',     badge: '할인' },
    { id: 'room3',        label: '레트로 선반', price: 47, desc: '복고 감성 인테리어',     badge: '할인' },
    { id: 'room4',        label: '핑크 쿠션',  price: 72,  desc: '달콤한 분위기',          badge: 'NEW'  },
  ],
  배경: [
    { id: 'bg_default',   label: '기본 배경',  price: 0,   desc: '따뜻한 아보카도 방',     badge: '기본' },
    { id: 'background_2', label: '배경 2',     price: 0,   desc: '새로운 무료 배경',        badge: '무료' },
    { id: 'background_3', label: '배경 3',     price: 100, desc: '특별한 프리미엄 배경',    badge: 'NEW'  },
    { id: 'building2',    label: '카페 하우스', price: 90, desc: '아늑한 카페 배경',       badge: '추천' },
    { id: 'building3',    label: '숲속 오두막', price: 120, desc: '자연 속 힐링 공간',     badge: '인기' },
    { id: 'building4',    label: '루프탑',     price: 110, desc: '하늘을 바라보는 공간',   badge: 'NEW'  },
  ],
};

// Render a room item thumbnail (used in drawer)
function RoomItemThumb({ itemId }) {
  const src = ITEM_IMAGES[itemId];
  if (!src) return <Text style={{ fontSize: 24 }}>🎁</Text>;
  return <Image source={src} style={{ width: 56, height: 56 }} resizeMode="contain" />;
}

// Draggable placed-item wrapper
// - 짧은 드래그(>4px 이동): 위치 이동
// - 제자리에서 600ms 유지: 제거
function DraggableRoomItem({ placedItem, onUpdatePosition, onRemove }) {
  const size     = ITEM_SIZE[placedItem.itemId] || { w: 80, h: 80 };
  const src      = ITEM_IMAGES[placedItem.itemId];
  const pan      = useRef(new Animated.ValueXY({ x: placedItem.x, y: placedItem.y })).current;
  const cbRef    = useRef({ onUpdatePosition, onRemove });
  const dragging = useRef(false);
  const longPressTimer = useRef(null);
  cbRef.current = { onUpdatePosition, onRemove };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4,

      onPanResponderGrant: () => {
        dragging.current = false;
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
        // 롱프레스 타이머 시작
        longPressTimer.current = setTimeout(() => {
          if (!dragging.current) cbRef.current.onRemove(placedItem.id);
        }, 650);
      },

      onPanResponderMove: (_, gs) => {
        if (Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4) {
          dragging.current = true;
          clearTimeout(longPressTimer.current);
        }
        pan.setValue({ x: gs.dx, y: gs.dy });
      },

      onPanResponderRelease: () => {
        clearTimeout(longPressTimer.current);
        pan.flattenOffset();
        cbRef.current.onUpdatePosition(placedItem.id, pan.x._value, pan.y._value);
      },

      onPanResponderTerminate: () => {
        clearTimeout(longPressTimer.current);
        pan.flattenOffset();
      },
    })
  ).current;

  if (!src) return null;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
        zIndex: dragging.current ? 30 : 20,
      }}
      {...panResponder.panHandlers}>
      <Image source={src} style={{ width: size.w, height: size.h }} resizeMode="contain" />
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
//  LEADERBOARD SCREEN
// ─────────────────────────────────────────────────────────────────
function LeaderboardScreen() {
  const { T, sbUser, avocado, profile, leaderboard, leaderboardLoading, fetchLeaderboard } = useApp();
  const [rankTab, setRankTab] = useState('streak'); // 'streak' | 'coins'

  useEffect(() => { fetchLeaderboard(); }, []);

  const currentMonth = today().slice(0, 7);
  const monthLabel = (() => {
    const [y, m] = currentMonth.split('-');
    return `${y}년 ${parseInt(m)}월`;
  })();

  const data = rankTab === 'streak' ? leaderboard.streak : leaderboard.coins;

  function RankRow({ item, index }) {
    const isMe = sbUser && item.user_id === sbUser.id;
    const rankColors = ['#c9a227', '#9aa4b2', '#b87333'];
    const rankBg     = index < 3 ? (rankColors[index] + '22') : 'transparent';
    const rankNumColor = index < 3 ? rankColors[index] : T.ink3;

    return (
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, paddingHorizontal: 16,
        backgroundColor: isMe ? T.brownBg : rankBg,
        borderRadius: 16,
        borderWidth: isMe ? 1.5 : 0,
        borderColor: isMe ? T.warmBrown : 'transparent',
        marginBottom: 8,
      }}>
        {/* 등수 */}
        <View style={{ width: 32, alignItems: 'center' }}>
          {index < 3 ? (
            <Text style={{ fontSize: 18 }}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
            </Text>
          ) : (
            <Text style={{ fontSize: 14, fontWeight: '700', color: rankNumColor }}>
              {index + 1}
            </Text>
          )}
        </View>

        {/* 프로필 */}
        <View style={{ width: 40, height: 40, borderRadius: 20, marginHorizontal: 12,
          backgroundColor: T.paper2, alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', borderWidth: 1.5, borderColor: isMe ? T.warmBrown : T.rule2 }}>
          {item.photo_uri ? (
            <Image source={{ uri: item.photo_uri }} style={{ width: 40, height: 40 }} resizeMode="cover" />
          ) : (
            <Text style={{ fontSize: 20 }}>{item.photo || '🥑'}</Text>
          )}
        </View>

        {/* 닉네임 + 수치 */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: isMe ? '700' : '500', color: T.ink }} numberOfLines={1}>
            {item.nickname || '익명'}{isMe ? ' (나)' : ''}
          </Text>
          <Text style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>
            {rankTab === 'streak'
              ? `🔥 ${item.streak ?? 0}일 연속`
              : `🪙 ${item.monthly_coins ?? 0} 코인`}
          </Text>
        </View>
      </View>
    );
  }

  if (!sbUser) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Trophy size={48} color={T.ink4} strokeWidth={1.5} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: T.ink, marginTop: 16, marginBottom: 8 }}>리더보드</Text>
        <Text style={{ fontSize: 13, color: T.ink3, textAlign: 'center', lineHeight: 20 }}>
          로그인하면 다른 사용자와{'\n'}순위를 비교할 수 있어요.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* 헤더 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Trophy size={22} color={T.warmBrown} strokeWidth={2} />
          <Text style={{ fontSize: 20, fontWeight: '700', color: T.ink }}>리더보드</Text>
        </View>
        <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 16 }}>
          {monthLabel} 기준 · 매달 1일 초기화
        </Text>

        {/* 내 현황 카드 */}
        <View style={{ backgroundColor: T.paper, borderRadius: 20, borderWidth: 2, borderColor: T.olive,
          padding: 16, marginBottom: 16, flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, alignItems: 'center', backgroundColor: T.brownBg,
            borderRadius: 14, padding: 12 }}>
            <Text style={{ fontSize: 11, color: T.ink3 }}>이번 달 연속 출석</Text>
            <Text style={{ fontSize: 26, fontWeight: '700', color: T.warmBrown, marginTop: 4 }}>
              {avocado.streak || 0}
            </Text>
            <Text style={{ fontSize: 11, color: T.ink3 }}>일</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center', backgroundColor: T.brownBg,
            borderRadius: 14, padding: 12 }}>
            <Text style={{ fontSize: 11, color: T.ink3 }}>이번 달 획득 코인</Text>
            <Text style={{ fontSize: 26, fontWeight: '700', color: T.warmBrown, marginTop: 4 }}>
              {avocado.monthlyCoinsEarned || 0}
            </Text>
            <Text style={{ fontSize: 11, color: T.ink3 }}>🪙</Text>
          </View>
        </View>

        {/* 탭 선택 */}
        <View style={{ flexDirection: 'row', backgroundColor: T.paper2, borderRadius: 14,
          padding: 3, marginBottom: 16, borderWidth: 1, borderColor: T.rule2 }}>
          {[
            { key: 'streak', label: '🔥 연속 출석 순위' },
            { key: 'coins',  label: '🪙 코인 획득 순위' },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setRankTab(key)}
              style={{ flex: 1, paddingVertical: 9, borderRadius: 11,
                backgroundColor: rankTab === key ? T.paper : 'transparent',
                alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: rankTab === key ? '700' : '400',
                color: rankTab === key ? T.ink : T.ink3 }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 순위 리스트 */}
        {leaderboardLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: T.ink3 }}>불러오는 중...</Text>
          </View>
        ) : data.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🌱</Text>
            <Text style={{ fontSize: 14, color: T.ink3 }}>아직 기록이 없어요</Text>
          </View>
        ) : (
          data.map((item, i) => <RankRow key={item.user_id} item={item} index={i} />)
        )}

        {/* 새로고침 버튼 */}
        <TouchableOpacity
          onPress={fetchLeaderboard}
          style={{ marginTop: 12, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10,
            borderRadius: 20, borderWidth: 1, borderColor: T.rule2, backgroundColor: T.paper }}>
          <Text style={{ fontSize: 12, color: T.ink3 }}>새로고침</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
//  AVOCADO SCREEN
// ─────────────────────────────────────────────────────────────────
function AvocadoScreen() {
  const { T, avocado, useCoins, careAvocado, showToast, profile, sbUser } = useApp();
  const [viewMode, setViewMode] = useState('home');
  const [storeTab, setStoreTab] = useState('캐릭터');
  const [ownedItems, setOwnedItems] = useState([
    'char1', 'room1', 'building1', 'char_avocado', 'bg_default',
  ]);
  const [wateringCanCount, setWateringCanCount] = useState(0);
  const [equipped, setEquipped] = useState({ 캐릭터: 'char1', 방: 'room1', 건물: 'building1' });

  // 캐릭터 상태 & 애니메이션
  const [charState, setCharState] = useState('idle'); // idle | uplifting | happy | sad | surprised
  const charStateTimer = useRef(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const bounceLoop = useRef(null);

  const startBounce = () => {
    if (bounceLoop.current) bounceLoop.current.stop();
    bounceAnim.setValue(0);
    bounceLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -10, duration: 250, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0,   duration: 250, useNativeDriver: true }),
      ])
    );
    bounceLoop.current.start();
  };

  const stopBounce = () => {
    if (bounceLoop.current) { bounceLoop.current.stop(); bounceLoop.current = null; }
    Animated.timing(bounceAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start();
  };

  const triggerCharState = (state, duration = 2000) => {
    clearTimeout(charStateTimer.current);
    setCharState(state);
    startBounce();
    charStateTimer.current = setTimeout(() => {
      setCharState('idle');
      stopBounce();
    }, duration);
  };

  // Lottie 애니메이션 참조
  const lottieRef = useRef(null);

  const handleCharacterTap = () => {
    // 애니메이션 재생
    if (lottieRef.current) {
      lottieRef.current.play();
    }
    
    tapCountRef.current += 1;
    clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      triggerCharState(Math.random() < 0.5 ? 'sad' : 'surprised');
    } else {
      triggerCharState('uplifting');
      tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 600);
    }
  };
  const [search, setSearch] = useState('');
  const [discountOnly, setDiscountOnly] = useState(false);

  // Room decoration state
  const [roomBg, setRoomBg] = useState('bg_default');
  const [roomLayout, setRoomLayout] = useState({ w: 360, h: 480 });

  // 캐릭터 고정 위치 + 크기 계산 (방 크기에 비례한 responsive 사이징)
  // 방 너비의 65%를 캐릭터 너비로 사용, 세로는 비율 유지
  const charFixedPos = (rw, rh, itemId) => {
    const base = ITEM_SIZE[itemId] || { w: 280, h: 308 };
    const w = Math.round(rw * 0.40);
    const h = Math.round(w * (base.h / base.w));
    return {
      x: Math.round((rw - w) / 2),
      y: Math.round(rh * 0.58),
      w,
      h,
    };
  };

  // 로드된 배치 목록에서 캐릭터 좌표를 항상 고정값으로 덮어씀
  const enforceCharPositions = (items, rw, rh) =>
    items.map(item => {
      const meta = ALL_ROOM_ITEMS.find(i => i.id === item.itemId);
      if (meta?.category === '캐릭터') {
        return { ...item, ...charFixedPos(rw, rh, item.itemId) };
      }
      return item;
    });

  // 방 크기 기반 초기 배치 계산 — 캐릭터만
  const makeInitialItems = (rw, rh) => {
    const av = charFixedPos(rw, rh, 'char_avocado');
    return [
      { id: 'pi_avocado', itemId: 'char_avocado', ...av },
    ];
  };

  const [placedItems, setPlacedItems] = useState(() => makeInitialItems(360, 480));
  const layoutInitialized = useRef(false);
  const saveTimer = useRef(null);

  // ── 방 상태 저장 키
  const ROOM_STATE_KEY = 'myvocab_room_state';

  // 구매제 전환 전 자동 지급된 소품 목록 — 로드 시 소장/배치에서 제거
  const LEGACY_FREE_PROPS = ['sofa', 'table', 'curtain', 'glasses', 'tumbler'];

  const migratePlaced = (items, rw, rh) => {
    const cleaned = items.filter(p => !LEGACY_FREE_PROPS.includes(p.itemId));
    const hasChar = cleaned.some(p => {
      const meta = ALL_ROOM_ITEMS.find(i => i.id === p.itemId);
      return meta?.category === '캐릭터';
    });
    const base = hasChar ? cleaned : [...cleaned, ...makeInitialItems(rw, rh)];
    return enforceCharPositions(base, rw, rh);
  };

  const migrateOwned = (items) =>
    items.filter(id => !LEGACY_FREE_PROPS.includes(id));

  // ── Supabase or AsyncStorage 로드
  const loadRoomState = useCallback(async (rw, rh) => {
    try {
      if (sbUser) {
        const { data } = await sbClient
          .from('user_room_state')
          .select('room_bg, placed_items, owned_items')
          .eq('user_id', sbUser.id)
          .maybeSingle();
        if (data) {
          if (data.room_bg) setRoomBg(data.room_bg);
          if (Array.isArray(data.placed_items) && data.placed_items.length > 0)
            setPlacedItems(migratePlaced(data.placed_items, rw, rh));
          else
            setPlacedItems(makeInitialItems(rw, rh));
          if (Array.isArray(data.owned_items) && data.owned_items.length > 0)
            setOwnedItems(migrateOwned(data.owned_items));
          if (typeof data.watering_can_count === 'number')
            setWateringCanCount(data.watering_can_count);
          return;
        }
      }
      // 비로그인 또는 Supabase에 데이터 없음 → AsyncStorage
      const saved = await AsyncStorage.getItem(ROOM_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.roomBg) setRoomBg(parsed.roomBg);
        const rawPlaced = Array.isArray(parsed.placedItems) ? parsed.placedItems : [];
        setPlacedItems(migratePlaced(rawPlaced, rw, rh));
        if (Array.isArray(parsed.ownedItems) && parsed.ownedItems.length > 0)
          setOwnedItems(migrateOwned(parsed.ownedItems));
        if (typeof parsed.wateringCanCount === 'number')
          setWateringCanCount(parsed.wateringCanCount);
      } else {
        setPlacedItems(makeInitialItems(rw, rh));
      }
    } catch (e) {
      console.warn('loadRoomState error:', e);
    }
  }, [sbUser]);

  // ── 저장 (변경 후 1.5초 debounce)
  const persistRoomState = useCallback((bg, items, owned, canCount) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        if (sbUser) {
          await sbClient.from('user_room_state').upsert({
            user_id: sbUser.id,
            room_bg: bg,
            placed_items: items,
            owned_items: owned,
            watering_can_count: canCount,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        } else {
          await AsyncStorage.setItem(ROOM_STATE_KEY,
            JSON.stringify({ roomBg: bg, placedItems: items, ownedItems: owned, wateringCanCount: canCount }));
        }
      } catch (e) {
        console.warn('persistRoomState error:', e);
      }
    }, 1500);
  }, [sbUser]);

  // ── 방 레이아웃 측정 후 첫 1회: 실제 크기로 재계산 + 저장된 상태 로드
  const onRoomLayout = useCallback((e) => {
    if (layoutInitialized.current) return;
    layoutInitialized.current = true;
    const { width: rw, height: rh } = e.nativeEvent.layout;
    setRoomLayout({ w: rw, h: rh });
    loadRoomState(rw, rh);
  }, [loadRoomState]);

  // ── 로그인/로그아웃 시 방 상태 재로드
  useEffect(() => {
    if (layoutInitialized.current) {
      loadRoomState(roomLayout.w, roomLayout.h);
    }
  }, [sbUser]);

  // ── 상태 변경 시 자동 저장
  useEffect(() => {
    persistRoomState(roomBg, placedItems, ownedItems, wateringCanCount);
  }, [roomBg, placedItems, ownedItems, wateringCanCount]);
  const [showDecorDrawer, setShowDecorDrawer] = useState(false);
  const [decorTab, setDecorTab] = useState('가구');
  const drawerAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setShowDecorDrawer(true);
    Animated.spring(drawerAnim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 200 }).start();
  };
  const closeDrawer = () => {
    Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }).start(() => setShowDecorDrawer(false));
  };

  const addItemToRoom = (itemId) => {
    const itemData = ALL_ROOM_ITEMS.find(i => i.id === itemId);
    // 배경은 교체
    if (itemData?.category === '배경') {
      setRoomBg(itemId);
      showToast('배경을 변경했어요');
      closeDrawer();
      return;
    }
    const already = placedItems.find(p => p.itemId === itemId);
    if (already) { showToast('이미 배치되어 있어요'); return; }
    const newId = `pi_${itemId}_${Date.now()}`;
    // 캐릭터는 항상 고정 위치 (bottom 40%, 수평 중앙)
    const pos = itemData?.category === '캐릭터'
      ? charFixedPos(roomLayout.w, roomLayout.h, itemId)
      : { x: Math.round(roomLayout.w * 0.10), y: Math.round(roomLayout.h * 0.50) };
    setPlacedItems(prev => [...prev, { id: newId, itemId, ...pos }]);
    showToast(itemData?.category === '캐릭터' ? '캐릭터를 배치했어요!' : '방에 배치했어요! 드래그해서 이동하세요');
    closeDrawer();
  };
  const updateItemPosition = (id, x, y) => {
    setPlacedItems(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
  };
  const removeItemFromRoom = (id) => {
    setPlacedItems(prev => prev.filter(p => p.id !== id));
    showToast('아이템을 제거했어요');
  };

  const decorTabs = ['캐릭터', '가구', '배경'];
  const decorItems = ALL_ROOM_ITEMS.filter(item => item.category === decorTab && ownedItems.includes(item.id));

  const caresUntilNextLevel = avocado.level === 1 ? 25 : (avocado.level === 2 ? 50 : 999);
  const caresNeeded = Math.max(caresUntilNextLevel - avocado.totalCares, 0);
  const nextLevelPercent = Math.min((avocado.totalCares / caresUntilNextLevel) * 100, 100);

  const storeTabs = ['캐릭터', '가구', '배경'];

  const owned = (id) => ownedItems.includes(id);

  const handlePurchase = (item) => {
    if (item.id === 'watering_can') {
      if (!useCoins(50)) { showToast('코인이 부족해요'); return; }
      setWateringCanCount(prev => prev + 1);
      showToast('✅ 물뿌리개 구매 완료! 아보카도에게 물을 줘보세요 🪣');
      return;
    }
    if (owned(item.id)) {
      if (storeTab === '배경' && ITEM_IMAGES[item.id]) {
        setRoomBg(item.id);
        showToast('✔️ 배경 적용 완료');
      } else {
        showToast('이미 보유 중이에요');
      }
      return;
    }
    if (item.price > 0 && !useCoins(item.price)) {
      showToast('코인이 부족해요');
      return;
    }
    setOwnedItems(prev => [...prev, item.id]);
    showToast(`✅ ${item.label} 구매 완료! 🎨 버튼으로 방에 배치하세요`);
  };

  const shopItems = (SHOP_CATALOG[storeTab] || []).filter(item => {
    const keyword = search.trim().toLowerCase();
    const matches = item.label.toLowerCase().includes(keyword) || item.desc.toLowerCase().includes(keyword);
    return matches && (!discountOnly || item.badge === '할인');
  });

  const renderBadge = (badge) => (
    <View style={{ backgroundColor: badge === '할인' ? T.amberBg : T.brownBg, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8 }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: badge === '할인' ? T.amber : T.warmBrown }}>{badge}</Text>
    </View>
  );

  if (viewMode === 'shop') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#f2f5f0' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <TouchableOpacity
            onPress={() => setViewMode('home')}
            style={{ width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: T.rule2, alignItems: 'center', justifyContent: 'center', backgroundColor: T.paper }}>
            <ChevronLeft size={18} color={T.ink4} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '800', color: T.ink }}>상점</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ backgroundColor: T.paper, borderRadius: 24, padding: 18, borderWidth: 2, borderColor: T.olive, marginBottom: 12, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 }}>
          <Text style={{ fontSize: 14, color: T.ink3, marginBottom: 8 }}>보유 코인</Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: T.warmBrown }}>{avocado.coins} 🪙</Text>
        </View>

        {/* 물뿌리개 구매 카드 */}
        <View style={{ backgroundColor: '#e8f5e4', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#b8dcb0', marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#d0edca', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 30 }}>🪣</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: T.ink, marginBottom: 2 }}>물뿌리개</Text>
            <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 6 }}>아보카도에게 물을 줘서 성장시켜요</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: T.warmBrown }}>50 🪙 · 보유 {wateringCanCount}개</Text>
          </View>
          <TouchableOpacity
            onPress={() => handlePurchase({ id: 'watering_can', label: '물뿌리개', price: 50 })}
            style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: T.warmBrown, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>구매</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {storeTabs.map(tabName => (
            <TouchableOpacity
              key={tabName}
              onPress={() => setStoreTab(tabName)}
              style={{
                flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: 'center',
                backgroundColor: storeTab === tabName ? T.brownBg : T.paper,
                borderWidth: storeTab === tabName ? 2 : 1, borderColor: storeTab === tabName ? T.warmBrown : T.rule2,
              }}>
              <Text style={{ color: storeTab === tabName ? T.warmBrown : T.ink, fontWeight: storeTab === tabName ? '700' : '500' }}>{tabName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ backgroundColor: T.paper, borderRadius: 18, borderWidth: 1, borderColor: T.rule2, padding: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, backgroundColor: T.bg, borderRadius: 14, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: T.rule2 }}>
            <Search size={16} color={T.ink3} />
            <TextInput
              style={{ flex: 1, fontSize: 13, color: T.ink }}
              placeholder="검색하세요"
              placeholderTextColor={T.ink4}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            onPress={() => setDiscountOnly(prev => !prev)}
            style={{ marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: discountOnly ? T.brownBg : T.paper2, borderWidth: 1, borderColor: discountOnly ? T.brownBorder : T.rule2 }}>
            <Text style={{ fontSize: 12, color: discountOnly ? T.warmBrown : T.ink3, fontWeight: discountOnly ? '600' : '400' }}>{discountOnly ? '할인 중만 보기' : '할인 중만 보기'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: T.ink }}>아이템 목록</Text>
          <Text style={{ fontSize: 12, color: T.ink3 }}>{shopItems.length}개</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          {shopItems.map(item => {
            const alreadyOwned = owned(item.id);
            const hasImg = !!ITEM_IMAGES[item.id];
            const isBg   = storeTab === '배경';
            const isActiveBg = isBg && roomBg === item.id;
            return (
              <View key={item.id} style={{ width: '48%', backgroundColor: T.paper, borderRadius: 20, borderWidth: 1.5, borderColor: alreadyOwned ? T.brownBorder : T.rule2, padding: 14 }}>
                {renderBadge(item.badge)}
                <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 8 }}>
                  {item.price > 0 ? `${item.price} 🪙` : '무료'}
                </Text>
                {/* 아이템 미리보기 */}
                <View style={{ height: 100, borderRadius: 16, backgroundColor: '#f0f5ed', marginBottom: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {hasImg ? (
                    <Image
                      source={ITEM_IMAGES[item.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={{ fontSize: 34 }}>
                      {storeTab === '캐릭터' ? '🥑' : storeTab === '가구' ? '🛋️' : '🏠'}
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: T.ink, marginBottom: 4 }}>{item.label}</Text>
                <Text style={{ fontSize: 11, color: T.ink3, marginBottom: 12 }}>{item.desc}</Text>
                <TouchableOpacity
                  onPress={() => handlePurchase(item)}
                  style={{
                    paddingVertical: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1.5,
                    backgroundColor: isActiveBg ? T.greenBg : alreadyOwned ? T.brownBg : T.warmBrown,
                    borderColor:     isActiveBg ? '#7ab870'  : alreadyOwned ? T.brownBorder : T.warmBrown,
                  }}>
                  <Text style={{ fontWeight: '700', color: isActiveBg ? '#4a8a40' : alreadyOwned ? T.warmBrown : '#fff' }}>
                    {isActiveBg   ? '✔ 적용 중'
                    : alreadyOwned ? (isBg ? '배경 적용' : '보유 중')
                    : `구매 ${item.price}🪙`}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={{ marginTop: 20, backgroundColor: '#e5ede1', borderRadius: 24, padding: 18, borderWidth: 2, borderColor: '#d0dfc8', shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: T.ink, marginBottom: 8 }}>아보카도 성장 상태</Text>
          <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 12 }}>지금 꾸미는 아이템으로 캐릭터와 방, 건물을 함께 꾸며보세요.</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: T.paper, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: T.rule2 }}>
              <Text style={{ fontSize: 11, color: T.ink3 }}>레벨</Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: T.ink, marginTop: 8 }}>{avocado.level}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: T.paper, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: T.rule2 }}>
              <Text style={{ fontSize: 11, color: T.ink3 }}>코인</Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: T.warmBrown, marginTop: 8 }}>{avocado.coins}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>

      {/* ── 전체 화면 방 (배경이 상태바까지 덮음) ── */}
      <View
        onLayout={onRoomLayout}
        style={{ flex: 1, overflow: 'hidden' }}>

        {/* 배경 이미지 — 전체 화면 cover */}
        <Image
          source={ITEM_IMAGES[roomBg] || ITEM_IMAGES.bg_default}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* 배치된 아이템들 — 캐릭터: 고정 위치 정적 렌더, 나머지: 드래그 가능 */}
        {placedItems.map(item => {
          const meta = ALL_ROOM_ITEMS.find(i => i.id === item.itemId);
          if (meta?.category === '캐릭터') {
            const pos = charFixedPos(roomLayout.w, roomLayout.h, item.itemId);
            const stateKey = charState === 'idle' ? item.itemId
              : charState === 'uplifting'  ? 'char_avocado_uplifting'
              : charState === 'happy'      ? 'char_avocado_happy'
              : charState === 'sad'        ? 'char_avocado_sad'
              : 'char_avocado_surprised';
            const src = ITEM_IMAGES[stateKey] || ITEM_IMAGES[item.itemId];
            if (!src) return null;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={1}
                onPress={handleCharacterTap}
                style={{ position: 'absolute', left: pos.x, top: pos.y, width: pos.w, height: pos.h, zIndex: 10 }}>
                <Animated.View style={{ flex: 1, transform: [{ translateY: bounceAnim }] }}>
                  <LottieView
                    ref={lottieRef}
                    source={require('./assets/images/items/character/basic/Animation-1.json')}
                    autoPlay={false}
                    loop={false}
                    style={{ width: pos.w, height: pos.h }}
                  />
                  <Image
                    source={src}
                    style={{ position: 'absolute', width: pos.w, height: pos.h, top: 0, left: 0 }}
                    resizeMode="contain"
                  />
                </Animated.View>
              </TouchableOpacity>
            );
          }
          return (
            <DraggableRoomItem
              key={item.id}
              placedItem={item}
              onUpdatePosition={updateItemPosition}
              onRemove={removeItemFromRoom}
            />
          );
        })}

        {/* ── 상단 상태바 오버레이 ── */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: T.brownBg, borderWidth: 2, borderColor: T.warmBrown, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {profile?.photoUri
                ? <Image source={{ uri: profile.photoUri }} style={{ width: 40, height: 40 }} resizeMode="cover" />
                : <Text style={{ fontSize: 20 }}>{profile?.photo || '🥑'}</Text>
              }
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: T.ink }}>{profile?.nickname || '나의 아보카도'}</Text>
                <View style={{ backgroundColor: T.brownBg, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: T.warmBrown }}>Lv.{avocado.level}</Text>
                </View>
                <Text style={{ fontSize: 11, color: T.warmBrown, fontWeight: '600', marginLeft: 'auto' }}>{avocado.coins} 🪙</Text>
              </View>
              <View style={{ height: 4, backgroundColor: T.paper2, borderRadius: 2, overflow: 'hidden' }}>
                <View style={{ width: `${nextLevelPercent}%`, height: '100%', backgroundColor: T.green, borderRadius: 2 }} />
              </View>
            </View>
          </View>
          {/* 물뿌리개 버튼 */}
          <TouchableOpacity
            onPress={() => {
              if (wateringCanCount <= 0) { showToast('물뿌리개가 없어요. 상점에서 구매하세요! 🛍️'); return; }
              setWateringCanCount(prev => prev - 1);
              careAvocado(1);
              triggerCharState('happy');
              showToast('💧 아보카도에게 물을 줬어요!');
            }}
            style={{
              alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: wateringCanCount > 0 ? '#d0edca' : T.paper2,
              borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7,
              borderWidth: 1.5, borderColor: wateringCanCount > 0 ? '#7ab870' : T.rule2,
            }}>
            <Text style={{ fontSize: 18 }}>🪣</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: wateringCanCount > 0 ? '#4a7a40' : T.ink4 }}>
              {wateringCanCount}개
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 우측 퀵버튼 ── */}
        <View style={{ position: 'absolute', right: 18, top: '20%', gap: 8 }}>
          {[
            { emoji: '🛍️', onPress: () => setViewMode('shop'), bg: T.brownBg, border: T.warmBrown },
            { emoji: '🎨', onPress: showDecorDrawer ? closeDrawer : openDrawer, bg: T.blueBg, border: T.blue },
          ].map(({ emoji, onPress, bg, border }, i) => (
            <TouchableOpacity
              key={i}
              onPress={onPress}
              style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: bg, borderWidth: 1.5, borderColor: border,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
              }}>
              <Text style={{ fontSize: 20 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>

      {/* ── 꾸미기 서랍 (Decoration Drawer) ── */}
      {showDecorDrawer && (
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)' }}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      )}
      {showDecorDrawer && (
        <Animated.View style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          backgroundColor: T.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28,
          paddingBottom: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12, shadowRadius: 16, elevation: 12,
          transform: [{
            translateY: drawerAnim.interpolate({ inputRange: [0, 1], outputRange: [340, 0] })
          }],
        }}>
          {/* Handle bar */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 6 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: T.rule2 }} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: T.ink }}>방 꾸미기</Text>
            <TouchableOpacity onPress={closeDrawer}>
              <X size={20} color={T.ink3} />
            </TouchableOpacity>
          </View>

          {/* Category tabs */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 14 }}>
            {decorTabs.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setDecorTab(t)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16,
                  backgroundColor: decorTab === t ? T.brownBg : T.paper2,
                  borderWidth: 1.5, borderColor: decorTab === t ? T.warmBrown : T.rule2,
                }}>
                <Text style={{ fontSize: 13, fontWeight: decorTab === t ? '700' : '500', color: decorTab === t ? T.warmBrown : T.ink3 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Item grid */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {decorItems.map(item => {
              const isPlaced = placedItems.some(p => p.itemId === item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => addItemToRoom(item.id)}
                  style={{
                    width: 88, alignItems: 'center',
                    backgroundColor: isPlaced ? T.greenBg : T.paper,
                    borderRadius: 18, padding: 10,
                    borderWidth: 1.5, borderColor: isPlaced ? T.greenBorder : T.rule2,
                  }}>
                  <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <RoomItemThumb itemId={item.id} />
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: T.ink, textAlign: 'center' }} numberOfLines={1}>{item.label}</Text>
                  {isPlaced && (
                    <View style={{ marginTop: 4, backgroundColor: '#7ab870', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>배치됨</Text>
                    </View>
                  )}
                  {!isPlaced && item.free && (
                    <View style={{ marginTop: 4, backgroundColor: T.brownBg, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 9, color: T.warmBrown, fontWeight: '700' }}>무료</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <Text style={{ fontSize: 11, color: T.ink4, textAlign: 'center' }}>아이템을 탭해서 방에 배치하세요 · 길게 눌러 제거</Text>
          </View>
        </Animated.View>
      )}

    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
//  PROFILE EDIT MODAL
// ─────────────────────────────────────────────────────────────────
const EMOJI_PRESETS = ['🥑', '🌿', '🍃', '🌱', '🫐', '🍎', '🐥', '🐻', '🦊', '🐼', '🐨', '🦁', '🌸', '⭐', '🔥', '💎'];

function ProfileEditModal({ visible, onClose }) {
  const { T, profile, updateProfile, showToast } = useApp();
  const [nicknameInput, setNicknameInput] = useState(profile?.nickname || '나의 아보카도');
  const [photoUri, setPhotoUri]           = useState(profile?.photoUri || null);
  const [emojiInput, setEmojiInput]       = useState(profile?.photo || '🥑');
  const [tab, setTab]                     = useState('emoji'); // 'emoji' | 'photo'

  // 모달 열릴 때 최신 프로필로 초기화
  useEffect(() => {
    if (visible) {
      setNicknameInput(profile?.nickname || '나의 아보카도');
      setPhotoUri(profile?.photoUri || null);
      setEmojiInput(profile?.photo || '🥑');
      setTab(profile?.photoUri ? 'photo' : 'emoji');
    }
  }, [visible]);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: false,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      setTab('photo');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      setTab('photo');
    }
  };

  const handleSave = () => {
    if (!nicknameInput.trim()) {
      Alert.alert('닉네임을 입력해주세요');
      return;
    }
    updateProfile({
      nickname: nicknameInput.trim(),
      photo: emojiInput,
      photoUri: tab === 'photo' ? photoUri : null,
    });
    showToast('프로필이 저장됐어요 ✓');
    onClose();
  };

  const avatarSize = 96;
  const currentAvatar = tab === 'photo' && photoUri;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: T.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
          paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        }}>
          {/* 핸들 */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: T.ink4 }} />
          </View>

          {/* 헤더 */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20, paddingVertical: 14,
          }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: T.ink }}>프로필 편집</Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32, height: 32, borderRadius: 10, borderWidth: 1,
                borderColor: T.rule2, alignItems: 'center', justifyContent: 'center',
              }}>
              <X size={18} color={T.ink3} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}>

            {/* 아바타 미리보기 */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{
                width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2,
                backgroundColor: T.brownBg, borderWidth: 3, borderColor: T.warmBrown,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: T.shadow, shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
                overflow: 'hidden',
              }}>
                {currentAvatar
                  ? <Image source={{ uri: photoUri }} style={{ width: avatarSize, height: avatarSize }} resizeMode="cover" />
                  : <Text style={{ fontSize: 50 }}>{emojiInput}</Text>
                }
              </View>
              <Text style={{ fontSize: 12, color: T.ink3, marginTop: 8 }}>현재 프로필 사진</Text>
            </View>

            {/* 탭: 이모지 / 사진 */}
            <View style={{
              flexDirection: 'row', backgroundColor: T.paper2, borderRadius: 14,
              padding: 4, marginBottom: 20,
            }}>
              {[['emoji', '이모지'], ['photo', '사진']].map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setTab(key)}
                  style={{
                    flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
                    backgroundColor: tab === key ? T.paper : 'transparent',
                    shadowColor: tab === key ? T.shadow : 'transparent',
                    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
                    elevation: tab === key ? 1 : 0,
                  }}>
                  <Text style={{ fontSize: 13, fontWeight: tab === key ? '600' : '400', color: tab === key ? T.warmBrown : T.ink3 }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 이모지 선택 */}
            {tab === 'emoji' && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>이모지 선택</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  {EMOJI_PRESETS.map((em) => (
                    <TouchableOpacity
                      key={em}
                      onPress={() => setEmojiInput(em)}
                      style={{
                        width: 48, height: 48, borderRadius: 14,
                        backgroundColor: emojiInput === em ? T.brownBg : T.paper2,
                        borderWidth: 2, borderColor: emojiInput === em ? T.warmBrown : T.rule2,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                      <Text style={{ fontSize: 24 }}>{em}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>직접 입력</Text>
                <TextInput
                  style={{
                    backgroundColor: T.paper, borderRadius: 12, borderWidth: 1.5,
                    borderColor: T.rule2, paddingHorizontal: 14, paddingVertical: 10,
                    fontSize: 22, color: T.ink, textAlign: 'center', letterSpacing: 4,
                  }}
                  placeholder="🥑"
                  placeholderTextColor={T.ink4}
                  value={emojiInput}
                  onChangeText={(v) => setEmojiInput(v.trim() || '🥑')}
                  maxLength={2}
                />
              </View>
            )}

            {/* 사진 선택 */}
            {tab === 'photo' && (
              <View style={{ marginBottom: 20, gap: 10 }}>
                <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>사진 선택</Text>
                <TouchableOpacity
                  onPress={pickFromGallery}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    backgroundColor: T.paper, borderRadius: 16, padding: 16,
                    borderWidth: 2, borderColor: T.olive,
                    shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
                  }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: T.blueBg, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20 }}>🖼️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: T.ink }}>갤러리에서 선택</Text>
                    <Text style={{ fontSize: 12, color: T.ink3 }}>사진 라이브러리에서 불러오기</Text>
                  </View>
                  <ChevronRight size={16} color={T.ink4} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={takePhoto}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    backgroundColor: T.paper, borderRadius: 16, padding: 16,
                    borderWidth: 2, borderColor: T.olive,
                    shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
                  }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: T.greenBg, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20 }}>📷</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: T.ink }}>카메라로 촬영</Text>
                    <Text style={{ fontSize: 12, color: T.ink3 }}>지금 바로 셀카 찍기</Text>
                  </View>
                  <ChevronRight size={16} color={T.ink4} />
                </TouchableOpacity>
                {photoUri && (
                  <TouchableOpacity
                    onPress={() => { setPhotoUri(null); setTab('emoji'); }}
                    style={{ alignItems: 'center', paddingVertical: 8 }}>
                    <Text style={{ fontSize: 12, color: T.red }}>사진 제거하고 이모지로 돌아가기</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 닉네임 */}
            <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>닉네임</Text>
            <TextInput
              style={{
                backgroundColor: T.paper, borderRadius: 12, borderWidth: 1.5,
                borderColor: T.rule2, paddingHorizontal: 14, paddingVertical: 12,
                fontSize: 15, color: T.ink, marginBottom: 24,
              }}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor={T.ink4}
              value={nicknameInput}
              onChangeText={setNicknameInput}
              maxLength={20}
            />

            {/* 저장 버튼 */}
            <TouchableOpacity
              onPress={handleSave}
              style={{
                backgroundColor: T.warmBrown, borderRadius: 16, paddingVertical: 15,
                alignItems: 'center',
                shadowColor: T.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 2,
              }}>
              <Text style={{ color: T.paper, fontSize: 15, fontWeight: '700' }}>저장하기</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
//  SETTINGS SCREEN (Modal)
// ─────────────────────────────────────────────────────────────────
function SettingsScreen() {
  const { T, theme, toggleTheme, geminiKey, saveGeminiKey, showToast, sbUser, doLogout, profile, updateProfile, setShowSettings } = useApp();
  const [keyInput, setKeyInput]       = useState(geminiKey);
  const [showKey, setShowKey]         = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const SectionLabel = ({ label }) => (
    <Text style={{
      fontSize: 11, fontWeight: '600', color: T.ink3, textTransform: 'uppercase',
      letterSpacing: 0.7, paddingHorizontal: 16, paddingBottom: 8, paddingTop: 12,
      borderBottomWidth: 1, borderBottomColor: T.rule2, marginBottom: 0,
    }}>{label}</Text>
  );

  const SettingsRow = ({ title, desc, right, last, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1, borderBottomColor: T.rule,
        gap: 12,
        backgroundColor: onPress ? T.paper : 'transparent',
      }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: T.ink, marginBottom: 2, fontWeight: '500' }}>{title}</Text>
        {desc ? <Text style={{ fontSize: 12, color: T.ink3 }}>{desc}</Text> : null}
      </View>
      {right}
    </TouchableOpacity>
  );

  const cardStyle = {
    backgroundColor: T.paper, borderRadius: 20, borderWidth: 2,
    borderColor: T.olive, marginBottom: 16, overflow: 'hidden',
    shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  };

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={{
        flex: 1, backgroundColor: T.bg,
        paddingTop: 16, paddingBottom: 16,
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: T.ink }}>설정</Text>
          <TouchableOpacity
            onPress={() => setShowSettings(false)}
            style={{
              width: 32, height: 32, borderRadius: 10, borderWidth: 1,
              borderColor: T.rule2, alignItems: 'center', justifyContent: 'center',
            }}>
            <X size={18} color={T.ink3} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 20 }}>
          {/* 프로필 */}
          <SectionLabel label="프로필" />
          <View style={cardStyle}>
            <TouchableOpacity
              onPress={() => setShowProfileEdit(true)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 14,
                padding: 16,
              }}>
              {/* 아바타 */}
              <View style={{
                width: 60, height: 60, borderRadius: 30,
                backgroundColor: T.brownBg, borderWidth: 2, borderColor: T.warmBrown,
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
              }}>
                {profile?.photoUri
                  ? <Image source={{ uri: profile.photoUri }} style={{ width: 60, height: 60 }} resizeMode="cover" />
                  : <Text style={{ fontSize: 30 }}>{profile?.photo || '🥑'}</Text>
                }
              </View>
              {/* 정보 */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: T.ink, marginBottom: 2 }}>
                  {profile?.nickname || '나의 아보카도'}
                </Text>
                <Text style={{ fontSize: 12, color: T.ink3 }}>프로필 사진 · 닉네임 변경</Text>
              </View>
              {/* 편집 아이콘 */}
              <View style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: T.paper2, borderWidth: 1, borderColor: T.rule2,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Pencil size={14} color={T.ink3} />
              </View>
            </TouchableOpacity>
          </View>

          {/* 프로필 편집 모달 */}
          <ProfileEditModal visible={showProfileEdit} onClose={() => setShowProfileEdit(false)} />

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
                      <Text style={{ fontSize: 12, color: T.red, fontWeight: '600' }}>로그아웃</Text>
                    </TouchableOpacity>
                  }
                />
              </View>
            </>
          )}

          {/* AI API 키 */}
          <SectionLabel label="AI API 키" />
          <View style={cardStyle}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: T.rule, gap: 10 }}>
              <Text style={{ fontSize: 12, color: T.ink3, marginBottom: 4 }}>Gemini API 키</Text>
              <TextInput
                style={{
                  backgroundColor: T.bg, borderRadius: 10, borderWidth: 1,
                  borderColor: T.rule2, color: T.ink, paddingHorizontal: 12, paddingVertical: 10,
                  fontSize: 13, fontFamily: 'monospace',
                }}
                placeholder="AIzaSy..."
                placeholderTextColor={T.ink4}
                value={keyInput}
                onChangeText={setKeyInput}
                secureTextEntry={!showKey}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setShowKey(!showKey)}
                  style={{
                    flex: 1, backgroundColor: T.paper2, borderRadius: 10, paddingVertical: 10,
                    alignItems: 'center', borderWidth: 1, borderColor: T.rule2,
                  }}>
                  <Text style={{ color: T.ink3, fontWeight: '600', fontSize: 12 }}>
                    {showKey ? '숨기기' : '보이기'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    saveGeminiKey(keyInput);
                    showToast('API 키가 저장됐어요');
                  }}
                  style={{
                    flex: 1, backgroundColor: T.warmBrown, borderRadius: 10, paddingVertical: 10,
                    alignItems: 'center',
                  }}>
                  <Text style={{ color: T.paper, fontWeight: '600', fontSize: 12 }}>저장</Text>
                </TouchableOpacity>
              </View>
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
                  trackColor={{ false: T.rule2, true: T.warmBrown }}
                  thumbColor="#fff"
                />
              }
            />
          </View>

          {/* 고객지원 */}
          <SectionLabel label="고객지원" />
          <View style={cardStyle}>
            <SettingsRow
              title="공지사항"
              desc="앱 업데이트 소식과 공지"
              right={<ChevronRight size={16} color={T.ink3} />}
              onPress={() => showToast('공지사항 페이지 준비 중입니다.')}
            />
            <SettingsRow
              title="문의하기"
              desc="버그 리포트 및 피드백"
              last
              right={<ChevronRight size={16} color={T.ink3} />}
              onPress={() => showToast('문의 페이지 준비 중입니다.')}
            />
          </View>

          {/* 앱 정보 */}
          <SectionLabel label="앱 정보" />
          <View style={cardStyle}>
            <SettingsRow
              title="My Avoca"
              desc="v1.0.0 · OPIc 영어 단어장"
              last
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
//  SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────
function Card({ children, style }) {
  const { T } = useApp();
  return (
    <View style={[{
      backgroundColor: T.paper, borderRadius: 24, padding: 18, marginBottom: 14,
      borderWidth: 2, borderColor: T.olive,
      shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6,
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
