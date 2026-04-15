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
  Leaf,
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

const STORAGE_KEY      = 'myvocab_v3';
const THEME_KEY        = 'myvocab_theme';
const GEMINI_KEY       = 'myvocab_gemini_key';
const CATEGORIES_KEY   = 'myvocab_categories';
const AVOCADO_KEY      = 'myvocab_avocado';
const DAILY_LOG_KEY    = 'myvocab_daily_log';
const PROFILE_KEY      = 'myvocab_profile';
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
};

// ─────────────────────────────────────────────────────────────────
//  INITIAL PROFILE
// ─────────────────────────────────────────────────────────────────
const INITIAL_PROFILE = {
  nickname: '나의 아보카도',
  createdAt: today(),
};

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
  const [theme, setTheme]           = useState('light');
  const [words, setWords]           = useState([]);
  const [geminiKey, setGeminiKey]   = useState('');
  const [tab, setTab]               = useState('home');   // home | categories | quiz | avocado
  const [toast, setToast]           = useState('');
  const [sbUser, setSbUser]         = useState(null);    // Supabase user
  const [authMode, setAuthMode]     = useState('login'); // login | signup
  const [showAuth, setShowAuth]     = useState(true);    // Show auth screen
  const [loading, setLoading]       = useState(true);    // Loading auth state

  // ── NEW: Categories & Avocado ──
  const [categories, setCategories]           = useState(DEFAULT_CATEGORIES);
  const [customCategories, setCustomCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('default_travel');
  const [avocado, setAvocado]                 = useState(INITIAL_AVOCADO);
  const [profile, setProfile]                 = useState(INITIAL_PROFILE);

  const toastAnim                   = useRef(new Animated.Value(0)).current;
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

      // Load local settings & data
      const [th, gk, catData, avoData, profData] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(GEMINI_KEY),
        AsyncStorage.getItem(CATEGORIES_KEY),
        AsyncStorage.getItem(AVOCADO_KEY),
        AsyncStorage.getItem(PROFILE_KEY),
      ]);
      if (th)  setTheme(th);
      if (gk)  setGeminiKey(gk);

      // Load categories
      if (catData) {
        try {
          const { defaults, customs } = JSON.parse(catData);
          setCustomCategories(customs || []);
        } catch (e) {
          console.log('Parse categories error:', e.message);
        }
      }

      // Load avocado & apply daily bonus
      if (avoData) {
        try {
          const avo = JSON.parse(avoData);
          const lastLogin = avo.lastLogin || today();
          const isNewDay = lastLogin !== today();
          if (isNewDay) {
            // Daily login bonus: +10 coins, reset daily counters
            avo.coins += 10;
            avo.dailyCoinsFromQuiz = 0;
            avo.dailyCoinsFromWords = 0;
            avo.lastLogin = today();
          }
          setAvocado(avo);
        } catch (e) {
          console.log('Parse avocado error:', e.message);
        }
      }

      // Load profile
      if (profData) {
        try {
          setProfile(JSON.parse(profData));
        } catch (e) {
          console.log('Parse profile error:', e.message);
        }
      }

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
    await AsyncStorage.setItem(AVOCADO_KEY, JSON.stringify(avo));
  }, []);

  const addCoins = useCallback((amount) => {
    const updated = { ...avocado, coins: avocado.coins + amount };
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
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(prof));
  }, []);

  const updateProfile = useCallback((changes) => {
    const updated = { ...profile, ...changes };
    saveProfile(updated);
  }, [profile, saveProfile]);

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
    // NEW: categories, avocado, profile
    categories, customCategories, selectedCategory, setSelectedCategory,
    addCategory, deleteCategory, renameCategory,
    avocado, addCoins, useCoins, careAvocado,
    profile, updateProfile,
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
              {tab === 'home'       && <AddScreen />}
              {tab === 'categories' && <ListScreen />}
              {tab === 'quiz'       && <QuizScreen />}
              {tab === 'avocado'    && <AvocadoScreen />}
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
  const { T, theme, toggleTheme, setTab } = useApp();
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
        <BookMarked size={20} color={T.blue} strokeWidth={2} />
        <Text style={{ fontFamily: 'serif', fontSize: 20, fontWeight: '700', color: T.ink, letterSpacing: -0.3 }}>
          My Avoca
        </Text>
      </TouchableOpacity>

      {/* Right controls: Profile + Theme */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Profile button */}
        <TouchableOpacity
          onPress={() => setTab('avocado')}
          style={{
            width: 36, height: 36, borderRadius: 10, borderWidth: 1,
            borderColor: T.rule2, alignItems: 'center', justifyContent: 'center',
            backgroundColor: T.paper,
          }}>
          <Settings size={16} color={T.ink2} strokeWidth={2} />
        </TouchableOpacity>

        {/* Theme toggle */}
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
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
//  BOTTOM NAV
// ─────────────────────────────────────────────────────────────────
function BottomNav() {
  const { T, tab, setTab } = useApp();
  const items = [
    { key: 'home',       label: '홈',     Icon: Plus },
    { key: 'categories', label: '단어장', Icon: Layers },
    { key: 'quiz',       label: '퀴즈',   Icon: BrainCircuit },
    { key: 'avocado',    label: '아보카도', Icon: Leaf },
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
  const { T, addWords, showToast, geminiKey, setTab, avocado, addCoins } = useApp();
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
        { text: '설정으로', onPress: () => setTab('avocado') },
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
//  AVOCADO SCREEN (Placeholder - Phase 6)
// ─────────────────────────────────────────────────────────────────
function AvocadoScreen() {
  const { T } = useApp();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: T.ink, marginBottom: 24, textAlign: 'center' }}>
        My Avocado 🥑
      </Text>
      <Text style={{ fontSize: 14, color: T.ink2, textAlign: 'center' }}>
        Avocado screen coming soon in Phase 6!
      </Text>
    </ScrollView>
  );
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
