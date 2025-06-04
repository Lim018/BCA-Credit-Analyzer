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
