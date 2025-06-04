"use client"

import { useState, useEffect } from "react"
import { ChevronRight, User, DollarSign, TrendingUp, AlertCircle, CheckCircle, Shield, Award, BarChart3, Phone, MapPin, Clock, Star } from 'lucide-react'

// Import CSS files
import "./styles/reset.css"
import "./styles/variables.css"
import "./styles/animations.css"
import "./styles/components.css"
import "./styles/responsive.css"
import "./styles/progress.css"
import "./styles/loading.css"

const BCAFuzzyCreditAnalyzer = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answers, setAnswers] = useState({})
  const [questionHistory, setQuestionHistory] = useState([])
  const [riskScore, setRiskScore] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Database pertanyaan dengan logika dinamis (sama seperti sebelumnya)
  const questionDatabase = {
    start: {
      id: "start",
      question: "Selamat datang di Sistem Analisis Kredit BCA. Apa tujuan utama Anda mengajukan kredit?",
      type: "radio",
      options: [
        { value: "modal_usaha", label: "Modal Usaha/Bisnis", next: "business_experience" },
        { value: "rumah", label: "Pembelian Rumah", next: "house_income" },
        { value: "kendaraan", label: "Pembelian Kendaraan", next: "vehicle_type" },
        { value: "pendidikan", label: "Biaya Pendidikan", next: "education_level" },
        { value: "konsumtif", label: "Kebutuhan Konsumtif", next: "income_source" },
      ],
      category: "purpose",
      weight: 0.15,
    },

    business_experience: {
      id: "business_experience",
      question: "Berapa lama pengalaman Anda dalam menjalankan bisnis?",
      type: "radio",
      options: [
        { value: "baru", label: "Baru memulai (< 1 tahun)", next: "business_plan", score: 2 },
        { value: "junior", label: "1-3 tahun", next: "business_revenue", score: 5 },
        { value: "experienced", label: "3-7 tahun", next: "business_revenue", score: 7 },
        { value: "expert", label: "> 7 tahun", next: "business_growth", score: 9 },
      ],
      category: "business_profile",
      weight: 0.2,
    },

    business_plan: {
      id: "business_plan",
      question: "Apakah Anda memiliki rencana bisnis yang tertulis dan detail?",
      type: "radio",
      options: [
        { value: "none", label: "Tidak ada rencana tertulis", next: "income_source", score: 2 },
        { value: "basic", label: "Rencana sederhana", next: "market_research", score: 4 },
        { value: "detailed", label: "Rencana bisnis lengkap", next: "market_research", score: 8 },
        {
          value: "professional",
          label: "Rencana bisnis profesional dengan analisis pasar",
          next: "business_revenue",
          score: 9,
        },
      ],
      category: "business_profile",
      weight: 0.15,
    },

    market_research: {
      id: "market_research",
      question: "Seberapa dalam riset pasar yang telah Anda lakukan?",
      type: "radio",
      options: [
        { value: "none", label: "Belum melakukan riset", next: "competition_analysis", score: 2 },
        { value: "basic", label: "Survei sederhana", next: "competition_analysis", score: 5 },
        { value: "comprehensive", label: "Riset mendalam dengan data", next: "business_revenue", score: 8 },
      ],
      category: "business_profile",
      weight: 0.1,
    },

    competition_analysis: {
      id: "competition_analysis",
      question: "Bagaimana Anda menganalisis kompetitor di bidang bisnis Anda?",
      type: "radio",
      options: [
        { value: "unaware", label: "Belum menganalisis kompetitor", next: "income_source", score: 2 },
        { value: "basic", label: "Mengetahui kompetitor utama", next: "income_source", score: 5 },
        { value: "detailed", label: "Analisis SWOT kompetitor", next: "business_revenue", score: 8 },
      ],
      category: "business_profile",
      weight: 0.1,
    },

    business_revenue: {
      id: "business_revenue",
      question: "Berapa rata-rata pendapatan bulanan bisnis Anda saat ini?",
      type: "radio",
      options: [
        { value: "low", label: "< Rp 10 juta", next: "revenue_consistency", score: 3 },
        { value: "medium", label: "Rp 10-50 juta", next: "revenue_growth", score: 6 },
        { value: "high", label: "Rp 50-200 juta", next: "revenue_growth", score: 8 },
        { value: "very_high", label: "> Rp 200 juta", next: "business_growth", score: 9 },
      ],
      category: "income",
      weight: 0.25,
    },

    revenue_consistency: {
      id: "revenue_consistency",
      question: "Seberapa stabil pendapatan bisnis Anda dari bulan ke bulan?",
      type: "radio",
      options: [
        { value: "volatile", label: "Sangat fluktuatif (>50% variasi)", next: "income_source", score: 2 },
        { value: "moderate", label: "Cukup stabil (20-50% variasi)", next: "other_income", score: 5 },
        { value: "stable", label: "Sangat stabil (<20% variasi)", next: "other_income", score: 8 },
      ],
      category: "income",
      weight: 0.2,
    },

    revenue_growth: {
      id: "revenue_growth",
      question: "Bagaimana tren pertumbuhan pendapatan bisnis Anda dalam 12 bulan terakhir?",
      type: "radio",
      options: [
        { value: "declining", label: "Menurun", next: "business_challenges", score: 3 },
        { value: "stable", label: "Stabil", next: "other_income", score: 6 },
        { value: "growing", label: "Meningkat 10-30%", next: "business_growth", score: 8 },
        { value: "fast_growing", label: "Meningkat >30%", next: "business_growth", score: 9 },
      ],
      category: "growth",
      weight: 0.15,
    },

    business_growth: {
      id: "business_growth",
      question: "Apa strategi utama Anda untuk mengembangkan bisnis dengan kredit ini?",
      type: "radio",
      options: [
        { value: "expansion", label: "Ekspansi ke lokasi baru", next: "expansion_plan", score: 7 },
        { value: "inventory", label: "Menambah inventory/stok", next: "inventory_management", score: 6 },
        { value: "equipment", label: "Membeli peralatan/mesin baru", next: "equipment_plan", score: 8 },
        { value: "marketing", label: "Meningkatkan marketing", next: "marketing_strategy", score: 5 },
      ],
      category: "strategy",
      weight: 0.15,
    },

    house_income: {
      id: "house_income",
      question: "Berapa total pendapatan rumah tangga Anda per bulan?",
      type: "radio",
      options: [
        { value: "low", label: "< Rp 5 juta", next: "house_downpayment", score: 3 },
        { value: "medium", label: "Rp 5-15 juta", next: "house_price_range", score: 6 },
        { value: "high", label: "Rp 15-30 juta", next: "house_price_range", score: 8 },
        { value: "very_high", label: "> Rp 30 juta", next: "house_investment", score: 9 },
      ],
      category: "income",
      weight: 0.3,
    },

    house_price_range: {
      id: "house_price_range",
      question: "Berapa kisaran harga rumah yang ingin Anda beli?",
      type: "radio",
      options: [
        { value: "affordable", label: "Rp 200-500 juta", next: "house_downpayment", score: 7 },
        { value: "medium", label: "Rp 500 juta - 1 miliar", next: "house_location", score: 6 },
        { value: "expensive", label: "Rp 1-2 miliar", next: "house_location", score: 5 },
        { value: "luxury", label: "> Rp 2 miliar", next: "house_investment", score: 4 },
      ],
      category: "asset_value",
      weight: 0.2,
    },

    income_source: {
      id: "income_source",
      question: "Apa sumber pendapatan utama Anda?",
      type: "radio",
      options: [
        { value: "employee", label: "Karyawan tetap", next: "employment_duration", score: 7 },
        { value: "freelance", label: "Freelancer/Konsultan", next: "freelance_clients", score: 5 },
        { value: "business_owner", label: "Pemilik usaha", next: "business_type", score: 6 },
        { value: "mixed", label: "Kombinasi beberapa sumber", next: "mixed_income_ratio", score: 6 },
      ],
      category: "employment",
      weight: 0.25,
    },

    employment_duration: {
      id: "employment_duration",
      question: "Berapa lama Anda bekerja di perusahaan saat ini?",
      type: "radio",
      options: [
        { value: "new", label: "< 1 tahun", next: "job_stability", score: 4 },
        { value: "stable", label: "1-3 tahun", next: "salary_range", score: 7 },
        { value: "senior", label: "3-7 tahun", next: "salary_range", score: 8 },
        { value: "veteran", label: "> 7 tahun", next: "career_growth", score: 9 },
      ],
      category: "employment",
      weight: 0.2,
    },

    salary_range: {
      id: "salary_range",
      question: "Berapa gaji bulanan Anda saat ini?",
      type: "radio",
      options: [
        { value: "low", label: "< Rp 5 juta", next: "other_income", score: 4 },
        { value: "medium", label: "Rp 5-15 juta", next: "salary_growth", score: 7 },
        { value: "high", label: "Rp 15-30 juta", next: "salary_growth", score: 8 },
        { value: "executive", label: "> Rp 30 juta", next: "career_growth", score: 9 },
      ],
      category: "income",
      weight: 0.25,
    },

    other_income: {
      id: "other_income",
      question: "Apakah Anda memiliki sumber pendapatan tambahan?",
      type: "radio",
      options: [
        { value: "none", label: "Tidak ada", next: "monthly_expenses", score: 5 },
        { value: "passive", label: "Pendapatan pasif (sewa, investasi)", next: "passive_income_amount", score: 8 },
        { value: "side_business", label: "Bisnis sampingan", next: "side_business_income", score: 7 },
        { value: "multiple", label: "Beberapa sumber tambahan", next: "total_additional_income", score: 8 },
      ],
      category: "income",
      weight: 0.15,
    },

    monthly_expenses: {
      id: "monthly_expenses",
      question: "Berapa total pengeluaran bulanan Anda (termasuk cicilan yang ada)?",
      type: "radio",
      options: [
        { value: "low", label: "< Rp 3 juta", next: "existing_debt", score: 8 },
        { value: "medium", label: "Rp 3-10 juta", next: "expense_breakdown", score: 6 },
        { value: "high", label: "Rp 10-25 juta", next: "expense_breakdown", score: 4 },
        { value: "very_high", label: "> Rp 25 juta", next: "lifestyle_analysis", score: 2 },
      ],
      category: "expenses",
      weight: 0.2,
    },

    existing_debt: {
      id: "existing_debt",
      question: "Berapa total cicilan/hutang yang sedang Anda bayar per bulan?",
      type: "radio",
      options: [
        { value: "none", label: "Tidak ada cicilan", next: "savings_amount", score: 9 },
        { value: "low", label: "< Rp 2 juta", next: "debt_types", score: 7 },
        { value: "medium", label: "Rp 2-7 juta", next: "debt_types", score: 5 },
        { value: "high", label: "> Rp 7 juta", next: "debt_management", score: 3 },
      ],
      category: "debt",
      weight: 0.25,
    },

    savings_amount: {
      id: "savings_amount",
      question: "Berapa jumlah tabungan/dana darurat yang Anda miliki?",
      type: "radio",
      options: [
        { value: "minimal", label: "< Rp 10 juta", next: "investment_portfolio", score: 4 },
        { value: "adequate", label: "Rp 10-50 juta", next: "financial_goals", score: 7 },
        { value: "strong", label: "Rp 50-200 juta", next: "financial_goals", score: 8 },
        { value: "excellent", label: "> Rp 200 juta", next: "investment_portfolio", score: 9 },
      ],
      category: "savings",
      weight: 0.2,
    },

    credit_history: {
      id: "credit_history",
      question: "Bagaimana riwayat kredit Anda selama ini?",
      type: "radio",
      options: [
        { value: "no_history", label: "Belum pernah mengambil kredit", next: "savings_amount", score: 6 },
        { value: "excellent", label: "Selalu lancar, tidak pernah telat", next: "credit_amount_history", score: 9 },
        { value: "good", label: "Umumnya lancar, sesekali telat <30 hari", next: "credit_amount_history", score: 7 },
        { value: "fair", label: "Beberapa kali telat 30-90 hari", next: "credit_improvement", score: 4 },
        { value: "poor", label: "Sering telat >90 hari atau pernah macet", next: "debt_restructure", score: 2 },
      ],
      category: "credit_history",
      weight: 0.3,
    },

    final_assessment: {
      id: "final_assessment",
      question: "Terakhir, seberapa yakin Anda dapat membayar cicilan kredit ini tepat waktu?",
      type: "radio",
      options: [
        { value: "uncertain", label: "Tidak terlalu yakin", next: "complete", score: 3 },
        { value: "confident", label: "Cukup yakin", next: "complete", score: 6 },
        { value: "very_confident", label: "Sangat yakin", next: "complete", score: 8 },
        { value: "absolutely", label: "Sangat yakin dengan backup plan", next: "complete", score: 9 },
      ],
      category: "confidence",
      weight: 0.1,
    },

    vehicle_type: {
      id: "vehicle_type",
      question: "Jenis kendaraan apa yang ingin Anda beli?",
      type: "radio",
      options: [
        { value: "motor", label: "Sepeda Motor", next: "motor_category" },
        { value: "mobil_bekas", label: "Mobil Bekas", next: "used_car_age" },
        { value: "mobil_baru", label: "Mobil Baru", next: "new_car_brand" },
        { value: "komersial", label: "Kendaraan Komersial", next: "commercial_purpose" },
      ],
      category: "vehicle_profile",
      weight: 0.1,
    },

    motor_category: {
      id: "motor_category",
      question: "Kategori sepeda motor yang Anda inginkan?",
      type: "radio",
      options: [
        { value: "matic", label: "Motor Matic", next: "motor_price_matic", score: 7 },
        { value: "bebek", label: "Motor Bebek", next: "motor_price_bebek", score: 8 },
        { value: "sport", label: "Motor Sport", next: "motor_price_sport", score: 5 },
        { value: "big_bike", label: "Big Bike (>250cc)", next: "big_bike_experience", score: 4 },
      ],
      category: "vehicle_profile",
      weight: 0.12,
    },

    motor_price_matic: {
      id: "motor_price_matic",
      question: "Berapa kisaran harga motor matic yang Anda inginkan?",
      type: "radio",
      options: [
        { value: "entry", label: "15-20 juta", next: "motor_usage_purpose", score: 8 },
        { value: "mid", label: "20-30 juta", next: "motor_usage_purpose", score: 7 },
        { value: "premium", label: "30-50 juta", next: "motor_brand_preference", score: 6 },
        { value: "luxury", label: "> 50 juta", next: "luxury_motor_reason", score: 4 },
      ],
      category: "asset_value",
      weight: 0.15,
    },

    motor_price_bebek: {
      id: "motor_price_bebek",
      question: "Berapa kisaran harga motor bebek yang Anda inginkan?",
      type: "radio",
      options: [
        { value: "basic", label: "12-18 juta", next: "motor_usage_purpose", score: 9 },
        { value: "standard", label: "18-25 juta", next: "motor_usage_purpose", score: 8 },
        { value: "premium", label: "> 25 juta", next: "motor_brand_preference", score: 7 },
      ],
      category: "asset_value",
      weight: 0.15,
    },

    motor_price_sport: {
      id: "motor_price_sport",
      question: "Berapa kisaran harga motor sport yang Anda inginkan?",
      type: "radio",
      options: [
        { value: "entry_sport", label: "20-35 juta", next: "sport_experience", score: 6 },
        { value: "mid_sport", label: "35-60 juta", next: "sport_experience", score: 5 },
        { value: "high_sport", label: "> 60 juta", next: "sport_expertise", score: 4 },
      ],
      category: "asset_value",
      weight: 0.15,
    },

    big_bike_experience: {
      id: "big_bike_experience",
      question: "Berapa lama pengalaman Anda mengendarai motor besar?",
      type: "radio",
      options: [
        { value: "beginner", label: "Belum pernah/< 1 tahun", next: "big_bike_training", score: 3 },
        { value: "intermediate", label: "1-3 tahun", next: "big_bike_price", score: 5 },
        { value: "expert", label: "> 3 tahun", next: "big_bike_price", score: 7 },
      ],
      category: "experience",
      weight: 0.1,
    },

    big_bike_training: {
      id: "big_bike_training",
      question: "Apakah Anda berencana mengikuti training safety riding?",
      type: "radio",
      options: [
        { value: "no_plan", label: "Tidak ada rencana", next: "big_bike_price", score: 2 },
        { value: "planning", label: "Berencana mengikuti", next: "big_bike_price", score: 5 },
        { value: "already_trained", label: "Sudah pernah training", next: "big_bike_price", score: 7 },
      ],
      category: "preparation",
      weight: 0.08,
    },

    big_bike_price: {
      id: "big_bike_price",
      question: "Berapa kisaran harga big bike yang Anda inginkan?",
      type: "radio",
      options: [
        { value: "entry_big", label: "80-150 juta", next: "motor_usage_purpose", score: 5 },
        { value: "mid_big", label: "150-300 juta", next: "premium_vehicle_reason", score: 4 },
        { value: "luxury_big", label: "> 300 juta", next: "luxury_motor_reason", score: 3 },
      ],
      category: "asset_value",
      weight: 0.2,
    },

    sport_experience: {
      id: "sport_experience",
      question: "Berapa lama pengalaman Anda mengendarai motor sport?",
      type: "radio",
      options: [
        { value: "new_rider", label: "Baru akan mulai", next: "motor_usage_purpose", score: 4 },
        { value: "some_exp", label: "1-2 tahun", next: "motor_usage_purpose", score: 6 },
        { value: "experienced", label: "> 2 tahun", next: "motor_brand_preference", score: 7 },
      ],
      category: "experience",
      weight: 0.08,
    },

    sport_expertise: {
      id: "sport_expertise",
      question: "Apakah Anda memiliki pengalaman balap atau track day?",
      type: "radio",
      options: [
        { value: "no_track", label: "Tidak ada pengalaman", next: "premium_vehicle_reason", score: 4 },
        { value: "amateur", label: "Sesekali track day", next: "motor_brand_preference", score: 6 },
        { value: "racer", label: "Aktif balap/sering track", next: "motor_brand_preference", score: 7 },
      ],
      category: "expertise",
      weight: 0.1,
    },

    motor_usage_purpose: {
      id: "motor_usage_purpose",
      question: "Apa tujuan utama penggunaan motor ini?",
      type: "radio",
      options: [
        { value: "daily_commute", label: "Transportasi harian ke kantor", next: "daily_distance", score: 8 },
        { value: "business", label: "Untuk keperluan bisnis/usaha", next: "business_vehicle_usage", score: 7 },
        { value: "hobby", label: "Hobi/rekreasi", next: "hobby_budget", score: 6 },
        { value: "family", label: "Keperluan keluarga", next: "family_vehicle_need", score: 7 },
      ],
      category: "usage_purpose",
      weight: 0.15,
    },

    daily_distance: {
      id: "daily_distance",
      question: "Berapa kilometer rata-rata perjalanan harian Anda?",
      type: "radio",
      options: [
        { value: "short", label: "< 20 km/hari", next: "motor_maintenance_budget", score: 8 },
        { value: "medium", label: "20-50 km/hari", next: "fuel_budget_consideration", score: 7 },
        { value: "long", label: "> 50 km/hari", next: "fuel_budget_consideration", score: 6 },
      ],
      category: "usage_intensity",
      weight: 0.1,
    },

    fuel_budget_consideration: {
      id: "fuel_budget_consideration",
      question: "Berapa budget bulanan Anda untuk bahan bakar motor?",
      type: "radio",
      options: [
        { value: "low_fuel", label: "< Rp 300.000", next: "motor_maintenance_budget", score: 6 },
        { value: "mid_fuel", label: "Rp 300-600.000", next: "motor_maintenance_budget", score: 7 },
        { value: "high_fuel", label: "> Rp 600.000", next: "motor_maintenance_budget", score: 8 },
      ],
      category: "operational_cost",
      weight: 0.12,
    },

    business_vehicle_usage: {
      id: "business_vehicle_usage",
      question: "Bagaimana motor akan digunakan untuk bisnis?",
      type: "radio",
      options: [
        { value: "delivery", label: "Delivery/antar barang", next: "delivery_volume", score: 7 },
        { value: "field_work", label: "Kunjungan klien/lapangan", next: "client_visit_frequency", score: 8 },
        { value: "ojek_online", label: "Ojek online", next: "ojol_experience", score: 6 },
        { value: "general_business", label: "Keperluan bisnis umum", next: "motor_maintenance_budget", score: 7 },
      ],
      category: "business_usage",
      weight: 0.15,
    },

    delivery_volume: {
      id: "delivery_volume",
      question: "Berapa estimasi volume delivery per hari?",
      type: "radio",
      options: [
        { value: "light_delivery", label: "1-5 pengiriman", next: "motor_maintenance_budget", score: 7 },
        { value: "medium_delivery", label: "5-15 pengiriman", next: "vehicle_durability_concern", score: 6 },
        { value: "heavy_delivery", label: "> 15 pengiriman", next: "vehicle_durability_concern", score: 5 },
      ],
      category: "business_intensity",
      weight: 0.12,
    },

    ojol_experience: {
      id: "ojol_experience",
      question: "Berapa lama pengalaman Anda sebagai driver ojek online?",
      type: "radio",
      options: [
        { value: "new_ojol", label: "Baru akan mulai", next: "ojol_hours_plan", score: 5 },
        { value: "experienced_ojol", label: "Sudah > 1 tahun", next: "ojol_income_target", score: 7 },
        { value: "veteran_ojol", label: "Sudah > 3 tahun", next: "ojol_income_target", score: 8 },
      ],
      category: "business_experience",
      weight: 0.15,
    },

    ojol_hours_plan: {
      id: "ojol_hours_plan",
      question: "Berapa jam per hari Anda berencana bekerja sebagai ojol?",
      type: "radio",
      options: [
        { value: "part_time", label: "4-6 jam (part time)", next: "motor_maintenance_budget", score: 7 },
        { value: "full_time", label: "8-10 jam (full time)", next: "vehicle_durability_concern", score: 6 },
        { value: "intensive", label: "> 10 jam", next: "vehicle_durability_concern", score: 5 },
      ],
      category: "work_intensity",
      weight: 0.12,
    },

    ojol_income_target: {
      id: "ojol_income_target",
      question: "Berapa target pendapatan bulanan dari ojek online?",
      type: "radio",
      options: [
        { value: "low_target", label: "< Rp 3 juta", next: "motor_maintenance_budget", score: 6 },
        { value: "medium_target", label: "Rp 3-6 juta", next: "vehicle_durability_concern", score: 7 },
        { value: "high_target", label: "> Rp 6 juta", next: "vehicle_durability_concern", score: 8 },
      ],
      category: "income_projection",
      weight: 0.18,
    },

    used_car_age: {
      id: "used_car_age",
      question: "Berapa usia maksimal mobil bekas yang Anda pertimbangkan?",
      type: "radio",
      options: [
        { value: "very_new", label: "< 3 tahun", next: "used_car_price_premium", score: 7 },
        { value: "fairly_new", label: "3-7 tahun", next: "used_car_price_mid", score: 6 },
        { value: "older", label: "7-12 tahun", next: "used_car_price_budget", score: 5 },
        { value: "very_old", label: "> 12 tahun", next: "old_car_maintenance_budget", score: 3 },
      ],
      category: "vehicle_condition",
      weight: 0.15,
    },

    used_car_price_premium: {
      id: "used_car_price_premium",
      question: "Berapa kisaran harga mobil bekas premium yang Anda inginkan?",
      type: "radio",
      options: [
        { value: "premium_low", label: "200-400 juta", next: "car_brand_preference", score: 6 },
        { value: "premium_mid", label: "400-700 juta", next: "luxury_car_reason", score: 5 },
        { value: "premium_high", label: "> 700 juta", next: "luxury_car_reason", score: 4 },
      ],
      category: "asset_value",
      weight: 0.2,
    },

    used_car_price_mid: {
      id: "used_car_price_mid",
      question: "Berapa kisaran harga mobil bekas yang Anda targetkan?",
      type: "radio",
      options: [
        { value: "budget_friendly", label: "80-150 juta", next: "car_usage_purpose", score: 8 },
        { value: "mid_range", label: "150-300 juta", next: "car_brand_preference", score: 7 },
        { value: "higher_mid", label: "300-500 juta", next: "car_brand_preference", score: 6 },
      ],
      category: "asset_value",
      weight: 0.2,
    },

    new_car_brand: {
      id: "new_car_brand",
      question: "Kategori mobil baru apa yang Anda inginkan?",
      type: "radio",
      options: [
        { value: "lcgc", label: "LCGC (Low Cost Green Car)", next: "new_car_price_lcgc", score: 8 },
        { value: "hatchback", label: "Hatchback", next: "new_car_price_hatchback", score: 7 },
        { value: "sedan", label: "Sedan", next: "new_car_price_sedan", score: 6 },
        { value: "suv_mpv", label: "SUV/MPV", next: "suv_mpv_size", score: 5 },
        { value: "luxury_new", label: "Mobil Mewah", next: "luxury_car_reason", score: 4 },
      ],
      category: "vehicle_category",
      weight: 0.15,
    },

    new_car_price_lcgc: {
      id: "new_car_price_lcgc",
      question: "Berapa budget untuk mobil LCGC?",
      type: "radio",
      options: [
        { value: "lcgc_basic", label: "120-150 juta", next: "car_usage_purpose", score: 9 },
        { value: "lcgc_mid", label: "150-180 juta", next: "car_usage_purpose", score: 8 },
        { value: "lcgc_premium", label: "> 180 juta", next: "car_usage_purpose", score: 7 },
      ],
      category: "asset_value",
      weight: 0.2,
    },

    suv_mpv_size: {
      id: "suv_mpv_size",
      question: "Ukuran SUV/MPV yang Anda inginkan?",
      type: "radio",
      options: [
        { value: "compact_suv", label: "Compact SUV", next: "suv_price_compact", score: 6 },
        { value: "mid_suv", label: "Medium SUV/MPV", next: "suv_price_medium", score: 5 },
        { value: "full_suv", label: "Full Size SUV", next: "suv_price_full", score: 4 },
      ],
      category: "vehicle_size",
      weight: 0.12,
    },

    car_usage_purpose: {
      id: "car_usage_purpose",
      question: "Apa tujuan utama penggunaan mobil ini?",
      type: "radio",
      options: [
        { value: "family_daily", label: "Transportasi keluarga sehari-hari", next: "family_size", score: 8 },
        { value: "work_commute", label: "Pergi kerja", next: "commute_distance", score: 7 },
        { value: "business_car", label: "Keperluan bisnis", next: "business_car_usage", score: 6 },
        { value: "weekend_car", label: "Mobil weekend/rekreasi", next: "recreational_budget", score: 5 },
      ],
      category: "usage_purpose",
      weight: 0.18,
    },

    family_size: {
      id: "family_size",
      question: "Berapa jumlah anggota keluarga yang akan menggunakan mobil?",
      type: "radio",
      options: [
        { value: "small_family", label: "2-3 orang", next: "car_features_priority", score: 8 },
        { value: "medium_family", label: "4-5 orang", next: "car_features_priority", score: 7 },
        { value: "large_family", label: "> 5 orang", next: "large_family_needs", score: 6 },
      ],
      category: "family_profile",
      weight: 0.12,
    },

    education_level: {
      id: "education_level",
      question: "Untuk jenjang pendidikan apa kredit ini digunakan?",
      type: "radio",
      options: [
        { value: "tk_sd", label: "TK/SD", next: "school_choice_reason", score: 8 },
        { value: "smp_sma", label: "SMP/SMA", next: "secondary_school_type", score: 7 },
        { value: "diploma_s1", label: "Diploma/S1", next: "higher_education_type", score: 6 },
        { value: "s2_s3", label: "S2/S3", next: "postgrad_field", score: 5 },
        { value: "courses_training", label: "Kursus/Pelatihan", next: "course_type", score: 7 },
      ],
      category: "education_level",
      weight: 0.15,
    },

    school_choice_reason: {
      id: "school_choice_reason",
      question: "Mengapa memilih sekolah swasta untuk anak?",
      type: "radio",
      options: [
        { value: "quality_education", label: "Kualitas pendidikan lebih baik", next: "school_fee_range_primary", score: 7 },
        { value: "religious_values", label: "Nilai-nilai agama/karakter", next: "school_fee_range_primary", score: 8 },
        { value: "bilingual", label: "Pendidikan bilingual/internasional", next: "international_school_fee", score: 5 },
        { value: "smaller_class", label: "Kelas lebih kecil, perhatian personal", next: "school_fee_range_primary", score: 7 },
      ],
      category: "education_motivation",
      weight: 0.12,
    },

    school_fee_range_primary: {
      id: "school_fee_range_primary",
      question: "Berapa kisaran biaya sekolah per tahun untuk TK/SD?",
      type: "radio",
      options: [
        { value: "affordable_primary", label: "5-15 juta/tahun", next: "education_planning_duration", score: 8 },
        { value: "mid_primary", label: "15-30 juta/tahun", next: "additional_education_cost", score: 6 },
        { value: "premium_primary", label: "30-60 juta/tahun", next: "premium_education_reason", score: 4 },
        { value: "luxury_primary", label: "> 60 juta/tahun", next: "luxury_education_reason", score: 3 },
      ],
      category: "education_cost",
      weight: 0.2,
    },

    international_school_fee: {
      id: "international_school_fee",
      question: "Berapa kisaran biaya sekolah internasional yang Anda targetkan?",
      type: "radio",
      options: [
        { value: "local_international", label: "50-100 juta/tahun", next: "international_school_reason", score: 4 },
        { value: "premium_international", label: "100-200 juta/tahun", next: "international_school_reason", score: 3 },
        { value: "elite_international", label: "> 200 juta/tahun", next: "elite_education_plan", score: 2 },
      ],
      category: "education_cost",
      weight: 0.25,
    },

    secondary_school_type: {
      id: "secondary_school_type",
      question: "Jenis sekolah menengah yang dipilih?",
      type: "radio",
      options: [
        { value: "regular_private", label: "SMP/SMA Swasta Reguler", next: "secondary_school_fee", score: 7 },
        { value: "vocational", label: "SMK/Sekolah Kejuruan", next: "vocational_field", score: 8 },
        { value: "islamic_boarding", label: "Pesantren/Islamic Boarding", next: "boarding_school_fee", score: 6 },
        { value: "international_secondary", label: "Sekolah Internasional", next: "international_secondary_fee", score: 4 },
      ],
      category: "school_type",
      weight: 0.15,
    },

    vocational_field: {
      id: "vocational_field",
      question: "Bidang kejuruan apa yang dipilih?",
      type: "radio",
      options: [
        { value: "tech_vocational", label: "Teknologi/IT", next: "vocational_fee_tech", score: 8 },
        { value: "business_vocational", label: "Bisnis/Akuntansi", next: "vocational_fee_business", score: 7 },
        { value: "health_vocational", label: "Kesehatan/Keperawatan", next: "vocational_fee_health", score: 8 },
        { value: "automotive", label: "Otomotif/Teknik", next: "vocational_fee_automotive", score: 7 },
        { value: "culinary", label: "Kuliner/Perhotelan", next: "vocational_fee_culinary", score: 6 },
      ],
      category: "vocational_field",
      weight: 0.12,
    },

    higher_education_type: {
      id: "higher_education_type",
      question: "Jenis perguruan tinggi yang dipilih?",
      type: "radio",
      options: [
        { value: "state_university", label: "Universitas Negeri", next: "state_uni_program", score: 8 },
        { value: "private_university", label: "Universitas Swasta", next: "private_uni_tier", score: 6 },
        { value: "vocational_college", label: "Politeknik/Akademi", next: "vocational_program", score: 7 },
        { value: "overseas", label: "Kuliah di Luar Negeri", next: "overseas_destination", score: 3 },
      ],
      category: "university_type",
      weight: 0.18,
    },

    state_uni_program: {
      id: "state_uni_program",
      question: "Program studi di universitas negeri?",
      type: "radio",
      options: [
        { value: "medical", label: "Kedokteran/Kesehatan", next: "medical_program_fee", score: 6 },
        { value: "engineering", label: "Teknik/Engineering", next: "state_uni_fee_engineering", score: 7 },
        { value: "business_econ", label: "Ekonomi/Bisnis", next: "state_uni_fee_business", score: 8 },
        { value: "social_science", label: "Ilmu Sosial/Humaniora", next: "state_uni_fee_social", score: 8 },
        { value: "science_math", label: "MIPA/Sains", next: "state_uni_fee_science", score: 7 },
      ],
      category: "study_field",
      weight: 0.15,
    },

    medical_program_fee: {
      id: "medical_program_fee",
      question: "Berapa kisaran biaya program kedokteran?",
      type: "radio",
      options: [
        { value: "state_medical", label: "PTN: 20-50 juta/tahun", next: "medical_specialization_plan", score: 7 },
        { value: "private_medical", label: "PTS: 100-300 juta/tahun", next: "medical_specialization_plan", score: 4 },
        { value: "overseas_medical", label: "Luar negeri: 500juta-1M/tahun", next: "overseas_medical_country", score: 2 },
      ],
      category: "education_cost",
      weight: 0.25,
    },

    private_uni_tier: {
      id: "private_uni_tier",
      question: "Tingkatan universitas swasta yang dipilih?",
      type: "radio",
      options: [
        { value: "local_private", label: "Universitas Swasta Lokal", next: "local_private_fee", score: 7 },
        { value: "reputable_private", label: "Universitas Swasta Ternama", next: "reputable_private_fee", score: 6 },
        { value: "top_private", label: "Universitas Swasta Top (UI, UGM level)", next: "top_private_fee", score: 5 },
      ],
      category: "university_tier",
      weight: 0.15,
    },

    postgrad_field: {
      id: "postgrad_field",
      question: "Bidang studi S2/S3 yang dipilih?",
      type: "radio",
      options: [
        { value: "mba", label: "MBA/Manajemen Bisnis", next: "mba_program_type", score: 5 },
        { value: "engineering_master", label: "Teknik/Engineering", next: "master_program_fee", score: 6 },
        { value: "medical_specialist", label: "Spesialis Kedokteran", next: "specialist_program_fee", score: 4 },
        { value: "phd_research", label: "Doktor/Penelitian", next: "phd_funding_plan", score: 5 },
        { value: "law_master", label: "Hukum", next: "law_program_fee", score: 6 },
      ],
      category: "postgrad_field",
      weight: 0.18,
    },

     mba_program_type: {
      id: "mba_program_type",
      question: "Jenis program MBA yang dipilih?",
      type: "radio",
      options: [
        { value: "local_mba", label: "MBA Lokal", next: "local_mba_fee", score: 6 },
        { value: "executive_mba", label: "Executive MBA", next: "executive_mba_fee", score: 5 },
        { value: "overseas_mba", label: "MBA Luar Negeri", next: "overseas_mba_destination", score: 3 },
      ],
      category: "mba_type",
      weight: 0.2
    }, // Pastikan ada koma di sini jika ini bukan objek terakhir

    local_mba_fee: {
      id: "local_mba_fee",
      question: "Berapa perkiraan biaya untuk MBA Lokal yang Anda pilih?",
      type: "radio",
      options: [
        { value: "under_100", label: "< Rp 100 juta", next: "education_funding_source", score: 8 },
        { value: "100_200", label: "Rp 100 - 200 juta", next: "education_funding_source", score: 6 },
        { value: "over_200", label: "> Rp 200 juta", next: "education_funding_source", score: 4 },
      ],
      category: "education_cost",
      weight: 0.2,
    },

    executive_mba_fee: {
      id: "executive_mba_fee",
      question: "Berapa perkiraan biaya untuk Executive MBA yang Anda pilih?",
      type: "radio",
      options: [
        { value: "under_200", label: "< Rp 200 juta", next: "education_funding_source", score: 7 },
        { value: "200_400", label: "Rp 200 - 400 juta", next: "education_funding_source", score: 5 },
        { value: "over_400", label: "> Rp 400 juta", next: "education_funding_source", score: 3 },
      ],
      category: "education_cost",
      weight: 0.2,
    },

    overseas_mba_destination: {
      id: "overseas_mba_destination",
      question: "Negara tujuan untuk MBA Luar Negeri?",
      type: "radio",
      options: [
        { value: "asia", label: "Asia (Singapura, Hong Kong, dll.)", next: "overseas_mba_fee", score: 6 },
        { value: "europe", label: "Eropa (UK, Jerman, dll.)", next: "overseas_mba_fee", score: 4 },
        { value: "usa_canada", label: "Amerika Serikat/Kanada", next: "overseas_mba_fee", score: 3 },
        { value: "australia_nz", label: "Australia/Selandia Baru", next: "overseas_mba_fee", score: 5 },
      ],
      category: "education_preference",
      weight: 0.15,
    },

    // Placeholder untuk pertanyaan selanjutnya yang mungkin dibutuhkan setelah detail biaya MBA
    education_funding_source: {
      id: "education_funding_source",
      question: "Dari mana sumber utama pendanaan untuk biaya pendidikan ini?",
      type: "radio",
      options: [
        { value: "personal_savings", label: "Tabungan Pribadi", next: "credit_history", score: 8 },
        { value: "family_support", label: "Dukungan Keluarga", next: "credit_history", score: 7 },
        { value: "scholarship", label: "Beasiswa (Sebagian/Penuh)", next: "credit_history", score: 9 },
        { value: "loan", label: "Pinjaman Pendidikan (termasuk ini)", next: "credit_history", score: 5 },
      ],
      category: "financial_planning",
      weight: 0.18,
    },

    overseas_mba_fee: {
      id: "overseas_mba_fee",
      question: "Berapa perkiraan total biaya untuk MBA di luar negeri (termasuk biaya hidup)?",
      type: "radio",
      options: [
        { value: "moderate_os", label: "Rp 500 juta - 1 miliar", next: "education_funding_source", score: 5 },
        { value: "high_os", label: "Rp 1 miliar - 2 miliar", next: "education_funding_source", score: 3 },
        { value: "very_high_os", label: "> Rp 2 miliar", next: "education_funding_source", score: 2 },
      ],
      category: "education_cost",
      weight: 0.25,
    },

    // --- Contoh kelanjutan untuk beberapa pertanyaan lain yang hilang ---

    // Dari revenue_growth -> business_challenges
    business_challenges: {
      id: "business_challenges",
      question: "Apa tantangan utama yang dihadapi bisnis Anda saat ini?",
      type: "radio",
      options: [
        { value: "cashflow", label: "Masalah Arus Kas", next: "income_source", score: 3 },
        { value: "competition", label: "Persaingan Ketat", next: "income_source", score: 5 },
        { value: "operational", label: "Operasional & SDM", next: "income_source", score: 4 },
        { value: "market_demand", label: "Penurunan Permintaan Pasar", next: "income_source", score: 2 },
        { value: "scaling", label: "Kesulitan Skalabilitas", next: "income_source", score: 6 },
      ],
      category: "business_risk",
      weight: 0.15,
    },

    // Dari business_growth -> expansion_plan
    expansion_plan: {
      id: "expansion_plan",
      question: "Seberapa matang rencana ekspansi lokasi baru Anda?",
      type: "radio",
      options: [
        { value: "idea", label: "Masih tahap ide", next: "business_revenue", score: 3 },
        { value: "surveyed", label: "Sudah survei lokasi potensial", next: "business_revenue", score: 6 },
        { value: "secured", label: "Lokasi sudah diamankan/dalam proses", next: "business_revenue", score: 8 },
      ],
      category: "strategy_detail",
      weight: 0.1,
    },

    // Dari house_income / house_price_range -> house_downpayment
    house_downpayment: {
      id: "house_downpayment",
      question: "Berapa persen uang muka (DP) yang sudah Anda siapkan untuk pembelian rumah?",
      type: "radio",
      options: [
        { value: "dp_minimal", label: "< 10%", next: "income_source", score: 2 },
        { value: "dp_small", label: "10% - 20%", next: "income_source", score: 4 },
        { value: "dp_medium", label: "21% - 30%", next: "income_source", score: 6 },
        { value: "dp_large", label: "31% - 50%", next: "savings_amount", score: 8 },
        { value: "dp_very_large", label: "> 50%", next: "savings_amount", score: 9 },
      ],
      category: "financial_capacity",
      weight: 0.25,
    },

    // Dari income_source (jika freelance) -> freelance_clients
    freelance_clients: {
      id: "freelance_clients",
      question: "Bagaimana profil klien utama Anda sebagai freelancer/konsultan?",
      type: "radio",
      options: [
        { value: "varied_small", label: "Banyak klien kecil, proyek jangka pendek", next: "monthly_expenses", score: 5 },
        { value: "few_large", label: "Beberapa klien besar, proyek jangka panjang", next: "monthly_expenses", score: 7 },
        { value: "retainer", label: "Klien tetap dengan kontrak retainer", next: "monthly_expenses", score: 8 },
        { value: "new_freelance", label: "Baru memulai, klien belum stabil", next: "monthly_expenses", score: 3 },
      ],
      category: "employment",
      weight: 0.15,
    },

    // Dari income_source (jika business_owner, tapi bukan tujuan utama "Modal Usaha") -> business_type
    // Ini mungkin perlu dibedakan dari pertanyaan bisnis di awal jika konteksnya berbeda.
    // Untuk contoh ini, kita asumsikan ini adalah pemilik usaha kecil yang tujuannya bukan modal usaha spesifik.
    business_type: {
      id: "business_type",
      question: "Apa jenis usaha yang Anda miliki (jika bukan tujuan utama kredit)?",
      type: "radio",
      options: [
        { value: "dagang", label: "Perdagangan (Toko/Online)", next: "business_revenue_secondary", score: 7 }, // next bisa ke pertanyaan pendapatan bisnis sekunder
        { value: "jasa", label: "Jasa (Konsultan, Servis)", next: "business_revenue_secondary", score: 6 },
        { value: "produksi", label: "Produksi Skala Kecil", next: "business_revenue_secondary", score: 5 },
        { value: "lainnya", label: "Lainnya", next: "business_revenue_secondary", score: 4 },
      ],
      category: "employment", // atau 'business_profile_secondary'
      weight: 0.2,
    },
    
    // Contoh pertanyaan untuk pendapatan bisnis sekunder (jika relevan dari business_type)
    business_revenue_secondary: {
        id: "business_revenue_secondary",
        question: "Berapa rata-rata pendapatan bulanan dari usaha tersebut?",
        type: "radio",
        options: [
            { value: "low", label: "< Rp 5 juta", next: "other_income", score: 3 },
            { value: "medium", label: "Rp 5-15 juta", next: "other_income", score: 5 },
            { value: "high", label: "> Rp 15 juta", next: "other_income", score: 7 },
        ],
        category: "income",
        weight: 0.15,
    },

    // Dari employment_duration / salary_range -> career_growth
    career_growth: {
        id: "career_growth",
        question: "Bagaimana proyeksi pertumbuhan karir Anda dalam 2-3 tahun ke depan?",
        type: "radio",
        options: [
            { value: "stable_no_change", label: "Stabil, tidak ada perubahan signifikan", next: "other_income", score: 5 },
            { value: "promotion_expected", label: "Ada potensi promosi/kenaikan jabatan", next: "other_income", score: 8 },
            { value: "industry_change", label: "Berencana pindah industri/peran", next: "other_income", score: 4 },
            { value: "business_plan_personal", label: "Berencana memulai usaha sendiri", next: "other_income", score: 6 },
        ],
        category: "employment",
        weight: 0.1,
    },

    inventory_management: {
      id: "inventory_management",
      question: "Bagaimana Anda akan mengelola peningkatan inventaris/stok dengan kredit ini?",
      type: "radio",
      options: [
        { value: "manual_tracking", label: "Pelacakan manual, perkiraan kebutuhan", next: "business_revenue", score: 4 },
        { value: "software_basic", label: "Menggunakan software stok dasar", next: "business_revenue", score: 6 },
        { value: "software_advanced", label: "Sistem manajemen inventaris terintegrasi", next: "business_revenue", score: 8 },
        { value: "just_in_time", label: "Rencana untuk sistem Just-In-Time (JIT)", next: "business_revenue", score: 7 },
      ],
      category: "strategy_detail",
      weight: 0.1,
    },

    // Dari house_price_range -> house_location
    house_location: {
      id: "house_location",
      question: "Preferensi lokasi rumah yang Anda inginkan?",
      type: "radio",
      options: [
        { value: "city_center", label: "Pusat Kota (Akses mudah, harga tinggi)", next: "house_downpayment", score: 5 },
        { value: "suburb_developed", label: "Pinggir Kota (Area berkembang, fasilitas lengkap)", next: "house_downpayment", score: 7 },
        { value: "suburb_new", label: "Area Pinggiran Baru (Harga lebih terjangkau, fasilitas berkembang)", next: "house_downpayment", score: 8 },
        { value: "rural_area", label: "Pedesaan (Tenang, jauh dari pusat kota)", next: "house_downpayment", score: 6 },
      ],
      category: "asset_preference", // Atau 'property_details'
      weight: 0.15,
    },

    // Dari employment_duration -> job_stability
    job_stability: {
      id: "job_stability",
      question: "Bagaimana Anda menilai stabilitas pekerjaan Anda saat ini di industri Anda?",
      type: "radio",
      options: [
        { value: "very_stable", label: "Sangat stabil, industri berkembang pesat", next: "salary_range", score: 9 },
        { value: "stable", label: "Cukup stabil, risiko rendah", next: "salary_range", score: 7 },
        { value: "moderate_risk", label: "Ada beberapa ketidakpastian/fluktuasi industri", next: "salary_range", score: 5 },
        { value: "high_risk", label: "Berisiko tinggi, industri sedang sulit/kontrak jangka pendek", next: "salary_range", score: 3 },
      ],
      category: "employment",
      weight: 0.18,
    },

    // Dari other_income -> passive_income_amount
    passive_income_amount: {
      id: "passive_income_amount",
      question: "Berapa perkiraan total pendapatan pasif Anda per bulan?",
      type: "radio",
      options: [
        { value: "passive_low", label: "< Rp 2 juta", next: "monthly_expenses", score: 6 },
        { value: "passive_medium", label: "Rp 2 - 5 juta", next: "monthly_expenses", score: 7 },
        { value: "passive_high", label: "Rp 5 - 10 juta", next: "monthly_expenses", score: 8 },
        { value: "passive_very_high", label: "> Rp 10 juta", next: "monthly_expenses", score: 9 },
      ],
      category: "income",
      weight: 0.12,
    },

    // Dari existing_debt -> debt_types
    debt_types: {
      id: "debt_types",
      question: "Jenis hutang apa saja yang sedang Anda bayar saat ini?",
      type: "radio", // Sebenarnya ini lebih cocok 'checkbox', tapi sistem hanya punya 'radio'. Kita anggap pilih yang paling utama/besar.
      options: [
        { value: "kpr_kpa", label: "KPR/KPA (Kredit Rumah/Apartemen)", next: "savings_amount", score: 5 },
        { value: "kendaraan", label: "Kredit Kendaraan", next: "savings_amount", score: 6 },
        { value: "kta_cc", label: "KTA dan/atau Kartu Kredit (Cicilan)", next: "savings_amount", score: 4 },
        { value: "pendidikan", label: "Pinjaman Pendidikan", next: "savings_amount", score: 7 },
        { value: "lainnya", label: "Kombinasi beberapa jenis / Lainnya", next: "savings_amount", score: 5 },
      ],
      category: "debt",
      weight: 0.15,
    },

    // Dari vehicle_type -> commercial_purpose
    commercial_purpose: {
      id: "commercial_purpose",
      question: "Untuk tujuan komersial apa kendaraan ini akan digunakan?",
      type: "radio",
      options: [
        { value: "angkutan_barang", label: "Angkutan Barang (Pick-up, Truk Kecil)", next: "commercial_load_capacity", score: 8 },
        { value: "angkutan_orang", label: "Angkutan Orang (Travel, Shuttle)", next: "commercial_passenger_capacity", score: 7 },
        { value: "operasional_bisnis", label: "Kendaraan Operasional Bisnis Umum", next: "income_source", score: 6 }, // Kembali ke alur finansial umum
        { value: "sewa_rental", label: "Untuk Disewakan/Rental", next: "rental_business_plan", score: 5 },
      ],
      category: "vehicle_usage",
      weight: 0.18,
    },
    
    // Contoh pertanyaan lanjutan untuk commercial_purpose
    commercial_load_capacity: {
        id: "commercial_load_capacity",
        question: "Berapa kapasitas angkut barang yang Anda butuhkan?",
        type: "radio",
        options: [
            { value: "light_duty", label: "Ringan (< 1 Ton)", next: "income_source", score: 7 },
            { value: "medium_duty", label: "Sedang (1-3 Ton)", next: "income_source", score: 6 },
            { value: "heavy_duty_small", label: "Berat (>3 Ton, kategori kecil)", next: "income_source", score: 5 },
        ],
        category: "vehicle_specification",
        weight: 0.1,
    },

    // Dari motor_price_matic, motor_price_bebek, sport_experience, sport_expertise -> motor_brand_preference
    motor_brand_preference: {
      id: "motor_brand_preference",
      question: "Apakah Anda memiliki preferensi merek motor tertentu?",
      type: "radio",
      options: [
        { value: "honda", label: "Honda", next: "motor_usage_purpose", score: 7 }, // Asumsi kembali ke alur penggunaan umum motor
        { value: "yamaha", label: "Yamaha", next: "motor_usage_purpose", score: 7 },
        { value: "suzuki", label: "Suzuki", next: "motor_usage_purpose", score: 6 },
        { value: "kawasaki", label: "Kawasaki", next: "motor_usage_purpose", score: 6 },
        { value: "no_preference", label: "Tidak ada preferensi khusus / Merek Lain", next: "motor_usage_purpose", score: 8 }, // Skor lebih tinggi karena fleksibel
      ],
      category: "vehicle_preference",
      weight: 0.05, // Bobot kecil karena preferensi merek tidak terlalu signifikan untuk risiko
    },

    // Dari salary_range -> salary_growth
    salary_growth: {
      id: "salary_growth",
      question: "Bagaimana tren pertumbuhan gaji Anda dalam 2 tahun terakhir?",
      type: "radio",
      options: [
        { value: "no_increase", label: "Tidak ada kenaikan signifikan", next: "other_income", score: 3 },
        { value: "standard_increase", label: "Kenaikan standar tahunan (sesuai inflasi/UMR)", next: "other_income", score: 6 },
        { value: "good_increase", label: "Kenaikan baik (>10% per tahun)", next: "other_income", score: 8 },
        { value: "exceptional_increase", label: "Kenaikan sangat baik/promosi (>20% per tahun)", next: "other_income", score: 9 },
      ],
      category: "income_stability", // atau 'employment'
      weight: 0.15,
    },

    // Dari savings_amount -> investment_portfolio
    investment_portfolio: {
      id: "investment_portfolio",
      question: "Apakah Anda memiliki portofolio investasi selain tabungan (misal: reksadana, saham, properti)?",
      type: "radio",
      options: [
        { value: "none", label: "Tidak ada, hanya tabungan biasa", next: "financial_goals", score: 4 },
        { value: "small_invest", label: "Ya, nilai investasi < Rp 50 juta", next: "financial_goals", score: 6 },
        { value: "medium_invest", label: "Ya, nilai investasi Rp 50 - 200 juta", next: "financial_goals", score: 8 },
        { value: "large_invest", label: "Ya, nilai investasi > Rp 200 juta", next: "financial_goals", score: 9 },
      ],
      category: "savings", // atau 'financial_assets'
      weight: 0.18,
    }
      
  }

  // Logika untuk menentukan pertanyaan selanjutnya
  const getNextQuestion = (currentId, selectedValue) => {
    const current = questionDatabase[currentId]
    if (!current) return null

    const selectedOption = current.options.find((opt) => opt.value === selectedValue)
    if (!selectedOption || !selectedOption.next) return null

    if (selectedOption.next === "complete") {
      return null
    }

    if (selectedOption.next === "credit_history" && answers.existing_debt === "none") {
      return questionDatabase["savings_amount"]
    }

    if (selectedOption.next === "final_assessment") {
      const answeredCategories = Object.values(answers).length
      if (answeredCategories < 8) {
        return questionDatabase["credit_history"]
      }
    }

    return questionDatabase[selectedOption.next]
  }

  // Fungsi untuk menghitung skor risiko menggunakan logika fuzzy Tsukamoto
const calculateRiskScore = () => {
  let totalScore = 0
  let totalWeight = 0

  const categoryScores = {
    income: [],
    employment: [],
    debt: [],
    expenses: [],
    savings: [],
    credit_history: [],
    business_profile: [],
    confidence: [],
    purpose: [],
    growth: [],
    strategy: [],
    asset_value: [],
  }

  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = questionDatabase[questionId]
    if (question && question.category && categoryScores[question.category]) {
      const option = question.options.find((opt) => opt.value === answer)
      if (option && option.score) {
        categoryScores[question.category].push({
          score: option.score,
          weight: question.weight,
        })
      }
    } else {
      console.warn(`Unknown category or invalid question: ${questionId}, category: ${question?.category}`)
    }
  })

  Object.entries(categoryScores).forEach(([category, scores]) => {
    if (scores.length > 0) {
      const categoryTotal = scores.reduce((sum, item) => sum + item.score * item.weight, 0)
      const categoryWeight = scores.reduce((sum, item) => sum + item.weight, 0)

      if (categoryWeight > 0) {
        totalScore += categoryTotal
        totalWeight += categoryWeight
      }
    }
  })

  const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 10 : 50
  return Math.min(100, Math.max(0, normalizedScore))
}

  // Interpretasi risiko
  const getRiskInterpretation = (score) => {
    if (score >= 80)
      return {
        level: "Risiko Rendah",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        progressClass: "excellent",
        description: "Profil kredit sangat baik, kemungkinan persetujuan tinggi dengan suku bunga kompetitif",
        icon: <Award className="w-6 h-6 text-emerald-600" />,
      }
    if (score >= 65)
      return {
        level: "Risiko Sedang-Rendah",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        progressClass: "good",
        description: "Profil kredit baik, persyaratan standar berlaku dengan proses persetujuan normal",
        icon: <Shield className="w-6 h-6 text-blue-600" />,
      }
    if (score >= 50)
      return {
        level: "Risiko Sedang",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        progressClass: "fair",
        description: "Perlu evaluasi lebih detail, mungkin perlu jaminan tambahan atau dokumen pendukung",
        icon: <BarChart3 className="w-6 h-6 text-amber-600" />,
      }
    if (score >= 35)
      return {
        level: "Risiko Tinggi",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        progressClass: "poor",
        description: "Memerlukan persyaratan ketat, jaminan kuat, dan suku bunga yang disesuaikan",
        icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
      }
    return {
      level: "Risiko Sangat Tinggi",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      progressClass: "very-poor",
      description: "Kemungkinan penolakan tinggi, perlu perbaikan profil finansial sebelum mengajukan",
      icon: <AlertCircle className="w-6 h-6 text-red-600" />,
    }
  }

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCurrentQuestion(questionDatabase.start)
      setIsLoading(false)
    }, 1500)
  }, [])

  const handleAnswer = (value) => {
    if (!currentQuestion) return

    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)
    setQuestionHistory([...questionHistory, { question: currentQuestion, answer: value }])

    const nextQuestion = getNextQuestion(currentQuestion.id, value)

    if (!nextQuestion) {
      setIsLoading(true)
      setTimeout(() => {
        const score = calculateRiskScore()
        setRiskScore(score)
        setIsComplete(true)
        setIsLoading(false)
      }, 2000)
    } else {
      setCurrentQuestion(nextQuestion)
    }
  }

  const resetAnalysis = () => {
    setAnswers({})
    setQuestionHistory([])
    setCurrentQuestion(questionDatabase.start)
    setRiskScore(null)
    setIsComplete(false)
  }

  // Loading Screen
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content animate-fade-in">
          <div className="loading-icon animate-pulse-slow shadow-glow">
            <img 
              src={process.env.PUBLIC_URL + '/images/bca-logo.png'}
              alt="BCA Logo" 
              style={{ width: "40px", height: "40px", objectFit: "contain" }}
            />
          </div>
          <h2 className="loading-title">BCA Credit Analyzer</h2>
          <p className="loading-subtitle">
            {isComplete ? "Memproses hasil analisis..." : "Memuat sistem analisis kredit..."}
          </p>
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      </div>
    )
  }

  // Results Page
  if (isComplete && riskScore !== null) {
    const risk = getRiskInterpretation(riskScore)

    return (
      <div
        className="min-h-screen animate-fade-in"
        style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f0f9ff 100%)" }}
      >
        {/* Header dengan Logo BCA */}
        <div className="bg-white shadow-sm border-b">
          <div className="container">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className="bca-logo-container">
                  <img 
                    src={process.env.PUBLIC_URL + '/images/bca-logo.png'}
                    alt="BCA Logo" 
                    className="bca-logo-header"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-900">Credit Analyzer</h1>
                  <p className="text-sm text-gray-600">Bank Central Asia - Sistem Analisis Kredit</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Dengan mengakses situs ini, Anda telah menyetujui penggunaan</div>
                <div className="text-lg font-bold text-blue-600">cookies dari kami</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="text-center mb-8 animate-slide-up" style={{ paddingTop: "var(--spacing-6)" }}>
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg"
              style={{ background: `linear-gradient(135deg, var(--emerald-400), var(--emerald-600))` }}
            >
              <CheckCircle className="w-12 h-12" style={{ color: "white" }} />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Analisis Kredit Selesai</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Berikut hasil evaluasi komprehensif risiko dan kemampuan finansial Anda
            </p>
          </div>

          {/* Score Card */}
          <div className={`card ${risk.bgColor} ${risk.borderColor} border-2 mb-8 animate-slide-up`}>
            <div className="card-body">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">{risk.icon}</div>
                <div
                  className="text-7xl font-bold mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${
                      risk.color.includes("emerald")
                        ? "var(--emerald-500), var(--emerald-600)"
                        : risk.color.includes("blue")
                          ? "var(--bca-blue-500), var(--bca-blue-600)"
                          : risk.color.includes("amber")
                            ? "var(--amber-500), var(--amber-600)"
                            : risk.color.includes("orange")
                              ? "var(--orange-500), var(--orange-600)"
                              : "var(--red-500), var(--red-600)"
                    })`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {Math.round(riskScore)}
                </div>
                <div className="text-lg text-gray-500 mb-4">Skor Kredit (0-100)</div>
                <div className={`text-3xl font-bold ${risk.color} mb-4`}>{risk.level}</div>
                <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">{risk.description}</p>
              </div>

              {/* Progress Bar */}
              <div className="score-progress-container">
                <div className={`score-progress-bar ${risk.progressClass}`} style={{ width: `${riskScore}%` }}></div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div className={`${riskScore < 35 ? "font-bold text-red-600" : "text-gray-400"}`}>
                  <div>0-34</div>
                  <div>Sangat Tinggi</div>
                </div>
                <div className={`${riskScore >= 35 && riskScore < 50 ? "font-bold text-orange-600" : "text-gray-400"}`}>
                  <div>35-49</div>
                  <div>Tinggi</div>
                </div>
                <div className={`${riskScore >= 50 && riskScore < 65 ? "font-bold text-amber-600" : "text-gray-400"}`}>
                  <div>50-64</div>
                  <div>Sedang</div>
                </div>
                <div className={`${riskScore >= 65 && riskScore < 80 ? "font-bold text-blue-600" : "text-gray-400"}`}>
                  <div>65-79</div>
                  <div>Rendah</div>
                </div>
                <div className={`${riskScore >= 80 ? "font-bold text-emerald-600" : "text-gray-400"}`}>
                  <div>80-100</div>
                  <div>Sangat Rendah</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Cards */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="card glass-effect animate-slide-up">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                  <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                  Ringkasan Analisis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Pertanyaan Dijawab:</span>
                    <span className="font-bold text-blue-600">{questionHistory.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Kategori Dievaluasi:</span>
                    <span className="font-bold text-green-600">
                      {Object.keys(answers).length > 5 ? "Lengkap" : "Partial"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card glass-effect animate-slide-up">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                  <Shield className="w-6 h-6 mr-3 text-green-600" />
                  Rekomendasi BCA
                </h3>
                <ul className="space-y-3 text-sm">
                  {riskScore >= 80 && (
                    <>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <span>Ajukan kredit dengan suku bunga kompetitif</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <span>Proses persetujuan dipercepat</span>
                      </li>
                    </>
                  )}
                  {riskScore >= 65 && riskScore < 80 && (
                    <>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                        <span>Siapkan dokumen pendukung lengkap</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                        <span>Proses persetujuan standar</span>
                      </li>
                    </>
                  )}
                  {riskScore >= 50 && riskScore < 65 && (
                    <>
                      <li className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                        <span>Pertimbangkan jaminan tambahan</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                        <span>Evaluasi mendalam diperlukan</span>
                      </li>
                    </>
                  )}
                  {riskScore < 50 && (
                    <>
                      <li className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                        <span>Perbaiki profil finansial terlebih dahulu</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                        <span>Konsultasi dengan financial advisor</span>
                      </li>
                    </>
                  )}
                  <li className="flex items-start">
                    <User className="w-4 h-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Konsultasi dengan Relationship Manager BCA</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card glass-effect animate-slide-up">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                  <TrendingUp className="w-6 h-6 mr-3 text-purple-600" />
                  Langkah Selanjutnya
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-semibold text-blue-800 mb-1">1. Persiapan Dokumen</div>
                    <div className="text-sm text-blue-600">Siapkan dokumen pendukung sesuai rekomendasi</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-semibold text-green-700 mb-1">2. Konsultasi</div>
                    <div className="text-sm text-green-600">Hubungi cabang BCA terdekat untuk konsultasi</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="font-semibold text-purple-700 mb-1">3. Pengajuan</div>
                    <div className="text-sm text-purple-600">Submit aplikasi kredit melalui channel BCA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card glass-effect mb-8 animate-slide-up">
            <div className="card-body">
              <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Hubungi BCA</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <Phone className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="font-semibold text-gray-800">BCA Call Center</div>
                  <div className="text-blue-600 font-bold text-lg">1500888</div>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="w-8 h-8 text-green-600 mb-2" />
                  <div className="font-semibold text-gray-800">Cabang Terdekat</div>
                  <div className="text-green-600 font-bold">Temukan Lokasi</div>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="font-semibold text-gray-800">Jam Operasional</div>
                  <div className="text-purple-600 font-bold">24/7 Online</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4 animate-slide-up pb-8">
            <button onClick={resetAnalysis} className="btn btn-primary btn-lg">
              Mulai Analisis Baru
            </button>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Dipercaya oleh jutaan nasabah BCA</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Question Page
  return (
    <div
      className="min-h-screen animate-fade-in"
      style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f0f9ff 100%)" }}
    >
      {/* Header dengan Logo BCA */}
      <div className="bg-white shadow-sm border-b">
        <div className="container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="bca-logo-container">
                <img 
                  src={process.env.PUBLIC_URL + '/images/bca-logo.png'}
                  alt="BCA Logo" 
                  className="bca-logo-header"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Credit Analyzer</h1>
                <p className="text-sm text-gray-600">Bank Central Asia - Sistem Analisis Kredit</p>
              </div>
            </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Dengan mengakses situs ini, Anda telah menyetujui penggunaan</div>
                <div className="text-lg font-bold text-blue-600">cookies dari kami</div>
              </div>
          </div>
        </div>
      </div>

      <div className="container-sm" style={{ paddingTop: "var(--spacing-6)" }}>
        {/* Progress Section */}
        <div className="mb-8 text-center animate-slide-up">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Analisis Risiko Kredit</h2>
          <p className="text-lg text-gray-600 mb-6">Sistem evaluasi kemampuan finansial berbasis kecerdasan buatan</p>

          <div className="progress-container glass-effect">
            <div className="progress-header">
              <span className="progress-label">Progress Analisis</span>
              <span className="progress-percentage">{Math.round((questionHistory.length / 15) * 100)}%</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${Math.min(100, (questionHistory.length / 15) * 100)}%` }}
              ></div>
            </div>
            <div className="progress-text">Pertanyaan {questionHistory.length + 1} dari perkiraan 15 pertanyaan</div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card overflow-hidden mb-6 animate-slide-up">
          <div className="card-header">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                {currentQuestion.category === "income" && <DollarSign className="w-7 h-7" style={{ color: "white" }} />}
                {currentQuestion.category === "employment" && <User className="w-7 h-7" style={{ color: "white" }} />}
                {["debt", "expenses", "savings"].includes(currentQuestion.category) && (
                  <TrendingUp className="w-7 h-7" style={{ color: "white" }} />
                )}
                {currentQuestion.category === "business_profile" && (
                  <img 
                    src={process.env.PUBLIC_URL + '/images/bca-logo.png'}
                    alt="BCA Logo" 
                    style={{ width: "28px", height: "28px", objectFit: "contain", filter: "brightness(0) invert(1)" }}
                  />
                )}
                {!["income", "employment", "debt", "expenses", "savings", "business_profile"].includes(
                  currentQuestion.category,
                ) && <AlertCircle className="w-7 h-7" style={{ color: "white" }} />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium mb-1" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  {currentQuestion.category === "income" && "Analisis Pendapatan"}
                  {currentQuestion.category === "employment" && "Profil Pekerjaan"}
                  {currentQuestion.category === "debt" && "Evaluasi Hutang"}
                  {currentQuestion.category === "expenses" && "Analisis Pengeluaran"}
                  {currentQuestion.category === "savings" && "Evaluasi Tabungan"}
                  {currentQuestion.category === "business_profile" && "Profil Bisnis"}
                  {currentQuestion.category === "purpose" && "Tujuan Kredit"}
                  {currentQuestion.category === "credit_history" && "Riwayat Kredit"}
                  {currentQuestion.category === "confidence" && "Tingkat Keyakinan"}
                </div>
                <h3 className="text-xl font-bold leading-tight" style={{ color: "white" }}>
                  {currentQuestion.question}
                </h3>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button key={option.value} onClick={() => handleAnswer(option.value)} className="btn-option">
                  <span className="text">{option.label}</span>
                  <ChevronRight className="w-6 h-6 icon" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History Section */}
        {questionHistory.length > 0 && (
          <div className="card glass-effect animate-slide-up">
            <div className="card-body">
              <h3 className="text-lg font-bold mb-4 text-gray-700 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Riwayat Jawaban Terakhir
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {questionHistory.slice(-3).map((item, index) => (
                  <div key={index} className="border-l-4 pl-4 py-2">
                    <div className="text-sm text-gray-600 mb-1 font-medium">{item.question.question}</div>
                    <div className="text-blue-600 font-semibold">
                      → {item.question.options.find((opt) => opt.value === item.answer)?.label}
                    </div>
                  </div>
                ))}
                {questionHistory.length > 3 && (
                  <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                    ... dan {questionHistory.length - 3} jawaban lainnya
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BCAFuzzyCreditAnalyzer
